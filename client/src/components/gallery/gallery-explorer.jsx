import { Search, SlidersHorizontal } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";

import { Lightbox } from "./lightbox";
import { TheaterCard } from "./theater-card";

const SORTS = {
  recommended: {
    label: "Top rated",
    compare: (a, b) => b.rating - a.rating,
  },
  "price-asc": {
    label: "Price: low to high",
    compare: (a, b) => a.basePrice - b.basePrice,
  },
  "price-desc": {
    label: "Price: high to low",
    compare: (a, b) => b.basePrice - a.basePrice,
  },
  capacity: {
    label: "Capacity: largest",
    compare: (a, b) => b.maxCapacity - a.maxCapacity,
  },
};

const GUEST_FILTERS = [
  { value: 0, label: "Any group size" },
  { value: 2, label: "2+ guests" },
  { value: 6, label: "6+ guests" },
  { value: 10, label: "10+ guests" },
  { value: 15, label: "15+ guests" },
];

export function GalleryExplorer({ theaters, locations }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [minGuests, setMinGuests] = useState(0);
  const [sort, setSort] = useState("recommended");
  const [viewer, setViewer] = useState(null);
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return theaters
      .filter((t) => location === "all" || t.location.slug === location)
      .filter((t) => t.maxCapacity >= minGuests)
      .filter(
        (t) =>
          !q ||
          [
            t.name,
            t.tagline,
            t.description,
            t.location.city,
            t.location.name,
            t.screen,
            t.sound,
            ...t.amenities,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q),
      )
      .sort(SORTS[sort].compare);
  }, [theaters, deferredQuery, location, minGuests, sort]);

  const filtersActive = query !== "" || location !== "all" || minGuests !== 0;
  const resetFilters = () => {
    setQuery("");
    setLocation("all");
    setMinGuests(0);
  };

  return (
    <>
      <div
        role="search"
        className="grid gap-3 rounded-2xl border border-white/5 bg-ink-900 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]"
      >
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-500"
          />
          <label htmlFor="gallery-search" className="sr-only">
            Search theatres
          </label>
          <Input
            id="gallery-search"
            type="search"
            placeholder="Search by name, city or amenity…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11"
          />
        </div>
        <div>
          <label htmlFor="gallery-location" className="sr-only">
            Location
          </label>
          <Select
            id="gallery-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="all">All locations</option>
            {locations.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}, {l.city}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="gallery-guests" className="sr-only">
            Group size
          </label>
          <Select
            id="gallery-guests"
            value={minGuests}
            onChange={(e) => setMinGuests(Number(e.target.value))}
          >
            {GUEST_FILTERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="gallery-sort" className="sr-only">
            Sort by
          </label>
          <Select id="gallery-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-zinc-400">
        <p aria-live="polite">
          {results.length} {results.length === 1 ? "theatre" : "theatres"} found
        </p>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((theater, i) => (
            <TheaterCard
              key={theater.id}
              theater={theater}
              eager={i < 3}
              onViewPhotos={() => setViewer({ theater, index: 0 })}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
          <SlidersHorizontal aria-hidden className="size-8 text-zinc-600" />
          <p className="mt-4 font-medium text-white">No theatres match your filters</p>
          <p className="mt-1 text-sm text-zinc-500">
            Try a different search or a smaller group size.
          </p>
          <Button variant="secondary" size="sm" className="mt-6" onClick={resetFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {viewer && (
        <Lightbox
          title={viewer.theater.name}
          images={viewer.theater.images}
          index={viewer.index}
          onIndexChange={(index) => setViewer({ ...viewer, index })}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}
