import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StepFooter({
  onBack,
  nextLabel = "Continue",
  nextDisabled,
  onNext,
  nextType = "button",
  loading,
  extra,
}) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft aria-hidden className="size-4" /> Back
        </Button>
      ) : (
        <span />
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {extra}
        <Button
          type={nextType}
          onClick={onNext}
          disabled={nextDisabled}
          loading={loading}
          size="lg"
        >
          {nextLabel} {!loading && <ArrowRight aria-hidden className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
