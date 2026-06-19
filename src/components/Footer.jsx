import React from "react";
import { Boxes, Mail, MapPin } from "lucide-react";
import logo from "../assets/logo.png";
import { FaInstagram } from "react-icons/fa";

const companyLinks = [
  { name: "About", href: "/" },
  { name: "Events", href: "/event" },
  { name: "Contact", href: "/contact" },
];

const supportLinks = [
  { name: "FAQ", href: "#faqs" },
  { name: "Sign In", href: "/signin" },
  { name: "Create Account", href: "/signup" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 px-4 py-16 text-slate-300 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden">
              <img src={logo} alt="Ticketii" className="h-full w-auto object-contain" />
            </div>
            {/* <div>
              <p className="font-display text-lg font-semibold text-white">Ticketii</p>
              <p className="text-sm text-slate-400">Simple, modern event ticketing</p>
            </div> */}
          </div>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
            Ticketii helps organizers present events more professionally while giving attendees a smoother path from discovery to entry.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              support@ticketii.com
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lagos, Nigeria
            </span>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-display text-base font-semibold text-white">Company</h3>
            <div className="mt-4 space-y-3 text-sm">
              {companyLinks.map((item) => (
                <a key={item.name} href={item.href} className="block transition hover:text-white">
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-white">Support</h3>
            <div className="mt-4 space-y-3 text-sm">
              {supportLinks.map((item) => (
                <a key={item.name} href={item.href} className="block transition hover:text-white">
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-white">Social</h3>
            <a
              href="https://www.instagram.com/p/DTNTmvRDA5G/"
              className="mt-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:text-white"
            >
              <Boxes className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-sm text-slate-500">
        © 2026 Ticketii. All rights reserved.
      </div>
    </footer>
  );
}
