import { Container, SectionHeading } from "@/components/ui/container";
import { services, steps } from "@/data/site";

export function Services() {
  return (
    <section id="services" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="What we do"
          title="An experience for every occasion"
          text="From a quiet date night to a 20-person birthday bash, every theatre is private, personalised and set up before you arrive."
        />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="group rounded-2xl border border-white/5 bg-ink-900 p-6 transition-colors hover:border-gold-400/30"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 ring-1 ring-gold-400/20">
                <Icon aria-hidden className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="border-y border-white/5 bg-ink-900 py-20">
      <Container>
        <SectionHeading eyebrow="How it works" title="Booked in three simple steps" />
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-gold-400/40 font-display text-xl text-gold-300">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-zinc-400">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
