import { createBrowserRouter } from "react-router";

import { RootLayout } from "@/components/layout/root-layout";
import { Spinner } from "@/components/ui/spinner";
import { ErrorPage, NotFoundView } from "@/pages/error-page";

function PageLoading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-zinc-400"
      role="status"
    >
      <Spinner className="size-4" /> Loading…
    </div>
  );
}

/**
 * Each page module exports `loader` (fetches its API data before rendering)
 * and `Component`. `lazy` splits every page into its own JS chunk.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    // Shown while the very first page's loader runs.
    hydrateFallbackElement: (
      <RootLayout>
        <PageLoading />
      </RootLayout>
    ),
    // Last-resort boundary if the layout itself fails.
    errorElement: (
      <RootLayout>
        <ErrorPage />
      </RootLayout>
    ),
    children: [
      {
        // Page errors and 404s render inside the layout, keeping header and footer.
        errorElement: <ErrorPage />,
        children: [
          { index: true, lazy: () => import("@/pages/home-page") },
          { path: "gallery", lazy: () => import("@/pages/gallery-page") },
          { path: "ai-planner", lazy: () => import("@/pages/planner-page") },
          { path: "booking", lazy: () => import("@/pages/booking-page") },
          { path: "booking/confirmation/:id", lazy: () => import("@/pages/confirmation-page") },
          { path: "waitlist", lazy: () => import("@/pages/waitlist-page") },
          { path: "*", element: <NotFoundView /> },
        ],
      },
    ],
  },
]);
