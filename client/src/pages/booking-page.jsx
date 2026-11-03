import { useLoaderData } from "react-router";

import { BookingWizard } from "@/components/booking/booking-wizard";
import { PageMeta } from "@/components/layout/page-meta";
import { Container, SectionHeading } from "@/components/ui/container";
import { addDays, BOOKING_WINDOW_DAYS, todayInIST } from "@/shared/dates";
import { OCCASIONS } from "@/shared/planner";
import { apiFetch } from "@/lib/api-client";

/**
 * Loads the catalogue and turns deep-link query parameters from the gallery
 * and AI planner (?location=&theater=&occasion=&guests=&options=) into a
 * validated `prefill`. Unknown values are ignored, never trusted.
 */
export async function loader({ request }) {
  const params = new URL(request.url).searchParams;
  const [{ locations }, { theaters }, { addOns }] = await Promise.all([
    apiFetch("/api/locations"),
    apiFetch("/api/theaters"),
    apiFetch("/api/addons"),
  ]);
  const active = locations.filter((l) => l.status === "ACTIVE");
  const today = todayInIST();

  const theater = theaters.find((t) => t.slug === params.get("theater"));
  const locationParam = params.get("location");
  const location =
    theater?.location.slug ??
    active.find((l) => l.slug === locationParam)?.slug ??
    active[0]?.slug ??
    "";
  const occasionParam = params.get("occasion");
  const occasion = OCCASIONS.includes(occasionParam) ? occasionParam : undefined;
  const guestsParam = Number(params.get("guests"));
  const guests =
    Number.isInteger(guestsParam) && guestsParam >= 1 && guestsParam <= 20
      ? guestsParam
      : undefined;

  const cart = {};
  for (const optionId of (params.get("options") ?? "").split(",").filter(Boolean)) {
    const addOn = addOns.find((a) => a.options.some((o) => o.id === optionId));
    if (addOn) cart[addOn.id] = { optionId, quantity: 1 };
  }

  return {
    locations: active,
    addOns,
    today,
    maxDate: addDays(today, BOOKING_WINDOW_DAYS),
    prefill: {
      fromLink: Boolean(theater || locationParam || occasion || guests || Object.keys(cart).length),
      location,
      guests,
      occasion,
      theaterId: theater?.id,
      cart,
    },
  };
}

export function Component() {
  const { locations, addOns, today, maxDate, prefill } = useLoaderData();
  return (
    <Container className="py-10 sm:py-14">
      <PageMeta
        title="Book a Theatre"
        description="Book a private theatre in 9 easy steps: pick a slot, add cakes, decor and gifts, and pay securely."
      />
      <div className="print:hidden">
        <SectionHeading
          as="h1"
          align="left"
          eyebrow="Book your experience"
          title="Reserve your private theatre"
          text="Nine quick steps from picking a slot to your confirmation. Your progress is saved if you refresh."
        />
      </div>
      <div className="mt-10">
        <BookingWizard
          locations={locations}
          addOns={addOns}
          today={today}
          maxDate={maxDate}
          prefill={prefill}
        />
      </div>
    </Container>
  );
}
