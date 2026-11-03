import { ArrowRight } from "lucide-react";

import { TheaterCard } from "@/components/gallery/theater-card";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/container";

export function TheatrePreview({ theaters: all }) {
  const theaters = [...all].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Our theatres"
            title="Step inside our private screens"
            text="Every suite pairs a 4K laser projector with Dolby Atmos sound and plush seating."
          />
          <ButtonLink to="/gallery" variant="secondary">
            View all theatres <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {theaters.map((theater) => (
            <TheaterCard key={theater.id} theater={theater} />
          ))}
        </div>
      </Container>
    </section>
  );
}
