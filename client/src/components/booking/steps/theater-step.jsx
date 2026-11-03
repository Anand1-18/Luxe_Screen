import { Monitor, Star, Users, Volume2 } from "lucide-react";
import { Photo } from "@/components/ui/photo";

import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { formatTime } from "@/shared/dates";
import { formatINR } from "@/shared/money";
import { extraGuestCharge } from "@/shared/pricing";
import { cn } from "@/lib/utils";

import { selectTheater } from "../booking-state";
import { StepFooter } from "../step-footer";

export function TheaterStep({ state, dispatch, availability, onBack, onNext }) {
  const theaters = (availability.data?.theaters ?? []).map((theater) => {
    const slot = theater.slots.find((s) => s.startTime === state.startTime);
    let unavailable = null;
    if (!slot || slot.status === "CLOSED") unavailable = "Not open at this time";
    else if (slot.status === "BOOKED") unavailable = "Already booked";
    else if (theater.maxCapacity < state.guests)
      unavailable = `Fits up to ${theater.maxCapacity} guests`;
    return { theater, slot, unavailable };
  });
  // Available theatres first, then cheapest.
  theaters.sort(
    (a, b) =>
      Number(!!a.unavailable) - Number(!!b.unavailable) ||
      a.theater.basePrice - b.theater.basePrice,
  );

  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title" className="font-display text-2xl text-white">
        Pick your theatre
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        Showing theatres for {state.guests} {state.guests === 1 ? "guest" : "guests"}
        {state.startTime && ` at ${formatTime(state.startTime)}`}.
      </p>

      {availability.loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400" role="status">
          <Spinner className="size-4" /> Loading theatres…
        </div>
      ) : availability.error ? (
        <Alert className="mt-6">{availability.error}</Alert>
      ) : (
        <fieldset className="mt-6">
          <legend className="sr-only">Theatre</legend>
          <div className="grid gap-4">
            {theaters.map(({ theater, slot, unavailable }) => {
              const checked = state.theater?.id === theater.id;
              const price = theater.basePrice + extraGuestCharge(theater, state.guests);
              return (
                <label
                  key={theater.id}
                  className={cn(
                    "flex cursor-pointer flex-col gap-4 rounded-2xl border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-400 sm:flex-row",
                    checked
                      ? "border-gold-400 bg-gold-500/10"
                      : "border-white/10 hover:border-white/25",
                    unavailable && "cursor-not-allowed opacity-50 hover:border-white/10",
                  )}
                >
                  <input
                    type="radio"
                    name="theater"
                    value={theater.id}
                    checked={checked}
                    disabled={!!unavailable}
                    onChange={() => {
                      if (slot) dispatch(selectTheater(theater, slot));
                    }}
                    className="sr-only"
                  />
                  <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl sm:aspect-auto sm:h-auto sm:w-48">
                    <Photo src={theater.images[0]} alt="" width={400} className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 px-1 pb-1 sm:py-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="block font-display text-lg text-white">
                          {theater.name}
                        </span>
                        <span className="text-sm text-zinc-400">{theater.tagline}</span>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-xs text-gold-300">
                        <Star aria-hidden className="size-3.5 fill-current" />{" "}
                        {theater.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <Users aria-hidden className="size-3.5 text-gold-400" /> Up to{" "}
                        {theater.maxCapacity}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Monitor aria-hidden className="size-3.5 text-gold-400" /> {theater.screen}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Volume2 aria-hidden className="size-3.5 text-gold-400" /> {theater.sound}
                      </span>
                    </span>
                    <span className="mt-auto flex items-end justify-between gap-3 pt-2">
                      {unavailable ? (
                        <span className="text-sm text-red-300">{unavailable}</span>
                      ) : (
                        <span className="text-xs text-zinc-500">
                          Includes {theater.includedGuests} guests · +
                          {formatINR(theater.extraGuestPrice)} per extra guest
                        </span>
                      )}
                      <span className="shrink-0 text-lg font-semibold text-white">
                        {formatINR(price)}
                      </span>
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!state.theater || !state.slot} />
    </section>
  );
}
