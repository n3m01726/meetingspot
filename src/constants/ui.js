import {
  Clapperboard,
  Coffee,
  Footprints,
  Gamepad2,
  Laptop2,
  Sparkles
} from "lucide-react";

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
  maybe: "Peut-etre"
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
  { key: "now", label: "Now" },
  { key: "tonight", label: "Ce soir" },
  { key: "online", label: "En ligne" }
];

export const circleFilters = [
  { key: "all", label: "Tous les cercles" },
  { key: "Inner Circle", label: "Inner Circle" },
  { key: "Connexions", label: "Connexions" }
];

export const visibilityFilters = [
  { key: "all", label: "Toutes visibilites" },
  { key: "Inner Circle", label: "Inner Circle" },
  { key: "Inner Circle + Connexions", label: "Inner + Connexions" },
  { key: "Connexions", label: "Connexions" }
];
