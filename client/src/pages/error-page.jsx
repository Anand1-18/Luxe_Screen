import { useEffect } from "react";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";

import { PageMeta } from "@/components/layout/page-meta";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/** 404 page, used for unknown URLs and for records that don't exist (e.g. a bad booking id). */
export function NotFoundView() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <PageMeta title="Page not found" noIndex />
      <p className="font-display text-7xl text-gold-400">404</p>
      <h1 className="mt-4 font-display text-3xl text-white">This scene was cut</h1>
      <p className="mt-3 max-w-md text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink to="/">Back to home</ButtonLink>
        <ButtonLink to="/gallery" variant="secondary">
          Browse theatres
        </ButtonLink>
      </div>
    </Container>
  );
}

/** Route error boundary: renders a 404 for unknown pages and a retry screen for failures. */
export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  useEffect(() => {
    if (!notFound) console.error(error);
  }, [error, notFound]);

  if (notFound) return <NotFoundView />;

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <PageMeta title="Something went wrong" noIndex />
      <p className="text-xs font-semibold tracking-[0.25em] text-gold-400 uppercase">
        Intermission
      </p>
      <h1 className="mt-3 font-display text-4xl text-white">Something went wrong</h1>
      <p className="mt-4 max-w-md text-zinc-400">
        We couldn&apos;t load this page. Please check that the API server is running and try again.
      </p>
      <div className="mt-8 flex gap-3">
        {/* navigate(0) re-runs the current route, including its loader. */}
        <Button onClick={() => navigate(0)}>Try again</Button>
        <ButtonLink to="/" variant="secondary">
          Go home
        </ButtonLink>
      </div>
    </Container>
  );
}
