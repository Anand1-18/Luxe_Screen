import { Printer } from "lucide-react";
import { useEffect, useMemo, useReducer, useRef } from "react";
import { Link } from "react-router";

import { Button, buttonClasses } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import {
  clearStoredState,
  createInitialState,
  loadStoredState,
  saveState,
  selectTheater,
  wizardReducer,
} from "./booking-state";
import { cartLines, OrderSummary, previewPrice } from "./order-summary";
import { Receipt } from "./receipt";
import { Stepper } from "./stepper";
import { AddOnStep } from "./steps/addon-step";
import { ContactStep } from "./steps/contact-step";
import { DateTimeStep } from "./steps/date-time-step";
import { OccasionStep } from "./steps/occasion-step";
import { PaymentStep } from "./steps/payment-step";
import { TheaterStep } from "./steps/theater-step";
import { useAvailability } from "./use-availability";

/**
 * Props come from the booking page loader:
 * prefill = { fromLink, location, guests?, occasion?, theaterId?, cart? } (from a gallery/planner deep link).
 */
export function BookingWizard({ locations, addOns, today, maxDate, prefill }) {
  // Lazy initial state: restore an in-progress booking after a refresh,
  // unless the user arrived through a deep link, which starts fresh.
  const [state, dispatch] = useReducer(wizardReducer, null, () => {
    const fresh = createInitialState({
      today,
      location: prefill.location,
      guests: prefill.guests,
      occasion: prefill.occasion,
      preferredTheaterId: prefill.theaterId,
      cart: prefill.cart,
    });
    return prefill.fromLink ? fresh : (loadStoredState(today) ?? fresh);
  });
  const topRef = useRef(null);
  const addOnsById = useMemo(() => new Map(addOns.map((a) => [a.id, a])), [addOns]);

  // Drop the deep-link query from the address bar so a refresh restores saved progress.
  useEffect(() => {
    if (prefill.fromLink) window.history.replaceState(window.history.state, "", "/booking");
  }, [prefill.fromLink]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Bring the new step into view (not on first render).
  const lastStep = useRef(state.step);
  useEffect(() => {
    if (lastStep.current === state.step) return;
    lastStep.current = state.step;
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Move focus to the new step heading for keyboard and screen-reader users.
    const heading = topRef.current?.querySelector("h2");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }, [state.step]);

  const availability = useAvailability(state.location, state.date, state.step <= 2);

  const go = (step) => dispatch({ type: "GO", step });
  const back = () => go(state.step - 1);
  const next = () => go(state.step + 1);

  function continueFromDateTime() {
    // Pre-select the theatre requested via deep link if it is free at the chosen time.
    if (!state.theater && state.preferredTheaterId && availability.data) {
      const theater = availability.data.theaters.find((t) => t.id === state.preferredTheaterId);
      const slot = theater?.slots.find(
        (s) => s.startTime === state.startTime && s.status === "AVAILABLE",
      );
      if (theater && slot && theater.maxCapacity >= state.guests) {
        dispatch(selectTheater(theater, slot));
      }
    }
    next();
  }

  function startOver() {
    clearStoredState();
    dispatch({ type: "HYDRATE", state: createInitialState({ today, location: prefill.location }) });
  }

  const total = previewPrice(state, cartLines(state, addOnsById))?.total ?? 0;
  const showSummary = state.step >= 2 && state.step <= 8;

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className="print:hidden">
        <Stepper current={state.step} maxReached={state.maxStep} onSelect={go} />
      </div>

      <div
        className={
          showSummary ? "mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start" : "mt-8"
        }
      >
        <div
          key={state.step}
          className="animate-fade-in rounded-2xl border border-white/5 bg-ink-900/60 p-5 sm:p-8 print:border-0 print:p-0 [&_h2]:outline-none"
        >
          {state.step === 1 && (
            <DateTimeStep
              state={state}
              dispatch={dispatch}
              locations={locations}
              today={today}
              maxDate={maxDate}
              availability={availability}
              onNext={continueFromDateTime}
            />
          )}
          {state.step === 2 && (
            <TheaterStep
              state={state}
              dispatch={dispatch}
              availability={availability}
              onBack={back}
              onNext={next}
            />
          )}
          {state.step === 3 && (
            <ContactStep state={state} dispatch={dispatch} onBack={back} onNext={next} />
          )}
          {state.step === 4 && (
            <OccasionStep state={state} dispatch={dispatch} onBack={back} onNext={next} />
          )}
          {state.step === 5 && (
            <AddOnStep
              category="CAKE"
              addOns={addOns}
              state={state}
              dispatch={dispatch}
              onBack={back}
              onNext={next}
            />
          )}
          {state.step === 6 && (
            <AddOnStep
              category="DECOR"
              addOns={addOns}
              state={state}
              dispatch={dispatch}
              onBack={back}
              onNext={next}
            />
          )}
          {state.step === 7 && (
            <AddOnStep
              category="GIFT"
              addOns={addOns}
              state={state}
              dispatch={dispatch}
              onBack={back}
              onNext={next}
            />
          )}
          {state.step === 8 && (
            <PaymentStep
              state={state}
              dispatch={dispatch}
              total={total}
              onBack={back}
              onEdit={go}
            />
          )}
          {state.step === 9 && state.booking && (
            <div className="space-y-6">
              <Receipt booking={state.booking} />
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center print:hidden">
                <Button variant="secondary" onClick={() => window.print()}>
                  <Printer aria-hidden className="size-4" /> Print receipt
                </Button>
                <Link
                  to={`/booking/confirmation/${state.booking.id}`}
                  className={buttonClasses({ variant: "secondary" })}
                >
                  Open receipt page
                </Link>
                <Button onClick={startOver}>Book another experience</Button>
              </div>
            </div>
          )}
        </div>

        {showSummary && (
          <div className="lg:sticky lg:top-24">
            <OrderSummary state={state} addOnsById={addOnsById} />
          </div>
        )}
      </div>
    </div>
  );
}

export function WizardSkeleton() {
  return (
    <div
      className="flex min-h-80 items-center justify-center gap-2 rounded-2xl border border-white/5 bg-ink-900/60 text-sm text-zinc-400"
      role="status"
    >
      <Spinner className="size-4" /> Loading booking…
    </div>
  );
}
