const { PLAN_ROLES } = require("./roles");

function hasRole(roles, role) {
  return Array.isArray(roles) && roles.includes(role);
}

function canViewPlanSummary(roles, plan) {
  if (hasRole(roles, PLAN_ROLES.ADMIN) || hasRole(roles, PLAN_ROLES.HOST)) {
    return true;
  }

  if (plan.visibilityMode === "public_vibe") {
    return hasRole(roles, PLAN_ROLES.PUBLIC_VIEWER);
  }

  return hasRole(roles, PLAN_ROLES.CIRCLE_MEMBER);
}

function canViewPlanDetails(roles, plan) {
  if (hasRole(roles, PLAN_ROLES.ADMIN) || hasRole(roles, PLAN_ROLES.HOST)) {
    return true;
  }

  if (plan.visibilityMode === "public_vibe") {
    return hasRole(roles, PLAN_ROLES.PUBLIC_VIEWER);
  }

  if (plan.visibilityMode === "circle_open") {
    return hasRole(roles, PLAN_ROLES.CIRCLE_MEMBER);
  }

  return hasRole(roles, PLAN_ROLES.APPROVED_PARTICIPANT);
}

function canApproveRsvp(roles, plan) {
  return plan.visibilityMode === "rsvp_first"
    && (hasRole(roles, PLAN_ROLES.HOST) || hasRole(roles, PLAN_ROLES.ADMIN));
}

function canCheckIn(roles) {
  return hasRole(roles, PLAN_ROLES.ADMIN)
    || hasRole(roles, PLAN_ROLES.HOST)
    || hasRole(roles, PLAN_ROLES.APPROVED_PARTICIPANT);
}

function canEditPlan(roles) {
  return hasRole(roles, PLAN_ROLES.ADMIN) || hasRole(roles, PLAN_ROLES.HOST);
}

function canDeletePlan(roles) {
  return canEditPlan(roles);
}

function canRsvpToPlan(roles, plan) {
  if (hasRole(roles, PLAN_ROLES.ADMIN) || hasRole(roles, PLAN_ROLES.HOST)) {
    return true;
  }

  return canViewPlanSummary(roles, plan);
}

module.exports = {
  canViewPlanSummary,
  canViewPlanDetails,
  canApproveRsvp,
  canCheckIn,
  canEditPlan,
  canDeletePlan,
  canRsvpToPlan
};
