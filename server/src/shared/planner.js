// AI Experience Planner: a deterministic, explainable recommendation engine.
// Given an occasion, budget and guest count it ranks theatres and assembles
// an add-on package that fits the remaining budget. Pure function, no I/O.

import { extraGuestCharge } from "./pricing.js";

export const OCCASIONS = [
  "BIRTHDAY",
  "ANNIVERSARY",
  "PROPOSAL",
  "DATE_NIGHT",
  "BRIDE_TO_BE",
  "FRIENDS_PARTY",
  "MOVIE_NIGHT",
  "CORPORATE",
  "OTHER",
];

const PROFILES = {
  BIRTHDAY: {
    mood: "party",
    DECOR: ["balloon-bliss", "confetti-party"],
    CAKE: ["rainbow-sprinkle-cake", "chocolate-truffle-cake", "cupcake-box"],
    GIFT: ["surprise-gift-box", "chocolate-hamper"],
  },
  ANNIVERSARY: {
    mood: "intimate",
    DECOR: ["romantic-hearts", "candle-light-table"],
    CAKE: ["strawberry-cream-cake", "chocolate-truffle-cake"],
    GIFT: ["rose-bouquet", "golden-keepsake"],
  },
  PROPOSAL: {
    mood: "intimate",
    DECOR: ["romantic-hearts", "candle-light-table"],
    CAKE: ["strawberry-cream-cake", "chocolate-truffle-cake"],
    GIFT: ["rose-bouquet", "golden-keepsake"],
  },
  DATE_NIGHT: {
    mood: "intimate",
    DECOR: ["candle-light-table", "romantic-hearts"],
    CAKE: ["cupcake-box", "chocolate-truffle-cake"],
    GIFT: ["chocolate-hamper", "rose-bouquet"],
  },
  BRIDE_TO_BE: {
    mood: "party",
    DECOR: ["balloon-bliss", "romantic-hearts"],
    CAKE: ["strawberry-cream-cake", "cupcake-box"],
    GIFT: ["surprise-gift-box", "rose-bouquet"],
  },
  FRIENDS_PARTY: {
    mood: "party",
    DECOR: ["confetti-party", "balloon-bliss"],
    CAKE: ["cupcake-box", "rainbow-sprinkle-cake"],
    GIFT: ["chocolate-hamper"],
  },
  MOVIE_NIGHT: { mood: "neutral", DECOR: [], CAKE: ["cupcake-box"], GIFT: [] },
  CORPORATE: {
    mood: "party",
    DECOR: ["confetti-party"],
    CAKE: ["cupcake-box", "chocolate-truffle-cake"],
    GIFT: ["golden-keepsake"],
  },
  OTHER: {
    mood: "neutral",
    DECOR: ["balloon-bliss"],
    CAKE: ["chocolate-truffle-cake"],
    GIFT: ["surprise-gift-box"],
  },
};

// Decor sets the scene, so it gets first claim on the remaining budget.
const CATEGORY_PRIORITY = ["DECOR", "CAKE", "GIFT"];

function scoreTheater(theater, input) {
  const reasons = [];
  const cost = theater.basePrice + extraGuestCharge(theater, input.guests);
  const profile = PROFILES[input.occasion];
  let score = 0;

  // Capacity fit: a room around 50-100% full feels right; a half-empty hall does not.
  const utilisation = input.guests / theater.maxCapacity;
  score += Math.max(0, 40 - Math.abs(0.75 - utilisation) * 60);
  if (utilisation >= 0.5) reasons.push(`Comfortably fits your group of ${input.guests}`);

  if (profile.mood === "intimate" && theater.maxCapacity <= 6) {
    score += 20;
    reasons.push("Cosy, intimate room suited to the occasion");
  } else if (profile.mood === "party" && theater.maxCapacity >= 8) {
    score += 12;
    reasons.push("Spacious enough to celebrate");
  }

  // Budget fit: reward leaving roughly a third of the budget for add-ons.
  if (cost <= input.budget) {
    const share = cost / input.budget;
    score += Math.max(0, 25 - Math.abs(0.65 - share) * 40);
    reasons.push("Leaves room in your budget for add-ons");
  } else {
    score -= 50;
  }

  score += Math.max(0, (theater.rating - 4) * 10);

  return { score: Math.round(score * 10) / 10, cost, reasons };
}

// Two passes: first secure one item per category at its cheapest option (so a
// lavish decor pick never crowds out the cake), then upgrade options in priority
// order with whatever budget is left.
function buildPackage(occasion, addOns, allowance) {
  const profile = PROFILES[occasion];
  const bySlug = new Map(addOns.map((a) => [a.slug, a]));
  const picks = [];
  let remaining = allowance;

  for (const category of CATEGORY_PRIORITY) {
    for (const slug of profile[category]) {
      const addOn = bySlug.get(slug);
      if (!addOn || addOn.options.length === 0) continue;
      const cheapest = addOn.options.reduce((min, o) => (o.price < min.price ? o : min));
      if (cheapest.price > remaining) continue;
      picks.push({ addOn, category, option: cheapest });
      remaining -= cheapest.price;
      break;
    }
  }

  for (const pick of picks) {
    const upgrade = pick.addOn.options
      .filter((o) => o.price > pick.option.price && o.price - pick.option.price <= remaining)
      .sort((a, b) => b.price - a.price)[0];
    if (!upgrade) continue;
    remaining -= upgrade.price - pick.option.price;
    pick.option = upgrade;
  }

  return picks.map(({ addOn, category, option }) => ({
    addOnId: addOn.id,
    addOnName: addOn.name,
    category,
    optionId: option.id,
    optionName: option.name,
    price: option.price,
  }));
}

/**
 * Ranks theatres for an occasion and builds an add-on package for each.
 * @param {{ occasion: string, budget: number, guests: number,
 *   theaters: Array<{ id: string, name: string, basePrice: number, includedGuests: number,
 *     extraGuestPrice: number, maxCapacity: number, rating: number }>,
 *   addOns: Array<{ id: string, slug: string, name: string, category: string,
 *     options: Array<{ id: string, name: string, price: number }> }>,
 *   limit?: number }} input  Budget and prices are in paise.
 * @returns Top options, best first: { theater, theaterCost, items, total, withinBudget, score, reasons }
 */
export function planExperience(input) {
  const eligible = input.theaters.filter((t) => t.maxCapacity >= input.guests);

  return eligible
    .map((theater) => {
      const { score, cost, reasons } = scoreTheater(theater, input);
      const items = buildPackage(input.occasion, input.addOns, Math.max(0, input.budget - cost));
      const total = cost + items.reduce((sum, i) => sum + i.price, 0);
      return {
        theater,
        theaterCost: cost,
        items,
        total,
        withinBudget: total <= input.budget,
        score,
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score || a.total - b.total)
    .slice(0, input.limit ?? 3);
}
