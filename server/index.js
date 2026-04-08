const fs = require("fs");
const path = require("path");
const express = require("express");
const {
  getOverview,
  getPlanSummaryRows,
  getPlanDetail,
  getPresenceRows,
  getUsers,
  getCurrentUser,
  getUserById,
  createPlan,
  upsertRsvp
} = require("./db");
const {
  validatePlanPayload,
  validateRsvpPayload,
  validateAuthPayload
} = require("./validators");
const {
  readSessionUserId,
  createSession,
  clearSession,
  sessionCookieValue,
  expiredSessionCookieValue
} = require("./auth");

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "127.0.0.1";
const rootDirectory = path.join(__dirname, "..");
const distDirectory = path.join(rootDirectory, "dist");
const hasBuiltClient = fs.existsSync(path.join(distDirectory, "index.html"));

app.use(express.json());
app.use("/images", express.static(path.join(rootDirectory, "images")));
app.use((request, _response, next) => {
  const sessionUserId = readSessionUserId(request);
  request.currentUser = sessionUserId ? getUserById(sessionUserId) : null;
  next();
});

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    date: new Date().toISOString()
  });
});

app.get("/api/me", (_request, response) => {
  response.json(_request.currentUser);
});

app.get("/api/users", (_request, response) => {
  response.json(getUsers());
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

app.get("/api/overview", (_request, response) => {
  response.json(getOverview({
    filter: _request.query.filter,
    circle: _request.query.circle,
    visibility: _request.query.visibility
  }, _request.currentUser));
});

app.get("/api/presence", (_request, response) => {
  response.json(getPresenceRows());
});

app.get("/api/plans", (_request, response) => {
  response.json(getPlanSummaryRows({
    filter: _request.query.filter,
    circle: _request.query.circle,
    visibility: _request.query.visibility
  }, _request.currentUser));
});

app.get("/api/plans/:id", (request, response) => {
  const planId = Number.parseInt(request.params.id, 10);
  const plan = getPlanDetail(planId, request.currentUser);

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

  const body = validation.value;
  const title = `${body.title || body.activity || "Plan"}${body.friendName ? ` avec ${body.friendName}` : ""}`.trim();
  const area = body.area;
  const venue = body.venue;
  const timeLabel = body.timeLabel;
  const plan = createPlan({
    title,
    activity: body.activity || "Custom",
    circle: body.visibility || "Inner Circle + Connexions",
    momentumLabel: "Nouveau",
    momentumTone: "normal",
    timeLabel,
    durationLabel: body.durationLabel,
    area,
    locationDetail: venue,
    summary: body.summary || `Plan spontané proposé avec ${body.friendName || "un proche"}.`,
    visibility: body.visibility || "Inner Circle + Connexions",
    addressRule: "Le lieu exact se confirme quand le plan prend forme.",
    isOnline: area.toLowerCase().includes("ligne") || venue.toLowerCase().includes("discord")
  });

  response.status(201).json(plan);
});

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

  const userId = Number.isInteger(validation.value.userId) && validation.value.userId > 0
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

if (hasBuiltClient) {
  app.use(express.static(distDirectory));

  app.get("*", (request, response, next) => {
    if (request.path.startsWith("/api")) {
      next();
      return;
    }

    response.sendFile(path.join(distDirectory, "index.html"));
  });
} else {
  app.get("/", (_request, response) => {
    response
      .status(200)
      .send("Frontend not built. Run `npm run dev` for Vite or `npm run build` before `npm start`.");
  });
}

app.listen(port, host, () => {
  console.log(`meetingspot api running on http://${host}:${port}`);
  if (!hasBuiltClient) {
    console.log("frontend not built yet; run `npm run dev` for Vite or `npm run build` for production assets");
  }
});
