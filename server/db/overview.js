const { db } = require("./connection");
const { normalizeResponseLabel, getRelationshipCircle } = require("./helpers");
const { getPlanSummaryRows } = require("./plans");

function getPresenceRows() {
  return db.prepare(`
    SELECT
      id,
      name,
      availability,
      circle,
      image_path AS imagePath,
      status_text AS statusText,
      seen_state AS seenState
    FROM users
    ORDER BY CASE availability WHEN 'down' THEN 1 WHEN 'probable' THEN 2 ELSE 3 END, name
  `).all().map((row) => ({
    ...row,
    availabilityLabel: normalizeResponseLabel(row.availability)
  }));
}

function getOverview(filters = {}, currentUser = null) {
  const presence = getPresenceRows()
    .filter((user) => user.id !== currentUser?.id)
    .map((user) => ({
      ...user,
      relationshipCircle: currentUser ? getRelationshipCircle(currentUser.id, user.id) : ""
    }));

  const plans = getPlanSummaryRows(filters, currentUser);

  return {
    currentUser,
    stats: {
      availableNow: presence.filter((user) => user.availability === "down").length,
      activePlans: plans.length,
      averageRadius: "2 km"
    },
    presence,
    plans
  };
}

module.exports = { getPresenceRows, getOverview };