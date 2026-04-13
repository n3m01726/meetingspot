const { PLAN_ROLES } = require("./roles");
const { VISIBILITY_MODE } = require("../db/constants");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasRole(roles, role) {
  return Array.isArray(roles) && roles.includes(role);
}

function isPrivileged(roles) {
  return hasRole(roles, PLAN_ROLES.ADMIN) || hasRole(roles, PLAN_ROLES.HOST);
}

// ---------------------------------------------------------------------------
// Permission checks
// Each function takes a `roles` array (from getRolesForPlan) and the plan.
// ---------------------------------------------------------------------------

/** Can the user see the plan card in list views? */
function canViewPlanSummary(roles, plan) {
  if (isPrivileged(roles))                              return true;
  if (plan.visibilityModeId === VISIBILITY_MODE.PUBLIC_VIBE) return true;
  return hasRole(roles, PLAN_ROLES.CIRCLE_MEMBER);
}

/** Can the user see location details, checkins, and participant list? */
function canViewPlanDetails(roles, plan) {
  if (isPrivileged(roles))                              return true;
  if (plan.visibilityModeId === VISIBILITY_MODE.PUBLIC_VIBE) return true;
  if (plan.visibilityModeId === VISIBILITY_MODE.CIRCLE_OPEN) return hasRole(roles, PLAN_ROLES.CIRCLE_MEMBER);
  // RSVP_FIRST: must be an approved participant
  return hasRole(roles, PLAN_ROLES.APPROVED_PARTICIPANT);
}

/** Can the user approve pending RSVPs? */
function canApproveRsvp(roles, plan) {
  return plan.visibilityModeId === VISIBILITY_MODE.RSVP_FIRST && isPrivileged(roles);
}

/** Can the user post a checkin? */
function canCheckIn(roles) {
  return (
    isPrivileged(roles) ||
    hasRole(roles, PLAN_ROLES.APPROVED_PARTICIPANT)
  );
}

/** Can the user edit the plan? */
function canEditPlan(roles) {
  return isPrivileged(roles);
}

/** Can the user delete the plan? */
function canDeletePlan(roles) {
  return isPrivileged(roles);
}

/** Can the user submit an RSVP? */
function canRsvpToPlan(roles, plan) {
  return isPrivileged(roles) || canViewPlanSummary(roles, plan);
}

module.exports = {
  canViewPlanSummary,
  canViewPlanDetails,
  canApproveRsvp,
  canCheckIn,
  canEditPlan,
  canDeletePlan,
  canRsvpToPlan,
};