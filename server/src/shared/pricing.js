// Pure pricing rules shared by the API (authoritative) and the UI (preview).
// All amounts are integer paise.

/**
 * @typedef {{ basePrice: number, includedGuests: number, extraGuestPrice: number }} PricedTheater
 * @typedef {{ price: number, quantity: number }} PricedItem
 * @typedef {{ theaterAmount: number, extraGuestAmount: number, addOnsAmount: number,
 *   subtotal: number, discountAmount: number, total: number }} PriceBreakdown
 */

/** Charge for guests above the theatre's included count. */
export function extraGuestCharge(theater, guests) {
  return Math.max(0, guests - theater.includedGuests) * theater.extraGuestPrice;
}

export function addOnsTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Checks a coupon against an order subtotal (paise).
 * Coupon fields: discountType ("PERCENT" | "FLAT"), discountValue (percent, or paise for FLAT),
 * minOrderAmount, maxDiscount (paise or null), validFrom, validUntil, usageLimit (or null),
 * usedCount, isActive.
 * @returns {{ valid: true, discount: number } | { valid: false, reason: string, message: string }}
 */
export function evaluateCoupon(coupon, subtotal, now = new Date()) {
  if (!coupon.isActive) {
    return { valid: false, reason: "INACTIVE", message: "This coupon is no longer active." };
  }
  if (now < coupon.validFrom) {
    return { valid: false, reason: "NOT_STARTED", message: "This coupon is not active yet." };
  }
  if (now > coupon.validUntil) {
    return { valid: false, reason: "EXPIRED", message: "This coupon has expired." };
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return {
      valid: false,
      reason: "USAGE_LIMIT_REACHED",
      message: "This coupon has been fully redeemed.",
    };
  }
  if (subtotal < coupon.minOrderAmount) {
    const min = Math.round(coupon.minOrderAmount / 100).toLocaleString("en-IN");
    return {
      valid: false,
      reason: "MIN_ORDER_NOT_MET",
      message: `Add items worth ₹${min} or more to use this coupon.`,
    };
  }

  let discount =
    coupon.discountType === "PERCENT"
      ? Math.floor((subtotal * coupon.discountValue) / 100)
      : coupon.discountValue;
  if (coupon.maxDiscount !== null) discount = Math.min(discount, coupon.maxDiscount);
  // Round down to whole rupees and never discount more than the order.
  discount = Math.min(Math.floor(discount / 100) * 100, subtotal);

  return { valid: true, discount };
}

/**
 * @param {{ theater: PricedTheater, guests: number, items: PricedItem[], discountAmount?: number }} input
 * @returns {PriceBreakdown}
 */
export function calculatePrice(input) {
  const theaterAmount = input.theater.basePrice;
  const extraGuestAmount = extraGuestCharge(input.theater, input.guests);
  const addOnsAmount = addOnsTotal(input.items);
  const subtotal = theaterAmount + extraGuestAmount + addOnsAmount;
  const discountAmount = Math.min(input.discountAmount ?? 0, subtotal);
  return {
    theaterAmount,
    extraGuestAmount,
    addOnsAmount,
    subtotal,
    discountAmount,
    total: subtotal - discountAmount,
  };
}
