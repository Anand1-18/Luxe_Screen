import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, fieldAria, Input, Textarea } from "@/components/ui/field";
import { apiFetch, ApiClientError, errorMessage } from "@/lib/api-client";
import { contactSchema } from "@/shared/validation";

export function ContactForm() {
  const [status, setStatus] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setStatus(null);
    try {
      await apiFetch("/api/contact", { method: "POST", json: values });
      reset();
      setStatus({
        tone: "success",
        text: "Thanks! We've received your message and will reply soon.",
      });
    } catch (error) {
      if (error instanceof ApiClientError) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          setError(field, { message: messages[0] });
        }
      }
      setStatus({ tone: "error", text: errorMessage(error) });
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5 rounded-2xl border border-white/5 bg-ink-900 p-6 sm:p-8"
      aria-label="Contact form"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Name" error={errors.name?.message}>
          <Input
            {...fieldAria("contact-name", errors.name?.message)}
            autoComplete="name"
            {...register("name")}
          />
        </Field>
        <Field id="contact-phone" label="Phone" optional error={errors.phone?.message}>
          <Input
            {...fieldAria("contact-phone", errors.phone?.message)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            {...register("phone")}
          />
        </Field>
      </div>
      <Field id="contact-email" label="Email" error={errors.email?.message}>
        <Input
          {...fieldAria("contact-email", errors.email?.message)}
          type="email"
          autoComplete="email"
          {...register("email")}
        />
      </Field>
      <Field id="contact-message" label="Message" error={errors.message?.message}>
        <Textarea
          {...fieldAria("contact-message", errors.message?.message)}
          rows={4}
          placeholder="Tell us about your celebration…"
          {...register("message")}
        />
      </Field>
      {status && <Alert tone={status.tone}>{status.text}</Alert>}
      <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
        Send message
      </Button>
    </form>
  );
}
