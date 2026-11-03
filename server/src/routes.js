import { Router } from "express";
import { z } from "zod";

import {
  confirmBookingSchema,
  contactSchema,
  couponValidateSchema,
  createBookingSchema,
  plannerSchema,
  slotsQuerySchema,
  waitlistSchema,
} from "./shared/validation.js";

import { prisma } from "./lib/db.js";
import { ApiError } from "./lib/errors.js";
import { rateLimitMiddleware } from "./lib/rate-limit.js";
import { getAvailability } from "./services/availability.js";
import { confirmBooking, createBooking, getBooking, validateCoupon } from "./services/bookings.js";
import { getTheaterBySlug, listAddOns, listLocations, listTheaters } from "./services/catalog.js";
import { joinWaitlist, submitContactMessage } from "./services/leads.js";
import { recommendExperience } from "./services/planner.js";

const perMinute = (key, limit) => rateLimitMiddleware({ key, limit, windowMs: 60_000 });

/** Catalogue data changes rarely: let browsers and CDNs cache it for 5 minutes. */
const cacheCatalog = (_req, res, next) => {
  res.set("Cache-Control", "public, max-age=300");
  next();
};
const noStore = (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
};

export const api = Router();

api.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "up" });
  } catch {
    res.status(503).json({ status: "degraded", database: "down" });
  }
});

// ---- Catalogue --------------------------------------------------------------

api.get("/locations", cacheCatalog, async (_req, res) => {
  res.json({ locations: await listLocations() });
});

api.get("/theaters", cacheCatalog, async (req, res) => {
  const { location } = z
    .object({ location: z.string().trim().max(80).optional() })
    .parse(req.query);
  res.json({ theaters: await listTheaters({ location }) });
});

api.get("/theaters/:slug", cacheCatalog, async (req, res) => {
  const theater = await getTheaterBySlug(req.params.slug);
  if (!theater) throw new ApiError(404, "NOT_FOUND", "Theatre not found.");
  res.json({ theater });
});

api.get("/addons", cacheCatalog, async (req, res) => {
  const { category } = z
    .object({ category: z.enum(["CAKE", "DECOR", "GIFT"]).optional() })
    .parse(req.query);
  res.json({ addOns: await listAddOns({ category }) });
});

// ---- Booking flow -----------------------------------------------------------

/** GET /api/slots?date=YYYY-MM-DD&location=<slug> | &theaterId=<id> */
api.get("/slots", noStore, async (req, res) => {
  res.json(await getAvailability(slotsQuerySchema.parse(req.query)));
});

api.post("/coupons/validate", perMinute("coupon", 20), async (req, res) => {
  res.json(await validateCoupon(couponValidateSchema.parse(req.body)));
});

/** Creates a PENDING booking that holds the slot while the customer pays. */
api.post("/booking", perMinute("booking", 10), async (req, res) => {
  const booking = await createBooking(createBookingSchema.parse(req.body));
  res.status(201).json({ booking });
});

/** Simulated payment gateway: settles payment and confirms the booking. */
api.post("/booking/confirm", perMinute("confirm", 20), async (req, res) => {
  res.json({ booking: await confirmBooking(confirmBookingSchema.parse(req.body)) });
});

api.get("/booking/:id", noStore, async (req, res) => {
  const booking = await getBooking(req.params.id);
  if (!booking) throw new ApiError(404, "NOT_FOUND", "Booking not found.");
  res.json({ booking });
});

// ---- Planner & leads --------------------------------------------------------

api.post("/planner", perMinute("planner", 30), async (req, res) => {
  res.json(await recommendExperience(plannerSchema.parse(req.body)));
});

api.post("/waitlist", perMinute("waitlist", 5), async (req, res) => {
  res.status(201).json({ entry: await joinWaitlist(waitlistSchema.parse(req.body)) });
});

api.post("/contact", perMinute("contact", 5), async (req, res) => {
  res.status(201).json({ message: await submitContactMessage(contactSchema.parse(req.body)) });
});
