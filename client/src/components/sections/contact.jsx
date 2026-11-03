import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Container, SectionHeading } from "@/components/ui/container";
import { siteConfig } from "@/data/site";

import { ContactForm } from "./contact-form";

export function Contact({ locations: all }) {
  const locations = all.filter((l) => l.status === "ACTIVE");

  return (
    <section id="contact" className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Contact"
            title="Let's plan something special"
            text="Have a custom request or a big group? Send us a message and our team will get back within a few hours."
          />
          <ul className="mt-8 space-y-4 text-sm text-zinc-300">
            <li className="flex items-center gap-3">
              <Phone aria-hidden className="size-4 text-gold-400" />
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                className="hover:text-gold-300"
              >
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail aria-hidden className="size-4 text-gold-400" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-gold-300">
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock aria-hidden className="size-4 text-gold-400" />
              {siteConfig.hours}
            </li>
            {locations.map((l) => (
              <li key={l.id} className="flex items-start gap-3">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-400" />
                <span>
                  <span className="font-medium text-white">
                    {l.name}, {l.city}
                  </span>
                  {l.address && <span className="block text-zinc-400">{l.address}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <ContactForm />
      </Container>
    </section>
  );
}
