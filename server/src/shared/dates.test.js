import { describe, expect, it } from "vitest";

import {
  addDays,
  isSlotClosed,
  isValidDateOnly,
  isWithinBookingWindow,
  todayInIST,
} from "./dates.js";

describe("dates", () => {
  it("uses the IST calendar date, not UTC", () => {
    // 20:00 UTC on 31 Oct is 01:30 IST on 1 Nov.
    expect(todayInIST(new Date("2026-10-31T20:00:00Z"))).toBe("2026-11-01");
  });

  it("validates strict YYYY-MM-DD dates", () => {
    expect(isValidDateOnly("2026-02-28")).toBe(true);
    expect(isValidDateOnly("2026-02-30")).toBe(false);
    expect(isValidDateOnly("31-10-2026")).toBe(false);
  });

  it("adds days across month boundaries", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  });

  it("limits bookings to today..today+60", () => {
    const now = new Date("2026-10-31T06:00:00Z");
    expect(isWithinBookingWindow("2026-10-30", now)).toBe(false);
    expect(isWithinBookingWindow("2026-10-31", now)).toBe(true);
    expect(isWithinBookingWindow("2026-12-30", now)).toBe(true);
    expect(isWithinBookingWindow("2026-12-31", now)).toBe(false);
  });

  it("closes slots within 30 minutes of start", () => {
    // 11:00 IST
    const now = new Date("2026-10-31T05:30:00Z");
    expect(isSlotClosed("2026-10-31", "10:00", now)).toBe(true);
    expect(isSlotClosed("2026-10-31", "11:20", now)).toBe(true);
    expect(isSlotClosed("2026-10-31", "13:30", now)).toBe(false);
  });
});
