const { db } = require("../connection");
const { VISIBILITY_MODE, CIRCLE } = require("../constants");

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_PLANS = [
  {
    title: "Cafe express avant le gym",
    host_name: "Nora",
    target_circle_id: CIRCLE.CONNEXIONS,
    visibility_mode_id: VISIBILITY_MODE.CIRCLE_OPEN,
    momentum_label: "Ça bouge maintenant",
    time_label: "Vers 17h30",
    duration_label: "45 min",
    area: "Plateau",
    location_detail: "Plateau, près du métro Laurier",
    summary: "Plan spontané pour attraper un café, prendre des nouvelles et voir qui est encore chaud pour continuer la soirée après.",
    is_online: 0,
  },
  {
    title: "Balade sunset + bubble tea",
    host_name: "Chris",
    target_circle_id: CIRCLE.CONNEXIONS,
    visibility_mode_id: VISIBILITY_MODE.CIRCLE_OPEN,
    momentum_label: "Ça bouge maintenant",
    time_label: "18h - 20h",
    duration_label: "1h30",
    area: "Canal",
    location_detail: "Canal Lachine, point de rencontre partagé après RSVP",
    summary: "On se rejoint pour marcher sans pression, jaser un peu et prendre quelque chose sur le chemin si le mood est là.",
    is_online: 0,
  },
  {
    title: "2 games chill après le dîner",
    host_name: "Ana",
    target_circle_id: CIRCLE.CONNEXIONS,
    visibility_mode_id: VISIBILITY_MODE.PUBLIC_VIBE,
    momentum_label: "Chill plus tard",
    time_label: "Autour de 21h",
    duration_label: "1h",
    area: "En ligne",
    location_detail: "Discord + lobby partagé après confirmation",
    summary: "Petit plan léger pour gamer une heure, voir qui est dispo et garder la porte ouverte à plus si ça clique.",
    is_online: 1,
  },
];

function seedPlans(byName) {
  const insertPlan = db.prepare(`
    INSERT INTO plans (
      title, host_user_id, target_circle_id, visibility_mode_id,
      momentum_label, time_label, duration_label,
      area, location_detail, summary, is_online
    ) VALUES (
      @title, @host_user_id, @target_circle_id, @visibility_mode_id,
      @momentum_label, @time_label, @duration_label,
      @area, @location_detail, @summary, @is_online
    )
  `);

  db.transaction((plans) => {
    plans.forEach((plan) => {
      insertPlan.run({
        ...plan,
        host_user_id: byName[plan.host_name] ?? null,
      });
    });
  })(SEED_PLANS);
}

function seedParticipants(byName, byTitle) {
  const rows = [
    { plan_id: byTitle["Cafe express avant le gym"], user_id: byName.Nora, response: "down", note: "Peut être là en 10 min", approval_status: "approved", approved_by_user_id: byName.Nora },
    { plan_id: byTitle["Cafe express avant le gym"], user_id: byName.Sam, response: "down", note: "Part du bureau bientôt", approval_status: "approved", approved_by_user_id: byName.Nora },
    { plan_id: byTitle["Cafe express avant le gym"], user_id: byName.Julien, response: "probable", note: "Confirme s'il finit à l'heure", approval_status: "approved", approved_by_user_id: byName.Nora },
    { plan_id: byTitle["Cafe express avant le gym"], user_id: byName.Maya, response: "maybe", note: "Attend de voir le timing exact", approval_status: "approved", approved_by_user_id: byName.Nora },
    { plan_id: byTitle["Balade sunset + bubble tea"], user_id: byName.Maya, response: "down", note: "Peut partir du Sud-Ouest", approval_status: "approved", approved_by_user_id: byName.Chris },
    { plan_id: byTitle["Balade sunset + bubble tea"], user_id: byName.Chris, response: "down", note: "Open si on part avant 19h", approval_status: "approved", approved_by_user_id: byName.Chris },
    { plan_id: byTitle["Balade sunset + bubble tea"], user_id: byName.Ana, response: "maybe", note: "Peut rejoindre pour le bubble tea", approval_status: "approved", approved_by_user_id: byName.Chris },
    { plan_id: byTitle["2 games chill après le dîner"], user_id: byName.Ana, response: "maybe", note: "Libre pour une game ou deux", approval_status: "approved", approved_by_user_id: byName.Ana },
    { plan_id: byTitle["2 games chill après le dîner"], user_id: byName.Chris, response: "probable", note: "Peut hop on plus tard", approval_status: "approved", approved_by_user_id: byName.Ana },
  ];

  const insert = db.prepare(`
    INSERT INTO plan_participants (plan_id, user_id, response, note, approval_status, approved_by_user_id)
    VALUES (@plan_id, @user_id, @response, @note, @approval_status, @approved_by_user_id)
  `);

  db.transaction((items) => items.forEach((item) => insert.run(item)))(rows);
}

function seedCheckins(byName, byTitle) {
  const rows = [
    { plan_id: byTitle["Cafe express avant le gym"], user_id: byName.Nora, message: "Je peux y être dans 10 minutes si vous partez bientôt.", minutes_ago: 2, tone: "default" },
    { plan_id: byTitle["Cafe express avant le gym"], user_id: byName.Julien, message: "Fort probable. Ping-moi si vous choisissez vraiment le spot près de Laurier.", minutes_ago: 6, tone: "yellow" },
    { plan_id: byTitle["Cafe express avant le gym"], user_id: byName.Maya, message: "Je regarde selon mon meeting. Gardez-moi dans la loop.", minutes_ago: 9, tone: "gray" },
    { plan_id: byTitle["Balade sunset + bubble tea"], user_id: byName.Chris, message: "Je suis chaud si on garde ça relax et sans horaire trop strict.", minutes_ago: 5, tone: "default" },
  ];

  const insert = db.prepare(`
    INSERT INTO checkins (plan_id, user_id, message, minutes_ago, tone)
    VALUES (@plan_id, @user_id, @message, @minutes_ago, @tone)
  `);

  db.transaction((items) => items.forEach((item) => insert.run(item)))(rows);
}

module.exports = { seedPlans, seedParticipants, seedCheckins };
