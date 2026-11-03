import { useLoaderData } from "react-router";

import { GalleryExplorer } from "@/components/gallery/gallery-explorer";
import { PageMeta } from "@/components/layout/page-meta";
import { Container, SectionHeading } from "@/components/ui/container";
import { apiFetch } from "@/lib/api-client";

export async function loader() {
  const [{ theaters }, { locations }] = await Promise.all([
    apiFetch("/api/theaters"),
    apiFetch("/api/locations"),
  ]);
  return { theaters, locations: locations.filter((l) => l.status === "ACTIVE") };
}

export function Component() {
  const { theaters, locations } = useLoaderData();
  return (
    <Container className="py-14 sm:py-20">
      <PageMeta
        title="Theatres"
        description="Browse our private luxury theatres by city, group size and price, and view photos of every suite."
      />
      <SectionHeading
        as="h1"
        eyebrow="Gallery"
        title="Find your perfect theatre"
        text="Search, filter and compare every private screen. Tap a photo to look inside."
      />
      <div className="mt-12">
        <GalleryExplorer theaters={theaters} locations={locations} />
      </div>
    </Container>
  );
}
