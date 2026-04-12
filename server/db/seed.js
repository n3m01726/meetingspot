const { db } = require("./connection");
const { VISIBILITY_MODES } = require("./constants");
const { normalizeCircle } = require("./helpers");

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const seedUsers = [
  { name: "Nora", is_admin: 1, availability: "Disponible", image_path: "/images/Nora.jpeg", status_text: "Peut être là en 10 min" },
  { name: "Sam", is_admin: 0, availability: "Disponible", image_path: "/images/Sam.jpeg", status_text: "Part du bureau bientôt" },
  { name: "Julien", is_admin: 0, availability: "Probable", image_path: "/images/Julien.jpeg", status_text: "Confirme s'il finit à l'heure", },
  { name: "Maya", is_admin: 0, availability: "Ne sais pas",image_path: "/images/Maya.jpeg", status_text: "Attend de voir le timing exact"},
  { name: "Chris", is_admin: 0, availability: "Disponible", image_path: "/images/Chris.jpeg", status_text: "Open pour impro après 18h" },
  { name: "Ana", is_admin: 0, availability: "Ne sais pas", image_path: "/images/Ana.jpeg", status_text: "Peut embarquer plus tard" }
];

const seedPlans = [
  {
    title: "Cafe express avant le gym",
    host_name: "Nora",
    target_circle_id: 2, // CIRCLE_OPEN
    visibility_mode_id: 2, // CIRCLE_OPEN
    momentum_label: "Ça bouge maintenant",
    time_label: "Vers 17h30",
    duration_label: "45 min",
    area: "Plateau",
    location_detail: "Plateau, près du métro Laurier",
    summary: "Plan spontané pour attraper un café, prendre des nouvelles et voir qui est encore chaud pour continuer la soirée après.",
    is_online: 0
  },
  {
    title: "Balade sunset + bubble tea",
    host_name: "Chris",
    target_circle_id: 2, // CIRCLE_OPEN
    visibility_mode_id: 2, // CIRCLE_OPEN
    momentum_label: "Ça bouge maintenant",
    time_label: "18h - 20h",
    duration_label: "1h30",
    area: "Canal",
    location_detail: "Canal Lachine, point de rencontre partagé après RSVP",
    summary: "On se rejoint pour marcher sans pression, jaser un peu et prendre quelque chose sur le chemin si le mood est là.",
    is_online: 0
  },
  {
    title: "2 games chill après le dîner",
    host_name: "Ana",
    target_circle_id: 3, // PUBLIC_VIBE
    visibility_mode_id: 3, // PUBLIC_VIBE
    momentum_label: "Chill plus tard",
    time_label: "Autour de 21h",
    duration_label: "1h",
    area: "En ligne",
    location_detail: "Discord + lobby partagé après confirmation",
    summary: "Petit plan léger pour gamer une heure, voir qui est dispo et garder la porte ouverte à plus si ça clique.",
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

// ---------------------------------------------------------------------------
// Schema helpers
// ---------------------------------------------------------------------------

function columnExists(tableName, columnName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all()
    .some((col) => col.name === columnName);
}

function ensureColumn(tableName, columnName, definition) {
  if (!columnExists(tableName, columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function getAllUsersByName() {
  const users = db.prepare("SELECT id, name FROM users").all();
  return Object.fromEntries(users.map((u) => [u.name, u.id]));
}

// ---------------------------------------------------------------------------
// Schema creation
// ---------------------------------------------------------------------------

function createTables() {
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
}

function runMigrations() {
  ensureColumn("plans", "visibility_mode", "TEXT");
  ensureColumn("plans", "host_user_id", "INTEGER");
  ensureColumn("plan_participants", "approval_status", "TEXT DEFAULT 'approved'");
  ensureColumn("plan_participants", "approved_by_user_id", "INTEGER");
  ensureColumn("users", "is_admin", "INTEGER NOT NULL DEFAULT 0");
}

// ---------------------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------------------

function seedUsersIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO users (name, is_admin, availability, circle, image_path, status_text, seen_state)
    VALUES (@name, @is_admin, @availability, @circle, @image_path, @status_text, @seen_state)
  `);
  db.transaction((items) => items.forEach((item) => insert.run(item)))(seedUsers);
}

function ensureAdminFlag() {
  db.prepare("UPDATE users SET is_admin = 1 WHERE name = 'Nora'").run();
  db.prepare("UPDATE users SET is_admin = COALESCE(is_admin, 0)").run();
}

function seedRelationshipsIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) AS count FROM user_relationships").get().count;
  if (count > 0) return;

  const byName = getAllUsersByName();
  const insert = db.prepare(`
    INSERT INTO user_relationships (owner_user_id, member_user_id, circle)
    VALUES (@owner_user_id, @member_user_id, @circle)
  `);

  const rows = seedRelationships
    .map((r) => ({
      owner_user_id: byName[r.owner_name],
      member_user_id: byName[r.member_name],
      circle: normalizeCircle(r.circle)
    }))
    .filter((r) => r.owner_user_id && r.member_user_id);

  db.transaction((items) => items.forEach((item) => insert.run(item)))(rows);
}

function removeStaleTestPlans() {
  const staleTitles = [
    "RSVP first test plan",
    "Public vibe test plan",
    "Plan à éditer",
    "Plan Ã  Ã©diter",
    "Plan non éditable",
    "Plan non Ã©ditable"
  ];
  db.prepare(
    `DELETE FROM plans WHERE title IN (${staleTitles.map(() => "?").join(", ")})`
  ).run(...staleTitles);
}

function seedPlansIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) AS count FROM plans").get().count;
  if (count > 0) return;

  const byName = getAllUsersByName();

  const insertPlan = db.prepare(`
    INSERT INTO plans (
      title, activity, circle, visibility_mode, momentum_label, momentum_tone, time_label,
      duration_label, area, location_detail, summary, visibility, address_rule, is_online
    ) VALUES (
      @title, @activity, @circle, @visibility_mode, @momentum_label, @momentum_tone, @time_label,
      @duration_label, @area, @location_detail, @summary, @visibility, @address_rule, @is_online
    )
  `);
  db.transaction((items) => items.forEach((item) => insertPlan.run(item)))(seedPlans);

  // Assign host_user_id
  const planIds = db.prepare("SELECT id, title FROM plans").all();
  const planByTitle = Object.fromEntries(planIds.map((p) => [p.title, p.id]));
  const updateHost = db.prepare("UPDATE plans SET host_user_id = ? WHERE id = ?");

  seedPlans.forEach((plan) => {
    const hostUserId = byName[plan.host_name];
    const planId = planByTitle[plan.title];
    if (hostUserId && planId) updateHost.run(hostUserId, planId);
  });

  // Seed participants
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
  db.transaction((items) => items.forEach((item) => insertParticipant.run(item)))(participantRows);

  // Seed checkins
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
  db.transaction((items) => items.forEach((item) => insertCheckin.run(item)))(checkinRows);
}

// ---------------------------------------------------------------------------
// Backfill: ensure all plans have a visibility_mode and host_user_id
// ---------------------------------------------------------------------------

function backfillPlans() {
  const byName = getAllUsersByName();
  const hostBackfill = {
    "Cafe express avant le gym": byName.Nora,
    "Balade sunset + bubble tea": byName.Chris,
    "2 games chill apres le diner": byName.Ana,
    "2 games chill après le dîner": byName.Ana
  };

  const plans = db.prepare(`
    SELECT id, title, visibility_mode AS visibilityMode, host_user_id AS hostUserId
    FROM plans
  `).all();

  const updateMode = db.prepare("UPDATE plans SET visibility_mode = ? WHERE id = ?");
  const updateHost = db.prepare("UPDATE plans SET host_user_id = ? WHERE id = ?");

  plans.forEach((plan) => {
    if (!plan.visibilityMode) updateMode.run(VISIBILITY_MODES.CIRCLE_OPEN, plan.id);
    if (!plan.hostUserId && hostBackfill[plan.title]) {
      updateHost.run(hostBackfill[plan.title], plan.id);
    }
  });

  db.prepare(
    "UPDATE plan_participants SET approval_status = 'approved' WHERE approval_status IS NULL"
  ).run();
}

// ---------------------------------------------------------------------------
// Main init
// ---------------------------------------------------------------------------

function initializeDatabase() {
  createTables();
  runMigrations();
  seedUsersIfEmpty();
  ensureAdminFlag();
  seedRelationshipsIfEmpty();
  removeStaleTestPlans();
  seedPlansIfEmpty();
  backfillPlans();
}

module.exports = { initializeDatabase };