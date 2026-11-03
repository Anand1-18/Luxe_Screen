import { CircleAlert, CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export function Alert({ tone = "error", children, className }) {
  const Icon = tone === "success" ? CircleCheck : CircleAlert;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        tone === "error" && "border-red-400/30 bg-red-500/10 text-red-200",
        tone === "success" && "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
        tone === "info" && "border-gold-400/30 bg-gold-500/10 text-gold-200",
        className,
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
