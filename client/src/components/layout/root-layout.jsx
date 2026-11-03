import { Outlet, ScrollRestoration, useNavigation } from "react-router";

import { cn } from "@/lib/utils";

import { Footer } from "./footer";
import { Header } from "./header";

/** App shell shared by every page: skip link, header, page content and footer. */
export function RootLayout({ children }) {
  const navigation = useNavigation();
  const loading = navigation.state === "loading";

  return (
    <div className="flex min-h-svh flex-col font-sans">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-gold-500 px-4 py-2 text-ink-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      {/* Thin progress bar while the next page's data loads. */}
      <div
        aria-hidden
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gold-400 transition-transform duration-500",
          loading ? "scale-x-75" : "scale-x-0",
        )}
      />
      <Header />
      <main id="main" className="flex-1" aria-busy={loading || undefined}>
        {children ?? <Outlet />}
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
