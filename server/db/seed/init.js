const { createTables }           = require("./schema/tables");
const { runMigrations }          = require("./migrations");
const {
  seedUsersIfEmpty,
  ensureAdminFlag,
  seedRelationshipsIfEmpty,
  removeStaleTestPlans,
  seedPlansIfEmpty,
  backfillPlans,
} = require("./seed");

function initializeDatabase() {
  createTables();
  runMigrations();
  seedUsersIfEmpty();
  ensureAdminFlag();
  seedRelationshipsIfEmpty();
  removeStaleTestPlans();
  seedPlansIfEmpty();
  backfillPlans();
}

module.exports = { initializeDatabase };
