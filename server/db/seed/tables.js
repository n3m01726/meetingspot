const { db } = require("../connection");

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      is_admin    INTEGER NOT NULL DEFAULT 0,
      availability TEXT   NOT NULL,
      circle      TEXT    NOT NULL,
      image_path  TEXT    NOT NULL,
      status_text TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plans (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      title              TEXT    NOT NULL,
      host_user_id       INTEGER,
      target_circle_id   INTEGER NOT NULL,
      visibility_mode_id INTEGER NOT NULL,
      momentum_label     TEXT    NOT NULL,
      time_label         TEXT    NOT NULL,
      duration_label     TEXT    NOT NULL,
      area               TEXT    NOT NULL,
      location_detail    TEXT    NOT NULL,
      summary            TEXT    NOT NULL,
      is_online          INTEGER NOT NULL DEFAULT 0,
      created_at         TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS plan_participants (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id             INTEGER NOT NULL,
      user_id             INTEGER NOT NULL,
      response            TEXT    NOT NULL,
      note                TEXT    NOT NULL DEFAULT '',
      approval_status     TEXT             DEFAULT 'approved',
      approved_by_user_id INTEGER,
      created_at          TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(plan_id, user_id),
      FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id    INTEGER NOT NULL,
      user_id    INTEGER NOT NULL,
      message    TEXT    NOT NULL,
      minutes_ago INTEGER NOT NULL,
      tone       TEXT    NOT NULL DEFAULT 'default',
      created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_relationships (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_user_id  INTEGER NOT NULL,
      member_user_id INTEGER NOT NULL,
      circle         TEXT    NOT NULL,
      created_at     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(owner_user_id, member_user_id),
      FOREIGN KEY (owner_user_id)  REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (member_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

module.exports = { createTables };
