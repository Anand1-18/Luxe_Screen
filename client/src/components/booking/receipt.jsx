import { CircleAlert, CircleCheck } from "lucide-react";

import { formatDisplayDate, formatTime } from "@/shared/dates";
import { formatINR } from "@/shared/money";
import { CATEGORY_LABELS, OCCASION_LABELS, PAYMENT_METHOD_LABELS } from "@/shared/occasions";

/** Booking receipt; rendered in the wizard's final step and on the shareable receipt page. */
export function Receipt({ booking }) {
  const confirmed = booking.status === "CONFIRMED";
  const d = booking.occasionDetails ?? {};
  const names = [d.honoreeName, d.partnerName].filter(Boolean).join(" & ");

  return (
    <article
      aria-labelledby="receipt-title"
      className="rounded-2xl border border-white/10 bg-ink-900 print:border-zinc-300 print:bg-white print:text-black"
    >
      <header className="flex flex-col items-center border-b border-white/5 px-6 py-8 text-center">
        {confirmed ? (
          <CircleCheck aria-hidden className="size-12 text-emerald-400" />
        ) : (
          <CircleAlert aria-hidden className="size-12 text-amber-400" />
        )}
        <h2 id="receipt-title" className="mt-4 font-display text-3xl text-white print:text-black">
          {confirmed ? "Booking confirmed!" : `Booking ${booking.status.toLowerCase()}`}
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {confirmed
            ? "Show this booking reference at the venue. We'll contact you on your phone if anything changes."
            : "This booking is not confirmed. Please start a new booking."}
        </p>
        <p className="mt-4 rounded-full border border-gold-400/40 px-4 py-1.5 font-mono text-sm tracking-wider text-gold-300">
          {booking.reference}
        </p>
      </header>

      <div className="grid gap-6 px-6 py-6 text-sm sm:grid-cols-2">
        <Detail label="Theatre">
          {booking.theater.name}
          <span className="block text-zinc-400">
            {booking.location.name}, {booking.location.city}
          </span>
          {booking.location.address && (
            <span className="block text-zinc-500">{booking.location.address}</span>
          )}
        </Detail>
        <Detail label="Date & time">
          {formatDisplayDate(booking.date)}
          <span className="block text-zinc-400">
            {booking.slot.label} · {formatTime(booking.slot.startTime)} –{" "}
            {formatTime(booking.slot.endTime)}
          </span>
        </Detail>
        <Detail label="Guest">
          {booking.customer.name}
          <span className="block text-zinc-400">
            {booking.customer.phone} · {booking.customer.email}
          </span>
        </Detail>
        <Detail label="Occasion">
          {OCCASION_LABELS[booking.occasion]} · {booking.guests}{" "}
          {booking.guests === 1 ? "guest" : "guests"}
          {names && <span className="block text-zinc-400">{names}</span>}
          {d.screenMessage && (
            <span className="block text-zinc-400">On screen: “{d.screenMessage}”</span>
          )}
        </Detail>
        {booking.specialRequests && (
          <Detail label="Special requests" className="sm:col-span-2">
            {booking.specialRequests}
          </Detail>
        )}
      </div>

      <dl className="mx-6 space-y-2 border-t border-white/5 py-5 text-sm">
        <Row label="Theatre" value={booking.price.theaterAmount} />
        {booking.price.extraGuestAmount > 0 && (
          <Row label="Extra guests" value={booking.price.extraGuestAmount} />
        )}
        {booking.items.map((item) => (
          <Row
            key={`${item.addOnName}-${item.optionName}`}
            label={`${CATEGORY_LABELS[item.category].replace(/s$/, "")} · ${item.addOnName} (${item.optionName})${item.quantity > 1 ? ` × ${item.quantity}` : ""}`}
            value={item.price * item.quantity}
          />
        ))}
        {booking.price.discountAmount > 0 && (
          <Row
            label={`Coupon ${booking.coupon?.code ?? ""}`}
            value={-booking.price.discountAmount}
            highlight
          />
        )}
        <div className="flex justify-between border-t border-white/5 pt-3 text-base font-semibold">
          <dt className="text-white print:text-black">{confirmed ? "Total paid" : "Total"}</dt>
          <dd className="text-gold-300">{formatINR(booking.price.total)}</dd>
        </div>
      </dl>

      {booking.paymentRef && (
        <p className="border-t border-white/5 px-6 py-4 text-xs text-zinc-500">
          Paid via {booking.paymentMethod ? PAYMENT_METHOD_LABELS[booking.paymentMethod] : "—"} ·
          Payment ref <span className="font-mono">{booking.paymentRef}</span>
          {booking.confirmedAt &&
            ` · ${new Date(booking.confirmedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`}
        </p>
      )}
    </article>
  );
}

function Detail({ label, children, className }) {
  return (
    <div className={className}>
      <p className="text-xs tracking-wide text-zinc-500 uppercase">{label}</p>
      <p className="mt-1 text-zinc-200 print:text-black">{children}</p>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className={`flex justify-between gap-4 ${highlight ? "text-emerald-300" : ""}`}>
      <dt className={highlight ? "" : "text-zinc-400"}>{label}</dt>
      <dd className={`shrink-0 ${highlight ? "" : "text-zinc-200 print:text-black"}`}>
        {value < 0 ? `−${formatINR(-value)}` : formatINR(value)}
      </dd>
    </div>
  );
}
