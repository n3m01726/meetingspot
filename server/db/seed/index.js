const { db } = require("../connection");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function columnExists(tableName, columnName) {
  return db
    .prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .some((col) => col.name === columnName);
}

function ensureColumn(tableName, columnName, definition) {
  if (!columnExists(tableName, columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

// ---------------------------------------------------------------------------
// Migrations
// ---------------------------------------------------------------------------

function runMigrations() {
  // plans
  ensureColumn("plans", "host_user_id",       "INTEGER");
  ensureColumn("plans", "target_circle_id",   "INTEGER NOT NULL DEFAULT 2");
  ensureColumn("plans", "visibility_mode_id", "INTEGER NOT NULL DEFAULT 2");

  // plan_participants
  ensureColumn("plan_participants", "approval_status",     "TEXT DEFAULT 'approved'");
  ensureColumn("plan_participants", "approved_by_user_id", "INTEGER");

  // users
  ensureColumn("users", "is_admin", "INTEGER NOT NULL DEFAULT 0");
}

module.exports = { runMigrations };
