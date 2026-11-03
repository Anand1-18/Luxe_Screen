import { Expand, MapPin, Monitor, Star, Users, Volume2 } from "lucide-react";
import { Photo } from "@/components/ui/photo";

import { ButtonLink } from "@/components/ui/button";
import { formatINR } from "@/shared/money";

export function TheaterCard({ theater, onViewPhotos, eager = false }) {
  const image = (
    <Photo
      src={theater.images[0]}
      alt={`${theater.name} theatre`}
      eager={eager}
      width={800}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-900 transition-colors hover:border-gold-400/30">
      <div className="relative aspect-[4/3] overflow-hidden">
        {onViewPhotos ? (
          <button
            type="button"
            onClick={onViewPhotos}
            className="absolute inset-0 cursor-zoom-in"
            aria-label={`View ${theater.images.length} photos of ${theater.name}`}
          >
            {image}
            <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-ink-950/80 px-3 py-1 text-xs text-zinc-200 backdrop-blur">
              <Expand aria-hidden className="size-3.5" /> {theater.images.length} photos
            </span>
          </button>
        ) : (
          image
        )}
        <span className="pointer-events-none absolute top-3 left-3 flex items-center gap-1 rounded-full bg-ink-950/80 px-2.5 py-1 text-xs font-medium text-gold-300 backdrop-blur">
          <Star aria-hidden className="size-3.5 fill-current" /> {theater.rating.toFixed(1)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-xs text-zinc-500">
          <MapPin aria-hidden className="size-3.5" />
          {theater.location.name}, {theater.location.city}
        </p>
        <h3 className="mt-2 font-display text-xl text-white">{theater.name}</h3>
        <p className="mt-1 text-sm text-zinc-400">{theater.tagline}</p>

        <ul className="mt-4 grid grid-cols-3 gap-2 text-xs text-zinc-300">
          <li className="flex items-center gap-1.5">
            <Users aria-hidden className="size-3.5 text-gold-400" /> Up to {theater.maxCapacity}
          </li>
          <li className="flex items-center gap-1.5">
            <Monitor aria-hidden className="size-3.5 text-gold-400" /> {theater.screen}
          </li>
          <li className="flex items-center gap-1.5">
            <Volume2 aria-hidden className="size-3.5 text-gold-400" /> Atmos
          </li>
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-zinc-500">From</p>
            <p className="text-lg font-semibold text-white">
              {formatINR(theater.basePrice)}
              <span className="text-xs font-normal text-zinc-500">
                {" "}
                / {theater.includedGuests} guests
              </span>
            </p>
          </div>
          <ButtonLink
            to={`/booking?location=${theater.location.slug}&theater=${theater.slug}`}
            size="sm"
            aria-label={`Book ${theater.name}`}
          >
            Book
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
