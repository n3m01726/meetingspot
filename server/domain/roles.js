const { VISIBILITY_MODE, circleAccessLevel } = require("../db/constants");

// ---------------------------------------------------------------------------
// Role constants
// ---------------------------------------------------------------------------

const PLAN_ROLES = {
  ADMIN:               "admin",
  HOST:                "host",
  APPROVED_PARTICIPANT: "approved_participant",
  PENDING_PARTICIPANT:  "pending_participant",
  CIRCLE_MEMBER:        "circle_member",
  PUBLIC_VIEWER:        "public_viewer",
};

// ---------------------------------------------------------------------------
// Context builder
//
// Computes the set of roles a user holds for a specific plan.
// Called once per request — keeps permission checks simple (just array lookups).
//
// @param {object|null} user
// @param {object}      plan        - must include visibilityModeId, hostUserId, targetCircleId
// @param {object}      ctx
// @param {number|null} ctx.relationshipCircleId   - circle_id from user_relationships row (or null)
// @param {string|null} ctx.approvalStatus          - 'approved' | 'pending' | null
// ---------------------------------------------------------------------------

function getRolesForPlan(user, plan, ctx = {}) {
  const roles = new Set();
  const mode  = plan.visibilityModeId;

  // Unauthenticated
  if (!user) {
    if (mode === VISIBILITY_MODE.PUBLIC_VIBE) roles.add(PLAN_ROLES.PUBLIC_VIEWER);
    return Array.from(roles);
  }

  if (user.isAdmin)                              roles.add(PLAN_ROLES.ADMIN);
  if (plan.hostUserId && plan.hostUserId === user.id) roles.add(PLAN_ROLES.HOST);
  if (mode === VISIBILITY_MODE.PUBLIC_VIBE)      roles.add(PLAN_ROLES.PUBLIC_VIEWER);

  // Circle membership: viewer's relationship circle must be >= plan's target circle
  const viewerCircleId = ctx.relationshipCircleId ?? null;
  if (
    viewerCircleId !== null &&
    circleAccessLevel(viewerCircleId) >= circleAccessLevel(plan.targetCircleId)
  ) {
    roles.add(PLAN_ROLES.CIRCLE_MEMBER);
  }

  if (ctx.approvalStatus === "approved") roles.add(PLAN_ROLES.APPROVED_PARTICIPANT);
  if (ctx.approvalStatus === "pending")  roles.add(PLAN_ROLES.PENDING_PARTICIPANT);

  return Array.from(roles);
}

module.exports = { PLAN_ROLES, getRolesForPlan, getUserRolesForPlan: getRolesForPlan };
