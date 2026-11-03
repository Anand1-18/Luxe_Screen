import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

import { formatDisplayDate, formatTime } from "@/shared/dates";
import { formatINR } from "@/shared/money";
import { CATEGORY_LABELS } from "@/shared/occasions";
import { calculatePrice } from "@/shared/pricing";

export function cartLines(state, addOnsById) {
  return Object.entries(state.cart).flatMap(([addOnId, entry]) => {
    const addOn = addOnsById.get(addOnId);
    const option = addOn?.options.find((o) => o.id === entry.optionId);
    if (!addOn || !option) return [];
    return [
      {
        addOnId,
        addOnName: addOn.name,
        category: addOn.category,
        optionName: option.name,
        price: option.price,
        quantity: entry.quantity,
      },
    ];
  });
}

/** Client-side price preview. The server recalculates authoritatively on booking. */
export function previewPrice(state, lines) {
  if (!state.theater) return null;
  return calculatePrice({
    theater: state.theater,
    guests: state.guests,
    items: lines,
    discountAmount: state.coupon?.discount ?? 0,
  });
}

export function OrderSummary({ state, addOnsById }) {
  const lines = cartLines(state, addOnsById);
  const price = previewPrice(state, lines);

  return (
    <aside aria-label="Order summary" className="rounded-2xl border border-white/5 bg-ink-900 p-5">
      <h2 className="font-display text-lg text-white">Your booking</h2>

      <ul className="mt-4 space-y-2 text-sm text-zinc-300">
        <li className="flex items-center gap-2">
          <CalendarDays aria-hidden className="size-4 text-gold-400" />{" "}
          {formatDisplayDate(state.date)}
        </li>
        <li className="flex items-center gap-2">
          <Clock aria-hidden className="size-4 text-gold-400" />
          {state.slot
            ? `${state.slot.label} · ${formatTime(state.slot.startTime)} – ${formatTime(state.slot.endTime)}`
            : state.startTime
              ? formatTime(state.startTime)
              : "Time not selected"}
        </li>
        <li className="flex items-center gap-2">
          <Users aria-hidden className="size-4 text-gold-400" /> {state.guests}{" "}
          {state.guests === 1 ? "guest" : "guests"}
        </li>
        {state.theater && (
          <li className="flex items-center gap-2">
            <MapPin aria-hidden className="size-4 text-gold-400" />
            {state.theater.name}, {state.theater.location.city}
          </li>
        )}
      </ul>

      {price ? (
        <dl className="mt-5 space-y-2 border-t border-white/5 pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-400">Theatre (up to {state.theater.includedGuests})</dt>
            <dd className="text-zinc-200">{formatINR(price.theaterAmount)}</dd>
          </div>
          {price.extraGuestAmount > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-400">
                Extra guests × {state.guests - state.theater.includedGuests}
              </dt>
              <dd className="text-zinc-200">{formatINR(price.extraGuestAmount)}</dd>
            </div>
          )}
          {lines.map((line) => (
            <div key={line.addOnId} className="flex justify-between gap-3">
              <dt className="text-zinc-400">
                {line.addOnName} ({line.optionName}){line.quantity > 1 && ` × ${line.quantity}`}
                <span className="block text-xs text-zinc-600">
                  {CATEGORY_LABELS[line.category]}
                </span>
              </dt>
              <dd className="shrink-0 text-zinc-200">{formatINR(line.price * line.quantity)}</dd>
            </div>
          ))}
          {price.discountAmount > 0 && (
            <div className="flex justify-between gap-3 text-emerald-300">
              <dt>Coupon {state.coupon?.code}</dt>
              <dd>−{formatINR(price.discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3 border-t border-white/5 pt-3 text-base font-semibold">
            <dt className="text-white">Total</dt>
            <dd className="text-gold-300">{formatINR(price.total)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-5 border-t border-white/5 pt-4 text-sm text-zinc-500">
          Select a theatre to see your price.
        </p>
      )}
    </aside>
  );
}
