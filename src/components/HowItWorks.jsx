import React from "react";
import { CheckCircle2, Search, Ticket } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover",
    description: "Find concerts, conferences, and community experiences through a cleaner browsing flow.",
  },
  {
    icon: Ticket,
    title: "Book",
    description: "Select tickets quickly with straightforward pricing and a checkout flow that feels trustworthy.",
  },
  {
    icon: CheckCircle2,
    title: "Check In",
    description: "Deliver tickets instantly and keep entry fast with scannable access for every attendee.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#eef3f9] px-4 py-20 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">How It Works</p>
          <h2 className="font-display mt-4 text-3xl font-semibold sm:text-4xl">
            One platform for discovery, conversion, and event-day confidence.
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            The experience stays simple for attendees while organizers get a more professional operating layer behind the scenes.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className="app-panel-light group rounded-[2rem] p-7 text-left transition duration-300 hover:-translate-y-1"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300/20">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Step {index + 1}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">{title}</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
