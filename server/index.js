const fs      = require("fs");
const path    = require("path");
const express = require("express");

const {
  getOverview,
  getPlanSummaryRows,
  getPlanDetail,
  getPresenceRows,
  getUsers,
  getUserById,
  createPlan,
  updatePlan,
  deletePlan,
  upsertRsvp,
  approvePlanParticipant,
} = require("./db/index");

const {
  validatePlanPayload,
  validatePlanUpdatePayload,
  validateRsvpPayload,
  validateApprovalPayload,
  validateAuthPayload,
} = require("./validators");

const {
  readSessionUserId,
  createSession,
  clearSession,
  sessionCookieValue,
  expiredSessionCookieValue,
} = require("./auth");

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const app  = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "127.0.0.1";

const rootDirectory = path.join(__dirname, "..");
const distDirectory = path.join(rootDirectory, "dist");
const hasBuiltClient = fs.existsSync(path.join(distDirectory, "index.html"));

app.use(express.json());
app.use("/images", express.static(path.join(rootDirectory, "images")));

// Attach currentUser to every request
app.use((request, _response, next) => {
  const sessionUserId  = readSessionUserId(request);
  request.currentUser  = sessionUserId ? getUserById(sessionUserId) : null;
  next();
});

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

app.get("/api/me", (request, response) => {
  response.json(request.currentUser);
});

app.post("/api/auth/login", (request, response) => {
  const validation = validateAuthPayload(request.body || {});
  if (!validation.ok) {
    response.status(400).json({ error: validation.error });
    return;
  }

  const user = getUserById(validation.value.userId);
  if (!user) {
    response.status(404).json({ error: "Utilisateur introuvable." });
    return;
  }

  const token = createSession(user.id);
  response.setHeader("Set-Cookie", sessionCookieValue(token));
  response.json(user);
});

app.post("/api/auth/logout", (request, response) => {
  clearSession(request);
  response.setHeader("Set-Cookie", expiredSessionCookieValue());
  response.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

app.get("/api/users", (_request, response) => {
  response.json(getUsers());
});

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

app.get("/api/overview", (request, response) => {
  response.json(getOverview({
    filter:     request.query.filter,
    visibility: request.query.visibility,
  }, request.currentUser));
});

// ---------------------------------------------------------------------------
// Presence
// ---------------------------------------------------------------------------

app.get("/api/presence", (_request, response) => {
  response.json(getPresenceRows());
});

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

app.get("/api/plans", (request, response) => {
  response.json(getPlanSummaryRows({
    filter:     request.query.filter,
    visibility: request.query.visibility,
  }, request.currentUser));
});

app.get("/api/plans/:id", (request, response) => {
  const planId = Number.parseInt(request.params.id, 10);
  const plan   = getPlanDetail(planId, request.currentUser);

  if (!plan) {
    response.status(404).json({ error: "Plan introuvable ou non accessible." });
    return;
  }

  response.json(plan);
});

app.post("/api/plans", (request, response) => {
  if (!request.currentUser) {
    response.status(401).json({ error: "Connexion requise." });
    return;
  }

  const validation = validatePlanPayload(request.body || {});
  if (!validation.ok) {
    response.status(400).json({ error: validation.error });
    return;
  }

  const { friendName, title, visibilityModeId, targetCircleId, area, venue, timeLabel, durationLabel, summary } = validation.value;

  const planTitle = `${title || "Plan"}${friendName ? ` avec ${friendName}` : ""}`.trim();
  const isOnline  = area.toLowerCase().includes("ligne") || venue.toLowerCase().includes("discord");

  const plan = createPlan({
    title:           planTitle,
    hostUserId:      request.currentUser.id,
    targetCircleId,
    visibilityModeId,
    momentumLabel:   "Nouveau",
    timeLabel,
    durationLabel,
    area,
    locationDetail:  venue,
    summary:         summary || `Plan spontané proposé avec ${friendName || "un proche"}.`,
    isOnline,
  });

  response.status(201).json(plan);
});

app.put("/api/plans/:id", (request, response) => {
  const planId = Number.parseInt(request.params.id, 10);
  if (!Number.isInteger(planId) || planId <= 0) {
    response.status(400).json({ error: "Plan invalide" });
    return;
  }

  if (!request.currentUser) {
    response.status(401).json({ error: "Connexion requise." });
    return;
  }

  const validation = validatePlanUpdatePayload(request.body || {});
  if (!validation.ok) {
    response.status(400).json({ error: validation.error });
    return;
  }

  const body     = validation.value;
  const isOnline = body.area.toLowerCase().includes("ligne") || body.locationDetail.toLowerCase().includes("discord");

  const updatedPlan = updatePlan(planId, { ...body, isOnline }, request.currentUser);
  if (!updatedPlan) {
    response.status(403).json({ error: "Tu ne peux pas modifier ce plan." });
    return;
  }

  response.json(updatedPlan);
});

app.delete("/api/plans/:id", (request, response) => {
  const planId = Number.parseInt(request.params.id, 10);
  if (!Number.isInteger(planId) || planId <= 0) {
    response.status(400).json({ error: "Plan invalide" });
    return;
  }

  if (!request.currentUser) {
    response.status(401).json({ error: "Connexion requise." });
    return;
  }

  const deleted = deletePlan(planId, request.currentUser);
  if (!deleted) {
    response.status(403).json({ error: "Tu ne peux pas supprimer ce plan." });
    return;
  }

  response.json({ ok: true, deletedPlanId: planId });
});

// ---------------------------------------------------------------------------
// RSVP
// ---------------------------------------------------------------------------

app.post("/api/plans/:id/rsvp", (request, response) => {
  const planId = Number.parseInt(request.params.id, 10);
  if (!Number.isInteger(planId) || planId <= 0) {
    response.status(400).json({ error: "Plan invalide" });
    return;
  }

  const validation = validateRsvpPayload(request.body || {});
  if (!validation.ok) {
    response.status(400).json({ error: validation.error });
    return;
  }

  const userId =
    Number.isInteger(validation.value.userId) && validation.value.userId > 0
      ? validation.value.userId
      : request.currentUser?.id;

  if (!userId) {
    response.status(401).json({ error: "Connexion requise." });
    return;
  }

  const updatedPlan = upsertRsvp(planId, userId, validation.value.response, request.currentUser);
  if (!updatedPlan) {
    response.status(404).json({ error: "Plan introuvable ou non accessible." });
    return;
  }

  response.json(updatedPlan);
});

// ---------------------------------------------------------------------------
// Approval
// ---------------------------------------------------------------------------

app.post("/api/plans/:id/approve", (request, response) => {
  const planId = Number.parseInt(request.params.id, 10);
  if (!Number.isInteger(planId) || planId <= 0) {
    response.status(400).json({ error: "Plan invalide" });
    return;
  }

  if (!request.currentUser) {
    response.status(401).json({ error: "Connexion requise." });
    return;
  }

  const validation = validateApprovalPayload(request.body || {});
  if (!validation.ok) {
    response.status(400).json({ error: validation.error });
    return;
  }

  const updatedPlan = approvePlanParticipant(
    planId,
    request.currentUser.id,
    validation.value.participantUserId,
  );

  if (!updatedPlan) {
    response.status(404).json({ error: "Approbation impossible pour ce plan." });
    return;
  }

  response.json(updatedPlan);
});

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", date: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Static frontend
// ---------------------------------------------------------------------------

if (hasBuiltClient) {
  app.use(express.static(distDirectory));

  app.get("*", (request, response, next) => {
    if (request.path.startsWith("/api")) return next();
    response.sendFile(path.join(distDirectory, "index.html"));
  });
} else {
  app.get("/", (_request, response) => {
    response.status(200).send(
      "Frontend not built. Run `npm run dev` for Vite or `npm run build` before `npm start`."
    );
  });
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(port, host, () => {
  console.log(`meetingspot api running on http://${host}:${port}`);
  if (!hasBuiltClient) {
    console.log("frontend not built yet; run `npm run dev` or `npm run build`");
  }
});