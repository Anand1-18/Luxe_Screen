import { cn } from "@/lib/utils";

export function Container({ className, ...props }) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />
  );
}

export function SectionHeading({ eyebrow, title, text, align = "center", as: Heading = "h2" }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className="text-xs font-semibold tracking-[0.25em] text-gold-400 uppercase">{eyebrow}</p>
      )}
      <Heading className="mt-3 font-display text-3xl text-white sm:text-4xl">{title}</Heading>
      {text && <p className="mt-4 text-base leading-relaxed text-zinc-400">{text}</p>}
    </div>
  );
}
