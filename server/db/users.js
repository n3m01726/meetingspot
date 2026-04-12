const { db } = require("./connection");
const { normalizeResponseLabel } = require("./helpers");

const USER_FIELDS = `
  id,
  name,
  is_admin AS isAdmin,
  availability,
  circle,
  image_path AS imagePath,
  status_text AS statusText,
  seen_state AS seenState
`;

function mapUser(row) {
  return {
    ...row,
    availabilityLabel: normalizeResponseLabel(row.availability)
  };
}

function getUserById(userId) {
  const row = db.prepare(`
    SELECT ${USER_FIELDS}
    FROM users
    WHERE id = ?
  `).get(userId);

  return row ? mapUser(row) : null;
}

function getUsers() {
  return db.prepare(`
    SELECT ${USER_FIELDS}
    FROM users
    ORDER BY name
  `).all().map(mapUser);
}

function getCurrentUser() {
  const row = db.prepare(`
    SELECT ${USER_FIELDS}
    FROM users
    ORDER BY id
    LIMIT 1
  `).get();

  return row ? mapUser(row) : null;
}

module.exports = { getUserById, getUsers, getCurrentUser };