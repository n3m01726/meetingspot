const PLAN_ROLES = {
  HOST: "host",
  APPROVED_PARTICIPANT: "approved_participant",
  PENDING_PARTICIPANT: "pending_participant",
  CIRCLE_MEMBER: "circle_member",
  PUBLIC_VIEWER: "public_viewer",
  ADMIN: "admin"
};

function getUserRolesForPlan(user, plan, context = {}) {
  const roles = new Set();
  const mode = plan.visibilityMode;

  if (!user) {
    if (mode === "public_vibe") {
      roles.add(PLAN_ROLES.PUBLIC_VIEWER);
    }

    return Array.from(roles);
  }

  if (user.isAdmin) {
    roles.add(PLAN_ROLES.ADMIN);
  }

  if (plan.hostUserId && plan.hostUserId === user.id) {
    roles.add(PLAN_ROLES.HOST);
  }

  if (mode === "public_vibe") {
    roles.add(PLAN_ROLES.PUBLIC_VIEWER);
  }

  if (context.relationshipMatchesCircle) {
    roles.add(PLAN_ROLES.CIRCLE_MEMBER);
  }

  if (context.participantApprovalStatus === "approved") {
    roles.add(PLAN_ROLES.APPROVED_PARTICIPANT);
  } else if (context.participantApprovalStatus === "pending") {
    roles.add(PLAN_ROLES.PENDING_PARTICIPANT);
  }

  return Array.from(roles);
}

module.exports = {
  PLAN_ROLES,
  getUserRolesForPlan
};
