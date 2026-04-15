const {
  getRecentParticipantCount,
  getRecentCheckinCount,
  getLastPlanActivity,
} = require("../db/queries/planMomentumQueries");

const HOT_WINDOW_MINUTES = 10;
const NORMAL_WINDOW_MINUTES = 60;
const RECENT_ACTIVITY_WINDOW = 15;

const PARTICIPANT_UPDATE_WEIGHT = 3;
const CHECKIN_WEIGHT = 2;
const PLAN_AGE_DECAY_PER_HOUR = 0.35;
const MAX_PLAN_AGE_DECAY = 8;

function toUtcDate(timestamp) {
  if (!timestamp || typeof timestamp !== "string") return null;
  const normalized = timestamp.includes("T")
    ? timestamp
    : `${timestamp.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function minutesSince(timestamp, now) {
  const date = toUtcDate(timestamp);
  if (!date) return Number.POSITIVE_INFINITY;
  return Math.max(0, (now.getTime() - date.getTime()) / 60000);
}

function toneFromMinutesSinceActivity(minutes) {
  if (minutes <= HOT_WINDOW_MINUTES) return "hot";
  if (minutes <= NORMAL_WINDOW_MINUTES) return "normal";
  return "cold";
}

function recencyBonus(minutesSinceLastActivity) {
  if (minutesSinceLastActivity <= HOT_WINDOW_MINUTES) return 4;
  if (minutesSinceLastActivity <= NORMAL_WINDOW_MINUTES) return 2;
  return 0;
}

function planAgeDecay(minutesSincePlanCreated) {
  const decay = (minutesSincePlanCreated / 60) * PLAN_AGE_DECAY_PER_HOUR;
  return Math.min(MAX_PLAN_AGE_DECAY, decay);
}

function computePlanMomentum(planId) {
  const now = new Date();
  const recentParticipantCount = getRecentParticipantCount(planId, RECENT_ACTIVITY_WINDOW);
  const recentCheckinCount = getRecentCheckinCount(planId, RECENT_ACTIVITY_WINDOW);
  const activity = getLastPlanActivity(planId);

  if (!activity) {
    return { momentumTone: "cold", score: 0 };
  }

  const minutesSinceLastActivity = minutesSince(activity.lastActivityAt, now);
  const minutesSincePlanCreated = minutesSince(activity.planCreatedAt, now);

  const score =
    recentParticipantCount * PARTICIPANT_UPDATE_WEIGHT +
    recentCheckinCount * CHECKIN_WEIGHT +
    recencyBonus(minutesSinceLastActivity) -
    planAgeDecay(minutesSincePlanCreated);

  return {
    momentumTone: toneFromMinutesSinceActivity(minutesSinceLastActivity),
    score: Number(score.toFixed(2)),
  };
}

module.exports = {
  HOT_WINDOW_MINUTES,
  NORMAL_WINDOW_MINUTES,
  RECENT_ACTIVITY_WINDOW,
  computePlanMomentum,
};
