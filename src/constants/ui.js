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
  down: "I'm in!",
  probable: "Probably"
};

export const availabilityMap = {
  down: {
    label: "I'm in!",
    icon: CircleCheck,
    className: "btn--primary-icon",
  },
  maybe: {
    label: "maybe",
    icon: CircleHelp,
    className: "btn--secondary-icon",
  }
};

export const responseLabelMap = {
  down: "I'm in!",
  maybe: "maybe"
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
  { key: "all", label: "all" },
  { key: "now", label: "now" },
  { key: "tonight", label: "tonight" },
  { key: "online", label: "online now" }
];

export const visibilityFilters = [
  { key: "all", label: "All circles", tone: "" },
  { key: String(CIRCLES.INNER), label: "Inner Circle", tone: "inner" },
  { key: String(CIRCLES.CONNEXIONS), label: "Connections", tone: "connections" }
];

export const visibilityModeOptions = [
  {
    key: VISIBILITY_MODES.RSVP_FIRST,
    label: "🔐 RSVP first",
    helper: "The exact details are unlocked after host approval."
  },
  {
    key: VISIBILITY_MODES.CIRCLE_OPEN,
    label: "👥 Circle open",
    helper: "The entire authorized circle immediately sees all the details."
  },
  {
    key: VISIBILITY_MODES.PUBLIC_VIBE,
    label: "🌍 Public vibe",
    helper: "Open beyond your circle. Best for public places and group-friendly moments."
  }
];
