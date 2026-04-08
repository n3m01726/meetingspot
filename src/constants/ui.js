import {
  Clapperboard,
  Coffee,
  Footprints,
  Gamepad2,
  Laptop2,
  Sparkles
} from "lucide-react";

export const VISIBILITY_MODES = {
  RSVP_FIRST: "rsvp_first",
  CIRCLE_OPEN: "circle_open",
  PUBLIC_VIBE: "public_vibe"
};

export const toneClassMap = {
  default: "",
  yellow: "yellow",
  gray: "gray"
};

export const availabilityToneMap = {
  down: "ring-green",
  probable: "ring-yellow",
  maybe: "ring-gray"
};

export const availabilityLabelMap = {
  down: "Down",
  probable: "Fort probable",
  maybe: "Peut-être"
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
  { key: "Inner Circle", label: "Inner Circle", tone: "inner" },
  { key: "Inner Circle + Connexions", label: "Inner + Connexions", tone: "" },
  { key: "Connexions", label: "Connexions", tone: "connections" }
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
