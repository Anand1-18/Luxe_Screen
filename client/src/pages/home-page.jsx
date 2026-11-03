import { useLoaderData } from "react-router";

import { Contact } from "@/components/sections/contact";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { HowItWorks, Services } from "@/components/sections/services";
import { TheatrePreview } from "@/components/sections/theatre-preview";
import { PageMeta } from "@/components/layout/page-meta";
import { apiFetch } from "@/lib/api-client";

export async function loader() {
  const [{ theaters }, { locations }] = await Promise.all([
    apiFetch("/api/theaters"),
    apiFetch("/api/locations"),
  ]);
  return { theaters, locations };
}

export function Component() {
  const { theaters, locations } = useLoaderData();
  return (
    <>
      <PageMeta />
      <Hero />
      <Services />
      <HowItWorks />
      <TheatrePreview theaters={theaters} />
      <Faq />
      <Contact locations={locations} />
    </>
  );
}
