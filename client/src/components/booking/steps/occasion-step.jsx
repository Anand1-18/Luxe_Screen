import { zodResolver } from "@hookform/resolvers/zod";

import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Field, fieldAria, Input, Textarea } from "@/components/ui/field";
import { OCCASION_FIELDS, OCCASION_LABELS } from "@/shared/occasions";
import { OCCASIONS } from "@/shared/planner";
import { cn } from "@/lib/utils";
import { occasionDetailsSchema, occasionSchema } from "@/shared/validation";

import { StepFooter } from "../step-footer";

const schema = z.object({
  occasion: occasionSchema,
  occasionDetails: occasionDetailsSchema,
  specialRequests: z.string().trim().max(500, "Please keep it under 500 characters"),
});

export function OccasionStep({ state, dispatch, onBack, onNext }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      // An empty value lets the schema report "Choose an occasion".
      occasion: state.occasion ?? "",
      occasionDetails: state.occasionDetails,
      specialRequests: state.specialRequests,
    },
  });

  const occasion = useWatch({ control, name: "occasion" });
  const fields = occasion ? OCCASION_FIELDS[occasion] : {};

  const onSubmit = handleSubmit((values) => {
    // Keep only the detail fields relevant to the chosen occasion.
    const allowed = OCCASION_FIELDS[values.occasion];
    const d = values.occasionDetails;
    dispatch({
      type: "SET_OCCASION",
      occasion: values.occasion,
      occasionDetails: {
        honoreeName: allowed.honoree ? d.honoreeName : undefined,
        partnerName: allowed.partner ? d.partnerName : undefined,
        age: allowed.age ? d.age : undefined,
        screenMessage: d.screenMessage,
      },
      specialRequests: values.specialRequests,
    });
    onNext();
  });

  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title" className="font-display text-2xl text-white">
        What&apos;s the occasion?
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        We&apos;ll personalise the theatre and the welcome on screen.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-6">
        <fieldset aria-describedby={errors.occasion ? "occasion-error" : undefined}>
          <legend className="text-sm font-medium text-zinc-300">Occasion</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {OCCASIONS.map((key) => (
              <label
                key={key}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-400",
                  occasion === key
                    ? "border-gold-400 bg-gold-500/15 text-gold-200"
                    : "border-white/10 text-zinc-300 hover:border-white/25",
                )}
              >
                <input type="radio" value={key} className="sr-only" {...register("occasion")} />
                {OCCASION_LABELS[key]}
              </label>
            ))}
          </div>
          {errors.occasion && (
            <p id="occasion-error" role="alert" className="mt-2 text-xs text-red-400">
              {errors.occasion.message}
            </p>
          )}
        </fieldset>

        {(fields.honoree || fields.partner || fields.age) && (
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.honoree && (
              <Field
                id="occasion-honoree"
                label={fields.honoree}
                optional
                error={errors.occasionDetails?.honoreeName?.message}
              >
                <Input
                  {...fieldAria("occasion-honoree", errors.occasionDetails?.honoreeName?.message)}
                  {...register("occasionDetails.honoreeName")}
                />
              </Field>
            )}
            {fields.partner && (
              <Field
                id="occasion-partner"
                label={fields.partner}
                optional
                error={errors.occasionDetails?.partnerName?.message}
              >
                <Input
                  {...fieldAria("occasion-partner", errors.occasionDetails?.partnerName?.message)}
                  {...register("occasionDetails.partnerName")}
                />
              </Field>
            )}
            {fields.age && (
              <Field
                id="occasion-age"
                label="Turning"
                optional
                error={errors.occasionDetails?.age?.message}
              >
                <Input
                  {...fieldAria("occasion-age", errors.occasionDetails?.age?.message)}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={120}
                  {...register("occasionDetails.age", {
                    setValueAs: (v) =>
                      v === "" || v === null || v === undefined ? undefined : Number(v),
                  })}
                />
              </Field>
            )}
          </div>
        )}

        <Field
          id="occasion-message"
          label="Message on the big screen"
          optional
          hint="Up to 120 characters, e.g. “Happy 25th, Aarav!”"
          error={errors.occasionDetails?.screenMessage?.message}
        >
          <Input
            {...fieldAria("occasion-message", errors.occasionDetails?.screenMessage?.message)}
            maxLength={120}
            {...register("occasionDetails.screenMessage")}
          />
        </Field>

        <Field
          id="occasion-requests"
          label="Special requests"
          optional
          error={errors.specialRequests?.message}
        >
          <Textarea
            {...fieldAria("occasion-requests", errors.specialRequests?.message)}
            rows={3}
            placeholder="Dietary needs, surprise timing, accessibility…"
            {...register("specialRequests")}
          />
        </Field>

        <StepFooter onBack={onBack} nextType="submit" />
      </form>
    </section>
  );
}
