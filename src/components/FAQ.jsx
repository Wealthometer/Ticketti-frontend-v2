import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I receive tickets after purchase?",
    answer: "Tickets are delivered digitally and can be accessed inside your Ticketii account once the order is confirmed.",
  },
  {
    question: "Can organizers publish events quickly?",
    answer: "Yes. Organizers can create event pages, add ticket types, and manage sales from one dashboard.",
  },
  {
    question: "What happens if an event changes?",
    answer: "Important updates can be communicated through the platform, and attendees can review ticket details from their account.",
  },
  {
    question: "Is checkout secure?",
    answer: "Ticketii uses secure authentication and payment flows so attendees can book with confidence.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faqs" className="bg-white px-4 py-20 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">FAQ</p>
          <h2 className="font-display mt-4 text-3xl font-semibold sm:text-4xl">
            Answers that keep attendees and organizers moving.
          </h2>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            A simple support layer helps people understand what to expect before they buy, host, or check in.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question} className="app-panel-light overflow-hidden rounded-[1.75rem]">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-lg font-semibold text-slate-900">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 transition ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <p className="px-6 pb-6 text-base leading-7 text-slate-600">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
