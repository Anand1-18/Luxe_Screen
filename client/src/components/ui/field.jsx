import { cn } from "@/lib/utils";

export const inputClasses =
  "w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-gold-400 focus:outline-none aria-invalid:border-red-400/70";

export function Field({ id, label, error, hint, optional, className, children }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between text-sm font-medium text-zinc-300"
      >
        {label}
        {optional && <span className="text-xs font-normal text-zinc-500">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-zinc-500">{hint}</p>
      )}
    </div>
  );
}

/** aria props that wire an input to its Field error message. */
export function fieldAria(id, error) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}

export function Input({ className, ...props }) {
  return <input className={cn(inputClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn(inputClasses, "min-h-24 resize-y", className)} {...props} />;
}

export function Select({ className, ...props }) {
  return <select className={cn(inputClasses, "appearance-none pr-10", className)} {...props} />;
}
