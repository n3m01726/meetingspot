const { db }                                   = require("../connection");
const { createTables }                         = require("./schema");
const { seedUsers }                            = require("./users");
const { seedRelationships }                    = require("./relationships");
const { seedPlans, seedParticipants, seedCheckins } = require("./plans");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getUsersByName() {
  const rows = db.prepare("SELECT id, name FROM users").all();
  return Object.fromEntries(rows.map((u) => [u.name, u.id]));
}

function getPlansByTitle() {
  const rows = db.prepare("SELECT id, title FROM plans").all();
  return Object.fromEntries(rows.map((p) => [p.title, p.id]));
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function initializeDatabase() {
  // Clean slate — drops and recreates all tables
  createTables();

  seedUsers();

  const byName = getUsersByName();

  seedRelationships(byName);
  seedPlans(byName);

  const byTitle = getPlansByTitle();

  seedParticipants(byName, byTitle);
  seedCheckins(byName, byTitle);
}

module.exports = { initializeDatabase };