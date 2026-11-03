import { Hourglass } from "lucide-react";
import { useEffect, useState } from "react";

/** Shows how long the slot stays reserved while the customer pays. */
export function HoldCountdown({ expiresAt }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = Math.max(0, new Date(expiresAt).getTime() - now);
  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return (
    <p className="flex items-center gap-2 text-sm text-gold-200" role="timer" aria-live="off">
      <Hourglass aria-hidden className="size-4" />
      {remaining > 0 ? (
        <>
          Slot held for{" "}
          <span className="font-semibold tabular-nums">
            {minutes}:{String(seconds).padStart(2, "0")}
          </span>
        </>
      ) : (
        "Your hold has expired. Paying again will re-check availability."
      )}
    </p>
  );
}
