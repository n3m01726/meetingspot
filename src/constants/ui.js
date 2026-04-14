import {
  Clapperboard,
  Coffee,
  Footprints,
  Gamepad2,
  Laptop2,
  Sparkles,  CircleCheck,
  CircleHelp,
  CircleX,
} from "lucide-react";

export const VISIBILITY_MODES = {
  RSVP_FIRST: 1,
  CIRCLE_OPEN: 2,
  PUBLIC_VIBE: 3
};

export const CIRCLES = {
  INNER: 1,
  CONNEXIONS: 2
};

export const toneClassMap = {
  default: "",
  yellow: "yellow",
  gray: "gray"
};

export const availabilityToneMap = {
  down: "avatar-strip__ring--green",
  probable: "avatar-strip__ring--yellow",
  maybe: "avatar-strip__ring--gray"
};

export const availabilityLabelMap = {
  down: "J’en suis",
  probable: "Probable",
  maybe: "Indisponible"
};

export const availabilityMap = {
  down: {
    label: "J’en suis",
    icon: CircleCheck,
    className: "btn--primary-icon",
  },
  maybe: {
    label: "Peut-être",
    icon: CircleHelp,
    className: "btn--secondary-icon",
  },
  "not-here": {
    label: "Indisponible",
    icon: CircleX,
    className: "btn--ghost-icon",
  },
};

export const responseLabelMap = {
  down: "J’en suis",
  maybe: "Peut-être",
  nothere: "Indisponible"
};

export const intentOptions = [
  { key: "Coffee", label: "Coffee", Icon: Coffee },
  { key: "Walk", label: "Walk", Icon: Footprints },
  { key: "Gaming", label: "Gaming", Icon: Gamepad2 },
  { key: "Cowork", label: "Cowork", Icon: Laptop2 },
  { key: "Movie", label: "Movie", Icon: Clapperboard },
  { key: "Custom", label: "Custom", Icon: Sparkles }
];

export const quickFilters = [
  { key: "all", label: "Tous" },
  { key: "now", label: "Maintenant" },
  { key: "tonight", label: "Ce soir" },
  { key: "online", label: "En ligne" }
];

export const visibilityFilters = [
  { key: "all", label: "Tous les cercles", tone: "" },
  { key: String(CIRCLES.INNER), label: "Inner Circle", tone: "inner" },
  { key: String(CIRCLES.CONNEXIONS), label: "Connexions", tone: "connections" }
];

export const visibilityModeOptions = [
  {
    key: VISIBILITY_MODES.RSVP_FIRST,
    label: "🔐 RSVP first",
    helper: "Les détails exacts se débloquent après approbation de l’hôte."
  },
  {
    key: VISIBILITY_MODES.CIRCLE_OPEN,
    label: "👥 Circle open",
    helper: "Tout le cercle autorisé voit immédiatement tous les détails."
  },
  {
    key: VISIBILITY_MODES.PUBLIC_VIBE,
    label: "🌍 Public vibe",
    helper: "Open beyond your circle. Best for public places and group-friendly moments."
  }
];
