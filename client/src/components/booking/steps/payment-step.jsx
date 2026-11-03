import { CreditCard, Landmark, ShieldCheck, Smartphone, Tag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { apiFetch, ApiClientError, errorMessage } from "@/lib/api-client";
import { formatDisplayDate, formatTime } from "@/shared/dates";
import { formatINR } from "@/shared/money";
import { OCCASION_LABELS, PAYMENT_METHOD_LABELS } from "@/shared/occasions";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/shared/validation";

import { toBookingPayload } from "../booking-state";
import { HoldCountdown } from "../hold-countdown";
import { StepFooter } from "../step-footer";

const METHOD_ICONS = {
  UPI: Smartphone,
  CARD: CreditCard,
  NET_BANKING: Landmark,
};

export function PaymentStep({ state, dispatch, total, onBack, onEdit }) {
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  const quoteInput = {
    theaterId: state.theater?.id ?? "",
    guests: state.guests,
    items: Object.values(state.cart).map(({ optionId, quantity }) => ({ optionId, quantity })),
  };
  const quoteKey = JSON.stringify(quoteInput);

  async function applyCoupon(code) {
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await apiFetch("/api/coupons/validate", {
        method: "POST",
        json: { code, ...quoteInput },
      });
      dispatch({
        type: "SET_COUPON",
        coupon: { code: result.code, description: result.description, discount: result.discount },
      });
      setCouponInput("");
      return true;
    } catch (err) {
      setCouponError(
        err instanceof ApiClientError && err.code === "VALIDATION_ERROR"
          ? "Enter a valid coupon code."
          : errorMessage(err),
      );
      return false;
    } finally {
      setCouponLoading(false);
    }
  }

  // The cart may have changed since the coupon was applied: re-check it once per cart.
  const checkedKey = useRef(null);
  const appliedCode = state.coupon?.code;
  useEffect(() => {
    if (!appliedCode || checkedKey.current === quoteKey) return;
    checkedKey.current = quoteKey;
    apiFetch("/api/coupons/validate", {
      method: "POST",
      json: { code: appliedCode, ...JSON.parse(quoteKey) },
    })
      .then((r) =>
        dispatch({
          type: "SET_COUPON",
          coupon: { code: r.code, description: r.description, discount: r.discount },
        }),
      )
      .catch((err) => {
        dispatch({ type: "SET_COUPON", coupon: null });
        setCouponError(`${appliedCode} was removed: ${errorMessage(err)}`);
      });
  }, [appliedCode, quoteKey, dispatch]);

  async function pay() {
    setPaying(true);
    setError(null);
    const payload = toBookingPayload(state);
    const signature = JSON.stringify(payload);
    let pending = state.pending;
    // Reuse the existing hold only if nothing changed and it is still live.
    if (
      pending &&
      (pending.signature !== signature || new Date(pending.holdExpiresAt).getTime() <= Date.now())
    ) {
      pending = null;
    }

    try {
      if (!pending) {
        const { booking } = await apiFetch("/api/booking", {
          method: "POST",
          json: payload,
        });
        pending = { id: booking.id, signature, holdExpiresAt: booking.holdExpiresAt };
        dispatch({ type: "SET_PENDING", pending });
      }
      const { booking } = await apiFetch("/api/booking/confirm", {
        method: "POST",
        json: {
          bookingId: pending.id,
          paymentMethod: state.paymentMethod,
          simulateOutcome: simulateFailure ? "FAILURE" : "SUCCESS",
        },
      });
      dispatch({ type: "CONFIRMED", booking });
    } catch (err) {
      if (!(err instanceof ApiClientError)) {
        setError({ message: errorMessage(err) });
      } else if (["SLOT_UNAVAILABLE", "SLOT_CLOSED", "DATE_OUT_OF_RANGE"].includes(err.code)) {
        dispatch({ type: "SET_PENDING", pending: null });
        setError({ message: err.message, slotLost: true });
      } else if (err.code === "HOLD_EXPIRED") {
        dispatch({ type: "SET_PENDING", pending: null });
        setError({ message: `${err.message} Press pay to try again.` });
      } else if (err.code === "COUPON_INVALID") {
        dispatch({ type: "SET_COUPON", coupon: null });
        setError({
          message: `${err.message} The coupon was removed. Please review your total and pay again.`,
        });
      } else if (err.code === "VALIDATION_ERROR") {
        setError({ message: "Some booking details are invalid. Please go back and review them." });
      } else {
        setError({ message: err.message });
      }
    } finally {
      setPaying(false);
    }
  }

  const details = state.occasionDetails;
  const occasionLine = [details.honoreeName, details.partnerName].filter(Boolean).join(" & ");

  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title" className="font-display text-2xl text-white">
        Review &amp; pay
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        Check your booking, apply a coupon and complete payment.
      </p>

      <dl className="mt-6 grid gap-4 rounded-2xl border border-white/5 bg-ink-950 p-5 text-sm sm:grid-cols-2">
        <ReviewItem label="When" onEdit={() => onEdit(1)}>
          {formatDisplayDate(state.date)}
          {state.slot &&
            ` · ${formatTime(state.slot.startTime)} – ${formatTime(state.slot.endTime)}`}
        </ReviewItem>
        <ReviewItem label="Theatre" onEdit={() => onEdit(2)}>
          {state.theater?.name} · {state.guests} {state.guests === 1 ? "guest" : "guests"}
        </ReviewItem>
        <ReviewItem label="Contact" onEdit={() => onEdit(3)}>
          {state.customer.name}
          <span className="block text-zinc-400">
            {state.customer.phone} · {state.customer.email}
          </span>
        </ReviewItem>
        <ReviewItem label="Occasion" onEdit={() => onEdit(4)}>
          {state.occasion ? OCCASION_LABELS[state.occasion] : "—"}
          {occasionLine && <span className="block text-zinc-400">{occasionLine}</span>}
          {details.screenMessage && (
            <span className="block text-zinc-400">“{details.screenMessage}”</span>
          )}
        </ReviewItem>
      </dl>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-zinc-300">Coupon</h3>
        {state.coupon ? (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm">
            <span className="flex items-center gap-2 text-emerald-200">
              <Tag aria-hidden className="size-4" />
              <span>
                <span className="font-semibold">{state.coupon.code}</span> applied · you save{" "}
                {formatINR(state.coupon.discount)}
              </span>
            </span>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_COUPON", coupon: null })}
              className="flex size-8 items-center justify-center rounded-full text-emerald-200 hover:bg-white/10"
              aria-label="Remove coupon"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (couponInput.trim()) void applyCoupon(couponInput.trim());
            }}
          >
            <label htmlFor="coupon-code" className="sr-only">
              Coupon code
            </label>
            <Input
              id="coupon-code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Try LUXE10"
              autoComplete="off"
              aria-invalid={couponError ? true : undefined}
              aria-describedby={couponError ? "coupon-error" : undefined}
              className="uppercase"
            />
            <Button
              type="submit"
              variant="secondary"
              loading={couponLoading}
              disabled={!couponInput.trim()}
            >
              Apply
            </Button>
          </form>
        )}
        {couponError && (
          <p id="coupon-error" role="alert" className="mt-2 text-xs text-red-400">
            {couponError}
          </p>
        )}
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-zinc-300">Payment method</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {PAYMENT_METHODS.map((method) => {
            const Icon = METHOD_ICONS[method];
            const checked = state.paymentMethod === method;
            return (
              <label
                key={method}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-400",
                  checked
                    ? "border-gold-400 bg-gold-500/10 text-white"
                    : "border-white/10 text-zinc-300 hover:border-white/25",
                )}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={method}
                  checked={checked}
                  onChange={() => dispatch({ type: "SET_PAYMENT_METHOD", method })}
                  className="sr-only"
                />
                <Icon aria-hidden className="size-5 text-gold-400" />
                {PAYMENT_METHOD_LABELS[method]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 space-y-3 rounded-xl border border-gold-400/20 bg-gold-500/5 p-4">
        <p className="text-gold-100 flex items-start gap-2 text-sm">
          <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-400" />
          This is a simulated payment gateway for demonstration. No real payment is taken and no
          card details are collected.
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
            className="size-4 accent-gold-500"
          />
          Test mode: simulate a declined payment
        </label>
        {state.pending && <HoldCountdown expiresAt={state.pending.holdExpiresAt} />}
      </div>

      {error && (
        <Alert className="mt-6">
          {error.message}
          {error.slotLost && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => dispatch({ type: "CLEAR_SLOT" })}
            >
              Choose another slot
            </Button>
          )}
        </Alert>
      )}

      <StepFooter
        onBack={onBack}
        onNext={pay}
        loading={paying}
        nextLabel={paying ? "Processing payment…" : `Pay ${formatINR(total)}`}
      />
    </section>
  );
}

function ReviewItem({ label, onEdit, children }) {
  return (
    <div>
      <dt className="flex items-center justify-between text-xs tracking-wide text-zinc-500 uppercase">
        {label}
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-gold-400 normal-case hover:text-gold-300"
        >
          Edit<span className="sr-only"> {label.toLowerCase()}</span>
        </button>
      </dt>
      <dd className="mt-1 text-zinc-200">{children}</dd>
    </div>
  );
}
