import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";

import { Field, fieldAria, Input } from "@/components/ui/field";
import { customerSchema } from "@/shared/validation";

import { StepFooter } from "../step-footer";

export function ContactStep({ state, dispatch, onBack, onNext }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: state.customer,
  });

  const onSubmit = handleSubmit((customer) => {
    dispatch({ type: "SET_CUSTOMER", customer });
    onNext();
  });

  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title" className="font-display text-2xl text-white">
        Your contact details
      </h2>
      <p className="mt-1 text-sm text-zinc-400">We&apos;ll send your booking confirmation here.</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
        <Field id="customer-name" label="Full name" error={errors.name?.message}>
          <Input
            {...fieldAria("customer-name", errors.name?.message)}
            autoComplete="name"
            {...register("name")}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="customer-phone"
            label="Mobile number"
            hint="10-digit Indian mobile number"
            error={errors.phone?.message}
          >
            <Input
              {...fieldAria("customer-phone", errors.phone?.message)}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="98765 43210"
              {...register("phone")}
            />
          </Field>
          <Field id="customer-email" label="Email" error={errors.email?.message}>
            <Input
              {...fieldAria("customer-email", errors.email?.message)}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
            />
          </Field>
        </div>
        <StepFooter onBack={onBack} nextType="submit" />
      </form>
    </section>
  );
}
