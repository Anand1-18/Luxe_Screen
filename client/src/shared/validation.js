// Zod schemas shared by API routes (authoritative) and client forms.
import { z } from "zod";

import { isValidDateOnly } from "./dates.js";
import { OCCASIONS } from "./planner.js";

export const PAYMENT_METHODS = ["UPI", "CARD", "NET_BANKING"];

const id = z.string().trim().min(1, "Required").max(64);
const slug = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]+$/, "Invalid slug")
  .max(80);

export const dateOnlySchema = z
  .string()
  .refine(isValidDateOnly, "Use a valid date in YYYY-MM-DD format");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Please enter at least 2 characters")
  .max(80, "Please keep it under 80 characters");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

/** Indian mobile number; accepts optional +91/0 prefix and spaces, normalises to 10 digits. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"));

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max, `Please keep it under ${max} characters`)
    .optional()
    .transform((v) => (v ? v : undefined));

export const occasionSchema = z.enum(OCCASIONS, "Choose an occasion");

export const occasionDetailsSchema = z.object({
  honoreeName: optionalText(60),
  partnerName: optionalText(60),
  screenMessage: optionalText(120),
  age: z.coerce.number().int().min(1).max(120).optional(),
});

export const cartItemSchema = z.object({
  optionId: id,
  quantity: z.number().int().min(1).max(10),
});

const cartItemsSchema = z
  .array(cartItemSchema)
  .max(20)
  .refine(
    (items) => new Set(items.map((i) => i.optionId)).size === items.length,
    "Duplicate add-on options",
  );

export const couponCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{3,32}$/, "Enter a valid coupon code");

const guestsSchema = z.number().int().min(1, "At least 1 guest").max(50);

export const slotsQuerySchema = z
  .object({
    date: dateOnlySchema,
    location: slug.optional(),
    theaterId: id.optional(),
  })
  .refine((q) => q.location || q.theaterId, "Provide either location or theaterId");

export const couponValidateSchema = z.object({
  code: couponCodeSchema,
  theaterId: id,
  guests: guestsSchema,
  items: cartItemsSchema.default([]),
});

export const customerSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
});

export const createBookingSchema = z.object({
  theaterId: id,
  slotId: id,
  date: dateOnlySchema,
  guests: guestsSchema,
  customer: customerSchema,
  occasion: occasionSchema,
  occasionDetails: occasionDetailsSchema.prefault({}),
  specialRequests: optionalText(500),
  items: cartItemsSchema.default([]),
  couponCode: couponCodeSchema.optional(),
});

export const confirmBookingSchema = z.object({
  bookingId: id,
  paymentMethod: z.enum(PAYMENT_METHODS, "Choose a payment method"),
  /** The gateway is simulated; FAILURE lets you exercise the failure path. */
  simulateOutcome: z.enum(["SUCCESS", "FAILURE"]).default("SUCCESS"),
});

export const plannerSchema = z.object({
  occasion: occasionSchema,
  /** Budget in rupees. */
  budget: z
    .number()
    .int()
    .min(1000, "Minimum budget is ₹1,000")
    .max(500000, "Maximum budget is ₹5,00,000"),
  guests: guestsSchema,
  location: slug,
});

export const waitlistSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z
    .union([z.literal(""), phoneSchema])
    .optional()
    .transform((v) => (v ? v : undefined)),
  location: slug,
  message: optionalText(500),
});

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z
    .union([z.literal(""), phoneSchema])
    .optional()
    .transform((v) => (v ? v : undefined)),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(1000),
});
