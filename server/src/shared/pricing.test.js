import { describe, expect, it } from "vitest";

import { calculatePrice, evaluateCoupon } from "./pricing.js";

const theater = { basePrice: 249900, includedGuests: 4, extraGuestPrice: 35000 };

const coupon = (overrides = {}) => ({
  code: "TEST",
  discountType: "PERCENT",
  discountValue: 10,
  minOrderAmount: 150000,
  maxDiscount: 50000,
  validFrom: new Date("2026-01-01T00:00:00Z"),
  validUntil: new Date("2027-01-01T00:00:00Z"),
  usageLimit: null,
  usedCount: 0,
  isActive: true,
  ...overrides,
});

const now = new Date("2026-10-31T10:00:00Z");

describe("calculatePrice", () => {
  it("charges only the base price within included guests", () => {
    const price = calculatePrice({ theater, guests: 4, items: [] });
    expect(price).toMatchObject({ extraGuestAmount: 0, subtotal: 249900, total: 249900 });
  });

  it("adds extra-guest charges and add-ons", () => {
    const price = calculatePrice({
      theater,
      guests: 6,
      items: [
        { price: 64900, quantity: 1 },
        { price: 99900, quantity: 2 },
      ],
    });
    expect(price.extraGuestAmount).toBe(70000);
    expect(price.addOnsAmount).toBe(264700);
    expect(price.total).toBe(249900 + 70000 + 264700);
  });

  it("never lets the discount exceed the subtotal", () => {
    const price = calculatePrice({ theater, guests: 1, items: [], discountAmount: 10_000_000 });
    expect(price.total).toBe(0);
  });
});

describe("evaluateCoupon", () => {
  it("applies a percentage discount", () => {
    expect(evaluateCoupon(coupon(), 300000, now)).toEqual({ valid: true, discount: 30000 });
  });

  it("caps percentage discounts at maxDiscount", () => {
    expect(evaluateCoupon(coupon(), 900000, now)).toEqual({ valid: true, discount: 50000 });
  });

  it("rounds discounts down to whole rupees", () => {
    expect(evaluateCoupon(coupon({ maxDiscount: null }), 249950, now)).toEqual({
      valid: true,
      discount: 24900,
    });
  });

  it("applies a flat discount", () => {
    const flat = coupon({ discountType: "FLAT", discountValue: 30000, maxDiscount: null });
    expect(evaluateCoupon(flat, 200000, now)).toEqual({ valid: true, discount: 30000 });
  });

  it.each([
    ["INACTIVE", coupon({ isActive: false }), 300000],
    ["NOT_STARTED", coupon({ validFrom: new Date("2026-12-01T00:00:00Z") }), 300000],
    ["EXPIRED", coupon({ validUntil: new Date("2026-10-01T00:00:00Z") }), 300000],
    ["USAGE_LIMIT_REACHED", coupon({ usageLimit: 5, usedCount: 5 }), 300000],
    ["MIN_ORDER_NOT_MET", coupon(), 100000],
  ])("rejects with %s", (reason, rule, subtotal) => {
    const result = evaluateCoupon(rule, subtotal, now);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toBe(reason);
  });
});
