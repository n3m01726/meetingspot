import { VISIBILITY_MODES } from "../constants/ui.js";

export const visibilityModeCopy = {
  [VISIBILITY_MODES.RSVP_FIRST]: {
    shortLabel: "RSVP first",
    creationHelper: "Les détails exacts se débloquent après approbation de l’hôte.",
    feedHelper: "Accès complet après approbation.",
    detailHelper: "Tu vois le résumé, mais les détails exacts demandent encore l’approbation de l’hôte."
  },
  [VISIBILITY_MODES.CIRCLE_OPEN]: {
    shortLabel: "Circle open",
    creationHelper: "Le cercle autorisé voit immédiatement tous les détails du plan.",
    feedHelper: "Accès complet immédiat pour le cercle autorisé.",
    detailHelper: "Les membres du cercle autorisé voient immédiatement les détails exacts."
  },
  [VISIBILITY_MODES.PUBLIC_VIBE]: {
    shortLabel: "Public vibe",
    creationHelper: "Open beyond your circle. Best for public places and group-friendly moments.",
    feedHelper: "Accès complet immédiat au-delà du cercle.",
    detailHelper: "Le plan s’ouvre au-delà du cercle avec accès complet immédiat."
  }
};

export const visibilityProductCopy = {
  filters: {
    title: "Filtres et accès",
    quickFilters: "Filtres rapides",
    circleFilters: "Cercle du plan",
    visibilityModes: "Modes de visibilité"
  },
  creation: {
    title: "Créer un plan",
    withPersonTitle: "Créer un plan avec",
    genericSubtitle: "Choisis une activité, un mode de visibilité et un contexte simple.",
    intentPrompt: "Qu’est-ce que vous pourriez faire ?",
    visibilityLegend: "Choisis comment ce plan s’ouvre aux autres"
  },
  feed: {
    creatorPrefix: "Créé par",
    participantsLabel: "Réactions",
    lockedTitle: "Accès complet masqué",
    lockedPending: "Ton RSVP est en attente d’approbation.",
    lockedDefault: "Réponds pour demander l’accès complet.",
    openDetailsCta: "Voir les détails",
    unlockDetailsCta: "RSVP pour débloquer"
  },
  detail: {
    visibilitySectionTitle: "Mode de visibilité",
    accessSectionTitle: "Accès complet",
    accessLockedTitle: "Accès complet verrouillé pour le moment",
    accessLockedDefault: "Tu vois le résumé, mais les détails exacts demandent encore l’approbation de l’hôte.",
    accessWhenLabel: "Accès complet",
    accessWhereLabel: "Lieu exact",
    accessResponsesLabel: "Réponses",
    responseSection: "Répondre",
    unlockHeading: "Débloquer l’accès complet",
    joinHeading: "Est-ce que tu embarques ?"
  }
};

export function getVisibilityModeShortLabel(mode) {
  return visibilityModeCopy[mode]?.shortLabel || visibilityModeCopy[VISIBILITY_MODES.CIRCLE_OPEN].shortLabel;
}

export function getVisibilityModeHelper(mode, surface = "detailHelper") {
  return visibilityModeCopy[mode]?.[surface] || visibilityModeCopy[VISIBILITY_MODES.CIRCLE_OPEN][surface];
}

export function getAccessStateCopy({ detailAccess, approvalStatus }) {
  if (detailAccess !== "locked") {
    return {
      title: "",
      body: ""
    };
  }

  if (approvalStatus === "pending") {
    return {
      title: visibilityProductCopy.feed.lockedTitle,
      body: visibilityProductCopy.feed.lockedPending
    };
  }

  return {
    title: visibilityProductCopy.feed.lockedTitle,
    body: visibilityProductCopy.feed.lockedDefault
  };
}
