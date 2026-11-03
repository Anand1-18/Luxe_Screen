import { randomBytes, randomInt } from "node:crypto";

import { Prisma } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/db.js";
import { fromDbDate, isSlotClosed, isWithinBookingWindow, toDbDate } from "../shared/dates.js";
import { calculatePrice, evaluateCoupon } from "../shared/pricing.js";

/** How long a pending booking holds its slot while the customer pays. */
export const HOLD_MINUTES = 10;

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function generateReference() {
  let code = "";
  for (let i = 0; i < 8; i++) code += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  return `LXS-${code}`;
}

const slotKey = (theaterId, slotId, date) => `${theaterId}:${slotId}:${date}`;

/**
 * Prices a cart on the server from catalogue data. Client-sent prices are never trusted.
 */
async function buildQuote(
  input,

  db = prisma,
) {
  const theater = await db.theater.findFirst({
    where: { id: input.theaterId, isActive: true, location: { status: "ACTIVE" } },
  });
  if (!theater) throw new ApiError(404, "NOT_FOUND", "This theatre is not available.");
  if (input.guests > theater.maxCapacity) {
    throw new ApiError(
      422,
      "CAPACITY_EXCEEDED",
      `${theater.name} fits up to ${theater.maxCapacity} guests. Please choose a larger theatre.`,
    );
  }

  const optionIds = input.items.map((i) => i.optionId);
  const options = optionIds.length
    ? await db.addOnOption.findMany({
        where: { id: { in: optionIds }, isActive: true, addOn: { isActive: true } },
        include: { addOn: { select: { id: true, name: true, category: true } } },
      })
    : [];
  if (options.length !== optionIds.length) {
    throw new ApiError(
      422,
      "ADDON_UNAVAILABLE",
      "One or more selected add-ons are no longer available.",
    );
  }
  const optionsById = new Map(options.map((o) => [o.id, o]));
  const lines = input.items.map((item) => {
    const option = optionsById.get(item.optionId);
    return { option, quantity: item.quantity, price: option.price };
  });

  const base = calculatePrice({ theater, guests: input.guests, items: lines });

  let coupon = null;
  let discountAmount = 0;
  if (input.couponCode) {
    coupon = await db.coupon.findUnique({ where: { code: input.couponCode } });
    if (!coupon) throw new ApiError(422, "COUPON_INVALID", "This coupon code is not valid.");
    const result = evaluateCoupon(coupon, base.subtotal);
    if (!result.valid)
      throw new ApiError(422, "COUPON_INVALID", result.message, { reason: result.reason });
    discountAmount = result.discount;
  }

  return {
    theater,
    lines,
    coupon,
    price: calculatePrice({ theater, guests: input.guests, items: lines, discountAmount }),
  };
}

export async function validateCoupon(input) {
  const quote = await buildQuote({ ...input, couponCode: input.code });
  return {
    code: quote.coupon.code,
    description: quote.coupon.description,
    discount: quote.price.discountAmount,
    quote: quote.price,
  };
}

const bookingInclude = {
  theater: { select: { id: true, slug: true, name: true, images: true } },
  location: { select: { name: true, city: true, address: true } },
  slot: { select: { id: true, label: true, startTime: true, endTime: true } },
  coupon: { select: { code: true } },
  items: {
    orderBy: { id: "asc" },
    include: { addOn: { select: { name: true, category: true } } },
  },
};

function toBookingDTO(b, now = new Date()) {
  // Holds expire lazily: report an elapsed pending hold as EXPIRED.
  const expired = b.status === "PENDING" && b.holdExpiresAt !== null && b.holdExpiresAt <= now;
  return {
    id: b.id,
    reference: b.reference,
    status: expired ? "EXPIRED" : b.status,
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod,
    paymentRef: b.paymentRef,
    date: fromDbDate(b.date),
    guests: b.guests,
    customer: { name: b.customerName, phone: b.phone, email: b.email },
    occasion: b.occasion,
    occasionDetails: b.occasionDetails ?? null,
    specialRequests: b.specialRequests,
    theater: {
      id: b.theater.id,
      slug: b.theater.slug,
      name: b.theater.name,
      image: b.theater.images[0] ?? null,
    },
    location: b.location,
    slot: b.slot,
    items: b.items.map((i) => ({
      addOnName: i.addOn.name,
      category: i.addOn.category,
      optionName: i.optionName,
      price: i.price,
      quantity: i.quantity,
    })),
    coupon: b.coupon,
    price: {
      theaterAmount: b.theaterAmount,
      extraGuestAmount: b.extraGuestAmount,
      addOnsAmount: b.addOnsAmount,
      subtotal: b.theaterAmount + b.extraGuestAmount + b.addOnsAmount,
      discountAmount: b.discountAmount,
      total: b.total,
    },
    holdExpiresAt: b.holdExpiresAt?.toISOString() ?? null,
    confirmedAt: b.confirmedAt?.toISOString() ?? null,
    createdAt: b.createdAt.toISOString(),
  };
}

export async function getBooking(id) {
  const booking = await prisma.booking.findUnique({ where: { id }, include: bookingInclude });
  return booking ? toBookingDTO(booking) : null;
}

/**
 * Creates a PENDING booking that holds the slot for HOLD_MINUTES.
 * The unique `activeSlotKey` guarantees only one live hold per theatre/slot/date.
 */
export async function createBooking(input) {
  const now = new Date();
  if (!isWithinBookingWindow(input.date, now)) {
    throw new ApiError(
      422,
      "DATE_OUT_OF_RANGE",
      "Bookings are open from today up to 60 days ahead.",
    );
  }

  const slot = await prisma.slot.findFirst({
    where: { id: input.slotId, theaterId: input.theaterId, status: "ACTIVE" },
  });
  if (!slot)
    throw new ApiError(404, "NOT_FOUND", "This time slot does not exist for the selected theatre.");
  if (isSlotClosed(input.date, slot.startTime, now)) {
    throw new ApiError(
      422,
      "SLOT_CLOSED",
      "This slot is too close to its start time to book online.",
    );
  }

  const quote = await buildQuote(input);
  const key = slotKey(input.theaterId, input.slotId, input.date);

  try {
    const booking = await prisma.$transaction(async (tx) => {
      // Release holds that have lapsed, and the customer's own earlier hold on
      // this slot (e.g. they went back and changed their add-ons).
      await tx.booking.updateMany({
        where: {
          activeSlotKey: key,
          status: "PENDING",
          OR: [{ holdExpiresAt: { lte: now } }, { email: input.customer.email }],
        },
        data: { status: "EXPIRED", activeSlotKey: null },
      });

      return tx.booking.create({
        data: {
          reference: generateReference(),
          date: toDbDate(input.date),
          guests: input.guests,
          customerName: input.customer.name,
          phone: input.customer.phone,
          email: input.customer.email,
          occasion: input.occasion,
          occasionDetails: input.occasionDetails,
          specialRequests: input.specialRequests,
          theaterAmount: quote.price.theaterAmount,
          extraGuestAmount: quote.price.extraGuestAmount,
          addOnsAmount: quote.price.addOnsAmount,
          discountAmount: quote.price.discountAmount,
          total: quote.price.total,
          activeSlotKey: key,
          holdExpiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000),
          locationId: quote.theater.locationId,
          theaterId: quote.theater.id,
          slotId: slot.id,
          couponId: quote.coupon?.id,
          items: {
            create: quote.lines.map((line) => ({
              addOnId: line.option.addOn.id,
              addOnOptionId: line.option.id,
              optionName: line.option.name,
              price: line.price,
              quantity: line.quantity,
            })),
          },
        },
        include: bookingInclude,
      });
    });
    return toBookingDTO(booking, now);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError(
        409,
        "SLOT_UNAVAILABLE",
        "Sorry, this slot was just booked. Please pick another time.",
      );
    }
    throw error;
  }
}

/**
 * Simulated payment gateway callback. Idempotent: confirming an already
 * confirmed booking returns it unchanged.
 */
export async function confirmBooking(input) {
  const now = new Date();
  const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
  if (!booking) throw new ApiError(404, "NOT_FOUND", "Booking not found.");

  if (booking.status === "CONFIRMED") return await getBooking(booking.id);
  if (booking.status !== "PENDING") {
    throw new ApiError(409, "BOOKING_NOT_PAYABLE", "This booking can no longer be paid for.");
  }
  if (!booking.holdExpiresAt || booking.holdExpiresAt <= now) {
    await prisma.booking.updateMany({
      where: { id: booking.id, status: "PENDING" },
      data: { status: "EXPIRED", activeSlotKey: null },
    });
    throw new ApiError(
      410,
      "HOLD_EXPIRED",
      "Your slot hold expired. Please start the booking again.",
    );
  }

  if (input.simulateOutcome === "FAILURE") {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: "FAILED", paymentMethod: input.paymentMethod },
    });
    throw new ApiError(
      402,
      "PAYMENT_FAILED",
      "Payment was declined. You can try again before your hold expires.",
    );
  }

  await prisma.$transaction(async (tx) => {
    // Conditional update: only one concurrent confirm can win.
    const claimed = await tx.booking.updateMany({
      where: { id: booking.id, status: "PENDING", holdExpiresAt: { gt: now } },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentMethod: input.paymentMethod,
        paymentRef: `pay_${randomBytes(9).toString("base64url")}`,
        confirmedAt: now,
        holdExpiresAt: null,
      },
    });
    if (claimed.count === 0) return; // a parallel request already confirmed it

    if (booking.couponId) {
      const redeemed = await tx.$executeRaw`
        UPDATE "Coupon" SET "usedCount" = "usedCount" + 1, "updatedAt" = NOW()
        WHERE "id" = ${booking.couponId}
          AND ("usageLimit" IS NULL OR "usedCount" < "usageLimit")`;
      if (redeemed === 0) {
        throw new ApiError(
          409,
          "COUPON_INVALID",
          "This coupon was fully redeemed. Please remove it and retry.",
        );
      }
    }
  });

  return await getBooking(booking.id);
}
