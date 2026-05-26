import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarRange, ShieldCheck, Sparkles } from "lucide-react";
import heroImg from "../assets/hero.png";

const highlights = [
  "Clean check-in and ticket validation",
  "Faster payouts for organizers",
  "Professional pages for every event",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-24">
      <div className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.2),transparent_45%)]" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="pt-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
            <Sparkles className="h-4 w-4 text-sky-300" />
            Ticketing that feels polished from discovery to check-in
          </div>

          <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Build memorable event experiences with a calmer, smarter ticketing flow.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Ticketii helps organizers launch professional event pages, manage sales, and keep attendees moving with less friction.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/event"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-950 px-6 py-3 text-sm font-semibold text-black transition hover:bg-slate-200 hover:text-black"
            >
              Explore Events
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Create an Account
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Trusted flows", value: "OTP login", icon: ShieldCheck },
              { label: "Organizer tools", value: "Fast setup", icon: CalendarRange },
              { label: "Design quality", value: "Modern UI", icon: Sparkles },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="app-panel rounded-3xl px-4 py-4">
                <Icon className="mb-4 h-5 w-5 text-sky-300" />
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{label}</p>
                <p className="mt-2 text-base font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-blue-500/25 via-cyan-400/10 to-transparent blur-2xl" />
          <div className="app-panel overflow-hidden rounded-[2rem] p-4">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
              <img
                src={heroImg}
                alt="Audience enjoying a live event"
                className="h-[420px] w-full object-cover"
              />
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Why teams choose Ticketii</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.5rem] border border-sky-400/20 bg-gradient-to-br from-blue-500/20 to-cyan-400/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-sky-100/70">Launch momentum</p>
                <p className="mt-3 font-display text-4xl font-semibold text-white">24/7</p>
                <p className="mt-2 text-sm text-slate-200">
                  Your audience can discover, book, and access tickets whenever they are ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
