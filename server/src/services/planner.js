import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/db.js";
import { rupeesToPaise } from "../shared/money.js";
import { planExperience } from "../shared/planner.js";

import { addOnInclude, theaterInclude, toAddOnDTO, toTheaterDTO } from "./catalog.js";

export async function recommendExperience(input) {
  const location = await prisma.location.findUnique({ where: { slug: input.location } });
  if (!location || location.status !== "ACTIVE") {
    throw new ApiError(422, "LOCATION_UNAVAILABLE", "This location is not open for bookings yet.");
  }

  const [theaters, addOns] = await Promise.all([
    prisma.theater.findMany({
      where: { isActive: true, locationId: location.id },
      include: theaterInclude,
    }),
    prisma.addOn.findMany({ where: { isActive: true }, include: addOnInclude }),
  ]);

  const [recommendation = null, ...alternatives] = planExperience({
    occasion: input.occasion,
    budget: rupeesToPaise(input.budget),
    guests: input.guests,
    theaters: theaters.map(toTheaterDTO),
    addOns: addOns.map(toAddOnDTO),
  });

  return { recommendation, alternatives };
}
