// ---------------------------------------------------------------------------
// Circle IDs
// 1 = Inner Circle, 2 = Connexions
// ---------------------------------------------------------------------------

const CIRCLE = {
  INNER: 1,
  CONNEXIONS: 2,
};

const CIRCLE_LABEL = {
  [CIRCLE.INNER]: "Inner Circle",
  [CIRCLE.CONNEXIONS]: "Connexions",
};

// ---------------------------------------------------------------------------
// Visibility mode IDs
// 1 = RSVP first, 2 = Circle open, 3 = Public vibe
// ---------------------------------------------------------------------------

const VISIBILITY_MODE = {
  RSVP_FIRST: 1,
  CIRCLE_OPEN: 2,
  PUBLIC_VIBE: 3,
};

const VISIBILITY_MODE_LABEL = {
  [VISIBILITY_MODE.RSVP_FIRST]: "RSVP first",
  [VISIBILITY_MODE.CIRCLE_OPEN]: "Circle open",
  [VISIBILITY_MODE.PUBLIC_VIBE]: "Public vibe",
};

const VISIBILITY_MODE_ICON = {
  [VISIBILITY_MODE.RSVP_FIRST]: "🔐",
  [VISIBILITY_MODE.CIRCLE_OPEN]: "👥",
  [VISIBILITY_MODE.PUBLIC_VIBE]: "🌍",
};

const VISIBILITY_MODE_DESCRIPTION = {
  [VISIBILITY_MODE.RSVP_FIRST]: "Les détails exacts se débloquent après approbation de l'hôte.",
  [VISIBILITY_MODE.CIRCLE_OPEN]: "Le cercle autorisé voit tous les détails immédiatement.",
  [VISIBILITY_MODE.PUBLIC_VIBE]: "Ouvert au-delà du cercle. Les détails sont visibles immédiatement.",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function circleIdToLabel(id) {
  return CIRCLE_LABEL[id] ?? CIRCLE_LABEL[CIRCLE.CONNEXIONS];
}

function circleLabelToId(label) {
  if (label === "Inner Circle" || label === "Favori") return CIRCLE.INNER;
  return CIRCLE.CONNEXIONS;
}

function circleIdToTone(id) {
  return id === CIRCLE.INNER ? "inner" : "connections";
}

function circleAccessLevel(id) {
  return id === CIRCLE.INNER ? 2 : 1;
}

function visibilityModeLabel(id) {
  return VISIBILITY_MODE_LABEL[id] ?? VISIBILITY_MODE_LABEL[VISIBILITY_MODE.CIRCLE_OPEN];
}

function visibilityModeIcon(id) {
  return VISIBILITY_MODE_ICON[id] ?? VISIBILITY_MODE_ICON[VISIBILITY_MODE.CIRCLE_OPEN];
}

function visibilityModeDescription(id) {
  return VISIBILITY_MODE_DESCRIPTION[id] ?? VISIBILITY_MODE_DESCRIPTION[VISIBILITY_MODE.CIRCLE_OPEN];
}

module.exports = {
  CIRCLE,
  CIRCLE_LABEL,
  VISIBILITY_MODE,
  VISIBILITY_MODE_LABEL,
  VISIBILITY_MODE_ICON,
  VISIBILITY_MODE_DESCRIPTION,
  circleIdToLabel,
  circleLabelToId,
  circleIdToTone,
  circleAccessLevel,
  visibilityModeLabel,
  visibilityModeIcon,
  visibilityModeDescription,
};
