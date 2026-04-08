const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDirectory = path.join(__dirname, "..", "data");
const databasePath = path.join(dataDirectory, "meetingspot.db");

fs.mkdirSync(dataDirectory, { recursive: true });

const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const VISIBILITY_MODES = {
  RSVP_FIRST: "rsvp_first",
  CIRCLE_OPEN: "circle_open",
  PUBLIC_VIBE: "public_vibe"
};

const VISIBILITY_MODE_LABELS = {
  [VISIBILITY_MODES.RSVP_FIRST]: "RSVP first",
  [VISIBILITY_MODES.CIRCLE_OPEN]: "Circle open",
  [VISIBILITY_MODES.PUBLIC_VIBE]: "Public vibe"
};

const seedUsers = [
  {
    name: "Nora",
    is_admin: 1,
    availability: "down",
    circle: "Inner Circle",
    image_path: "/images/Nora.jpeg",
    status_text: "Peut être là en 10 min",
    seen_state: "unseen"
  },
  {
    name: "Sam",
    is_admin: 0,
    availability: "down",
    circle: "Favori",
    image_path: "/images/Sam.jpeg",
    status_text: "Part du bureau bientôt",
    seen_state: "seen"
  },
  {
    name: "Julien",
    is_admin: 0,
    availability: "probable",
    circle: "Inner Circle",
    image_path: "/images/Julien.jpeg",
    status_text: "Confirme s'il finit à l'heure",
    seen_state: "unseen"
  },
  {
    name: "Maya",
    is_admin: 0,
    availability: "maybe",
    circle: "Connexions",
    image_path: "/images/Maya.jpeg",
    status_text: "Attend de voir le timing exact",
    seen_state: "seen"
  },
  {
    name: "Chris",
    is_admin: 0,
    availability: "down",
    circle: "Connexions",
    image_path: "/images/Chris.jpeg",
    status_text: "Open pour impro après 18h",
    seen_state: "unseen"
  },
  {
    name: "Ana",
    is_admin: 0,
    availability: "maybe",
    circle: "Favori",
    image_path: "/images/Ana.jpeg",
    status_text: "Peut embarquer plus tard",
    seen_state: "seen"
  }
];

const seedPlans = [
  {
    title: "Cafe express avant le gym",
    activity: "Cafe",
    circle: "Inner Circle",
    host_name: "Nora",
    visibility_mode: VISIBILITY_MODES.CIRCLE_OPEN,
    momentum_label: "Ça bouge maintenant",
    momentum_tone: "hot",
    time_label: "Vers 17h30",
    duration_label: "45 min",
    area: "Plateau",
    location_detail: "Plateau, près du métro Laurier",
    summary: "Plan spontané pour attraper un café, prendre des nouvelles et voir qui est encore chaud pour continuer la soirée après.",
    visibility: "Inner Circle",
    address_rule: "Adresse exacte visible quand tu passes en « Je suis dispo ».",
    is_online: 0
  },
  {
    title: "Balade sunset + bubble tea",
    activity: "Walk",
    circle: "Connexions",
    host_name: "Chris",
    visibility_mode: VISIBILITY_MODES.CIRCLE_OPEN,
    momentum_label: "Sunset vibe",
    momentum_tone: "normal",
    time_label: "18h - 20h",
    duration_label: "1h30",
    area: "Canal",
    location_detail: "Canal Lachine, point de rencontre partagé après RSVP",
    summary: "On se rejoint pour marcher sans pression, jaser un peu et prendre quelque chose sur le chemin si le mood est là.",
    visibility: "Connexions",
    address_rule: "Le point exact se révèle après confirmation.",
    is_online: 0
  },
  {
    title: "2 games chill après le dîner",
    activity: "Gaming",
    circle: "Connexions",
    host_name: "Ana",
    visibility_mode: VISIBILITY_MODES.PUBLIC_VIBE,
    momentum_label: "Chill plus tard",
    momentum_tone: "subtle",
    time_label: "Autour de 21h",
    duration_label: "1h",
    area: "En ligne",
    location_detail: "Discord + lobby partagé après confirmation",
    summary: "Petit plan léger pour gamer une heure, voir qui est dispo et garder la porte ouverte à plus si ça clique.",
    visibility: "Connexions",
    address_rule: "Le lien vocal se partage aux participantes et participants confirmés.",
    is_online: 1
  }
];

const seedRelationships = [
  { owner_name: "Nora", member_name: "Sam", circle: "Inner Circle" },
  { owner_name: "Nora", member_name: "Julien", circle: "Inner Circle" },
  { owner_name: "Nora", member_name: "Maya", circle: "Connexions" },
  { owner_name: "Nora", member_name: "Chris", circle: "Connexions" },
  { owner_name: "Nora", member_name: "Ana", circle: "Connexions" },
  { owner_name: "Chris", member_name: "Maya", circle: "Inner Circle" },
  { owner_name: "Chris", member_name: "Ana", circle: "Connexions" },
  { owner_name: "Chris", member_name: "Nora", circle: "Connexions" },
  { owner_name: "Chris", member_name: "Sam", circle: "Connexions" },
  { owner_name: "Chris", member_name: "Julien", circle: "Connexions" },
  { owner_name: "Ana", member_name: "Chris", circle: "Inner Circle" },
  { owner_name: "Ana", member_name: "Maya", circle: "Connexions" },
  { owner_name: "Ana", member_name: "Nora", circle: "Connexions" },
  { owner_name: "Sam", member_name: "Nora", circle: "Inner Circle" },
  { owner_name: "Sam", member_name: "Chris", circle: "Connexions" },
  { owner_name: "Julien", member_name: "Nora", circle: "Inner Circle" },
  { owner_name: "Julien", member_name: "Sam", circle: "Connexions" },
  { owner_name: "Maya", member_name: "Chris", circle: "Inner Circle" },
  { owner_name: "Maya", member_name: "Ana", circle: "Connexions" }
];

function columnExists(tableName, columnName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all().some((column) => column.name === columnName);
}

function ensureColumn(tableName, columnName, definition) {
  if (!columnExists(tableName, columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function getAllUsersByName() {
  const users = db.prepare("SELECT id, name FROM users").all();
  return Object.fromEntries(users.map((user) => [user.name, user.id]));
}

function getAccessLevel(circle) {
  if (circle === "Inner Circle" || circle === "Favori") {
    return 2;
  }

  if (circle === "Connexions" || circle === "Inner Circle + Connexions") {
    return 1;
  }

  return 0;
}

function normalizeCircle(circle) {
  return getAccessLevel(circle) >= 2 ? "Inner Circle" : "Connexions";
}

function normalizeResponseLabel(value) {
  return value === "down" ? "Down" : value === "probable" ? "Fort probable" : "Peut-être";
}

function normalizeCircleTone(circle) {
  return normalizeCircle(circle) === "Inner Circle" ? "inner" : "connections";
}

function ownerHasRelationships(ownerUserId) {
  return Boolean(db.prepare(`
    SELECT 1
    FROM user_relationships
    WHERE owner_user_id = ?
    LIMIT 1
  `).get(ownerUserId));
}

function getRelationshipCircle(ownerUserId, memberUserId) {
  if (!ownerUserId || !memberUserId || ownerUserId === memberUserId) {
    return "Inner Circle";
  }

  const relationship = db.prepare(`
    SELECT circle
    FROM user_relationships
    WHERE owner_user_id = ? AND member_user_id = ?
  `).get(ownerUserId, memberUserId);

  if (relationship?.circle) {
    return normalizeCircle(relationship.circle);
  }

  if (ownerHasRelationships(ownerUserId)) {
    return "";
  }

  const member = getUserById(memberUserId);
  return member ? normalizeCircle(member.circle) : "";
}

function canViewerAccessHostCircle(plan, currentUser) {
  if (!currentUser) {
    return false;
  }

  if (!plan.hostUserId) {
    return getAccessLevel(currentUser.circle) >= getAccessLevel(plan.circle);
  }

  const relationshipCircle = getRelationshipCircle(plan.hostUserId, currentUser.id);
  if (!relationshipCircle) {
    return false;
  }

  return getAccessLevel(relationshipCircle) >= getAccessLevel(normalizeCircle(plan.circle));
}

function getVisibilityModeLabel(mode) {
  return VISIBILITY_MODE_LABELS[mode] || VISIBILITY_MODE_LABELS[VISIBILITY_MODES.CIRCLE_OPEN];
}

function getVisibilityModeIcon(mode) {
  if (mode === VISIBILITY_MODES.RSVP_FIRST) {
    return "🔐";
  }

  if (mode === VISIBILITY_MODES.PUBLIC_VIBE) {
    return "🌍";
  }

  return "👥";
}

function getVisibilityModeDescription(mode) {
  if (mode === VISIBILITY_MODES.RSVP_FIRST) {
    return "Les détails exacts se débloquent après approbation de l’hôte.";
  }

  if (mode === VISIBILITY_MODES.PUBLIC_VIBE) {
    return "Ouvert au-delà du cercle. Les détails sont visibles immédiatement.";
  }

  return "Le cercle autorisé voit tous les détails immédiatement.";
}

function getPlanVisibilityMode(plan) {
  return plan.visibilityMode || VISIBILITY_MODES.CIRCLE_OPEN;
}

function canUserSeePlanSummary(plan, currentUser = null) {
  const mode = getPlanVisibilityMode(plan);

  if (mode === VISIBILITY_MODES.PUBLIC_VIBE) {
    return true;
  }

  if (!currentUser) {
    return false;
  }

  if (currentUser.isAdmin) {
    return true;
  }

  if (plan.hostUserId && plan.hostUserId === currentUser.id) {
    return true;
  }

  return canViewerAccessHostCircle(plan, currentUser);
}

function getParticipantApprovalStatus(planId, userId) {
  if (!userId) {
    return "none";
  }

  const row = db.prepare(`
    SELECT approval_status AS approvalStatus
    FROM plan_participants
    WHERE plan_id = ? AND user_id = ?
  `).get(planId, userId);

  return row?.approvalStatus || "none";
}

function canUserSeeFullPlanDetail(plan, currentUser = null) {
  const mode = getPlanVisibilityMode(plan);

  if (mode === VISIBILITY_MODES.PUBLIC_VIBE) {
    return true;
  }

  if (!currentUser) {
    return false;
  }

  if (currentUser.isAdmin) {
    return true;
  }

  if (plan.hostUserId && plan.hostUserId === currentUser.id) {
    return true;
  }

  if (mode === VISIBILITY_MODES.CIRCLE_OPEN) {
    return canViewerAccessHostCircle(plan, currentUser);
  }

  return getParticipantApprovalStatus(plan.id, currentUser.id) === "approved";
}

function matchesAudienceFilter(plan, visibility) {
  if (!visibility || visibility === "all") {
    return true;
  }

  if (visibility === "Inner Circle") {
    return normalizeCircle(plan.circle) === "Inner Circle";
  }

  if (visibility === "Connexions") {
    return normalizeCircle(plan.circle) === "Connexions";
  }

  if (visibility === "Inner Circle + Connexions") {
    return true;
  }

  return true;
}

function getParticipantsForPlan(planId, options = {}) {
  const {
    approvalStatus = null
  } = options;

  const clauses = ["pp.plan_id = ?"];
  const values = [planId];

  if (approvalStatus) {
    clauses.push("pp.approval_status = ?");
    values.push(approvalStatus);
  }

  const rows = db.prepare(`
    SELECT
      u.id,
      u.name,
      u.image_path AS imagePath,
      u.circle,
      pp.response,
      pp.note,
      pp.approval_status AS approvalStatus
    FROM plan_participants pp
    JOIN users u ON u.id = pp.user_id
    WHERE ${clauses.join(" AND ")}
    ORDER BY CASE pp.response WHEN 'down' THEN 1 WHEN 'probable' THEN 2 ELSE 3 END, u.name
  `).all(...values);

  return rows.map((row) => ({
    ...row,
    responseLabel: normalizeResponseLabel(row.response),
    isApproved: row.approvalStatus === "approved"
  }));
}

function getPendingApprovals(planId) {
  return getParticipantsForPlan(planId, { approvalStatus: "pending" });
}

function decoratePlanSummary(plan, currentUser = null, index = 0) {
  const visibilityMode = getPlanVisibilityMode(plan);
  const canSeeFullDetails = canUserSeeFullPlanDetail(plan, currentUser);
  const visibleParticipants = canSeeFullDetails ? getParticipantsForPlan(plan.id, { approvalStatus: "approved" }) : [];
  const approvedParticipants = getParticipantsForPlan(plan.id, { approvalStatus: "approved" });
  const pendingParticipants = getPendingApprovals(plan.id);
  const confirmed = approvedParticipants.filter((participant) => participant.response === "down");
  const interested = approvedParticipants.filter((participant) => participant.response !== "down");

  return {
    ...plan,
    featured: index === 0,
    muted: index === 2,
    circle: normalizeCircle(plan.circle),
    circleTone: normalizeCircleTone(plan.circle),
    creatorName: currentUser?.isAdmin ? (plan.hostName || "Créateur inconnu") : "",
    isEditable: plan.hostUserId === currentUser?.id,
    visibilityMode,
    visibilityModeLabel: getVisibilityModeLabel(visibilityMode),
    visibilityModeIcon: getVisibilityModeIcon(visibilityMode),
    visibilityModeDescription: getVisibilityModeDescription(visibilityMode),
    detailAccess: canSeeFullDetails ? "full" : "locked",
    ctaLabel: canSeeFullDetails ? "Voir les détails" : "RSVP pour débloquer",
    accessNote: canSeeFullDetails ? "" : "Les détails exacts se débloquent après approbation.",
    participants: visibleParticipants,
    confirmedCount: confirmed.length,
    interestedCount: interested.length,
    pendingApprovalCount: pendingParticipants.length,
    currentUserApprovalStatus: getParticipantApprovalStatus(plan.id, currentUser?.id)
  };
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      is_admin INTEGER NOT NULL DEFAULT 0,
      availability TEXT NOT NULL,
      circle TEXT NOT NULL,
      image_path TEXT NOT NULL,
      status_text TEXT NOT NULL,
      seen_state TEXT NOT NULL DEFAULT 'seen'
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      activity TEXT NOT NULL,
      circle TEXT NOT NULL,
      visibility_mode TEXT,
      host_user_id INTEGER,
      momentum_label TEXT NOT NULL,
      momentum_tone TEXT NOT NULL DEFAULT 'normal',
      time_label TEXT NOT NULL,
      duration_label TEXT NOT NULL,
      area TEXT NOT NULL,
      location_detail TEXT NOT NULL,
      summary TEXT NOT NULL,
      visibility TEXT NOT NULL,
      address_rule TEXT NOT NULL,
      is_online INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS plan_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      response TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      approval_status TEXT DEFAULT 'approved',
      approved_by_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(plan_id, user_id),
      FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      minutes_ago INTEGER NOT NULL,
      tone TEXT NOT NULL DEFAULT 'default',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_user_id INTEGER NOT NULL,
      member_user_id INTEGER NOT NULL,
      circle TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(owner_user_id, member_user_id),
      FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (member_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  ensureColumn("plans", "visibility_mode", "TEXT");
  ensureColumn("plans", "host_user_id", "INTEGER");
  ensureColumn("plan_participants", "approval_status", "TEXT DEFAULT 'approved'");
  ensureColumn("plan_participants", "approved_by_user_id", "INTEGER");
  ensureColumn("users", "is_admin", "INTEGER NOT NULL DEFAULT 0");

  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (name, is_admin, availability, circle, image_path, status_text, seen_state)
      VALUES (@name, @is_admin, @availability, @circle, @image_path, @status_text, @seen_state)
    `);
    const insertMany = db.transaction((items) => items.forEach((item) => insertUser.run(item)));
    insertMany(seedUsers);
  }

  db.prepare("UPDATE users SET is_admin = 1 WHERE name = 'Nora'").run();
  db.prepare("UPDATE users SET is_admin = COALESCE(is_admin, 0)").run();

  const relationshipCount = db.prepare("SELECT COUNT(*) AS count FROM user_relationships").get().count;
  if (relationshipCount === 0) {
    const byName = getAllUsersByName();
    const insertRelationship = db.prepare(`
      INSERT INTO user_relationships (owner_user_id, member_user_id, circle)
      VALUES (@owner_user_id, @member_user_id, @circle)
    `);
    const insertRelationships = db.transaction((items) => items.forEach((item) => insertRelationship.run(item)));
    insertRelationships(
      seedRelationships
        .map((relationship) => ({
          owner_user_id: byName[relationship.owner_name],
          member_user_id: byName[relationship.member_name],
          circle: normalizeCircle(relationship.circle)
        }))
        .filter((relationship) => relationship.owner_user_id && relationship.member_user_id)
    );
  }

  const testPlanTitles = [
    "RSVP first test plan",
    "Public vibe test plan",
    "Plan à éditer",
    "Plan Ã  Ã©diter",
    "Plan non éditable",
    "Plan non Ã©ditable"
  ];
  db.prepare(`DELETE FROM plans WHERE title IN (${testPlanTitles.map(() => "?").join(", ")})`).run(...testPlanTitles);

  const planCount = db.prepare("SELECT COUNT(*) AS count FROM plans").get().count;
  if (planCount === 0) {
    const insertPlan = db.prepare(`
      INSERT INTO plans (
        title, activity, circle, visibility_mode, momentum_label, momentum_tone, time_label,
        duration_label, area, location_detail, summary, visibility, address_rule, is_online
      ) VALUES (
        @title, @activity, @circle, @visibility_mode, @momentum_label, @momentum_tone, @time_label,
        @duration_label, @area, @location_detail, @summary, @visibility, @address_rule, @is_online
      )
    `);
    const insertPlans = db.transaction((items) => items.forEach((item) => insertPlan.run(item)));
    insertPlans(seedPlans);

    const byName = getAllUsersByName();
    const planIds = db.prepare("SELECT id, title FROM plans").all();
    const planByTitle = Object.fromEntries(planIds.map((plan) => [plan.title, plan.id]));

    const updateHost = db.prepare(`
      UPDATE plans
      SET host_user_id = ?
      WHERE id = ?
    `);
    seedPlans.forEach((plan) => {
      const hostUserId = byName[plan.host_name];
      const planId = planByTitle[plan.title];
      if (hostUserId && planId) {
        updateHost.run(hostUserId, planId);
      }
    });

    const participantRows = [
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Nora, response: "down", note: "Peut être là en 10 min", approval_status: "approved", approved_by_user_id: byName.Nora },
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Sam, response: "down", note: "Part du bureau bientôt", approval_status: "approved", approved_by_user_id: byName.Nora },
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Julien, response: "probable", note: "Confirme s'il finit à l'heure", approval_status: "approved", approved_by_user_id: byName.Nora },
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Maya, response: "maybe", note: "Attend de voir le timing exact", approval_status: "approved", approved_by_user_id: byName.Nora },
      { plan_id: planByTitle["Balade sunset + bubble tea"], user_id: byName.Maya, response: "down", note: "Peut partir du Sud-Ouest", approval_status: "approved", approved_by_user_id: byName.Chris },
      { plan_id: planByTitle["Balade sunset + bubble tea"], user_id: byName.Chris, response: "down", note: "Open si on part avant 19h", approval_status: "approved", approved_by_user_id: byName.Chris },
      { plan_id: planByTitle["Balade sunset + bubble tea"], user_id: byName.Ana, response: "maybe", note: "Peut rejoindre pour le bubble tea", approval_status: "approved", approved_by_user_id: byName.Chris },
      { plan_id: planByTitle["2 games chill après le dîner"], user_id: byName.Ana, response: "maybe", note: "Libre pour une game ou deux", approval_status: "approved", approved_by_user_id: byName.Ana },
      { plan_id: planByTitle["2 games chill après le dîner"], user_id: byName.Chris, response: "probable", note: "Peut hop on plus tard", approval_status: "approved", approved_by_user_id: byName.Ana }
    ];

    const insertParticipant = db.prepare(`
      INSERT INTO plan_participants (plan_id, user_id, response, note, approval_status, approved_by_user_id)
      VALUES (@plan_id, @user_id, @response, @note, @approval_status, @approved_by_user_id)
    `);
    const insertParticipants = db.transaction((items) => items.forEach((item) => insertParticipant.run(item)));
    insertParticipants(participantRows);

    const checkinRows = [
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Nora, message: "Je peux y être dans 10 minutes si vous partez bientôt.", minutes_ago: 2, tone: "default" },
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Julien, message: "Fort probable. Ping-moi si vous choisissez vraiment le spot près de Laurier.", minutes_ago: 6, tone: "yellow" },
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Maya, message: "Je regarde selon mon meeting. Gardez-moi dans la loop.", minutes_ago: 9, tone: "gray" },
      { plan_id: planByTitle["Balade sunset + bubble tea"], user_id: byName.Chris, message: "Je suis chaud si on garde ça relax et sans horaire trop strict.", minutes_ago: 5, tone: "default" }
    ];

    const insertCheckin = db.prepare(`
      INSERT INTO checkins (plan_id, user_id, message, minutes_ago, tone)
      VALUES (@plan_id, @user_id, @message, @minutes_ago, @tone)
    `);
    const insertCheckins = db.transaction((items) => items.forEach((item) => insertCheckin.run(item)));
    insertCheckins(checkinRows);
  }

  const byName = getAllUsersByName();
  const hostBackfill = {
    "Cafe express avant le gym": byName.Nora,
    "Balade sunset + bubble tea": byName.Chris,
    "2 games chill apres le diner": byName.Ana,
    "2 games chill après le dîner": byName.Ana
  };

  const plans = db.prepare("SELECT id, title, visibility_mode AS visibilityMode, host_user_id AS hostUserId FROM plans").all();
  const updatePlanMode = db.prepare("UPDATE plans SET visibility_mode = ? WHERE id = ?");
  const updatePlanHost = db.prepare("UPDATE plans SET host_user_id = ? WHERE id = ?");

  plans.forEach((plan) => {
    if (!plan.visibilityMode) {
      updatePlanMode.run(VISIBILITY_MODES.CIRCLE_OPEN, plan.id);
    }

    if (!plan.hostUserId && hostBackfill[plan.title]) {
      updatePlanHost.run(hostBackfill[plan.title], plan.id);
    }
  });

  db.prepare("UPDATE plan_participants SET approval_status = 'approved' WHERE approval_status IS NULL").run();
}

function matchesPlanFilters(plan, filters = {}) {
  const filter = filters.filter;
  const visibility = String(filters.visibility || "all");

  if (!matchesAudienceFilter(plan, visibility)) {
    return false;
  }

  const timeLabel = String(plan.timeLabel || "").toLowerCase();

  if (!filter || filter === "all") {
    return true;
  }

  if (filter === "online") {
    return Boolean(plan.isOnline);
  }

  if (filter === "now") {
    return timeLabel.includes("vers")
      || timeLabel.includes("prochaine heure")
      || timeLabel.includes("30 min")
      || timeLabel.includes("maintenant");
  }

  if (filter === "tonight") {
    return timeLabel.includes("soir")
      || timeLabel.includes("21h")
      || timeLabel.includes("20h");
  }

  return true;
}

function getPlanSummaryRows(filters = {}, currentUser = null) {
  const plans = db.prepare(`
    SELECT
      p.id,
      p.title,
      p.activity,
      p.circle,
      p.visibility_mode AS visibilityMode,
      p.host_user_id AS hostUserId,
      host.name AS hostName,
      p.momentum_label AS momentumLabel,
      p.momentum_tone AS momentumTone,
      p.time_label AS timeLabel,
      p.duration_label AS durationLabel,
      p.area,
      p.summary,
      p.visibility,
      p.is_online AS isOnline
    FROM plans p
    LEFT JOIN users host ON host.id = p.host_user_id
    ORDER BY p.id DESC
  `).all();

  return plans
    .filter((plan) => canUserSeePlanSummary(plan, currentUser) && matchesPlanFilters(plan, filters))
    .map((plan, index) => decoratePlanSummary(plan, currentUser, index));
}

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

function getUsers() {
  return db.prepare(`
    SELECT
      id,
      name,
      is_admin AS isAdmin,
      availability,
      circle,
      image_path AS imagePath,
      status_text AS statusText,
      seen_state AS seenState
    FROM users
    ORDER BY name
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

function getCurrentUser() {
  return db.prepare(`
    SELECT
      id,
      name,
      is_admin AS isAdmin,
      availability,
      circle,
      image_path AS imagePath,
      status_text AS statusText,
      seen_state AS seenState
    FROM users
    ORDER BY id
    LIMIT 1
  `).get();
}

function getUserById(userId) {
  return db.prepare(`
    SELECT
      id,
      name,
      is_admin AS isAdmin,
      availability,
      circle,
      image_path AS imagePath,
      status_text AS statusText,
      seen_state AS seenState
    FROM users
    WHERE id = ?
  `).get(userId) || null;
}

function getPlanDetail(planId, currentUser = null) {
  const plan = db.prepare(`
    SELECT
      p.id,
      p.title,
      p.activity,
      p.circle,
      p.visibility_mode AS visibilityMode,
      p.host_user_id AS hostUserId,
      host.name AS hostName,
      p.momentum_label AS momentumLabel,
      p.momentum_tone AS momentumTone,
      p.time_label AS timeLabel,
      p.duration_label AS durationLabel,
      p.area,
      p.location_detail AS locationDetail,
      p.summary,
      p.visibility,
      p.address_rule AS addressRule,
      p.is_online AS isOnline
    FROM plans p
    LEFT JOIN users host ON host.id = p.host_user_id
    WHERE p.id = ?
  `).get(planId);

  if (!plan || !canUserSeePlanSummary(plan, currentUser)) {
    return null;
  }

  const visibilityMode = getPlanVisibilityMode(plan);
  const canSeeFullDetails = canUserSeeFullPlanDetail(plan, currentUser);
  const approvedParticipants = getParticipantsForPlan(planId, { approvalStatus: "approved" });
  const pendingApprovals = plan.hostUserId === currentUser?.id ? getPendingApprovals(planId) : [];
  const confirmed = approvedParticipants.filter((participant) => participant.response === "down");
  const interested = approvedParticipants.filter((participant) => participant.response !== "down");
  const checkins = canSeeFullDetails
    ? db.prepare(`
        SELECT
          c.id,
          c.message,
          c.minutes_ago AS minutesAgo,
          c.tone,
          u.name
        FROM checkins c
        JOIN users u ON u.id = c.user_id
        WHERE c.plan_id = ?
        ORDER BY c.minutes_ago ASC
      `).all(planId)
    : [];

  return {
    ...plan,
    circle: normalizeCircle(plan.circle),
    circleTone: normalizeCircleTone(plan.circle),
    creatorName: currentUser?.isAdmin ? (plan.hostName || "Créateur inconnu") : "",
    isEditable: plan.hostUserId === currentUser?.id,
    visibilityMode,
    visibilityModeLabel: getVisibilityModeLabel(visibilityMode),
    visibilityModeIcon: getVisibilityModeIcon(visibilityMode),
    visibilityModeDescription: getVisibilityModeDescription(visibilityMode),
    detailAccess: canSeeFullDetails ? "full" : "locked",
    currentUserApprovalStatus: getParticipantApprovalStatus(planId, currentUser?.id),
    canApproveRsvps: visibilityMode === VISIBILITY_MODES.RSVP_FIRST && plan.hostUserId === currentUser?.id,
    pendingApprovals,
    participants: canSeeFullDetails ? approvedParticipants : [],
    confirmedCount: confirmed.length,
    interestedCount: interested.length,
    lockedReason: visibilityMode === VISIBILITY_MODES.RSVP_FIRST
      ? "Ce plan est en mode RSVP first. L’hôte doit approuver ta demande avant de révéler les détails exacts."
      : "",
    visibilityLines: [
      {
        tone: "vc-inner",
        title: "RSVP first",
        body: "Les détails exacts se débloquent seulement après approbation de l’hôte."
      },
      {
        tone: "vc-connections",
        title: "Circle open",
        body: "Le cercle autorisé voit immédiatement tous les détails du plan."
      },
      {
        tone: "vc-private",
        title: "Public vibe",
        body: "Le plan est ouvert au-delà du cercle et ses détails sont visibles immédiatement."
      }
    ],
    checkins
  };
}

function createPlan(input) {
  const insert = db.prepare(`
    INSERT INTO plans (
      title, activity, circle, visibility_mode, host_user_id, momentum_label, momentum_tone, time_label,
      duration_label, area, location_detail, summary, visibility, address_rule, is_online
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    input.title,
    input.activity,
    normalizeCircle(input.circle),
    input.visibilityMode || VISIBILITY_MODES.CIRCLE_OPEN,
    input.hostUserId || null,
    input.momentumLabel,
    input.momentumTone,
    input.timeLabel,
    input.durationLabel,
    input.area,
    input.locationDetail,
    input.summary,
    normalizeCircle(input.circle),
    input.addressRule,
    input.isOnline ? 1 : 0
  );

  return getPlanDetail(result.lastInsertRowid, input.hostUserId ? getUserById(input.hostUserId) : null);
}

function updatePlan(planId, input, currentUser) {
  const plan = db.prepare(`
    SELECT
      id,
      host_user_id AS hostUserId,
      activity,
      duration_label AS durationLabel,
      address_rule AS addressRule
    FROM plans
    WHERE id = ?
  `).get(planId);

  if (!plan || !currentUser || plan.hostUserId !== currentUser.id) {
    return null;
  }

  db.prepare(`
    UPDATE plans
    SET
      title = ?,
      visibility_mode = ?,
      time_label = ?,
      area = ?,
      location_detail = ?,
      summary = ?,
      visibility = ?,
      circle = ?,
      is_online = ?
    WHERE id = ?
  `).run(
    input.title,
    input.visibilityMode,
    input.timeLabel,
    input.area,
    input.locationDetail,
    input.summary,
    normalizeCircle(input.circle || currentUser.circle),
    normalizeCircle(input.circle || currentUser.circle),
    input.isOnline ? 1 : 0,
    planId
  );

  return getPlanDetail(planId, currentUser);
}

function deletePlan(planId, currentUser) {
  const plan = db.prepare(`
    SELECT
      id,
      host_user_id AS hostUserId
    FROM plans
    WHERE id = ?
  `).get(planId);

  if (!plan || !currentUser) {
    return false;
  }

  if (plan.hostUserId !== currentUser.id && !currentUser.isAdmin) {
    return false;
  }

  const result = db.prepare("DELETE FROM plans WHERE id = ?").run(planId);
  return result.changes > 0;
}

function upsertRsvp(planId, userId, response, currentUser = null) {
  const plan = db.prepare(`
    SELECT
      p.id,
      p.circle,
      p.visibility_mode AS visibilityMode,
      p.host_user_id AS hostUserId,
      p.visibility
    FROM plans p
    WHERE p.id = ?
  `).get(planId);

  if (!plan || !canUserSeePlanSummary(plan, currentUser)) {
    return null;
  }

  const approvalStatus = getPlanVisibilityMode(plan) === VISIBILITY_MODES.RSVP_FIRST && plan.hostUserId !== userId
    ? "pending"
    : "approved";
  const approvedByUserId = approvalStatus === "approved" ? (plan.hostUserId || userId) : null;

  const statement = db.prepare(`
    INSERT INTO plan_participants (plan_id, user_id, response, note, approval_status, approved_by_user_id)
    VALUES (?, ?, ?, '', ?, ?)
    ON CONFLICT(plan_id, user_id) DO UPDATE SET
      response = excluded.response,
      approval_status = CASE
        WHEN plan_participants.approval_status = 'approved' THEN 'approved'
        ELSE excluded.approval_status
      END,
      approved_by_user_id = CASE
        WHEN plan_participants.approval_status = 'approved' THEN plan_participants.approved_by_user_id
        ELSE excluded.approved_by_user_id
      END
  `);

  statement.run(planId, userId, response, approvalStatus, approvedByUserId);
  return getPlanDetail(planId, currentUser);
}

function approvePlanParticipant(planId, hostUserId, participantUserId) {
  const plan = db.prepare(`
    SELECT
      id,
      host_user_id AS hostUserId,
      visibility_mode AS visibilityMode,
      circle,
      visibility
    FROM plans
    WHERE id = ?
  `).get(planId);

  if (!plan || plan.hostUserId !== hostUserId || getPlanVisibilityMode(plan) !== VISIBILITY_MODES.RSVP_FIRST) {
    return null;
  }

  const participant = db.prepare(`
    SELECT user_id AS userId
    FROM plan_participants
    WHERE plan_id = ? AND user_id = ?
  `).get(planId, participantUserId);

  if (!participant) {
    return null;
  }

  db.prepare(`
    UPDATE plan_participants
    SET approval_status = 'approved',
        approved_by_user_id = ?
    WHERE plan_id = ? AND user_id = ?
  `).run(hostUserId, planId, participantUserId);

  return getPlanDetail(planId, getUserById(hostUserId));
}

initializeDatabase();

module.exports = {
  VISIBILITY_MODES,
  db,
  getOverview,
  getPlanSummaryRows,
  getPlanDetail,
  getPresenceRows,
  getUsers,
  getCurrentUser,
  getUserById,
  createPlan,
  updatePlan,
  deletePlan,
  upsertRsvp,
  approvePlanParticipant
};
