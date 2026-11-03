import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/db.js";
import { isSlotClosed, isWithinBookingWindow, toDbDate } from "../shared/dates.js";

import { theaterInclude, toTheaterDTO } from "./catalog.js";

/** Bookings that currently hold a slot: confirmed, or pending with a live hold. */
export function activeHoldFilter(now) {
  return {
    OR: [{ status: "CONFIRMED" }, { status: "PENDING", holdExpiresAt: { gt: now } }],
  };
}

export async function getAvailability(query) {
  const now = new Date();
  if (!isWithinBookingWindow(query.date, now)) {
    throw new ApiError(
      422,
      "DATE_OUT_OF_RANGE",
      "Bookings are open from today up to 60 days ahead.",
    );
  }

  const theaters = await prisma.theater.findMany({
    where: {
      isActive: true,
      location: { status: "ACTIVE", ...(query.location ? { slug: query.location } : {}) },
      ...(query.theaterId ? { id: query.theaterId } : {}),
    },
    include: {
      ...theaterInclude,
      slots: { where: { status: "ACTIVE" }, orderBy: { startTime: "asc" } },
    },
    orderBy: { basePrice: "asc" },
  });

  const taken = await prisma.booking.findMany({
    where: {
      theaterId: { in: theaters.map((t) => t.id) },
      date: toDbDate(query.date),
      ...activeHoldFilter(now),
    },
    select: { slotId: true },
  });
  const takenSlotIds = new Set(taken.map((b) => b.slotId));

  return {
    date: query.date,
    theaters: theaters.map((theater) => ({
      ...toTheaterDTO(theater),
      slots: theater.slots.map((slot) => {
        let status = "AVAILABLE";
        if (isSlotClosed(query.date, slot.startTime, now)) status = "CLOSED";
        else if (takenSlotIds.has(slot.id)) status = "BOOKED";
        return {
          id: slot.id,
          label: slot.label,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status,
        };
      }),
    })),
  };
}
