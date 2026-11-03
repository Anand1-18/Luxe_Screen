import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { STEPS } from "./booking-state";

export function Stepper({ current, maxReached, onSelect }) {
  const progress = ((current - 1) / (STEPS.length - 1)) * 100;

  return (
    <nav aria-label="Booking progress">
      {/* Compact view for small screens */}
      <div className="lg:hidden">
        <p className="text-sm text-zinc-400">
          Step <span className="font-semibold text-white">{current}</span> of {STEPS.length} ·{" "}
          <span className="text-gold-300">{STEPS[current - 1]}</span>
        </p>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={current}
          aria-label="Booking progress"
        >
          <div
            className="h-full rounded-full bg-gold-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ol className="hidden items-center lg:flex">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          // Steps already visited can be revisited; nothing after confirmation can.
          const reachable = step <= maxReached && current !== 9 && step !== 9;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!reachable || active}
                onClick={() => onSelect(step)}
                aria-current={active ? "step" : undefined}
                className="group flex flex-col items-center gap-2 disabled:cursor-default"
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    active && "border-gold-400 bg-gold-500 text-ink-950",
                    done &&
                      "border-gold-400/60 bg-gold-500/15 text-gold-300 group-enabled:group-hover:bg-gold-500/30",
                    !active && !done && "border-white/15 text-zinc-500",
                  )}
                >
                  {done ? <Check aria-hidden className="size-4" /> : step}
                </span>
                <span
                  className={cn(
                    "text-[11px] whitespace-nowrap",
                    active ? "text-gold-300" : done ? "text-zinc-300" : "text-zinc-500",
                  )}
                >
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "mx-1 mb-6 h-px flex-1",
                    step < current ? "bg-gold-400/50" : "bg-white/10",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
