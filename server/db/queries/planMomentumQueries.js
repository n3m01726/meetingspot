const { db } = require("../connection");

function getRecentParticipantCount(planId, minutes) {
  const row = db.prepare(`
    SELECT COUNT(*) AS count
    FROM plan_participants
    WHERE plan_id = ?
      AND created_at >= datetime('now', '-' || ? || ' minutes')
  `).get(planId, minutes);

  return row?.count ?? 0;
}

function getRecentCheckinCount(planId, minutes) {
  const row = db.prepare(`
    SELECT COUNT(*) AS count
    FROM checkins
    WHERE plan_id = ?
      AND created_at >= datetime('now', '-' || ? || ' minutes')
  `).get(planId, minutes);

  return row?.count ?? 0;
}

function getLastPlanActivity(planId) {
  return db.prepare(`
    SELECT
      p.created_at AS planCreatedAt,
      MAX(
        COALESCE(pp.latestParticipantAt, p.created_at),
        COALESCE(c.latestCheckinAt, p.created_at),
        p.created_at
      ) AS lastActivityAt
    FROM plans p
    LEFT JOIN (
      SELECT plan_id, MAX(created_at) AS latestParticipantAt
      FROM plan_participants
      GROUP BY plan_id
    ) pp ON pp.plan_id = p.id
    LEFT JOIN (
      SELECT plan_id, MAX(created_at) AS latestCheckinAt
      FROM checkins
      GROUP BY plan_id
    ) c ON c.plan_id = p.id
    WHERE p.id = ?
  `).get(planId);
}

module.exports = {
  getRecentParticipantCount,
  getRecentCheckinCount,
  getLastPlanActivity,
};
