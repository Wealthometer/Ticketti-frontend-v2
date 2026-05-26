import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Ticket, Wallet as WalletIcon } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { getOrganizerDashboard, requestWithdrawal } from "../services/api";

const StatusPill = ({ s }) => {
  const map = { success: "bg-emerald-500/15 text-emerald-400", pending: "bg-amber-500/15 text-amber-400", failed: "bg-red-500/15 text-red-400", paid: "bg-blue-500/15 text-blue-400", refunded: "bg-purple-500/15 text-purple-400" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[s] || "bg-white/10 text-white/40"}`}>{s}</span>;
};

export default function Wallet() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ amount: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) { navigate("/signin"); return; }
    setUser(JSON.parse(stored));
    getOrganizerDashboard()
      .then(setDash)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: "", text: "" });
    try {
      await requestWithdrawal(Number(form.amount), form.notes);
      setMsg({ type: "success", text: "Withdrawal request submitted! You may receive an OTP to confirm." });
      setForm({ amount: "", notes: "" });
      setTimeout(() => { setShowModal(false); setMsg({ type: "", text: "" }); }, 3000);
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Withdrawal failed." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const balance = dash?.available_balance ?? dash?.data?.available_balance ?? 0;
  const pending = dash?.pending_balance ?? dash?.data?.pending_balance ?? 0;
  const revenue = dash?.total_revenue ?? dash?.data?.total_revenue ?? 0;
  const payouts = dash?.recent_payouts ?? dash?.data?.recent_payouts ?? [];

  return (
    <div className="app-shell flex">
      <Sidebar user={user} />

      <main className="app-main overflow-auto">
        <div className="app-topbar mt-16 px-6 py-4 md:mt-0">
          <h1 className="text-xl font-bold text-white">Wallet</h1>
          <p className="text-white/30 text-xs">Manage your earnings and withdrawals</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Balance cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Available Balance", value: `₦${Number(balance).toLocaleString()}`, color: "violet", note: "Ready to withdraw" },
              { label: "Pending Balance", value: `₦${Number(pending).toLocaleString()}`, color: "amber", note: "Being processed" },
              { label: "Total Revenue", value: `₦${Number(revenue).toLocaleString()}`, color: "green", note: "All time earnings" },
            ].map(({ label, value, color, note }) => {
              const bg = { violet: "from-violet-600/20 to-violet-900/10 border-violet-500/20", amber: "from-amber-600/20 to-amber-900/10 border-amber-500/20", green: "from-emerald-600/20 to-emerald-900/10 border-emerald-500/20" };
              const text = { violet: "text-violet-300", amber: "text-amber-300", green: "text-emerald-300" };
              return (
                <div key={label} className={`bg-gradient-to-br ${bg[color]} border rounded-2xl p-5`}>
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{label}</p>
                  <p className={`text-3xl font-black mt-2 ${text[color]}`}>{loading ? "..." : value}</p>
                  <p className="text-white/25 text-xs mt-1">{note}</p>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <h2 className="text-white font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setShowModal(true); setMsg({ type: "", text: "" }); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition"
              >
                <DollarSign className="h-4 w-4" />
                Request Withdrawal
              </button>
              <button
                onClick={() => navigate("/event")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/8 hover:bg-white/12 text-white text-sm font-medium rounded-xl transition border border-white/10"
              >
                <Ticket className="h-4 w-4" />
                Browse Events
              </button>
            </div>
          </div>

          {/* Payouts table */}
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-white font-bold">Recent Payouts</h2>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">{[1,2,3].map(n => <div key={n} className="h-10 bg-white/5 rounded animate-pulse" />)}</div>
            ) : payouts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-white/30 text-xs uppercase tracking-widest">
                      <th className="text-left px-5 py-3 font-medium">Description</th>
                      <th className="text-left px-5 py-3 font-medium">Amount</th>
                      <th className="text-left px-5 py-3 font-medium">Status</th>
                      <th className="text-left px-5 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payouts.map((p, i) => (
                      <tr key={i} className="hover:bg-white/2 transition">
                        <td className="px-5 py-3 text-white/70">{p.description || p.notes || "Payout"}</td>
                        <td className="px-5 py-3 text-emerald-400 font-semibold">₦{Number(p.amount).toLocaleString()}</td>
                        <td className="px-5 py-3"><StatusPill s={p.status} /></td>
                        <td className="px-5 py-3 text-white/30 font-mono text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
                  <WalletIcon className="h-8 w-8" />
                </div>
                <p className="text-white/30 text-sm">No payouts yet. Withdraw your earnings!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Withdrawal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Request Withdrawal</h3>
                <p className="text-white/30 text-xs mt-0.5">An OTP may be sent to confirm</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white/70 text-2xl leading-none transition">&times;</button>
            </div>

            {msg.text && (
              <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Amount (₦)</label>
                <input
                  type="number" min="100" max={balance} required
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="e.g. 5000"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition"
                />
                <p className="text-white/25 text-xs mt-1">Available: ₦{Number(balance).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Notes <span className="normal-case text-white/25 font-normal">(optional)</span></label>
                <input
                  type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Monthly payout"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold rounded-xl transition text-sm">
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl transition text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
