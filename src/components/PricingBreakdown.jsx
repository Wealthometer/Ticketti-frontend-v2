import React from "react";
import { Calculator, ReceiptText, ShieldCheck } from "lucide-react";

const SERVICE_FEE_PERCENT = 0.05;
const FLAT_PROCESSING_FEE = 100;
const SAMPLE_TICKET_PRICE = 5000;
const SAMPLE_QUANTITY = 2;

const formatNaira = (amount) =>
  `\u20A6${Math.round(Number(amount || 0)).toLocaleString()}`;

const subtotal = SAMPLE_TICKET_PRICE * SAMPLE_QUANTITY;
const serviceFee = subtotal * SERVICE_FEE_PERCENT;
const processingFee = FLAT_PROCESSING_FEE;
const total = subtotal + serviceFee + processingFee;

const rows = [
  { label: "Ticket subtotal", value: formatNaira(subtotal) },
  { label: "Service fee (5%)", value: formatNaira(serviceFee) },
  { label: "Processing fee", value: formatNaira(processingFee), note: "Flat per booking" },
];

export default function PricingBreakdown() {
  return (
    <section className="bg-white px-4 py-20 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <Calculator className="h-4 w-4" />
            Transparent pricing
          </div>
          <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            See the fees before checkout.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Ticketti keeps the math visible: attendees see the ticket subtotal,
            the 5% service fee, and one flat processing fee before confirming
            their tickets.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <ReceiptText className="h-5 w-5 text-blue-700" />
              <p className="mt-3 text-sm font-semibold text-slate-900">All amounts in NGN</p>
              <p className="mt-1 text-sm text-slate-500">No currency guesswork at checkout.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Flat base charge</p>
              <p className="mt-1 text-sm text-slate-500">Processing fee stays at {formatNaira(processingFee)} per booking.</p>
            </div>
          </div>
        </div>

        <div className="app-panel-light overflow-hidden rounded-[2rem] border border-slate-200 bg-[#f7fafc] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">Sample booking</p>
            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Concert ticket</p>
                <p className="font-display mt-1 text-3xl font-semibold">{formatNaira(SAMPLE_TICKET_PRICE)}</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold">
                Qty {SAMPLE_QUANTITY}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{row.label}</p>
                  {row.note && <p className="mt-1 text-xs text-slate-500">{row.note}</p>}
                </div>
                <p className="text-sm font-bold text-slate-950">{row.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-gradient-to-br from-blue-700 to-slate-950 p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">Total</p>
              <p className="font-display text-3xl font-semibold">{formatNaira(total)}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-blue-100">
              Calculated as subtotal + 5% service fee + {formatNaira(processingFee)} flat processing fee.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
