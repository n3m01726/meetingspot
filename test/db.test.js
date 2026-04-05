const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getOverview,
  getPlanSummaryRows,
  getPlanDetail,
  getUserById
} = require("../server/db");
const {
  validatePlanPayload,
  validateRsvpPayload,
  validateAuthPayload
} = require("../server/validators");

test("online filter returns only online plans", () => {
  const plans = getPlanSummaryRows({ filter: "online" });

  assert.ok(plans.length > 0);
  assert.ok(plans.every((plan) => Boolean(plan.isOnline)));
});

test("now filter excludes late-night online seed plan", () => {
  const plans = getPlanSummaryRows({ filter: "now" });

  assert.ok(plans.length > 0);
  assert.ok(plans.every((plan) => !String(plan.timeLabel).includes("21h")));
});

test("overview uses filtered plan collection", () => {
  const overview = getOverview({ filter: "online" });

  assert.equal(overview.stats.activePlans, 1);
  assert.equal(overview.plans.length, 1);
});

test("circle filter returns only matching circles", () => {
  const plans = getPlanSummaryRows({ circle: "Inner Circle" });

  assert.ok(plans.length > 0);
  assert.ok(plans.every((plan) => plan.circle === "Inner Circle"));
});

test("visibility filter returns only matching visibility", () => {
  const plans = getPlanSummaryRows({ visibility: "Connexions" });

  assert.ok(plans.length > 0);
  assert.ok(plans.every((plan) => plan.visibility === "Connexions"));
});

test("plan detail exposes participants and checkins", () => {
  const detail = getPlanDetail(1);

  assert.ok(detail);
  assert.ok(detail.participants.length > 0);
  assert.ok(detail.checkins.length > 0);
});

test("plan validator rejects missing area", () => {
  const result = validatePlanPayload({
    visibility: "Inner Circle",
    venue: "Olympico"
  });

  assert.equal(result.ok, false);
});

test("rsvp validator accepts expected values", () => {
  const result = validateRsvpPayload({
    userId: 1,
    response: "down"
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.userId, 1);
  assert.equal(result.value.response, "down");
});

test("auth validator accepts valid user ids", () => {
  const result = validateAuthPayload({ userId: 2 });

  assert.equal(result.ok, true);
  assert.equal(result.value.userId, 2);
});

test("db returns user by id", () => {
  const user = getUserById(1);

  assert.ok(user);
  assert.equal(user.name, "Nora");
});
