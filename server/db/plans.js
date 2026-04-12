const { db } = require("./connection");
const { VISIBILITY_MODES } = require("./constants");
const {
  normalizeCircle,
  normalizeCircleTone,
  getPlanVisibilityMode,
  getVisibilityModeLabel,
  getVisibilityModeIcon,
  getVisibilityModeDescription,
  getParticipantApprovalStatus,
  canUserSeePlanSummary,
  canUserSeeFullPlanDetail,
  matchesPlanFilters
} = require("./helpers");
const { getParticipantsForPlan, getPendingApprovals } = require("./participants");
const { getUserById } = require("./users");

// ---------------------------------------------------------------------------
// Shared SQL fragment
// ---------------------------------------------------------------------------

const PLAN_SUMMARY_FIELDS = `
  p.id,
  p.title,
  p.activity,
  p.circle,
  p.visibility_mode AS visibilityMode,
  p.host_user_id AS hostUserId,
  host.name AS hostName,
  p.momentum_label AS momentumLabel,
  p.momentum_tone AS momentumTone,
  p.time_label AS timeLabel,
  p.duration_label AS durationLabel,
  p.area,
  p.summary,
  p.visibility,
  p.is_online AS isOnline
`;

// ---------------------------------------------------------------------------
// Shared visibility lines (used in detail view)
// ---------------------------------------------------------------------------

const VISIBILITY_LINES = [
  {
    tone: "vc-inner",
    title: "RSVP first",
    body: "Les détails exacts se débloquent seulement après approbation de l'hôte."
  },
  {
    tone: "vc-connections",
    title: "Circle open",
    body: "Le cercle autorisé voit immédiatement tous les détails du plan."
  },
  {
    tone: "vc-public",
    title: "Public",
    body: "Le plan est ouvert au-delà du cercle et ses détails sont visibles immédiatement."
  }
];

// ---------------------------------------------------------------------------
// Participant counts helper
// ---------------------------------------------------------------------------

function getParticipantCounts(planId) {
  const approved = getParticipantsForPlan(planId, { approvalStatus: "approved" });
  return {
    approvedParticipants: approved,
    confirmedCount: approved.filter((p) => p.response === "down").length,
    interestedCount: approved.filter((p) => p.response !== "down").length
  };
}

// ---------------------------------------------------------------------------
// Decoration: plan card (list view)
// ---------------------------------------------------------------------------

function decoratePlanSummary(plan, currentUser = null, index = 0) {
  const visibilityMode = getPlanVisibilityMode(plan);
  const canSeeFullDetails = canUserSeeFullPlanDetail(plan, currentUser);
  const { approvedParticipants, confirmedCount, interestedCount } = getParticipantCounts(plan.id);
  const pendingCount = getPendingApprovals(plan.id).length;

  return {
    ...plan,
    featured: index === 0,
    muted: index === 2,
    circle: normalizeCircle(plan.circle),
    circleTone: normalizeCircleTone(plan.circle),
    creatorName: currentUser?.isAdmin ? (plan.hostName || "Créateur inconnu") : "",
    isEditable: plan.hostUserId === currentUser?.id,
    visibilityMode,
    visibilityModeLabel: getVisibilityModeLabel(visibilityMode),
    visibilityModeIcon: getVisibilityModeIcon(visibilityMode),
    visibilityModeDescription: getVisibilityModeDescription(visibilityMode),
    detailAccess: canSeeFullDetails ? "full" : "locked",
    ctaLabel: canSeeFullDetails ? "Voir les détails" : "RSVP pour débloquer",
    accessNote: canSeeFullDetails ? "" : "Les détails exacts se débloquent après approbation.",
    participants: canSeeFullDetails ? approvedParticipants : [],
    confirmedCount,
    interestedCount,
    pendingApprovalCount: pendingCount,
    currentUserApprovalStatus: getParticipantApprovalStatus(plan.id, currentUser?.id)
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

function getPlanSummaryRows(filters = {}, currentUser = null) {
  const plans = db.prepare(`
    SELECT ${PLAN_SUMMARY_FIELDS}
    FROM plans p
    LEFT JOIN users host ON host.id = p.host_user_id
    ORDER BY p.id DESC
  `).all();

  return plans
    .filter((plan) => canUserSeePlanSummary(plan, currentUser) && matchesPlanFilters(plan, filters))
    .map((plan, index) => decoratePlanSummary(plan, currentUser, index));
}

function getPlanDetail(planId, currentUser = null) {
  const plan = db.prepare(`
    SELECT
      ${PLAN_SUMMARY_FIELDS},
      p.location_detail AS locationDetail,
      p.address_rule AS addressRule
    FROM plans p
    LEFT JOIN users host ON host.id = p.host_user_id
    WHERE p.id = ?
  `).get(planId);

  if (!plan || !canUserSeePlanSummary(plan, currentUser)) return null;

  const visibilityMode = getPlanVisibilityMode(plan);
  const canSeeFullDetails = canUserSeeFullPlanDetail(plan, currentUser);
  const { approvedParticipants, confirmedCount, interestedCount } = getParticipantCounts(plan.id);
  const isHost = plan.hostUserId === currentUser?.id;
  const pendingApprovals = isHost ? getPendingApprovals(plan.id) : [];

  const checkins = canSeeFullDetails
    ? db.prepare(`
        SELECT
          c.id,
          c.message,
          c.minutes_ago AS minutesAgo,
          c.tone,
          u.name
        FROM checkins c
        JOIN users u ON u.id = c.user_id
        WHERE c.plan_id = ?
        ORDER BY c.minutes_ago ASC
      `).all(planId)
    : [];

  return {
    ...plan,
    circle: normalizeCircle(plan.circle),
    circleTone: normalizeCircleTone(plan.circle),
    creatorName: currentUser?.isAdmin ? (plan.hostName || "Créateur inconnu") : "",
    isEditable: isHost,
    visibilityMode,
    visibilityModeLabel: getVisibilityModeLabel(visibilityMode),
    visibilityModeIcon: getVisibilityModeIcon(visibilityMode),
    visibilityModeDescription: getVisibilityModeDescription(visibilityMode),
    detailAccess: canSeeFullDetails ? "full" : "locked",
    currentUserApprovalStatus: getParticipantApprovalStatus(plan.id, currentUser?.id),
    canApproveRsvps: visibilityMode === VISIBILITY_MODES.RSVP_FIRST && isHost,
    pendingApprovals,
    participants: canSeeFullDetails ? approvedParticipants : [],
    confirmedCount,
    interestedCount,
    lockedReason:
      visibilityMode === VISIBILITY_MODES.RSVP_FIRST
        ? "Ce plan est en mode RSVP first. L'hôte doit approuver ta demande avant de révéler les détails exacts."
        : "",
    visibilityLines: VISIBILITY_LINES,
    checkins
  };
}

function createPlan(input) {
  const result = db.prepare(`
    INSERT INTO plans (
      title, activity, circle, visibility_mode, host_user_id, momentum_label, momentum_tone,
      time_label, duration_label, area, location_detail, summary, visibility, address_rule, is_online
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.title,
    input.activity,
    normalizeCircle(input.circle),
    input.visibilityMode || VISIBILITY_MODES.CIRCLE_OPEN,
    input.hostUserId || null,
    input.momentumLabel,
    input.momentumTone,
    input.timeLabel,
    input.durationLabel,
    input.area,
    input.locationDetail,
    input.summary,
    normalizeCircle(input.circle),
    input.addressRule,
    input.isOnline ? 1 : 0
  );

  const host = input.hostUserId ? getUserById(input.hostUserId) : null;
  return getPlanDetail(result.lastInsertRowid, host);
}

function updatePlan(planId, input, currentUser) {
  const plan = db.prepare(`
    SELECT id, host_user_id AS hostUserId
    FROM plans
    WHERE id = ?
  `).get(planId);

  if (!plan || !currentUser || plan.hostUserId !== currentUser.id) return null;

  const circle = normalizeCircle(input.circle || currentUser.circle);

  db.prepare(`
    UPDATE plans
    SET
      title = ?,
      visibility_mode = ?,
      time_label = ?,
      area = ?,
      location_detail = ?,
      summary = ?,
      visibility = ?,
      circle = ?,
      is_online = ?
    WHERE id = ?
  `).run(
    input.title,
    input.visibilityMode,
    input.timeLabel,
    input.area,
    input.locationDetail,
    input.summary,
    circle,
    circle,
    input.isOnline ? 1 : 0,
    planId
  );

  return getPlanDetail(planId, currentUser);
}

function deletePlan(planId, currentUser) {
  const plan = db.prepare(`
    SELECT id, host_user_id AS hostUserId
    FROM plans
    WHERE id = ?
  `).get(planId);

  if (!plan || !currentUser) return false;
  if (plan.hostUserId !== currentUser.id && !currentUser.isAdmin) return false;

  return db.prepare("DELETE FROM plans WHERE id = ?").run(planId).changes > 0;
}

module.exports = {
  getPlanSummaryRows,
  getPlanDetail,
  createPlan,
  updatePlan,
  deletePlan
};