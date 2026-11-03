import { Clapperboard } from "lucide-react";
import { Link } from "react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Luxe Screens home">
      <span className="flex size-9 items-center justify-center rounded-full bg-gold-500/15 text-gold-400 ring-1 ring-gold-400/30">
        <Clapperboard aria-hidden className="size-4.5" />
      </span>
      <span className="font-display text-xl text-white">
        Luxe <span className="text-gold-400">Screens</span>
      </span>
    </Link>
  );
}
