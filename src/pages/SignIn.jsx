import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginStep1 } from "../services/api";
import { getDefaultRouteForUser } from "../utils/auth";

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      navigate(getDefaultRouteForUser(storedUser));
    }
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown) return;
    setLoading(true);
    setError("");
    try {
      await loginStep1(form.email, form.password);
      // OTP sent — navigate to verify page with context
      navigate("/verify-otp", { state: { email: form.email, type: "login", redirect: "/dashboard" } });
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("wait") || msg.includes("cooldown")) {
        setCooldown(true);
        setError("Too many attempts. Please wait before retrying.");
        setTimeout(() => setCooldown(false), 30000);
      } else if (msg.includes("restricted")) {
        setError("Your account is temporarily restricted. Contact support.");
      } else if (msg.includes("blocked") || msg.includes("Access denied")) {
        setError("Access denied. Please contact support.");
      } else {
        setError(msg || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
          alt="Event"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 via-purple-900/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 mb-8 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/80 text-sm font-medium">Live events near you</span>
          </div>
          <h2 className="text-5xl font-black text-white leading-tight mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Your ticket<br />to everything.
          </h2>
          <p className="text-white/60 text-lg max-w-xs">
            Discover, book, and manage events all in one place.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <span className="text-white text-xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Ticketii</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Welcome back</h1>
          <p className="text-white/40 mb-8 text-sm">Enter your credentials to continue. An OTP will be sent to verify your login.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠</span> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 focus:bg-white/8 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 focus:bg-white/8 transition"
              />
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition">Forgot password?</Link>
              </div>
            </div>

            <button
              type="submit" disabled={loading || cooldown}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm mt-2"
            >
              {loading ? "Sending OTP..." : cooldown ? "Please wait..." : "Continue →"}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-medium transition">Sign up</Link>
          </p>
          <p className="text-center text-white/30 text-sm mt-3">
            Admin access?{" "}
            <Link to="/admin-login" className="text-red-400 hover:text-red-300 font-medium transition">
              Use admin login
            </Link>
          </p>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&display=swap');`}</style>
    </div>
  );
}
