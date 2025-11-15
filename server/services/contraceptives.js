/**
 * Contraceptive pill ingredient definitions
 */

// Common OCP (Oral Contraceptive Pill) components - combined pills
export const OCP_INGREDIENTS = [
  "ethinyl estradiol",
  "levonorgestrel",
  "norgestimate",
  "drospirenone",
  "desogestrel",
  "norethindrone"
];

// POP (Progestin-Only Pill) components
export const POP_INGREDIENTS = [
  "norethindrone",
  "desogestrel",
  "drospirenone"
];

/**
 * Get target pill ingredients based on pill type
 * @param {string} pillType - "combined" or "progestin_only"
 * @returns {string[]} - Array of ingredient names
 */
export function getTargetIngredients(pillType) {
  if (pillType === "progestin_only") {
    return POP_INGREDIENTS;
  }
  return OCP_INGREDIENTS;
}

