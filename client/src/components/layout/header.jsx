import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";

import { ButtonLink } from "@/components/ui/button";
import { navLinks } from "@/data/site";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";

export function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-lg print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            // NavLink sets aria-current="page" on the active link automatically.
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  isActive ? "text-gold-300" : "text-zinc-400 hover:text-white",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink to="/booking" size="sm" className="hidden sm:inline-flex">
            Book Now
          </ButtonLink>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full text-zinc-300 hover:bg-white/5 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-white/5 px-4 pb-6 md:hidden"
        >
          <ul className="flex flex-col py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  end={link.href === "/"}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-lg px-3 py-3 text-base",
                      isActive ? "text-gold-300" : "text-zinc-300",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <ButtonLink to="/booking" className="w-full">
            Book Now
          </ButtonLink>
        </nav>
      )}
    </header>
  );
}
