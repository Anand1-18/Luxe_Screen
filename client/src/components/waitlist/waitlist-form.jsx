import { zodResolver } from "@hookform/resolvers/zod";
import { PartyPopper } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, fieldAria, Input, Select, Textarea } from "@/components/ui/field";
import { apiFetch, ApiClientError, errorMessage } from "@/lib/api-client";
import { waitlistSchema } from "@/shared/validation";

export function WaitlistForm({ locations }) {
  const [joined, setJoined] = useState(null);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: locations[0]?.slug ?? "",
      message: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const { entry } = await apiFetch("/api/waitlist", {
        method: "POST",
        json: values,
      });
      setJoined(`${entry.location.name}, ${entry.location.city}`);
      reset();
    } catch (err) {
      if (err instanceof ApiClientError) {
        for (const [field, messages] of Object.entries(err.fieldErrors)) {
          setFieldError(field, { message: messages[0] });
        }
      }
      setError(errorMessage(err));
    }
  });

  if (joined) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-gold-400/30 bg-ink-900 p-10 text-center">
        <PartyPopper aria-hidden className="size-10 text-gold-400" />
        <h2 className="mt-4 font-display text-2xl text-white">You&apos;re on the list!</h2>
        <p className="mt-2 max-w-sm text-sm text-zinc-400">
          We&apos;ll email you first when {joined} opens, with an early-bird offer for your first
          show.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => setJoined(null)}>
          Join for another city
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Join the waitlist"
      className="space-y-5 rounded-2xl border border-white/5 bg-ink-900 p-6 sm:p-8"
    >
      <Field
        id="waitlist-location"
        label="City you're waiting for"
        error={errors.location?.message}
      >
        <Select
          {...fieldAria("waitlist-location", errors.location?.message)}
          {...register("location")}
        >
          {locations.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.name}, {l.city}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="waitlist-name" label="Name" error={errors.name?.message}>
        <Input
          {...fieldAria("waitlist-name", errors.name?.message)}
          autoComplete="name"
          {...register("name")}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="waitlist-email" label="Email" error={errors.email?.message}>
          <Input
            {...fieldAria("waitlist-email", errors.email?.message)}
            type="email"
            autoComplete="email"
            {...register("email")}
          />
        </Field>
        <Field id="waitlist-phone" label="Phone" optional error={errors.phone?.message}>
          <Input
            {...fieldAria("waitlist-phone", errors.phone?.message)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            {...register("phone")}
          />
        </Field>
      </div>
      <Field
        id="waitlist-message"
        label="Anything you'd like us to know?"
        optional
        error={errors.message?.message}
      >
        <Textarea
          {...fieldAria("waitlist-message", errors.message?.message)}
          rows={3}
          placeholder="e.g. Planning a birthday in March"
          {...register("message")}
        />
      </Field>
      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={isSubmitting} className="w-full">
        Join the waitlist
      </Button>
    </form>
  );
}
