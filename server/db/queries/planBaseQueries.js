/**
 * server/db/queries/planBaseQueries.js
 *
 * Couche de requêtes SQL partagée — importée par plans.js ET participants.js
 * sans créer de dépendance circulaire entre les deux.
 */

const { db } = require("../connection");

const PLAN_BASE_FIELDS = `
  p.id,
  p.title,
  p.host_user_id       AS hostUserId,
  p.target_circle_id   AS targetCircleId,
  p.visibility_mode_id AS visibilityModeId,
  host.name            AS hostName,
  p.momentum_label     AS momentumLabel,
  p.time_label         AS timeLabel,
  p.duration_label     AS durationLabel,
  p.area,
  p.summary,
  p.is_online          AS isOnline
`;

/**
 * Récupère le plan brut (sans décoration) pour usage interne —
 * utilisé par participants.js pour reconstruire le détail après upsert/approve
 * sans avoir à importer plans.js.
 */
function getRawPlan(planId) {
  return db.prepare(`
    SELECT
      ${PLAN_BASE_FIELDS},
      p.location_detail AS locationDetail
    FROM plans p
    LEFT JOIN users host ON host.id = p.host_user_id
    WHERE p.id = ?
  `).get(planId) ?? null;
}

/**
 * Récupère uniquement les champs nécessaires au contrôle d'accès —
 * utilisé par participants.js pour vérifier les permissions avant upsert.
 */
function getPlanForAccessCheck(planId) {
  return db.prepare(`
    SELECT id, host_user_id AS hostUserId, target_circle_id AS targetCircleId,
           visibility_mode_id AS visibilityModeId
    FROM plans WHERE id = ?
  `).get(planId) ?? null;
}

module.exports = { PLAN_BASE_FIELDS, getRawPlan, getPlanForAccessCheck };