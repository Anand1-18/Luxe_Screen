import { ChevronDown } from "lucide-react";

import { Container, SectionHeading } from "@/components/ui/container";
import { faqs } from "@/data/site";

export function Faq() {
  return (
    <section id="faq" className="border-t border-white/5 bg-ink-900 py-20 sm:py-28">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-12 divide-y divide-white/5 rounded-2xl border border-white/5 bg-ink-950">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-white">
                {faq.q}
                <ChevronDown
                  aria-hidden
                  className="size-5 shrink-0 text-gold-400 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{faq.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
