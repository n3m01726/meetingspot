/**
 * server/db/profiles.js
 *
 * Lecture de profils publics et du profil courant (self).
 * Un profil public expose : infos de base, statut, cercle de relation
 * avec le viewer, et les plans actifs visibles par le viewer.
 */

const { db } = require("./connection");
const { circleIdToLabel } = require("./constants");
const { getRelationshipCircleId } = require("./participants");
const { getPlanSummaryRows } = require("./plans");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USER_PROFILE_FIELDS = `
  id,
  name,
  is_admin    AS isAdmin,
  availability,
  image_path  AS imagePath,
  status_text AS statusText
`;

function availabilityLabel(value) {
  if (value === "down")     return "J'en suis";
  if (value === "probable") return "Probable";
  return "Peut-être";
}

// ---------------------------------------------------------------------------
// Public profile
// Retourne les infos visibles d'un utilisateur, du point de vue du viewer.
// ---------------------------------------------------------------------------

function getPublicProfile(targetUserId, viewerUser = null) {
  const row = db.prepare(
    `SELECT ${USER_PROFILE_FIELDS} FROM users WHERE id = ?`
  ).get(targetUserId);

  if (!row) return null;

  const relationshipCircleId = viewerUser
    ? getRelationshipCircleId(viewerUser.id, targetUserId)
    : null;

  // Plans actifs de la cible, filtrés selon les droits du viewer
  const activePlans = getPlanSummaryRows({}, viewerUser).filter(
    (plan) => plan.hostUserId === targetUserId
  );

  return {
    ...row,
    availabilityLabel: availabilityLabel(row.availability),
    relationshipCircleId,
    relationshipCircleLabel: relationshipCircleId
      ? circleIdToLabel(relationshipCircleId)
      : null,
    isSelf: viewerUser?.id === targetUserId,
    activePlans,
  };
}

// ---------------------------------------------------------------------------
// Self profile (currentUser enrichi)
// Inclut les plans dont il est l'hôte + ses cercles + ses settings.
// ---------------------------------------------------------------------------

function getSelfProfile(userId) {
  const row = db.prepare(
    `SELECT ${USER_PROFILE_FIELDS} FROM users WHERE id = ?`
  ).get(userId);

  if (!row) return null;

  // Plans dont l'utilisateur est l'hôte
  const hostedPlans = db.prepare(`
    SELECT
      p.id, p.title, p.time_label AS timeLabel, p.area,
      p.visibility_mode_id AS visibilityModeId,
      p.target_circle_id   AS targetCircleId,
      p.momentum_label     AS momentumLabel,
      (SELECT COUNT(*) FROM plan_participants pp
       WHERE pp.plan_id = p.id AND pp.approval_status = 'approved') AS participantCount,
      (SELECT COUNT(*) FROM plan_participants pp
       WHERE pp.plan_id = p.id AND pp.approval_status = 'pending')  AS pendingCount
    FROM plans p
    WHERE p.host_user_id = ?
    ORDER BY p.id DESC
  `).all(userId);

  // Cercles de l'utilisateur (les gens qu'il a dans ses listes)
  const circles = db.prepare(`
    SELECT
      ur.circle_id  AS circleId,
      u.id, u.name, u.availability, u.image_path AS imagePath,
      u.status_text AS statusText
    FROM user_relationships ur
    JOIN users u ON u.id = ur.member_user_id
    WHERE ur.owner_user_id = ?
    ORDER BY ur.circle_id ASC, u.name ASC
  `).all(userId).map((r) => ({
    ...r,
    availabilityLabel: availabilityLabel(r.availability),
    circleLabel: circleIdToLabel(r.circleId),
  }));

  return {
    ...row,
    availabilityLabel: availabilityLabel(row.availability),
    isSelf: true,
    hostedPlans,
    circles,
  };
}

// ---------------------------------------------------------------------------
// Settings update (champs modifiables par le user lui-même)
// ---------------------------------------------------------------------------

const ALLOWED_AVAILABILITY = ["down", "probable", "maybe"];

function updateUserSettings(userId, input) {
  const statusText   = typeof input.statusText   === "string"
    ? input.statusText.trim().slice(0, 120)
    : null;
  const availability = ALLOWED_AVAILABILITY.includes(input.availability)
    ? input.availability
    : null;

  if (!statusText && !availability) return null;

  const fields = [];
  const values = [];

  if (statusText !== null)   { fields.push("status_text = ?");  values.push(statusText); }
  if (availability !== null) { fields.push("availability = ?"); values.push(availability); }

  values.push(userId);

  db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values);

  return db.prepare(
    `SELECT ${USER_PROFILE_FIELDS} FROM users WHERE id = ?`
  ).get(userId);
}

module.exports = { getPublicProfile, getSelfProfile, updateUserSettings };