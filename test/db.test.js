const test = require("node:test");
const assert = require("node:assert/strict");

const {
  VISIBILITY_MODES,
  buildPlanAccessState,
  getOverview,
  getPlanSummaryRows,
  getPlanDetail,
  getUserById,
  createPlan,
  updatePlan,
  deletePlan,
  upsertRsvp,
  approvePlanParticipant
} = require("../server/db");
const { PLAN_ROLES, getUserRolesForPlan } = require("../server/domain/roles");
const {
  canViewPlanSummary,
  canViewPlanDetails,
  canApproveRsvp,
  canCheckIn,
  canEditPlan
} = require("../server/domain/permissions");
const {
  validatePlanPayload,
  validatePlanUpdatePayload,
  validateRsvpPayload,
  validateApprovalPayload,
  validateAuthPayload
} = require("../server/validators");

test("online filter returns only online plans", () => {
  const chris = getUserById(5);
  const plans = getPlanSummaryRows({ filter: "online" }, chris);

  assert.ok(plans.length > 0);
  assert.ok(plans.every((plan) => Boolean(plan.isOnline)));
});

test("now filter excludes late-night online seed plan", () => {
  const nora = getUserById(1);
  const plans = getPlanSummaryRows({ filter: "now" }, nora);

  assert.ok(plans.length > 0);
  assert.ok(plans.every((plan) => !String(plan.timeLabel).includes("21h")));
});

test("overview uses filtered plan collection", () => {
  const chris = getUserById(5);
  const overview = getOverview({ filter: "online" }, chris);

  assert.equal(overview.stats.activePlans, 1);
  assert.equal(overview.plans.length, 1);
});

test("visibility filter returns connexions plans", () => {
  const chris = getUserById(5);
  const plans = getPlanSummaryRows({ visibility: "Connexions" }, chris);

  assert.ok(plans.length > 0);
  assert.ok(plans.every((plan) => plan.circle === "Connexions"));
});

test("overview hides inner-circle plans from connexions users", () => {
  const maya = getUserById(4);
  const plans = getPlanSummaryRows({}, maya);

  assert.ok(plans.length > 0);
  assert.ok(plans.every((plan) => !(plan.circle === "Inner Circle" && plan.visibilityMode !== VISIBILITY_MODES.PUBLIC_VIBE)));
});

test("circle visibility depends on host-viewer relationship, not a global user circle", () => {
  const ana = getUserById(6);
  const sam = getUserById(2);
  const chris = getUserById(5);
  const plan = createPlan({
    title: "Ana inner circle only",
    activity: "Coffee",
    circle: "Inner Circle",
    visibilityMode: VISIBILITY_MODES.CIRCLE_OPEN,
    hostUserId: ana.id,
    momentumLabel: "Test",
    momentumTone: "normal",
    timeLabel: "Ce soir",
    durationLabel: "45 min",
    area: "Plateau",
    locationDetail: "Spot test",
    summary: "Visible seulement au Inner Circle de Ana.",
    addressRule: "Le lieu exact se confirme quand le plan prend forme.",
    isOnline: false
  });

  const samView = getPlanDetail(plan.id, sam);
  const chrisView = getPlanDetail(plan.id, chris);

  assert.equal(samView, null);
  assert.ok(chrisView);
  assert.equal(chrisView.detailAccess, "full");
});

test("a viewer can be inner circle for one host and not for another", () => {
  const nora = getUserById(1);
  const ana = getUserById(6);
  const sam = getUserById(2);

  const noraPlan = createPlan({
    title: "Nora inner circle only",
    activity: "Walk",
    circle: "Inner Circle",
    visibilityMode: VISIBILITY_MODES.CIRCLE_OPEN,
    hostUserId: nora.id,
    momentumLabel: "Test",
    momentumTone: "normal",
    timeLabel: "Maintenant",
    durationLabel: "1 h",
    area: "Plateau",
    locationDetail: "Point Nora",
    summary: "Sam peut voir ce plan.",
    addressRule: "Le lieu exact se confirme quand le plan prend forme.",
    isOnline: false
  });

  const anaPlan = createPlan({
    title: "Ana inner circle mismatch",
    activity: "Walk",
    circle: "Inner Circle",
    visibilityMode: VISIBILITY_MODES.CIRCLE_OPEN,
    hostUserId: ana.id,
    momentumLabel: "Test",
    momentumTone: "normal",
    timeLabel: "Maintenant",
    durationLabel: "1 h",
    area: "Rosemont",
    locationDetail: "Point Ana",
    summary: "Sam ne peut pas voir ce plan.",
    addressRule: "Le lieu exact se confirme quand le plan prend forme.",
    isOnline: false
  });

  assert.ok(getPlanDetail(noraPlan.id, sam));
  assert.equal(getPlanDetail(anaPlan.id, sam), null);
});

test("admin sees who created each visible plan", () => {
  const nora = getUserById(1);
  const plans = getPlanSummaryRows({}, nora);

  assert.ok(nora.isAdmin);
  assert.ok(plans.length > 0);
  assert.ok(plans.every((plan) => typeof plan.creatorName === "string" && plan.creatorName.length > 0));
});

test("overview presence excludes the current user", () => {
  const chris = getUserById(5);
  const overview = getOverview({}, chris);

  assert.ok(overview.presence.length > 0);
  assert.ok(overview.presence.every((user) => user.id !== chris.id));
});

test("plan detail exposes participants and checkins when access is full", () => {
  const detail = getPlanDetail(1, getUserById(1));

  assert.ok(detail);
  assert.equal(detail.detailAccess, "full");
  assert.ok(detail.participants.length > 0);
  assert.ok(detail.checkins.length > 0);
});

test("plan detail is blocked when user lacks summary access", () => {
  const maya = getUserById(4);
  const detail = getPlanDetail(1, maya);

  assert.equal(detail, null);
});

test("admin sees full detail and rsvps on restricted plans", () => {
  const nora = getUserById(1);
  const detail = getPlanDetail(2, nora);

  assert.ok(nora.isAdmin);
  assert.ok(detail);
  assert.equal(detail.detailAccess, "full");
  assert.ok(Array.isArray(detail.participants));
  assert.ok(detail.participants.length > 0);
});

test("role resolver returns host role with full plan permissions", () => {
  const nora = getUserById(1);
  const detail = getPlanDetail(1, nora);

  assert.ok(detail.viewerRoles.includes(PLAN_ROLES.HOST));
  assert.ok(detail.viewerRoles.includes(PLAN_ROLES.ADMIN));
  assert.equal(detail.permissions.canViewSummary, true);
  assert.equal(detail.permissions.canViewDetails, true);
  assert.equal(detail.permissions.canApproveRsvps, false);
  assert.equal(detail.permissions.canCheckIn, true);
  assert.equal(detail.permissions.canEditPlan, true);
});

test("role resolver keeps pending participants locked on RSVP first plans", () => {
  const chris = getUserById(5);
  const maya = getUserById(4);
  const plan = createPlan({
    title: "Role pending plan",
    activity: "Coffee",
    circle: "Connexions",
    visibilityMode: VISIBILITY_MODES.RSVP_FIRST,
    hostUserId: chris.id,
    momentumLabel: "Test",
    momentumTone: "normal",
    timeLabel: "Ce soir",
    durationLabel: "45 min",
    area: "Plateau",
    locationDetail: "Cafe test",
    summary: "Plan pour tester les rôles pending.",
    addressRule: "Les détails exacts se débloquent après approbation.",
    isOnline: false
  });

  upsertRsvp(plan.id, maya.id, "down", maya);
  const lockedDetail = getPlanDetail(plan.id, maya);

  assert.ok(lockedDetail.viewerRoles.includes(PLAN_ROLES.PENDING_PARTICIPANT));
  assert.equal(lockedDetail.viewerRoles.includes(PLAN_ROLES.APPROVED_PARTICIPANT), false);
  assert.equal(lockedDetail.permissions.canViewSummary, true);
  assert.equal(lockedDetail.permissions.canViewDetails, false);
  assert.equal(lockedDetail.permissions.canCheckIn, false);
});

test("rsvp first keeps detail locked until host approval", () => {
  const chris = getUserById(5);
  const maya = getUserById(4);
  const plan = createPlan({
    title: "RSVP first test plan",
    activity: "Coffee",
    circle: "Connexions",
    visibilityMode: VISIBILITY_MODES.RSVP_FIRST,
    hostUserId: chris.id,
    momentumLabel: "Nouveau",
    momentumTone: "normal",
    timeLabel: "Ce soir",
    durationLabel: "45 min",
    area: "Plateau",
    locationDetail: "Cafe test",
    summary: "Résumé visible avant approbation.",
    addressRule: "Les détails exacts se débloquent après approbation.",
    isOnline: false
  });

  const summaryRows = getPlanSummaryRows({}, maya);
  const lockedCard = summaryRows.find((item) => item.id === plan.id);
  assert.ok(lockedCard);
  assert.equal(lockedCard.detailAccess, "locked");
  assert.equal(lockedCard.ctaLabel, "RSVP pour débloquer");

  const lockedDetailBeforeRsvp = getPlanDetail(plan.id, maya);
  assert.ok(lockedDetailBeforeRsvp);
  assert.equal(lockedDetailBeforeRsvp.detailAccess, "locked");
  assert.equal(lockedDetailBeforeRsvp.participants.length, 0);
  assert.equal(lockedDetailBeforeRsvp.checkins.length, 0);

  const pendingDetail = upsertRsvp(plan.id, maya.id, "down", maya);
  assert.ok(pendingDetail);
  assert.equal(pendingDetail.detailAccess, "locked");
  assert.equal(pendingDetail.currentUserApprovalStatus, "pending");

  const hostView = getPlanDetail(plan.id, chris);
  assert.ok(hostView.canApproveRsvps);
  assert.equal(hostView.pendingApprovals.length, 1);

  const approved = approvePlanParticipant(plan.id, chris.id, maya.id);
  assert.ok(approved);
  assert.equal(approved.pendingApprovals.length, 0);

  const unlockedDetail = getPlanDetail(plan.id, maya);
  assert.ok(unlockedDetail);
  assert.equal(unlockedDetail.detailAccess, "full");
  assert.equal(unlockedDetail.currentUserApprovalStatus, "approved");
});

test("passing on a plan removes the participant instead of changing the RSVP status", () => {
  const nora = getUserById(1);
  const sam = getUserById(6);
  const plan = createPlan({
    title: "Plan pour tester je passe",
    activity: "Coffee",
    circle: "Connexions",
    visibilityMode: VISIBILITY_MODES.CIRCLE_OPEN,
    hostUserId: nora.id,
    momentumLabel: "Test",
    momentumTone: "normal",
    timeLabel: "Ce soir",
    durationLabel: "30 min",
    area: "Plateau",
    locationDetail: "Spot test",
    summary: "Plan pour tester le retrait de RSVP.",
    addressRule: "Le lieu exact est visible pour les personnes qui voient le plan.",
    isOnline: false
  });

  assert.ok(plan);

  const joined = upsertRsvp(plan.id, sam.id, "down", sam);
  assert.ok(joined);

  const before = getPlanDetail(plan.id, nora);
  assert.ok(before.participants.some((participant) => participant.id === sam.id));

  const updated = upsertRsvp(plan.id, sam.id, "pass", sam);
  assert.ok(updated);
  assert.ok(!updated.participants.some((participant) => participant.id === sam.id));

  const hostView = getPlanDetail(plan.id, nora);
  assert.ok(!hostView.participants.some((participant) => participant.id === sam.id));
});

test("public vibe exposes full detail beyond the base circle", () => {
  const nora = getUserById(1);
  const maya = getUserById(4);
  const plan = createPlan({
    title: "Public vibe test plan",
    activity: "Walk",
    circle: "Inner Circle",
    visibilityMode: VISIBILITY_MODES.PUBLIC_VIBE,
    hostUserId: nora.id,
    momentumLabel: "Public",
    momentumTone: "normal",
    timeLabel: "Maintenant",
    durationLabel: "1 h",
    area: "Canal",
    locationDetail: "Point public",
    summary: "Visible tout de suite au-delà du cercle.",
    addressRule: "Le point exact est visible immédiatement.",
    isOnline: false
  });

  const detail = getPlanDetail(plan.id, maya);
  assert.ok(detail);
  assert.equal(detail.detailAccess, "full");
  assert.equal(detail.visibilityMode, VISIBILITY_MODES.PUBLIC_VIBE);
  assert.ok(detail.viewerRoles.includes(PLAN_ROLES.PUBLIC_VIEWER));
  assert.equal(detail.permissions.canViewDetails, true);
});

test("permission helpers support multi-role resolution", () => {
  const roles = getUserRolesForPlan({ id: 1, isAdmin: true }, { hostUserId: 1, visibilityMode: VISIBILITY_MODES.RSVP_FIRST }, {
    participantApprovalStatus: "approved",
    relationshipMatchesCircle: true
  });

  assert.ok(roles.includes(PLAN_ROLES.ADMIN));
  assert.ok(roles.includes(PLAN_ROLES.HOST));
  assert.ok(roles.includes(PLAN_ROLES.APPROVED_PARTICIPANT));
  assert.equal(canViewPlanSummary(roles, { visibilityMode: VISIBILITY_MODES.RSVP_FIRST }), true);
  assert.equal(canViewPlanDetails(roles, { visibilityMode: VISIBILITY_MODES.RSVP_FIRST }), true);
  assert.equal(canApproveRsvp(roles, { visibilityMode: VISIBILITY_MODES.RSVP_FIRST }), true);
  assert.equal(canCheckIn(roles), true);
  assert.equal(canEditPlan(roles), true);
});

test("buildPlanAccessState exposes centralized permissions for approved participants", () => {
  const chris = getUserById(5);
  const maya = getUserById(4);
  const plan = createPlan({
    title: "Approved roles plan",
    activity: "Coffee",
    circle: "Connexions",
    visibilityMode: VISIBILITY_MODES.RSVP_FIRST,
    hostUserId: chris.id,
    momentumLabel: "Test",
    momentumTone: "normal",
    timeLabel: "Demain",
    durationLabel: "1 h",
    area: "Plateau",
    locationDetail: "Cafe test",
    summary: "Plan pour tester approved participant.",
    addressRule: "Les détails exacts se débloquent après approbation.",
    isOnline: false
  });

  upsertRsvp(plan.id, maya.id, "down", maya);
  approvePlanParticipant(plan.id, chris.id, maya.id);
  const accessState = buildPlanAccessState({ id: plan.id, hostUserId: chris.id, circle: "Connexions", visibilityMode: VISIBILITY_MODES.RSVP_FIRST }, maya);

  assert.ok(accessState.roles.includes(PLAN_ROLES.APPROVED_PARTICIPANT));
  assert.equal(accessState.permissions.canViewSummary, true);
  assert.equal(accessState.permissions.canViewDetails, true);
  assert.equal(accessState.permissions.canCheckIn, true);
});

test("host can edit their own plan", () => {
  const chris = getUserById(5);
  const plan = createPlan({
    title: "Plan à éditer",
    activity: "Coffee",
    circle: "Connexions",
    visibilityMode: VISIBILITY_MODES.CIRCLE_OPEN,
    hostUserId: chris.id,
    momentumLabel: "Nouveau",
    momentumTone: "normal",
    timeLabel: "Ce soir",
    durationLabel: "45 min",
    area: "Plateau",
    locationDetail: "Café initial",
    summary: "Version initiale.",
    addressRule: "Le lieu exact se confirme quand le plan prend forme.",
    isOnline: false
  });

  const updated = updatePlan(plan.id, {
    title: "Plan édité",
    visibilityMode: VISIBILITY_MODES.RSVP_FIRST,
    circle: "Connexions",
    timeLabel: "Demain midi",
    area: "Rosemont",
    locationDetail: "Nouveau café",
    summary: "Version éditée.",
    isOnline: false
  }, chris);

  assert.ok(updated);
  assert.equal(updated.title, "Plan édité");
  assert.equal(updated.visibilityMode, VISIBILITY_MODES.RSVP_FIRST);
  assert.equal(updated.area, "Rosemont");
  assert.equal(updated.isEditable, true);
});

test("non-host cannot edit someone else's plan", () => {
  const chris = getUserById(5);
  const maya = getUserById(4);
  const plan = createPlan({
    title: "Plan non éditable",
    activity: "Walk",
    circle: "Connexions",
    visibilityMode: VISIBILITY_MODES.CIRCLE_OPEN,
    hostUserId: chris.id,
    momentumLabel: "Nouveau",
    momentumTone: "normal",
    timeLabel: "Ce soir",
    durationLabel: "45 min",
    area: "Centre-ville",
    locationDetail: "Point initial",
    summary: "Doit rester protégé.",
    addressRule: "Le lieu exact se confirme quand le plan prend forme.",
    isOnline: false
  });

  const updated = updatePlan(plan.id, {
    title: "Tentative",
    visibilityMode: VISIBILITY_MODES.PUBLIC_VIBE,
    circle: "Connexions",
    timeLabel: "Plus tard",
    area: "Plateau",
    locationDetail: "Point modifié",
    summary: "Tentative de modification.",
    isOnline: false
  }, maya);

  assert.equal(updated, null);
});

test("host can delete their own plan", () => {
  const chris = getUserById(5);
  const plan = createPlan({
    title: "Plan à supprimer",
    activity: "Walk",
    circle: "Connexions",
    visibilityMode: VISIBILITY_MODES.CIRCLE_OPEN,
    hostUserId: chris.id,
    momentumLabel: "Nouveau",
    momentumTone: "normal",
    timeLabel: "Ce soir",
    durationLabel: "45 min",
    area: "Canal",
    locationDetail: "Point à supprimer",
    summary: "Ce plan doit pouvoir être supprimé.",
    addressRule: "Le lieu exact se confirme quand le plan prend forme.",
    isOnline: false
  });

  const deleted = deletePlan(plan.id, chris);

  assert.equal(deleted, true);
  assert.equal(getPlanDetail(plan.id, chris), null);
});

test("non-host cannot delete someone else's plan", () => {
  const chris = getUserById(5);
  const maya = getUserById(4);
  const plan = createPlan({
    title: "Plan protégé",
    activity: "Coffee",
    circle: "Connexions",
    visibilityMode: VISIBILITY_MODES.CIRCLE_OPEN,
    hostUserId: chris.id,
    momentumLabel: "Nouveau",
    momentumTone: "normal",
    timeLabel: "Ce soir",
    durationLabel: "45 min",
    area: "Plateau",
    locationDetail: "Point protégé",
    summary: "Maya ne doit pas pouvoir supprimer ce plan.",
    addressRule: "Le lieu exact se confirme quand le plan prend forme.",
    isOnline: false
  });

  assert.equal(deletePlan(plan.id, maya), false);
  assert.ok(getPlanDetail(plan.id, chris));
});

test("plan validator rejects missing area", () => {
  const result = validatePlanPayload({
    visibilityMode: VISIBILITY_MODES.CIRCLE_OPEN,
    venue: "Olympico"
  });

  assert.equal(result.ok, false);
});

test("plan validator accepts new visibility mode payload", () => {
  const result = validatePlanPayload({
    visibilityMode: VISIBILITY_MODES.RSVP_FIRST,
    area: "Plateau",
    venue: "Cafe",
    activity: "Coffee"
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.visibilityMode, VISIBILITY_MODES.RSVP_FIRST);
});

test("plan update validator accepts edit payload", () => {
  const result = validatePlanUpdatePayload({
    title: "Plan mis à jour",
    visibilityMode: VISIBILITY_MODES.PUBLIC_VIBE,
    circle: "Connexions",
    timeLabel: "Demain",
    area: "Plateau",
    locationDetail: "Parc",
    summary: "Nouveau résumé"
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.title, "Plan mis à jour");
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

test("rsvp validator accepts pass for RSVP removal", () => {
  const result = validateRsvpPayload({
    userId: 1,
    response: "pass"
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.userId, 1);
  assert.equal(result.value.response, "pass");
});

test("approval validator accepts participant ids", () => {
  const result = validateApprovalPayload({ participantUserId: 4 });

  assert.equal(result.ok, true);
  assert.equal(result.value.participantUserId, 4);
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
