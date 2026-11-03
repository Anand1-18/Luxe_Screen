import { Check, Minus, Plus } from "lucide-react";
import { Photo } from "@/components/ui/photo";

import { Button } from "@/components/ui/button";
import { formatINR } from "@/shared/money";
import { cn } from "@/lib/utils";

import { StepFooter } from "../step-footer";

const COPY = {
  CAKE: { title: "Add a cake", text: "Freshly baked and delivered to your theatre." },
  DECOR: {
    title: "Choose your decor",
    text: "Set up before you arrive, styled for your occasion.",
  },
  GIFT: { title: "Surprise them with a gift", text: "Waiting in the theatre when you walk in." },
};

const MAX_QUANTITY = 5;

export function AddOnStep({ category, addOns, state, dispatch, onBack, onNext }) {
  const items = addOns.filter((a) => a.category === category);
  const selectedCount = items.filter((a) => state.cart[a.id]).length;

  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title" className="font-display text-2xl text-white">
        {COPY[category].title}
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        {COPY[category].text} Optional, so skip if you like.
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((addOn) => {
          const entry = state.cart[addOn.id];
          const selectedOption = addOn.options.find((o) => o.id === entry?.optionId);
          const set = (optionId, quantity) =>
            dispatch({ type: "SET_CART_ITEM", addOnId: addOn.id, entry: { optionId, quantity } });

          return (
            <li
              key={addOn.id}
              className={cn(
                "flex flex-col overflow-hidden rounded-2xl border bg-ink-900 transition-colors",
                entry ? "border-gold-400" : "border-white/10",
              )}
            >
              <div className="relative aspect-[16/9]">
                <Photo src={addOn.image} alt="" width={720} className="object-cover" />
                {entry && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-medium text-ink-950">
                    <Check aria-hidden className="size-3.5" /> Added
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-medium text-white">{addOn.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{addOn.description}</p>

                <fieldset className="mt-4">
                  <legend className="sr-only">{addOn.name} options</legend>
                  <div className="flex flex-wrap gap-2">
                    {addOn.options.map((option) => (
                      <label
                        key={option.id}
                        className={cn(
                          "cursor-pointer rounded-lg border px-3 py-2 text-xs transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-400",
                          entry?.optionId === option.id
                            ? "border-gold-400 bg-gold-500/15 text-gold-200"
                            : "border-white/10 text-zinc-300 hover:border-white/25",
                        )}
                      >
                        <input
                          type="radio"
                          name={`option-${addOn.id}`}
                          value={option.id}
                          checked={entry?.optionId === option.id}
                          onChange={() => set(option.id, entry?.quantity ?? 1)}
                          className="sr-only"
                        />
                        {option.name} · {formatINR(option.price)}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  {entry && selectedOption ? (
                    <>
                      <div
                        className="flex items-center gap-2"
                        role="group"
                        aria-label={`${addOn.name} quantity`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            entry.quantity > 1
                              ? set(entry.optionId, entry.quantity - 1)
                              : dispatch({ type: "SET_CART_ITEM", addOnId: addOn.id, entry: null })
                          }
                          className="flex size-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/5"
                          aria-label={
                            entry.quantity > 1 ? "Decrease quantity" : `Remove ${addOn.name}`
                          }
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <output className="w-6 text-center text-sm font-semibold text-white">
                          {entry.quantity}
                        </output>
                        <button
                          type="button"
                          onClick={() =>
                            set(entry.optionId, Math.min(MAX_QUANTITY, entry.quantity + 1))
                          }
                          disabled={entry.quantity >= MAX_QUANTITY}
                          className="flex size-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/5 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="font-semibold text-gold-300">
                        {formatINR(selectedOption.price * entry.quantity)}
                      </span>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => set(addOn.options[0].id, 1)}
                      aria-label={`Add ${addOn.name}`}
                    >
                      <Plus aria-hidden className="size-3.5" /> Add
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <StepFooter onBack={onBack} onNext={onNext} nextLabel={selectedCount ? "Continue" : "Skip"} />
    </section>
  );
}
