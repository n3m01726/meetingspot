const { db } = require("./connection");
const {
  VISIBILITY_MODE,
  CIRCLE,
  circleLabelToId,
  circleIdToLabel,
  circleIdToTone,
  visibilityModeLabel,
  visibilityModeIcon,
  visibilityModeDescription,
} = require("./constants");
const {
  getApprovedParticipants,
  getPendingParticipants,
  getApprovalStatus,
  buildRolesForUser,
} = require("./participants");
const {
  canViewPlanSummary,
  canViewPlanDetails,
  canApproveRsvp,
  canCheckIn,
  canEditPlan,
  canDeletePlan,
  canRsvpToPlan,
} = require("../domain/permissions");
const { computePlanMomentum } = require("../utils/planMomentum");

// ---------------------------------------------------------------------------
// Shared SQL fragment
// ---------------------------------------------------------------------------

const PLAN_BASE_FIELDS = `
  p.id,
  p.title,
  p.host_user_id       AS hostUserId,
  p.target_circle_id   AS targetCircleId,
  p.visibility_mode_id AS visibilityModeId,
  host.name            AS hostName,
  p.momentum_label     AS momentumLabel,
  p.time_label         AS timeLabel,
  p.duration_label     AS durationLabel,
  p.area,
  p.summary,
  p.is_online          AS isOnline
`;

// ---------------------------------------------------------------------------
// Decoration helpers
// ---------------------------------------------------------------------------

function participantCounts(planId) {
  const approved = getApprovedParticipants(planId);
  return {
    approvedParticipants: approved,
    confirmedCount:  approved.filter((p) => p.response === "down").length,
    interestedCount: approved.filter((p) => p.response !== "down").length,
  };
}

/**
 * Adds all derived/display fields to a raw plan row.
 * `roles` must already be computed by the caller (avoids double-queries).
 */
function decoratePlan(plan, roles, currentUser) {
  const canSeeDetails = canViewPlanDetails(roles, plan);
  const { approvedParticipants, confirmedCount, interestedCount } = participantCounts(plan.id);
  const { momentumTone } = computePlanMomentum(plan.id);
  const isHost = plan.hostUserId === currentUser?.id;
  const permissions = {
    canViewSummary: canViewPlanSummary(roles, plan),
    canViewDetails: canSeeDetails,
    canApproveRsvps: canApproveRsvp(roles, plan),
    canCheckIn: canCheckIn(roles),
    canEditPlan: canEditPlan(roles),
    canDeletePlan: canDeletePlan(roles),
    canRsvp: canRsvpToPlan(roles, plan),
  };

  return {
    ...plan,
    momentumTone,
    // Circle display
    circle:      circleIdToLabel(plan.targetCircleId),
    circleLabel: circleIdToLabel(plan.targetCircleId),
    circleTone:  circleIdToTone(plan.targetCircleId),
    // Visibility display
    visibilityMode:            plan.visibilityModeId,
    visibilityModeLabel:       visibilityModeLabel(plan.visibilityModeId),
    visibilityModeIcon:        visibilityModeIcon(plan.visibilityModeId),
    visibilityModeDescription: visibilityModeDescription(plan.visibilityModeId),
    // Access
    detailAccess: canSeeDetails ? "full" : "locked",
    ctaLabel:     canSeeDetails ? "Voir les détails" : "RSVP pour débloquer",
    accessNote:   canSeeDetails ? "" : "Les détails exacts se débloquent après approbation.",
    // Host info (admin only)
    creatorName: currentUser?.isAdmin ? (plan.hostName ?? "Créateur inconnu") : "",
    isEditable:  isHost || Boolean(currentUser?.isAdmin),
    viewerRoles: roles,
    permissions,
    // Participants
    participants:    canSeeDetails ? approvedParticipants : [],
    confirmedCount,
    interestedCount,
    currentUserApprovalStatus: getApprovalStatus(plan.id, currentUser?.id),
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

function getPlanSummaryRows(filters = {}, currentUser = null) {
  const rows = db.prepare(`
    SELECT ${PLAN_BASE_FIELDS}
    FROM plans p
    LEFT JOIN users host ON host.id = p.host_user_id
    ORDER BY p.id DESC
  `).all();

  return rows
    .map((plan, index) => {
      const roles = buildRolesForUser(plan, currentUser);
      if (!canViewPlanSummary(roles, plan)) return null;
      if (!matchesPlanFilters(plan, filters)) return null;

      return {
        ...decoratePlan(plan, roles, currentUser),
        featured: index === 0,
        muted:    index === 2,
        pendingApprovalCount: getPendingParticipants(plan.id).length,
      };
    })
    .filter(Boolean);
}

function getPlanDetail(planId, currentUser = null) {
  const plan = db.prepare(`
    SELECT
      ${PLAN_BASE_FIELDS},
      p.location_detail AS locationDetail
    FROM plans p
    LEFT JOIN users host ON host.id = p.host_user_id
    WHERE p.id = ?
  `).get(planId);

  if (!plan) return null;

  const roles = buildRolesForUser(plan, currentUser);
  if (!canViewPlanSummary(roles, plan)) return null;

  const canSeeDetails  = canViewPlanDetails(roles, plan);
  const isHost         = plan.hostUserId === currentUser?.id;
  const pendingApprovals = (isHost || Boolean(currentUser?.isAdmin)) ? getPendingParticipants(plan.id) : [];

  const checkins = canSeeDetails
    ? db.prepare(`
        SELECT c.id, c.message, c.minutes_ago AS minutesAgo, c.tone, u.name
        FROM checkins c
        JOIN users u ON u.id = c.user_id
        WHERE c.plan_id = ?
        ORDER BY c.minutes_ago ASC
      `).all(planId)
    : [];

  return {
    ...decoratePlan(plan, roles, currentUser),
    addressRule: canSeeDetails
      ? "Le lieu exact se confirme une fois le plan lancé."
      : "",
    locationDetail: canSeeDetails ? plan.locationDetail : null,
    lockedReason: plan.visibilityModeId === VISIBILITY_MODE.RSVP_FIRST && !canSeeDetails
      ? "Ce plan est en mode RSVP first. L'hôte doit approuver ta demande avant de révéler les détails exacts."
      : "",
    canApproveRsvps:  plan.visibilityModeId === VISIBILITY_MODE.RSVP_FIRST && (isHost || Boolean(currentUser?.isAdmin)),
    pendingApprovals,
    checkins,
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

function createPlan(input) {
  const targetCircleId   = input.targetCircleId   ?? circleLabelToId(input.circle) ?? CIRCLE.CONNEXIONS;
  const visibilityModeId = input.visibilityModeId ?? input.visibilityMode ?? VISIBILITY_MODE.CIRCLE_OPEN;

  const result = db.prepare(`
    INSERT INTO plans (
      title, host_user_id, target_circle_id, visibility_mode_id,
      momentum_label, time_label, duration_label,
      area, location_detail, summary, is_online
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.title,
    input.hostUserId ?? null,
    targetCircleId,
    visibilityModeId,
    input.momentumLabel ?? "Nouveau",
    input.timeLabel,
    input.durationLabel,
    input.area,
    input.locationDetail,
    input.summary,
    input.isOnline ? 1 : 0,
  );

  const { getUserById } = require("./users");
  const host = input.hostUserId ? getUserById(input.hostUserId) : null;
  return getPlanDetail(result.lastInsertRowid, host);
}

function updatePlan(planId, input, currentUser) {
  const plan = db.prepare(
    `SELECT id, host_user_id AS hostUserId FROM plans WHERE id = ?`
  ).get(planId);

  if (!plan || !currentUser) return null;
  if (plan.hostUserId !== currentUser.id && !currentUser.isAdmin) return null;

  const targetCircleId   = input.targetCircleId   ?? circleLabelToId(input.circle);
  const visibilityModeId = input.visibilityModeId ?? input.visibilityMode;

  db.prepare(`
    UPDATE plans
    SET title = ?, visibility_mode_id = ?, target_circle_id = ?,
        time_label = ?, area = ?, location_detail = ?, summary = ?, is_online = ?
    WHERE id = ?
  `).run(
    input.title,
    visibilityModeId,
    targetCircleId,
    input.timeLabel,
    input.area,
    input.locationDetail,
    input.summary,
    input.isOnline ? 1 : 0,
    planId,
  );

  return getPlanDetail(planId, currentUser);
}

function deletePlan(planId, currentUser) {
  const plan = db.prepare(
    `SELECT id, host_user_id AS hostUserId FROM plans WHERE id = ?`
  ).get(planId);

  if (!plan || !currentUser) return false;
  if (plan.hostUserId !== currentUser.id && !currentUser.isAdmin) return false;

  return db.prepare(`DELETE FROM plans WHERE id = ?`).run(planId).changes > 0;
}

// ---------------------------------------------------------------------------
// Filter helper (local — not shared globally)
// ---------------------------------------------------------------------------

function matchesPlanFilters(plan, filters = {}) {
  const { filter, visibility } = filters;

  // Audience filter by circle id
  if (visibility && visibility !== "all") {
    const targetId = Number(visibility);
    if (!Number.isNaN(targetId) && plan.targetCircleId !== targetId) return false;
  }

  if (!filter || filter === "all") return true;
  if (filter === "online") return Boolean(plan.isOnline);

  const timeLabel = String(plan.timeLabel || "").toLowerCase();
  if (filter === "now") {
    return (
      timeLabel.includes("vers") ||
      timeLabel.includes("prochaine heure") ||
      timeLabel.includes("30 min") ||
      timeLabel.includes("maintenant")
    );
  }
  if (filter === "tonight") {
    return (
      timeLabel.includes("soir") ||
      timeLabel.includes("21h") ||
      timeLabel.includes("20h")
    );
  }

  return true;
}

module.exports = { getPlanSummaryRows, getPlanDetail, createPlan, updatePlan, deletePlan };
