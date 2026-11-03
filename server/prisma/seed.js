import "./load-env.js";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@prisma/client";
import { addOns, coupons, locations, slotTemplates, theaters } from "../src/data/catalog.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const toPaise = (rupees) => Math.round(rupees * 100);

// Upserts keyed on natural keys (slug/code) make the seed safe to re-run.
async function main() {
  const locationIds = new Map();
  for (const { slug, ...data } of locations) {
    const location = await prisma.location.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });
    locationIds.set(slug, location.id);
  }

  for (const { slug, locationSlug, basePrice, extraGuestPrice, ...rest } of theaters) {
    const data = {
      ...rest,
      basePrice: toPaise(basePrice),
      extraGuestPrice: toPaise(extraGuestPrice),
      locationId: locationIds.get(locationSlug),
    };
    const theater = await prisma.theater.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });

    for (const slot of slotTemplates) {
      await prisma.slot.upsert({
        where: { theaterId_startTime: { theaterId: theater.id, startTime: slot.startTime } },
        create: { ...slot, theaterId: theater.id },
        update: slot,
      });
    }
  }

  for (const [index, { slug, options, ...data }] of addOns.entries()) {
    const addOn = await prisma.addOn.upsert({
      where: { slug },
      create: { slug, sortOrder: index, ...data },
      update: { sortOrder: index, ...data },
    });

    for (const [optionIndex, option] of options.entries()) {
      const optionData = { price: toPaise(option.price), sortOrder: optionIndex };
      await prisma.addOnOption.upsert({
        where: { addOnId_name: { addOnId: addOn.id, name: option.name } },
        create: { addOnId: addOn.id, name: option.name, ...optionData },
        update: optionData,
      });
    }
  }

  for (const {
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    ...rest
  } of coupons) {
    const data = {
      ...rest,
      discountType,
      discountValue: discountType === "FLAT" ? toPaise(discountValue) : discountValue,
      minOrderAmount: toPaise(minOrderAmount),
      maxDiscount: maxDiscount === undefined ? null : toPaise(maxDiscount),
      validFrom: new Date(rest.validFrom),
      validUntil: new Date(rest.validUntil),
    };
    await prisma.coupon.upsert({ where: { code }, create: { code, ...data }, update: data });
  }

  const counts = {
    locations: await prisma.location.count(),
    theaters: await prisma.theater.count(),
    slots: await prisma.slot.count(),
    addOns: await prisma.addOn.count(),
    addOnOptions: await prisma.addOnOption.count(),
    coupons: await prisma.coupon.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
