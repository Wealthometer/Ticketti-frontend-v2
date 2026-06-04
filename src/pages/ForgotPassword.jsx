import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      setSent(true);
      navigate("/verify-otp", { state: { email, type: "forgot_password", redirect: "/reset-password" } });
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-12 justify-center">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">T</span>
          </div>
          <span className="text-white text-xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Ticketii</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔑</span>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Forgot Password?</h1>
          <p className="text-white/40 text-sm text-center mb-8">Enter your email and we'll send you an OTP to reset your password.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl transition text-sm"
            >
              {loading ? "Sending OTP..." : "Send Reset OTP →"}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            <Link to="/signin" className="text-violet-400 hover:text-violet-300 transition">← Back to Sign In</Link>
          </p>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&display=swap');`}</style>
    </div>
  );
}
