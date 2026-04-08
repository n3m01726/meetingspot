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
  const visibility = asTrimmedString(payload.visibility, 80) || "Inner Circle + Connexions";
  const area = asTrimmedString(payload.area, 80);
  const venue = asTrimmedString(payload.venue, 120);
  const timeLabel = asTrimmedString(payload.timeLabel, 60) || "Plus tard aujourd'hui";
  const durationLabel = asTrimmedString(payload.durationLabel, 40) || "45 min";
  const summary = asTrimmedString(payload.summary, 280);

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
      visibility,
      area,
      venue,
      timeLabel,
      durationLabel,
      summary,
    }
  };
}

function validateRsvpPayload(payload) {
  const userId = Number.parseInt(payload.userId, 10);
  const response = asTrimmedString(payload.response, 20);

  if (!["down", "maybe", "probable"].includes(response)) {
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
  validateRsvpPayload,
  validateAuthPayload
};
