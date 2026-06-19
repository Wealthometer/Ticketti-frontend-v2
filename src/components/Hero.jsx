import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Ticket } from "lucide-react";
import heroImg from "../assets/hero.png";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <section className="relative h-[92vh] flex items-center justify-center overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Event crowd"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
      </div>

      {/* Floating Brand Tag */}
      {/* <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 backdrop-blur"
      >
        <Ticket className="h-4 w-4 text-sky-300" />
        Ticketii Platform
      </motion.div> */}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl">

        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur"
        >
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="h-4 w-4 text-sky-300" />
          </motion.span>
          Smarter ticketing for modern events
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
        >
          Events made simple
          <br />
          for everyone
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-slate-300 text-base sm:text-lg leading-7"
        >
          Discover events, book tickets, and manage experiences seamlessly in one place.
        </motion.p>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            to="/event"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100 transition"
          >
            Explore Events
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Get Started
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-xs text-slate-400"
        >
          Trusted for concerts, tech events, workshops & festivals
        </motion.p>
      </div>
    </section>
  );
}