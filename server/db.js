const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDirectory = path.join(__dirname, "..", "data");
const databasePath = path.join(dataDirectory, "meetingspot.db");

fs.mkdirSync(dataDirectory, { recursive: true });

const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const seedUsers = [
  {
    name: "Nora",
    availability: "down",
    circle: "Inner Circle",
    image_path: "/images/Nora.jpeg",
    status_text: "Peut etre la en 10 min",
    seen_state: "unseen",
  },
  {
    name: "Sam",
    availability: "down",
    circle: "Favori",
    image_path: "/images/Sam.jpeg",
    status_text: "Part du bureau bientot",
    seen_state: "seen",
  },
  {
    name: "Julien",
    availability: "probable",
    circle: "Inner Circle",
    image_path: "/images/Julien.jpeg",
    status_text: "Confirme s'il finit a l'heure",
    seen_state: "unseen",
  },
  {
    name: "Maya",
    availability: "maybe",
    circle: "Connexions",
    image_path: "/images/Maya.jpeg",
    status_text: "Attend de voir le timing exact",
    seen_state: "seen",
  },
  {
    name: "Chris",
    availability: "down",
    circle: "Connexions",
    image_path: "/images/Chris.jpeg",
    status_text: "Open pour impro apres 18h",
    seen_state: "unseen",
  },
  {
    name: "Ana",
    availability: "maybe",
    circle: "Favori",
    image_path: "/images/Ana.jpeg",
    status_text: "Peut embarquer plus tard",
    seen_state: "seen",
  }
];

const seedPlans = [
  {
    title: "Cafe express avant le gym",
    activity: "Cafe",
    circle: "Inner Circle",
    momentum_label: "Ca bouge maintenant",
    momentum_tone: "hot",
    time_label: "Vers 17h30",
    duration_label: "45 min",
    area: "Plateau",
    location_detail: "Plateau, pres du metro Laurier",
    summary:
      "Plan spontane pour attraper un cafe, prendre des nouvelles et voir qui est encore chaud pour continuer la soiree apres.",
    visibility: "Inner Circle + Connexions",
    address_rule: "Adresse exacte visible quand tu passes en \"Je suis dispo\".",
    is_online: 0,
  },
  {
    title: "Balade sunset + bubble tea",
    activity: "Walk",
    circle: "Connexions",
    momentum_label: "Sunset vibe",
    momentum_tone: "normal",
    time_label: "18h - 20h",
    duration_label: "1h30",
    area: "Canal",
    location_detail: "Canal Lachine, point de rencontre partage apres RSVP",
    summary:
      "On se rejoint pour marcher sans pression, jaser un peu et prendre quelque chose sur le chemin si le mood est la.",
    visibility: "Connexions",
    address_rule: "Le point exact se revele apres confirmation.",
    is_online: 0,
  },
  {
    title: "2 games chill apres le diner",
    activity: "Gaming",
    circle: "Connexions",
    momentum_label: "Chill plus tard",
    momentum_tone: "subtle",
    time_label: "Autour de 21h",
    duration_label: "1h",
    area: "En ligne",
    location_detail: "Discord + lobby partage apres confirmation",
    summary:
      "Petit plan leger pour gamer une heure, voir qui est dispo et garder la porte ouverte a plus si ca clique.",
    visibility: "Connexions",
    address_rule: "Le lien vocal se partage aux participants confirmes.",
    is_online: 1,
  }
];

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
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
  `);

  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (name, availability, circle, image_path, status_text, seen_state)
      VALUES (@name, @availability, @circle, @image_path, @status_text, @seen_state)
    `);
    const insertMany = db.transaction((items) => items.forEach((item) => insertUser.run(item)));
    insertMany(seedUsers);
  }

  const planCount = db.prepare("SELECT COUNT(*) AS count FROM plans").get().count;
  if (planCount === 0) {
    const insertPlan = db.prepare(`
      INSERT INTO plans (
        title, activity, circle, momentum_label, momentum_tone, time_label,
        duration_label, area, location_detail, summary, visibility, address_rule, is_online
      ) VALUES (
        @title, @activity, @circle, @momentum_label, @momentum_tone, @time_label,
        @duration_label, @area, @location_detail, @summary, @visibility, @address_rule, @is_online
      )
    `);
    const insertPlans = db.transaction((items) => items.forEach((item) => insertPlan.run(item)));
    insertPlans(seedPlans);

    const userIds = db.prepare("SELECT id, name FROM users").all();
    const byName = Object.fromEntries(userIds.map((user) => [user.name, user.id]));
    const planIds = db.prepare("SELECT id, title FROM plans").all();
    const planByTitle = Object.fromEntries(planIds.map((plan) => [plan.title, plan.id]));

    const participantRows = [
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Nora, response: "down", note: "Peut etre la en 10 min" },
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Sam, response: "down", note: "Part du bureau bientot" },
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Julien, response: "probable", note: "Confirme s'il finit a l'heure" },
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Maya, response: "maybe", note: "Attend de voir le timing exact" },
      { plan_id: planByTitle["Balade sunset + bubble tea"], user_id: byName.Maya, response: "down", note: "Peut partir du Sud-Ouest" },
      { plan_id: planByTitle["Balade sunset + bubble tea"], user_id: byName.Chris, response: "down", note: "Open si on part avant 19h" },
      { plan_id: planByTitle["Balade sunset + bubble tea"], user_id: byName.Ana, response: "maybe", note: "Peut rejoindre pour le bubble tea" },
      { plan_id: planByTitle["2 games chill apres le diner"], user_id: byName.Ana, response: "maybe", note: "Libre pour une game ou deux" },
      { plan_id: planByTitle["2 games chill apres le diner"], user_id: byName.Chris, response: "probable", note: "Peut hop on plus tard" }
    ];

    const insertParticipant = db.prepare(`
      INSERT INTO plan_participants (plan_id, user_id, response, note)
      VALUES (@plan_id, @user_id, @response, @note)
    `);
    const insertParticipants = db.transaction((items) => items.forEach((item) => insertParticipant.run(item)));
    insertParticipants(participantRows);

    const checkinRows = [
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Nora, message: "Je peux y etre dans 10 minutes si vous partez bientot.", minutes_ago: 2, tone: "default" },
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Julien, message: "Fort probable. Ping moi si vous choisissez vraiment le spot pres de Laurier.", minutes_ago: 6, tone: "yellow" },
      { plan_id: planByTitle["Cafe express avant le gym"], user_id: byName.Maya, message: "Je regarde selon mon meeting. Gardez-moi dans la loop.", minutes_ago: 9, tone: "gray" },
      { plan_id: planByTitle["Balade sunset + bubble tea"], user_id: byName.Chris, message: "Je suis chaud si on garde ca relax et sans horaire trop strict.", minutes_ago: 5, tone: "default" }
    ];

    const insertCheckin = db.prepare(`
      INSERT INTO checkins (plan_id, user_id, message, minutes_ago, tone)
      VALUES (@plan_id, @user_id, @message, @minutes_ago, @tone)
    `);
    const insertCheckins = db.transaction((items) => items.forEach((item) => insertCheckin.run(item)));
    insertCheckins(checkinRows);
  }
}

function normalizeResponseLabel(value) {
  return value === "down" ? "Down" : value === "probable" ? "Fort probable" : "Peut-etre";
}

function normalizeCircleTone(circle) {
  return circle === "Inner Circle" ? "inner" : "connections";
}

function getParticipantsForPlan(planId) {
  const rows = db.prepare(`
    SELECT
      u.id,
      u.name,
      u.image_path AS imagePath,
      u.circle,
      pp.response,
      pp.note
    FROM plan_participants pp
    JOIN users u ON u.id = pp.user_id
    WHERE pp.plan_id = ?
    ORDER BY CASE pp.response WHEN 'down' THEN 1 WHEN 'probable' THEN 2 ELSE 3 END, u.name
  `).all(planId);

  return rows.map((row) => ({
    ...row,
    responseLabel: normalizeResponseLabel(row.response)
  }));
}

function getPlanSummaryRows(filters = {}) {
  const plans = db.prepare(`
    SELECT
      p.id,
      p.title,
      p.activity,
      p.circle,
      p.momentum_label AS momentumLabel,
      p.momentum_tone AS momentumTone,
      p.time_label AS timeLabel,
      p.duration_label AS durationLabel,
      p.area,
      p.summary,
      p.visibility,
      p.is_online AS isOnline
    FROM plans p
    ORDER BY p.id
  `).all();

  const filteredPlans = plans.filter((plan) => matchesPlanFilters(plan, filters));

  return filteredPlans.map((plan, index) => {
    const participants = getParticipantsForPlan(plan.id);
    const confirmed = participants.filter((participant) => participant.response === "down");
    const interested = participants.filter((participant) => participant.response !== "down");

    return {
      ...plan,
      featured: index === 0,
      muted: index === 2,
      circleTone: normalizeCircleTone(plan.circle),
      participants,
      confirmedCount: confirmed.length,
      interestedCount: interested.length,
      participantSummary: {
        confirmed: confirmed.map((participant) => participant.name),
        interested: interested.map((participant) => participant.name)
      }
    };
  });
}

function matchesPlanFilters(plan, filters = {}) {
  const filter = filters.filter;
  const circle = String(filters.circle || "all");
  const visibility = String(filters.visibility || "all");

  if (!filter || filter === "all") {
    if (!matchesCircleAndVisibility(plan, circle, visibility)) {
      return false;
    }
  } else if (!matchesCircleAndVisibility(plan, circle, visibility)) {
    return false;
  }

  const timeLabel = String(plan.timeLabel || "").toLowerCase();

  if (filter === "online") {
    return Boolean(plan.isOnline);
  }

  if (filter === "now") {
    return timeLabel.includes("vers")
      || timeLabel.includes("prochaine heure")
      || timeLabel.includes("30 min");
  }

  if (filter === "tonight") {
    return timeLabel.includes("soir")
      || timeLabel.includes("21h")
      || timeLabel.includes("20h");
  }

  return true;
}

function matchesCircleAndVisibility(plan, circle, visibility) {
  if (circle !== "all" && plan.circle !== circle) {
    return false;
  }

  if (visibility !== "all" && plan.visibility !== visibility) {
    return false;
  }

  return true;
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
  const presence = getPresenceRows();
  const plans = getPlanSummaryRows(filters);

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
      availability,
      circle,
      image_path AS imagePath,
      status_text AS statusText,
      seen_state AS seenState
    FROM users
    WHERE id = ?
  `).get(userId) || null;
}

function getPlanDetail(planId) {
  const plan = db.prepare(`
    SELECT
      p.id,
      p.title,
      p.activity,
      p.circle,
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
    WHERE p.id = ?
  `).get(planId);

  if (!plan) {
    return null;
  }

  const participants = getParticipantsForPlan(planId);
  const confirmed = participants.filter((participant) => participant.response === "down");
  const interested = participants.filter((participant) => participant.response !== "down");
  const checkins = db.prepare(`
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
  `).all(planId);

  return {
    ...plan,
    circleTone: normalizeCircleTone(plan.circle),
    participants,
    confirmedCount: confirmed.length,
    interestedCount: interested.length,
    visibilityLines: [
      {
        tone: "vc-inner",
        title: "Inner Circle",
        body: "Voit tout immediatement, y compris le spot exact et qui a deja confirme."
      },
      {
        tone: "vc-connections",
        title: "Connexions / connaissances",
        body: "Voit l'intention, l'heure approximative et le quartier. L'adresse exacte se revele apres confirmation."
      },
      {
        tone: "vc-private",
        title: "Date en vue / prive",
        body: "Ce plan n'est pas dans ce mode-la. Si active, les details seraient visibles uniquement aux participants."
      }
    ],
    checkins
  };
}

function createPlan(input) {
  const insert = db.prepare(`
    INSERT INTO plans (
      title, activity, circle, momentum_label, momentum_tone, time_label,
      duration_label, area, location_detail, summary, visibility, address_rule, is_online
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    input.title,
    input.activity,
    input.circle,
    input.momentumLabel,
    input.momentumTone,
    input.timeLabel,
    input.durationLabel,
    input.area,
    input.locationDetail,
    input.summary,
    input.visibility,
    input.addressRule,
    input.isOnline ? 1 : 0
  );

  return getPlanDetail(result.lastInsertRowid);
}

function upsertRsvp(planId, userId, response) {
  const statement = db.prepare(`
    INSERT INTO plan_participants (plan_id, user_id, response, note)
    VALUES (?, ?, ?, '')
    ON CONFLICT(plan_id, user_id) DO UPDATE SET response = excluded.response
  `);

  statement.run(planId, userId, response);
  return getPlanDetail(planId);
}

initializeDatabase();

module.exports = {
  db,
  getOverview,
  getPlanSummaryRows,
  getPlanDetail,
  getPresenceRows,
  getUsers,
  getCurrentUser,
  getUserById,
  createPlan,
  upsertRsvp
};
