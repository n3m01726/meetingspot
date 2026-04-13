const { db } = require("./connection");

// ---------------------------------------------------------------------------
// Shared field list
// ---------------------------------------------------------------------------

const USER_FIELDS = `
  id,
  name,
  is_admin  AS isAdmin,
  availability,
  image_path  AS imagePath,
  status_text AS statusText
`;

// ---------------------------------------------------------------------------
// Availability label
// ---------------------------------------------------------------------------

function availabilityLabel(value) {
  if (value === "down")     return "Down";
  if (value === "probable") return "Fort probable";
  return "Peut-être";
}

function mapUser(row) {
  return { ...row, availabilityLabel: availabilityLabel(row.availability) };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

function getUserById(userId) {
  const row = db.prepare(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`).get(userId);
  return row ? mapUser(row) : null;
}

function getUsers() {
  return db.prepare(`SELECT ${USER_FIELDS} FROM users ORDER BY name`).all().map(mapUser);
}

module.exports = { getUserById, getUsers };