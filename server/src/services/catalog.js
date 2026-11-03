import { prisma } from "../lib/db.js";

export const theaterInclude = {
  location: { select: { slug: true, name: true, city: true } },
};

export function toTheaterDTO(t) {
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    description: t.description,
    basePrice: t.basePrice,
    includedGuests: t.includedGuests,
    extraGuestPrice: t.extraGuestPrice,
    maxCapacity: t.maxCapacity,
    screen: t.screen,
    sound: t.sound,
    images: t.images,
    amenities: t.amenities,
    rating: t.rating,
    location: t.location,
  };
}

export const addOnInclude = {
  options: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, price: true },
  },
};

export function toAddOnDTO(a) {
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    description: a.description,
    category: a.category,
    image: a.image,
    options: a.options,
  };
}

// Catalogue reads change rarely, so they are cached (tag "catalog") and can be
// rendered into the static shell. Booking availability is never cached.
export async function listLocations() {
  return prisma.location.findMany({
    orderBy: [{ status: "asc" }, { city: "asc" }],
    select: { id: true, slug: true, name: true, city: true, address: true, status: true },
  });
}

export async function listTheaters(filter = {}) {
  const theaters = await prisma.theater.findMany({
    where: {
      isActive: true,
      location: { status: "ACTIVE", ...(filter.location ? { slug: filter.location } : {}) },
    },
    include: theaterInclude,
    orderBy: [{ location: { city: "asc" } }, { basePrice: "asc" }],
  });
  return theaters.map(toTheaterDTO);
}

export async function getTheaterBySlug(slug) {
  const theater = await prisma.theater.findFirst({
    where: { slug, isActive: true },
    include: theaterInclude,
  });
  return theater ? toTheaterDTO(theater) : null;
}

export async function listAddOns(filter = {}) {
  const addOns = await prisma.addOn.findMany({
    where: { isActive: true, ...(filter.category ? { category: filter.category } : {}) },
    include: addOnInclude,
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
  return addOns.filter((a) => a.options.length > 0).map(toAddOnDTO);
}
