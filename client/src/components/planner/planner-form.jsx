import { Minus, Plus, WandSparkles } from "lucide-react";
import { useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { formatINR } from "@/shared/money";
import { OCCASION_LABELS } from "@/shared/occasions";
import { OCCASIONS } from "@/shared/planner";
import { cn } from "@/lib/utils";

import { PlannerResults } from "./planner-results";

const BUDGET = { min: 1000, max: 50000, step: 500 };
const GUESTS = { min: 1, max: 20 };

export function PlannerForm({ locations }) {
  const [occasion, setOccasion] = useState("BIRTHDAY");
  const [budget, setBudget] = useState(8000);
  const [guests, setGuests] = useState(4);
  const [location, setLocation] = useState(locations[0]?.slug ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const resultsRef = useRef(null);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const input = { occasion, budget, guests, location };
    try {
      const data = await apiFetch("/api/planner", {
        method: "POST",
        json: input,
      });
      setResult({ data, input });
      requestAnimationFrame(() =>
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={submit}
        className="space-y-8 rounded-2xl border border-white/5 bg-ink-900 p-6 sm:p-8"
      >
        <fieldset>
          <legend className="text-sm font-medium text-zinc-300">What are you celebrating?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {OCCASIONS.map((key) => (
              <label
                key={key}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-400",
                  occasion === key
                    ? "border-gold-400 bg-gold-500/15 text-gold-200"
                    : "border-white/10 text-zinc-300 hover:border-white/25",
                )}
              >
                <input
                  type="radio"
                  name="occasion"
                  value={key}
                  checked={occasion === key}
                  onChange={() => setOccasion(key)}
                  className="sr-only"
                />
                {OCCASION_LABELS[key]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="flex items-baseline justify-between">
              <label htmlFor="planner-budget" className="text-sm font-medium text-zinc-300">
                Total budget
              </label>
              <span className="text-lg font-semibold text-gold-300">{formatINR(budget * 100)}</span>
            </div>
            <input
              id="planner-budget"
              type="range"
              min={BUDGET.min}
              max={BUDGET.max}
              step={BUDGET.step}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-4 w-full accent-gold-500"
              aria-valuetext={formatINR(budget * 100)}
            />
            <div className="mt-1 flex justify-between text-xs text-zinc-500">
              <span>{formatINR(BUDGET.min * 100)}</span>
              <span>{formatINR(BUDGET.max * 100)}</span>
            </div>
          </div>

          <div>
            <span id="planner-guests-label" className="text-sm font-medium text-zinc-300">
              Number of guests
            </span>
            <div
              className="mt-3 flex items-center gap-3"
              role="group"
              aria-labelledby="planner-guests-label"
            >
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(GUESTS.min, g - 1))}
                disabled={guests <= GUESTS.min}
                className="flex size-11 items-center justify-center rounded-full border border-white/10 text-zinc-200 hover:bg-white/5 disabled:opacity-40"
                aria-label="Fewer guests"
              >
                <Minus className="size-4" />
              </button>
              <output
                aria-live="polite"
                className="w-10 text-center text-2xl font-semibold text-white"
              >
                {guests}
              </output>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(GUESTS.max, g + 1))}
                disabled={guests >= GUESTS.max}
                className="flex size-11 items-center justify-center rounded-full border border-white/10 text-zinc-200 hover:bg-white/5 disabled:opacity-40"
                aria-label="More guests"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="planner-location" className="text-sm font-medium text-zinc-300">
              Location
            </label>
            <Select
              id="planner-location"
              className="mt-3"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {locations.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.name}, {l.city}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {error && <Alert>{error}</Alert>}

        <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
          {!loading && <WandSparkles aria-hidden className="size-4" />}
          {loading ? "Planning your experience…" : "Plan my experience"}
        </Button>
      </form>

      <div ref={resultsRef} className="scroll-mt-24">
        {result && <PlannerResults data={result.data} input={result.input} />}
      </div>
    </>
  );
}
