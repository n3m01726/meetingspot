// target_circle_id and visibility_mode_id reference IDs defined in constants.js
// 1 = INNER_CIRCLE, 2 = CIRCLE_OPEN, 3 = PUBLIC_VIBE

const seedPlans = [
  {
    title:            "Cafe express avant le gym",
    host_name:        "Nora",
    target_circle_id: 2, // CIRCLE_OPEN
    visibility_mode_id: 2, // CIRCLE_OPEN
    momentum_label:   "Ça bouge maintenant",
    time_label:       "Vers 17h30",
    duration_label:   "45 min",
    area:             "Plateau",
    location_detail:  "Plateau, près du métro Laurier",
    summary:          "Plan spontané pour attraper un café, prendre des nouvelles et voir qui est encore chaud pour continuer la soirée après.",
    is_online:        0,
  },
  {
    title:            "Balade sunset + bubble tea",
    host_name:        "Chris",
    target_circle_id: 2, // CIRCLE_OPEN
    visibility_mode_id: 2, // CIRCLE_OPEN
    momentum_label:   "Ça bouge maintenant",
    time_label:       "18h - 20h",
    duration_label:   "1h30",
    area:             "Canal",
    location_detail:  "Canal Lachine, point de rencontre partagé après RSVP",
    summary:          "On se rejoint pour marcher sans pression, jaser un peu et prendre quelque chose sur le chemin si le mood est là.",
    is_online:        0,
  },
  {
    title:            "2 games chill après le dîner",
    host_name:        "Ana",
    target_circle_id: 3, // PUBLIC_VIBE
    visibility_mode_id: 3, // PUBLIC_VIBE
    momentum_label:   "Chill plus tard",
    time_label:       "Autour de 21h",
    duration_label:   "1h",
    area:             "En ligne",
    location_detail:  "Discord + lobby partagé après confirmation",
    summary:          "Petit plan léger pour gamer une heure, voir qui est dispo et garder la porte ouverte à plus si ça clique.",
    is_online:        1,
  },
];

module.exports = { seedPlans };
