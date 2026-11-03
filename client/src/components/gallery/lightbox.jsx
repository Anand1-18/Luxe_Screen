import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/** Full-screen photo viewer built on the native <dialog> (focus trap + Esc for free). */
export function Lightbox({ title, images, index, onIndexChange, onClose }) {
  const ref = useRef(null);
  const count = images.length;
  const go = (delta) => onIndexChange((index + delta + count) % count);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={`${title} photos`}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-ink-950 p-0 backdrop:bg-black/80"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-3 text-sm text-zinc-300 sm:px-6">
          <p>
            <span className="font-medium text-white">{title}</span>
            <span className="ml-3 text-zinc-500">
              {index + 1} / {count}
            </span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Close photo viewer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="relative flex-1">
          <Photo
            key={images[index]}
            src={images[index]}
            alt={`${title}, photo ${index + 1} of ${count}`}
            width={1600}
            className="animate-fade-in object-contain"
          />
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink-900/80 text-white hover:bg-ink-700"
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink-900/80 text-white hover:bg-ink-700"
                aria-label="Next photo"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
        </div>

        <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => onIndexChange(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition",
                i === index ? "ring-gold-400" : "opacity-60 ring-transparent hover:opacity-100",
              )}
            >
              <Photo src={src} width={160} />
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}
