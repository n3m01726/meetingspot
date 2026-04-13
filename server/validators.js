const { VISIBILITY_MODE, CIRCLE } = require("./db/constants");

// ---------------------------------------------------------------------------
// String helper
// ---------------------------------------------------------------------------

function trimmed(value, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// ---------------------------------------------------------------------------
// Plan creation
// ---------------------------------------------------------------------------

function validatePlanPayload(payload) {
  const friendName       = trimmed(payload.friendName, 80);
  const title            = trimmed(payload.title, 140);
  const visibilityModeId = Number.parseInt(payload.visibilityModeId, 10);
  const targetCircleId   = Number.parseInt(payload.targetCircleId,   10);
  const area             = trimmed(payload.area, 80);
  const venue            = trimmed(payload.venue, 120);
  const timeLabel        = trimmed(payload.timeLabel, 60)    || "Plus tard aujourd'hui";
  const durationLabel    = trimmed(payload.durationLabel, 40) || "45 min";
  const summary          = trimmed(payload.summary, 280);

  if (!Object.values(VISIBILITY_MODE).includes(visibilityModeId)) {
    return { ok: false, error: "Mode de visibilité invalide." };
  }

  if (!Object.values(CIRCLE).includes(targetCircleId)) {
    return { ok: false, error: "Cercle cible invalide." };
  }

  if (!area)  return { ok: false, error: "Le quartier ou la zone est requis." };
  if (!venue) return { ok: false, error: "Le lieu approximatif est requis." };

  return {
    ok: true,
    value: { friendName, title, visibilityModeId, targetCircleId, area, venue, timeLabel, durationLabel, summary },
  };
}

// ---------------------------------------------------------------------------
// Plan update
// ---------------------------------------------------------------------------

function validatePlanUpdatePayload(payload) {
  const title            = trimmed(payload.title, 140);
  const visibilityModeId = Number.parseInt(payload.visibilityModeId, 10);
  const targetCircleId   = Number.parseInt(payload.targetCircleId,   10);
  const area             = trimmed(payload.area, 80);
  const locationDetail   = trimmed(payload.locationDetail, 120);
  const timeLabel        = trimmed(payload.timeLabel, 60);
  const summary          = trimmed(payload.summary, 280);

  if (!title)          return { ok: false, error: "Le titre est requis." };
  if (!Object.values(VISIBILITY_MODE).includes(visibilityModeId)) {
    return { ok: false, error: "Mode de visibilité invalide." };
  }
  if (!Object.values(CIRCLE).includes(targetCircleId)) {
    return { ok: false, error: "Cercle cible invalide." };
  }
  if (!area)           return { ok: false, error: "Le quartier ou la zone est requis." };
  if (!locationDetail) return { ok: false, error: "Le lieu approximatif est requis." };
  if (!timeLabel)      return { ok: false, error: "Le moment du plan est requis." };

  return {
    ok: true,
    value: { title, visibilityModeId, targetCircleId, area, locationDetail, timeLabel, summary },
  };
}

// ---------------------------------------------------------------------------
// RSVP
// ---------------------------------------------------------------------------

function validateRsvpPayload(payload) {
  const userId   = Number.parseInt(payload.userId, 10);
  const response = trimmed(payload.response, 20);

  if (!["down", "maybe", "probable", "pass"].includes(response)) {
    return { ok: false, error: "Réponse invalide." };
  }

  return { ok: true, value: { userId, response } };
}

// ---------------------------------------------------------------------------
// Approval
// ---------------------------------------------------------------------------

function validateApprovalPayload(payload) {
  const participantUserId = Number.parseInt(payload.participantUserId, 10);

  if (!Number.isInteger(participantUserId) || participantUserId <= 0) {
    return { ok: false, error: "Participant invalide." };
  }

  return { ok: true, value: { participantUserId } };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function validateAuthPayload(payload) {
  const userId = Number.parseInt(payload.userId, 10);

  if (!Number.isInteger(userId) || userId <= 0) {
    return { ok: false, error: "Utilisateur invalide." };
  }

  return { ok: true, value: { userId } };
}

module.exports = {
  validatePlanPayload,
  validatePlanUpdatePayload,
  validateRsvpPayload,
  validateApprovalPayload,
  validateAuthPayload,
};