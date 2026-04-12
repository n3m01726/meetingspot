const { VISIBILITY_MODES } = require("./db/index");

function asTrimmedString(value, maxLength = 120) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function validatePlanPayload(payload) {
  const friendName = asTrimmedString(payload.friendName, 80);
  const title = asTrimmedString(payload.title, 140);
  const activity = asTrimmedString(payload.activity, 40) || "Custom";
  const visibilityMode = asTrimmedString(payload.visibilityMode, 40)
    || (asTrimmedString(payload.visibility, 80) ? VISIBILITY_MODES.CIRCLE_OPEN : "");
  const circle = asTrimmedString(payload.circle, 80);
  const area = asTrimmedString(payload.area, 80);
  const venue = asTrimmedString(payload.venue, 120);
  const timeLabel = asTrimmedString(payload.timeLabel, 60) || "Plus tard aujourd'hui";
  const durationLabel = asTrimmedString(payload.durationLabel, 40) || "45 min";
  const summary = asTrimmedString(payload.summary, 280);

  if (!Object.values(VISIBILITY_MODES).includes(visibilityMode)) {
    return { ok: false, error: "Mode de visibilité invalide." };
  }

  if (!area) {
    return { ok: false, error: "Le quartier ou la zone est requis." };
  }

  if (!venue) {
    return { ok: false, error: "Le lieu approximatif est requis." };
  }

  return {
    ok: true,
    value: {
      friendName,
      title,
      activity,
      visibilityMode,
      circle,
      area,
      venue,
      timeLabel,
      durationLabel,
      summary
    }
  };
}

function validatePlanUpdatePayload(payload) {
  const title = asTrimmedString(payload.title, 140);
  const visibilityMode = asTrimmedString(payload.visibilityMode, 40);
  const circle = asTrimmedString(payload.circle, 80);
  const area = asTrimmedString(payload.area, 80);
  const locationDetail = asTrimmedString(payload.locationDetail, 120);
  const timeLabel = asTrimmedString(payload.timeLabel, 60);
  const summary = asTrimmedString(payload.summary, 280);

  if (!title) {
    return { ok: false, error: "Le titre est requis." };
  }

  if (!Object.values(VISIBILITY_MODES).includes(visibilityMode)) {
    return { ok: false, error: "Mode de visibilité invalide." };
  }

  if (!area) {
    return { ok: false, error: "Le quartier ou la zone est requis." };
  }

  if (!locationDetail) {
    return { ok: false, error: "Le lieu approximatif est requis." };
  }

  if (!timeLabel) {
    return { ok: false, error: "Le moment du plan est requis." };
  }

  return {
    ok: true,
    value: {
      title,
      visibilityMode,
      circle,
      area,
      locationDetail,
      timeLabel,
      summary
    }
  };
}

function validateRsvpPayload(payload) {
  const userId = Number.parseInt(payload.userId, 10);
  const response = asTrimmedString(payload.response, 20);

  if (!["down", "maybe", "probable", "pass"].includes(response)) {
    return { ok: false, error: "Réponse invalide." };
  }

  return {
    ok: true,
    value: {
      userId,
      response
    }
  };
}

function validateApprovalPayload(payload) {
  const participantUserId = Number.parseInt(payload.participantUserId, 10);

  if (!Number.isInteger(participantUserId) || participantUserId <= 0) {
    return { ok: false, error: "Participant invalide." };
  }

  return {
    ok: true,
    value: {
      participantUserId
    }
  };
}

function validateAuthPayload(payload) {
  const userId = Number.parseInt(payload.userId, 10);

  if (!Number.isInteger(userId) || userId <= 0) {
    return { ok: false, error: "Utilisateur invalide." };
  }

  return {
    ok: true,
    value: {
      userId
    }
  };
}

module.exports = {
  validatePlanPayload,
  validatePlanUpdatePayload,
  validateRsvpPayload,
  validateApprovalPayload,
  validateAuthPayload
};