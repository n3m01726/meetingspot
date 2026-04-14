/**
 * server/db/seed/index.js
 *
 * En développement (ou CI), la base est recréée à chaque démarrage.
 * En production, positionner SKIP_SEED=true pour conserver les données.
 *
 *   SKIP_SEED=true node server/index.js
 */

const { db }                                        = require("../connection");
const { createTables }                              = require("./schema");
const { seedUsers }                                 = require("./users");
const { seedRelationships }                         = require("./relationships");
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
  if (process.env.SKIP_SEED === "true") {
    console.log("[db] SKIP_SEED=true — seed ignoré, données existantes conservées.");
    return;
  }

  console.log("[db] Recréation du schéma et seed des données...");

  createTables();
  seedUsers();

  const byName = getUsersByName();

  seedRelationships(byName);
  seedPlans(byName);

  const byTitle = getPlansByTitle();

  seedParticipants(byName, byTitle);
  seedCheckins(byName, byTitle);

  console.log("[db] Seed terminé.");
}

module.exports = { initializeDatabase };