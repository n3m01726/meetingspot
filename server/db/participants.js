const { db } = require("./connection");
const { VISIBILITY_MODES } = require("./constants");
const {
  normalizeResponseLabel,
  getPlanVisibilityMode,
  canUserSeePlanSummary,
  getParticipantApprovalStatus
} = require("./helpers");
const { getUserById } = require("./users");

function getParticipantsForPlan(planId, options = {}) {
  const { approvalStatus = null } = options;

  const clauses = ["pp.plan_id = ?"];
  const values = [planId];

  if (approvalStatus) {
    clauses.push("pp.approval_status = ?");
    values.push(approvalStatus);
  }

  const rows = db.prepare(`
    SELECT
      u.id,
      u.name,
      u.image_path AS imagePath,
      u.circle,
      pp.response,
      pp.note,
      pp.approval_status AS approvalStatus
    FROM plan_participants pp
    JOIN users u ON u.id = pp.user_id
    WHERE ${clauses.join(" AND ")}
    ORDER BY CASE pp.response WHEN 'down' THEN 1 WHEN 'probable' THEN 2 ELSE 3 END, u.name
  `).all(...values);

  return rows.map((row) => ({
    ...row,
    responseLabel: normalizeResponseLabel(row.response),
    isApproved: row.approvalStatus === "approved"
  }));
}

function getPendingApprovals(planId) {
  return getParticipantsForPlan(planId, { approvalStatus: "pending" });
}

function upsertRsvp(planId, userId, response, currentUser = null) {
  const plan = db.prepare(`
    SELECT
      p.id,
      p.circle,
      p.visibility_mode AS visibilityMode,
      p.host_user_id AS hostUserId,
      p.visibility
    FROM plans p
    WHERE p.id = ?
  `).get(planId);

  if (!plan || !canUserSeePlanSummary(plan, currentUser)) return null;

  if (response === "pass") {
    db.prepare(`
      DELETE FROM plan_participants
      WHERE plan_id = ? AND user_id = ?
    `).run(planId, userId);

    // Lazy import to avoid circular dependency with plans.js
    const { getPlanDetail } = require("./plans");
    return getPlanDetail(planId, currentUser);
  }

  const approvalStatus =
    getPlanVisibilityMode(plan) === VISIBILITY_MODES.RSVP_FIRST && plan.hostUserId !== userId
      ? "pending"
      : "approved";

  const approvedByUserId =
    approvalStatus === "approved" ? (plan.hostUserId || userId) : null;

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

  const { getPlanDetail } = require("./plans");
  return getPlanDetail(planId, currentUser);
}

function approvePlanParticipant(planId, hostUserId, participantUserId) {
  const plan = db.prepare(`
    SELECT
      id,
      host_user_id AS hostUserId,
      visibility_mode AS visibilityMode
    FROM plans
    WHERE id = ?
  `).get(planId);

  if (
    !plan ||
    plan.hostUserId !== hostUserId ||
    getPlanVisibilityMode(plan) !== VISIBILITY_MODES.RSVP_FIRST
  ) {
    return null;
  }

  const participant = db.prepare(`
    SELECT user_id AS userId
    FROM plan_participants
    WHERE plan_id = ? AND user_id = ?
  `).get(planId, participantUserId);

  if (!participant) return null;

  db.prepare(`
    UPDATE plan_participants
    SET approval_status = 'approved',
        approved_by_user_id = ?
    WHERE plan_id = ? AND user_id = ?
  `).run(hostUserId, planId, participantUserId);

  const { getPlanDetail } = require("./plans");
  return getPlanDetail(planId, getUserById(hostUserId));
}

module.exports = {
  getParticipantsForPlan,
  getPendingApprovals,
  upsertRsvp,
  approvePlanParticipant
};