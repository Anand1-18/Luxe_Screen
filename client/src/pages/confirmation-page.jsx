import { data, useLoaderData } from "react-router";

import { PrintButton } from "@/components/booking/print-button";
import { Receipt } from "@/components/booking/receipt";
import { PageMeta } from "@/components/layout/page-meta";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { apiFetch, ApiClientError } from "@/lib/api-client";

export async function loader({ params }) {
  try {
    const { booking } = await apiFetch(`/api/booking/${encodeURIComponent(params.id)}`, {
      cache: "no-store",
    });
    return { booking };
  } catch (error) {
    // Let the route error page show its "not found" view.
    if (error instanceof ApiClientError && error.status === 404) {
      throw data("Booking not found", { status: 404 });
    }
    throw error;
  }
}

export function Component() {
  const { booking } = useLoaderData();
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <PageMeta title="Booking Receipt" noIndex />
      <div className="space-y-6">
        <Receipt booking={booking} />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center print:hidden">
          <PrintButton />
          <ButtonLink to="/booking">Book another experience</ButtonLink>
        </div>
      </div>
    </Container>
  );
}
