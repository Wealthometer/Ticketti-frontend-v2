import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { updatePassword } from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email = "", token = "" } = location.state || {};

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) navigate("/forgot-password");
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    try {
      await updatePassword(token, form.password);
      setDone(true);
      setTimeout(() => navigate("/signin"), 2500);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
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
          {done ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Password Reset!</h2>
              <p className="text-white/40 text-sm">Redirecting you to sign in...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔒</span>
              </div>
              <h1 className="text-2xl font-bold text-white text-center mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Set New Password</h1>
              <p className="text-white/40 text-sm text-center mb-8">Choose a strong new password for your account.</p>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">New Password</label>
                  <input
                    type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6}
                    placeholder="Min. 6 characters"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Confirm Password</label>
                  <input
                    type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required
                    placeholder="Repeat new password"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl transition text-sm"
                >
                  {loading ? "Saving..." : "Reset Password →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&display=swap');`}</style>
    </div>
  );
}
