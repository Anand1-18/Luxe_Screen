import { cn } from "@/lib/utils";

/** Requests an Unsplash image at the given width instead of the 1600px original. */
export function photoUrl(src, width) {
  return src.replace(/([?&])w=\d+/, `$1w=${width}`);
}

/**
 * Fills its positioned parent (like CSS background-size: cover).
 * Lazy-loads by default; pass `eager` for above-the-fold images (better LCP).
 */
export function Photo({ src, width = 800, eager = false, alt = "", className, ...props }) {
  return (
    <img
      src={photoUrl(src, width)}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className={cn("absolute inset-0 size-full object-cover", className)}
      {...props}
    />
  );
}
