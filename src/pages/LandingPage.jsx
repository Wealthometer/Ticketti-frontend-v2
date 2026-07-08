import React from "react";
import CTASection from "../components/CTASection";
import EventGrid from "../components/EventGrid";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import PricingBreakdown from "../components/PricingBreakdown";

export default function LandingPage() {
  return (
    <div>
      <Header />
      <Hero />
      <PricingBreakdown />

      <section className="bg-[#f4f7fb] px-4 py-20 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">Featured Events</p>
              <h2 className="font-display mt-4 text-3xl font-semibold sm:text-4xl">
                Explore events with a sharper presentation and clearer next steps.
              </h2>
            </div>
            <a
              href="/event"
              className="inline-flex w-fit items-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
            >
              View all events
            </a>
          </div>

          <EventGrid limit={6} />
        </div>
      </section>

      <HowItWorks />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
