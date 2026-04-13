const { initializeDatabase }                           = require("./seed/index");
const { VISIBILITY_MODE, CIRCLE }                      = require("./constants");
const { db }                                           = require("./connection");
const { getUsers, getUserById }                        = require("./users");
const { getPlanSummaryRows, getPlanDetail, createPlan, updatePlan, deletePlan } = require("./plans");
const { getPresenceRows, getOverview }                 = require("./overview");
const { upsertRsvp, approvePlanParticipant }           = require("./participants");

// Boot — clean schema + seed on every start
initializeDatabase();

module.exports = {
  // Constants
  VISIBILITY_MODE,
  CIRCLE,
  db,
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
};