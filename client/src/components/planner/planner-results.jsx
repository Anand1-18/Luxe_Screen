import { ArrowRight, Check, Monitor, Users, Volume2 } from "lucide-react";
import { Photo } from "@/components/ui/photo";

import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { formatINR } from "@/shared/money";
import { CATEGORY_LABELS, OCCASION_LABELS } from "@/shared/occasions";

/** Deep link into the booking wizard with the recommended package pre-selected. */
function bookingHref(rec, input) {
  const params = new URLSearchParams({
    location: input.location,
    theater: rec.theater.slug,
    occasion: input.occasion,
    guests: String(input.guests),
  });
  if (rec.items.length) params.set("options", rec.items.map((i) => i.optionId).join(","));
  return `/booking?${params}`;
}

function BudgetLine({ rec, budget }) {
  const remaining = budget * 100 - rec.total;
  return rec.withinBudget ? (
    <p className="text-sm text-emerald-300">{formatINR(remaining)} under your budget</p>
  ) : (
    <p className="text-sm text-amber-300">{formatINR(-remaining)} over your budget</p>
  );
}

export function PlannerResults({ data, input }) {
  const rec = data.recommendation;

  if (!rec) {
    return (
      <Alert className="mt-10">
        None of our theatres at this location can host {input.guests} guests. Try a smaller group or
        another location.
      </Alert>
    );
  }

  return (
    <section aria-labelledby="planner-result-title" className="mt-12 animate-fade-in space-y-10">
      <div>
        <p className="text-xs font-semibold tracking-[0.25em] text-gold-400 uppercase">
          Our recommendation
        </p>
        <h2 id="planner-result-title" className="mt-2 font-display text-3xl text-white">
          {OCCASION_LABELS[input.occasion]} at {rec.theater.name}
        </h2>
      </div>

      <article className="grid overflow-hidden rounded-2xl border border-gold-400/30 bg-ink-900 lg:grid-cols-2">
        <div className="relative min-h-64">
          <Photo
            src={rec.theater.images[0]}
            alt={`${rec.theater.name} theatre`}
            width={1000}
            className="object-cover"
          />
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          <div>
            <h3 className="font-display text-2xl text-white">{rec.theater.name}</h3>
            <p className="mt-1 text-sm text-zinc-400">
              {rec.theater.location.name}, {rec.theater.location.city} · {rec.theater.tagline}
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-1.5">
                <Users aria-hidden className="size-3.5 text-gold-400" /> Up to{" "}
                {rec.theater.maxCapacity}
              </li>
              <li className="flex items-center gap-1.5">
                <Monitor aria-hidden className="size-3.5 text-gold-400" /> {rec.theater.screen}
              </li>
              <li className="flex items-center gap-1.5">
                <Volume2 aria-hidden className="size-3.5 text-gold-400" /> {rec.theater.sound}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Why we picked it</h4>
            <ul className="mt-2 space-y-1.5 text-sm text-zinc-300">
              {rec.reasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-400" /> {reason}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Your package</h4>
            <dl className="mt-2 divide-y divide-white/5 text-sm">
              <div className="flex justify-between py-2">
                <dt className="text-zinc-400">
                  Theatre · {input.guests} {input.guests === 1 ? "guest" : "guests"}
                </dt>
                <dd className="text-zinc-200">{formatINR(rec.theaterCost)}</dd>
              </div>
              {rec.items.map((item) => (
                <div key={item.optionId} className="flex justify-between gap-4 py-2">
                  <dt className="text-zinc-400">
                    {CATEGORY_LABELS[item.category].replace(/s$/, "")} · {item.addOnName} (
                    {item.optionName})
                  </dt>
                  <dd className="shrink-0 text-zinc-200">{formatINR(item.price)}</dd>
                </div>
              ))}
              <div className="flex justify-between py-3 text-base font-semibold">
                <dt className="text-white">Estimated total</dt>
                <dd className="text-gold-300">{formatINR(rec.total)}</dd>
              </div>
            </dl>
            <BudgetLine rec={rec} budget={input.budget} />
          </div>

          <ButtonLink to={bookingHref(rec, input)} size="lg" className="w-full sm:w-auto">
            Book this experience <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>
      </article>

      {data.alternatives.length > 0 && (
        <div>
          <h3 className="font-display text-2xl text-white">Other great options</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {data.alternatives.map((alt) => (
              <article
                key={alt.theater.id}
                className="flex gap-4 rounded-2xl border border-white/5 bg-ink-900 p-4"
              >
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
                  <Photo src={alt.theater.images[0]} alt="" width={200} className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h4 className="font-medium text-white">{alt.theater.name}</h4>
                  <p className="text-xs text-zinc-500">
                    Up to {alt.theater.maxCapacity} guests · {alt.items.length} add-ons
                  </p>
                  <p className="mt-1 font-semibold text-gold-300">{formatINR(alt.total)}</p>
                  <ButtonLink
                    to={bookingHref(alt, input)}
                    size="sm"
                    variant="secondary"
                    className="mt-auto self-start"
                  >
                    Book this
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Recommendations come from a rules-based engine that scores theatres on group size, occasion
        and budget fit. Final prices are confirmed at checkout.
      </p>
    </section>
  );
}
