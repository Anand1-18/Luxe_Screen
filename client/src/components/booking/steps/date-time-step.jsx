import { Minus, Plus } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { formatTime } from "@/shared/dates";
import { cn } from "@/lib/utils";

import { StepFooter } from "../step-footer";

const MAX_GUESTS = 20;

function timeOptions(data, guests) {
  const byTime = new Map();
  for (const theater of data.theaters) {
    for (const slot of theater.slots) {
      const option = byTime.get(slot.startTime) ?? {
        startTime: slot.startTime,
        endTime: slot.endTime,
        label: slot.label,
        available: 0,
        closed: slot.status === "CLOSED",
      };
      if (slot.status === "AVAILABLE" && theater.maxCapacity >= guests) option.available += 1;
      byTime.set(slot.startTime, option);
    }
  }
  return [...byTime.values()].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function DateTimeStep({ state, dispatch, locations, today, maxDate, availability, onNext }) {
  const options = availability.data ? timeOptions(availability.data, state.guests) : [];
  const selected = options.find((o) => o.startTime === state.startTime);
  const canContinue = !!selected && selected.available > 0;

  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title" className="font-display text-2xl text-white">
        When would you like to come?
      </h2>
      <p className="mt-1 text-sm text-zinc-400">Each slot is a private 3-hour session.</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <Field id="booking-location" label="Location">
          <Select
            id="booking-location"
            value={state.location}
            onChange={(e) => dispatch({ type: "SET_LOCATION", location: e.target.value })}
          >
            {locations.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}, {l.city}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="booking-date" label="Date">
          <Input
            id="booking-date"
            type="date"
            min={today}
            max={maxDate}
            value={state.date}
            required
            onChange={(e) => {
              const value = e.target.value;
              if (value >= today && value <= maxDate) dispatch({ type: "SET_DATE", date: value });
            }}
          />
        </Field>
        <div className="space-y-1.5">
          <span id="booking-guests-label" className="text-sm font-medium text-zinc-300">
            Guests
          </span>
          <div
            className="flex items-center gap-3"
            role="group"
            aria-labelledby="booking-guests-label"
          >
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_GUESTS", guests: Math.max(1, state.guests - 1) })
              }
              disabled={state.guests <= 1}
              className="flex size-11 items-center justify-center rounded-full border border-white/10 text-zinc-200 hover:bg-white/5 disabled:opacity-40"
              aria-label="Fewer guests"
            >
              <Minus className="size-4" />
            </button>
            <output aria-live="polite" className="w-8 text-center text-xl font-semibold text-white">
              {state.guests}
            </output>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_GUESTS", guests: Math.min(MAX_GUESTS, state.guests + 1) })
              }
              disabled={state.guests >= MAX_GUESTS}
              className="flex size-11 items-center justify-center rounded-full border border-white/10 text-zinc-200 hover:bg-white/5 disabled:opacity-40"
              aria-label="More guests"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="text-sm font-medium text-zinc-300">Choose a time</legend>
        {availability.loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400" role="status">
            <Spinner className="size-4" /> Checking availability…
          </div>
        ) : availability.error ? (
          <Alert className="mt-4">
            {availability.error}{" "}
            <Button variant="ghost" size="sm" onClick={availability.refresh}>
              Retry
            </Button>
          </Alert>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {options.map((option) => {
              const disabled = option.closed || option.available === 0;
              const checked = state.startTime === option.startTime;
              return (
                <label
                  key={option.startTime}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-400",
                    checked
                      ? "border-gold-400 bg-gold-500/10"
                      : "border-white/10 hover:border-white/25",
                    disabled && "cursor-not-allowed opacity-50 hover:border-white/10",
                  )}
                >
                  <input
                    type="radio"
                    name="slot-time"
                    value={option.startTime}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => dispatch({ type: "SELECT_TIME", startTime: option.startTime })}
                    className="sr-only"
                  />
                  <span>
                    <span className="block font-medium text-white">{option.label}</span>
                    <span className="text-sm text-zinc-400">
                      {formatTime(option.startTime)} – {formatTime(option.endTime)}
                    </span>
                  </span>
                  <span className={cn("text-xs", disabled ? "text-zinc-500" : "text-emerald-300")}>
                    {option.closed
                      ? "Closed"
                      : option.available === 0
                        ? "Sold out"
                        : `${option.available} ${option.available === 1 ? "theatre" : "theatres"} free`}
                  </span>
                </label>
              );
            })}
          </div>
        )}
        {!availability.loading &&
          !availability.error &&
          options.length > 0 &&
          options.every((o) => o.closed || o.available === 0) && (
            <Alert tone="info" className="mt-4">
              No theatres are free for {state.guests} guests on this date. Try another date or a
              smaller group.
            </Alert>
          )}
      </fieldset>

      <StepFooter onNext={onNext} nextDisabled={!canContinue} nextLabel="Choose theatre" />
    </section>
  );
}
