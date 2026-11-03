import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function Spinner({ className }) {
  return <LoaderCircle aria-hidden className={cn("size-5 animate-spin", className)} />;
}
