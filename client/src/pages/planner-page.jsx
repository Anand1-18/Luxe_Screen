import { useLoaderData } from "react-router";

import { PageMeta } from "@/components/layout/page-meta";
import { PlannerForm } from "@/components/planner/planner-form";
import { Container, SectionHeading } from "@/components/ui/container";
import { apiFetch } from "@/lib/api-client";

export async function loader() {
  const { locations } = await apiFetch("/api/locations");
  return { locations: locations.filter((l) => l.status === "ACTIVE") };
}

export function Component() {
  const { locations } = useLoaderData();
  return (
    <Container className="max-w-5xl py-14 sm:py-20">
      <PageMeta
        title="AI Experience Planner"
        description="Tell us the occasion, budget and guest count and get a recommended theatre with a cake, decor and gift package."
      />
      <SectionHeading
        as="h1"
        eyebrow="AI Experience Planner"
        title="Tell us the moment. We'll plan the rest."
        text="Pick your occasion, budget and group size, and we'll recommend the right theatre with a matching cake, decor and gift package."
      />
      <div className="mt-12">
        <PlannerForm locations={locations} />
      </div>
    </Container>
  );
}
