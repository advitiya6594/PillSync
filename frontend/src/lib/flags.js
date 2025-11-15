// frontend/src/lib/flags.js
export const SHOW_SIDE_EFFECT_TAGGER =
  (import.meta.env.VITE_SHOW_SIDE_EFFECT_TAGGER ?? "false").toString().toLowerCase() === "true";


