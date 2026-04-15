const { db } = require("../connection");

/**
 * Drops all tables and recreates the schema from scratch.
 * Called once at boot in development / clean-start mode.
 */
function createTables() {
  db.exec(`
    -- Drop in reverse FK order so constraints don't block us
    DROP TABLE IF EXISTS checkins;
    DROP TABLE IF EXISTS plan_participants;
    DROP TABLE IF EXISTS user_relationships;
    DROP TABLE IF EXISTS plans;
    DROP TABLE IF EXISTS users;

    -- -----------------------------------------------------------------------
    -- users
    -- -----------------------------------------------------------------------
    CREATE TABLE users (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      is_admin     INTEGER NOT NULL DEFAULT 0,
      availability TEXT    NOT NULL,
      image_path   TEXT    NOT NULL,
      status_text  TEXT    NOT NULL
    );

    -- -----------------------------------------------------------------------
    -- plans
    --   target_circle_id   : 1 = Inner Circle, 2 = Connexions
    --   visibility_mode_id : 1 = RSVP first, 2 = Circle open, 3 = Public vibe
    -- -----------------------------------------------------------------------
    CREATE TABLE plans (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      title              TEXT    NOT NULL,
      host_user_id       INTEGER,
      target_circle_id   INTEGER NOT NULL DEFAULT 2,
      visibility_mode_id INTEGER NOT NULL DEFAULT 2,
      momentum_label     TEXT    NOT NULL,
      time_label         TEXT    NOT NULL,
      duration_label     TEXT    NOT NULL,
      area               TEXT    NOT NULL,
      location_detail    TEXT    NOT NULL,
      summary            TEXT    NOT NULL,
      is_online          INTEGER NOT NULL DEFAULT 0,
      created_at         TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- -----------------------------------------------------------------------
    -- plan_participants
    -- -----------------------------------------------------------------------
    CREATE TABLE plan_participants (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id             INTEGER NOT NULL,
      user_id             INTEGER NOT NULL,
      response            TEXT    NOT NULL,
      note                TEXT    NOT NULL DEFAULT '',
      approval_status     TEXT    NOT NULL DEFAULT 'approved',
      approved_by_user_id INTEGER,
      created_at          TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(plan_id, user_id),
      FOREIGN KEY (plan_id) REFERENCES plans(id)  ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE
    );

    -- -----------------------------------------------------------------------
    -- checkins
    -- -----------------------------------------------------------------------
    CREATE TABLE checkins (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id     INTEGER NOT NULL,
      user_id     INTEGER NOT NULL,
      message     TEXT    NOT NULL,
      minutes_ago INTEGER NOT NULL,
      tone        TEXT    NOT NULL DEFAULT 'default',
      created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- -----------------------------------------------------------------------
    -- user_relationships
    -- -----------------------------------------------------------------------
    CREATE TABLE user_relationships (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_user_id  INTEGER NOT NULL,
      member_user_id INTEGER NOT NULL,
      circle_id      INTEGER NOT NULL DEFAULT 2,
      created_at     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(owner_user_id, member_user_id),
      FOREIGN KEY (owner_user_id)  REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (member_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

module.exports = { createTables };