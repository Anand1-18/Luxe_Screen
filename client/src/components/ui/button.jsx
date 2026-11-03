import { Link } from "react-router";

import { cn } from "@/lib/utils";

import { Spinner } from "./spinner";

const variants = {
  primary:
    "bg-gold-500 text-ink-950 hover:bg-gold-400 shadow-[0_8px_30px_-12px_rgba(201,161,74,0.7)] disabled:bg-gold-600/60",
  secondary:
    "border border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10 hover:border-white/25",
  ghost: "text-zinc-300 hover:text-white hover:bg-white/5",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
};

export function buttonClasses({ variant = "primary", size = "md" } = {}, className) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant,
  size,
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, className, ...props }) {
  return <Link className={buttonClasses({ variant, size }, className)} {...props} />;
}
