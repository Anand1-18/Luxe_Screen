import { ArrowRight, ChevronLeft, ChevronRight, WandSparkles } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { useCallback, useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { heroSlides } from "@/data/site";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 6000;

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = heroSlides.length;

  const go = useCallback((next) => setIndex((next + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  const slide = heroSlides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {heroSlides.map((s, i) => (
        <Photo
          key={s.image}
          src={s.image}
          alt=""
          width={1600}
          eager={i === 0}
          className={cn(
            "-z-20 object-cover transition-opacity duration-1000",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/10" />

      <div className="mx-auto w-full max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div key={index} className="max-w-2xl animate-fade-in" aria-live="polite">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase">
            {slide.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-white sm:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            {slide.text}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/booking" size="lg">
            Book a Theatre <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
          <ButtonLink to="/ai-planner" size="lg" variant="secondary">
            <WandSparkles aria-hidden className="size-4" /> Plan with AI
          </ButtonLink>
        </div>

        <div className="mt-12 flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="flex size-10 items-center justify-center rounded-full border border-white/15 text-zinc-200 hover:bg-white/10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex gap-2">
            {heroSlides.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1} of ${count}`}
                aria-current={i === index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-8 bg-gold-400" : "w-3 bg-white/30 hover:bg-white/50",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="flex size-10 items-center justify-center rounded-full border border-white/15 text-zinc-200 hover:bg-white/10"
            aria-label="Next slide"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
