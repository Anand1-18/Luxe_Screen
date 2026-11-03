import { Clock, Mail, Phone } from "lucide-react";
import { Link } from "react-router";

import { navLinks, siteConfig } from "@/data/site";

import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-900 print:hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-zinc-400">{siteConfig.description}</p>
        </div>

        <nav aria-label="Footer" className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Explore</h2>
          <ul className="space-y-2 text-sm text-zinc-400">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className="hover:text-gold-300">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/booking" className="hover:text-gold-300">
                Book a Theatre
              </Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Get in touch</h2>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-center gap-2">
              <Phone aria-hidden className="size-4 text-gold-400" />
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                className="hover:text-gold-300"
              >
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail aria-hidden className="size-4 text-gold-400" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-gold-300">
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Clock aria-hidden className="size-4 text-gold-400" />
              {siteConfig.hours}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
