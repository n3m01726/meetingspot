/**
 * Returns participant and checkin rows built from resolved name→id maps.
 *
 * @param {Record<string,number>} byName   - user name → user id
 * @param {Record<string,number>} byTitle  - plan title → plan id
 */
function buildParticipantRows(byName, byTitle) {
  return [
    { plan_id: byTitle["Cafe express avant le gym"],   user_id: byName.Nora,   response: "down",     note: "Peut être là en 10 min",          approval_status: "approved", approved_by_user_id: byName.Nora },
    { plan_id: byTitle["Cafe express avant le gym"],   user_id: byName.Sam,    response: "down",     note: "Part du bureau bientôt",          approval_status: "approved", approved_by_user_id: byName.Nora },
    { plan_id: byTitle["Cafe express avant le gym"],   user_id: byName.Julien, response: "probable", note: "Confirme s'il finit à l'heure",   approval_status: "approved", approved_by_user_id: byName.Nora },
    { plan_id: byTitle["Cafe express avant le gym"],   user_id: byName.Maya,   response: "maybe",    note: "Attend de voir le timing exact",  approval_status: "approved", approved_by_user_id: byName.Nora },
    { plan_id: byTitle["Balade sunset + bubble tea"],  user_id: byName.Maya,   response: "down",     note: "Peut partir du Sud-Ouest",        approval_status: "approved", approved_by_user_id: byName.Chris },
    { plan_id: byTitle["Balade sunset + bubble tea"],  user_id: byName.Chris,  response: "down",     note: "Open si on part avant 19h",       approval_status: "approved", approved_by_user_id: byName.Chris },
    { plan_id: byTitle["Balade sunset + bubble tea"],  user_id: byName.Ana,    response: "maybe",    note: "Peut rejoindre pour le bubble tea",approval_status: "approved", approved_by_user_id: byName.Chris },
    { plan_id: byTitle["2 games chill après le dîner"],user_id: byName.Ana,    response: "maybe",    note: "Libre pour une game ou deux",     approval_status: "approved", approved_by_user_id: byName.Ana },
    { plan_id: byTitle["2 games chill après le dîner"],user_id: byName.Chris,  response: "probable", note: "Peut hop on plus tard",           approval_status: "approved", approved_by_user_id: byName.Ana },
  ];
}

/**
 * @param {Record<string,number>} byName
 * @param {Record<string,number>} byTitle
 */
function buildCheckinRows(byName, byTitle) {
  return [
    { plan_id: byTitle["Cafe express avant le gym"],  user_id: byName.Nora,   message: "Je peux y être dans 10 minutes si vous partez bientôt.",               minutes_ago: 2, tone: "default" },
    { plan_id: byTitle["Cafe express avant le gym"],  user_id: byName.Julien, message: "Fort probable. Ping-moi si vous choisissez vraiment le spot près de Laurier.", minutes_ago: 6, tone: "yellow" },
    { plan_id: byTitle["Cafe express avant le gym"],  user_id: byName.Maya,   message: "Je regarde selon mon meeting. Gardez-moi dans la loop.",               minutes_ago: 9, tone: "gray" },
    { plan_id: byTitle["Balade sunset + bubble tea"], user_id: byName.Chris,  message: "Je suis chaud si on garde ça relax et sans horaire trop strict.",      minutes_ago: 5, tone: "default" },
  ];
}

module.exports = { buildParticipantRows, buildCheckinRows };
