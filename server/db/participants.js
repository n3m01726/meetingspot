/**
 * server/db/participants.js
 *
 * Gestion des participants, RSVP et approbations.
 * N'importe plus plans.js directement — passe par planBaseQueries + un
 * callback injecté (getPlanDetail) pour éviter la dépendance circulaire.
 */

const { db }              = require("./connection");
const { VISIBILITY_MODE } = require("./constants");
const { getRolesForPlan } = require("../domain/roles");
const { canViewPlanSummary } = require("../domain/permissions");
const { getPlanForAccessCheck } = require("./queries/planBaseQueries");

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Retourne le circle_id de la relation entre owner et member, ou null.
 */
function getRelationshipCircleId(ownerUserId, memberUserId) {
  if (!ownerUserId || !memberUserId || ownerUserId === memberUserId) return null;

  const row = db.prepare(`
    SELECT circle_id FROM user_relationships
    WHERE owner_user_id = ? AND member_user_id = ?
  `).get(ownerUserId, memberUserId);

  return row?.circle_id ?? null;
}

function getApprovalStatus(planId, userId) {
  if (!userId) return null;
  const row = db.prepare(`
    SELECT approval_status FROM plan_participants
    WHERE plan_id = ? AND user_id = ?
  `).get(planId, userId);
  return row?.approval_status ?? null;
}

function buildRolesForUser(plan, user) {
  const relationshipCircleId = user
    ? getRelationshipCircleId(plan.hostUserId, user.id)
    : null;
  const approvalStatus = user ? getApprovalStatus(plan.id, user.id) : null;

  return getRolesForPlan(user, plan, { relationshipCircleId, approvalStatus });
}

// ---------------------------------------------------------------------------
// Participant lists
// ---------------------------------------------------------------------------

function getApprovedParticipants(planId) {
  const rows = db.prepare(`
    SELECT
      u.id,
      u.name,
      u.image_path   AS imagePath,
      pp.response,
      pp.note,
      pp.approval_status AS approvalStatus
    FROM plan_participants pp
    JOIN users u ON u.id = pp.user_id
    WHERE pp.plan_id = ? AND pp.approval_status = 'approved'
    ORDER BY CASE pp.response WHEN 'down' THEN 1 WHEN 'probable' THEN 2 ELSE 3 END, u.name
  `).all(planId);

  return rows.map((row) => ({ ...row, isApproved: true }));
}

function getPendingParticipants(planId) {
  const rows = db.prepare(`
    SELECT
      u.id,
      u.name,
      u.image_path   AS imagePath,
      pp.response,
      pp.note,
      pp.approval_status AS approvalStatus
    FROM plan_participants pp
    JOIN users u ON u.id = pp.user_id
    WHERE pp.plan_id = ? AND pp.approval_status = 'pending'
    ORDER BY u.name
  `).all(planId);

  return rows.map((row) => ({ ...row, isApproved: false }));
}

// ---------------------------------------------------------------------------
// RSVP
//
// `getPlanDetail` est injecté par plans.js à l'initialisation pour éviter
// le require circulaire. Voir planParticipantsInit() ci-dessous.
// ---------------------------------------------------------------------------

let _getPlanDetail = null;

/**
 * Appelé une seule fois par plans.js après que les deux modules sont chargés.
 * Injecte la référence à getPlanDetail sans créer de cycle au moment du require.
 */
function initPlanDetailResolver(fn) {
  _getPlanDetail = fn;
}

function upsertRsvp(planId, userId, response, currentUser = null) {
  const plan = getPlanForAccessCheck(planId);
  if (!plan) return null;

  const roles = buildRolesForUser(plan, currentUser);
  if (!canViewPlanSummary(roles, plan)) return null;

  // Pass → supprime la ligne participant
  if (response === "pass") {
    db.prepare(`DELETE FROM plan_participants WHERE plan_id = ? AND user_id = ?`).run(planId, userId);
    return _getPlanDetail(planId, currentUser);
  }

  // RSVP_FIRST : pending sauf si l'utilisateur est l'hôte
  const approvalStatus =
    plan.visibilityModeId === VISIBILITY_MODE.RSVP_FIRST && plan.hostUserId !== userId
      ? "pending"
      : "approved";

  const approvedByUserId = approvalStatus === "approved" ? (plan.hostUserId ?? userId) : null;

  db.prepare(`
    INSERT INTO plan_participants (plan_id, user_id, response, note, approval_status, approved_by_user_id)
    VALUES (?, ?, ?, '', ?, ?)
    ON CONFLICT(plan_id, user_id) DO UPDATE SET
      response = excluded.response,
      approval_status = CASE
        WHEN plan_participants.approval_status = 'approved' THEN 'approved'
        ELSE excluded.approval_status
      END,
      approved_by_user_id = CASE
        WHEN plan_participants.approval_status = 'approved' THEN plan_participants.approved_by_user_id
        ELSE excluded.approved_by_user_id
      END
  `).run(planId, userId, response, approvalStatus, approvedByUserId);

  return _getPlanDetail(planId, currentUser);
}

// ---------------------------------------------------------------------------
// Host approval
// ---------------------------------------------------------------------------

function approvePlanParticipant(planId, hostUserId, participantUserId) {
  const plan = db.prepare(`
    SELECT id, host_user_id AS hostUserId, visibility_mode_id AS visibilityModeId
    FROM plans WHERE id = ?
  `).get(planId);

  if (!plan || plan.hostUserId !== hostUserId) return null;
  if (plan.visibilityModeId !== VISIBILITY_MODE.RSVP_FIRST) return null;

  const participant = db.prepare(`
    SELECT user_id FROM plan_participants WHERE plan_id = ? AND user_id = ?
  `).get(planId, participantUserId);

  if (!participant) return null;

  db.prepare(`
    UPDATE plan_participants
    SET approval_status = 'approved', approved_by_user_id = ?
    WHERE plan_id = ? AND user_id = ?
  `).run(hostUserId, planId, participantUserId);

  const { getUserById } = require("./users");
  return _getPlanDetail(planId, getUserById(hostUserId));
}

module.exports = {
  getApprovedParticipants,
  getPendingParticipants,
  getApprovalStatus,
  getRelationshipCircleId,
  buildRolesForUser,
  upsertRsvp,
  approvePlanParticipant,
  initPlanDetailResolver,
};