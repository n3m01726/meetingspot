const { db } = require("./connection");
const { getPlanSummaryRows } = require("./plans");
const { getRelationshipCircleId } = require("./participants");
const { circleIdToLabel } = require("./constants");

function availabilityLabel(value) {
  if (value === "down") return "I'm in!";
  if (value === "probable") return "maybe";
  return "offline";
}

function getPresenceRows() {
  return db.prepare(`
    SELECT id, name, availability, image_path AS imagePath, status_text AS statusText
    FROM users
    ORDER BY CASE availability WHEN 'down' THEN 1 WHEN 'probable' THEN 2 ELSE 3 END, name
  `).all().map((row) => ({
    ...row,
    availabilityLabel: availabilityLabel(row.availability),
  }));
}

function getOverview(filters = {}, currentUser = null) {
  const presence = getPresenceRows()
    .filter((user) => user.id !== currentUser?.id)
    .map((user) => {
      const circleId = currentUser
        ? getRelationshipCircleId(currentUser.id, user.id)
        : null;

      return {
        ...user,
        relationshipCircleId: circleId,
        relationshipCircleLabel: circleId ? circleIdToLabel(circleId) : "",
      };
    });

  const plans = getPlanSummaryRows(filters, currentUser);

  return {
    currentUser,
    stats: {
      availableNow: presence.filter((u) => u.availability === "down").length,
      activePlans: plans.length,
      averageRadius: "2 km",
    },
    presence,
    plans,
  };
}

module.exports = { getPresenceRows, getOverview };
