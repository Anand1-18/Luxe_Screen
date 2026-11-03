import { describe, expect, it } from "vitest";

import { planExperience } from "./planner.js";

const theaters = [
  {
    id: "small",
    name: "Small",
    basePrice: 149900,
    includedGuests: 2,
    extraGuestPrice: 30000,
    maxCapacity: 4,
    rating: 4.9,
  },
  {
    id: "mid",
    name: "Mid",
    basePrice: 249900,
    includedGuests: 4,
    extraGuestPrice: 35000,
    maxCapacity: 8,
    rating: 4.8,
  },
  {
    id: "large",
    name: "Large",
    basePrice: 499900,
    includedGuests: 10,
    extraGuestPrice: 30000,
    maxCapacity: 20,
    rating: 4.9,
  },
];

const addOns = [
  {
    id: "a1",
    slug: "romantic-hearts",
    name: "Romantic Hearts",
    category: "DECOR",
    options: [
      { id: "o1", name: "Standard", price: 149900 },
      { id: "o2", name: "Premium", price: 249900 },
    ],
  },
  {
    id: "a2",
    slug: "balloon-bliss",
    name: "Balloon Bliss",
    category: "DECOR",
    options: [{ id: "o3", name: "Standard", price: 99900 }],
  },
  {
    id: "a3",
    slug: "strawberry-cream-cake",
    name: "Strawberry Cream",
    category: "CAKE",
    options: [{ id: "o4", name: "Half kg", price: 69900 }],
  },
  {
    id: "a4",
    slug: "rose-bouquet",
    name: "Rose Bouquet",
    category: "GIFT",
    options: [{ id: "o5", name: "12 roses", price: 69900 }],
  },
];

describe("planExperience", () => {
  it("recommends an intimate room for a proposal", () => {
    const [top] = planExperience({
      occasion: "PROPOSAL",
      budget: 500000,
      guests: 2,
      theaters,
      addOns,
    });
    expect(top.theater.id).toBe("small");
    expect(top.withinBudget).toBe(true);
    expect(top.items.map((i) => i.category)).toEqual(["DECOR", "CAKE", "GIFT"]);
  });

  it("excludes theatres that cannot fit the group", () => {
    const options = planExperience({
      occasion: "BIRTHDAY",
      budget: 1500000,
      guests: 12,
      theaters,
      addOns,
    });
    expect(options.map((o) => o.theater.id)).toEqual(["large"]);
  });

  it("keeps the package within budget by downgrading or skipping add-ons", () => {
    const [top] = planExperience({
      occasion: "ANNIVERSARY",
      budget: 250000,
      guests: 2,
      theaters,
      addOns,
    });
    expect(top.total).toBeLessThanOrEqual(250000);
  });

  it("returns nothing when no theatre is large enough", () => {
    expect(
      planExperience({ occasion: "BIRTHDAY", budget: 1000000, guests: 50, theaters, addOns }),
    ).toEqual([]);
  });
});
