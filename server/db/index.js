const { initializeDatabase }                           = require("./seed/index");
const { VISIBILITY_MODE, CIRCLE }                      = require("./constants");
const { db }                                           = require("./connection");
const { getUsers, getUserById }                        = require("./users");
const { getPlanSummaryRows, getPlanDetail, createPlan, updatePlan, deletePlan } = require("./plans");
const { getPresenceRows, getOverview }                 = require("./overview");
const { upsertRsvp, approvePlanParticipant, buildRolesForUser } = require("./participants");
const {
  canViewPlanSummary,
  canViewPlanDetails,
  canApproveRsvp,
  canCheckIn,
  canEditPlan,
  canDeletePlan,
  canRsvpToPlan,
} = require("../domain/permissions");
const { getPublicProfile, getSelfProfile, updateUserSettings } = require("./profiles");
// Boot — clean schema + seed on every start
initializeDatabase();

function buildPlanAccessState(plan, currentUser = null) {
  const roles = buildRolesForUser(plan, currentUser);
  return {
    roles,
    permissions: {
      canViewSummary: canViewPlanSummary(roles, plan),
      canViewDetails: canViewPlanDetails(roles, plan),
      canApproveRsvps: canApproveRsvp(roles, plan),
      canCheckIn: canCheckIn(roles),
      canEditPlan: canEditPlan(roles),
      canDeletePlan: canDeletePlan(roles),
      canRsvp: canRsvpToPlan(roles, plan),
    },
  };
}

module.exports = {
  // Constants
  VISIBILITY_MODE,
  VISIBILITY_MODES: VISIBILITY_MODE,
  CIRCLE,
  db,
  buildPlanAccessState,
  // Users
  getUsers,
  getUserById,
  // Plans
  getPlanSummaryRows,
  getPlanDetail,
  createPlan,
  updatePlan,
  deletePlan,
  // Overview
  getPresenceRows,
  getOverview,
  // Participants
  upsertRsvp,
  approvePlanParticipant,

  // Profiles
  getPublicProfile,
getSelfProfile,
updateUserSettings,
};
