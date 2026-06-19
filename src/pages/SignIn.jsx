import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginStep1 } from "../services/api";
import { getDefaultRouteForUser } from "../utils/auth";
import { Mail, Lock } from "lucide-react";

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown) return;

    setLoading(true);
    setError("");

    try {
      await loginStep1(form.email, form.password);

      navigate("/verify-otp", {
        state: {
          email: form.email,
          type: "login",
          redirect: "/dashboard",
        },
      });
    } catch (err) {
      const msg = err.message || "";

      if (msg.includes("wait") || msg.includes("cooldown")) {
        setCooldown(true);
        setError("Too many attempts. Please wait before retrying.");
        setTimeout(() => setCooldown(false), 30000);
      } else if (msg.includes("restricted")) {
        setError("Account temporarily restricted. Contact support.");
      } else if (msg.includes("blocked") || msg.includes("Access denied")) {
        setError("Access denied. Contact support.");
      } else {
        setError(msg || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white">

      {/* LEFT VISUAL PANEL */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_60%)]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-16">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs text-sky-200 w-fit">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            Live events platform
          </div>

          <h2 className="text-5xl font-bold leading-tight">
            Your ticket to everything
          </h2>

          <p className="mt-4 text-slate-400 max-w-sm">
            Discover events, book tickets, and manage experiences in one place.
          </p>

        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* LOGO */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <span className="text-sky-300 font-bold">T</span>
            </div>
            <span className="text-xl font-bold">Ticketii</span>
          </div>

          {/* HEADER */}
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Enter your details to continue. OTP will be sent to your email.
          </p>

          {/* ERROR */}
          {error && (
            <div className="mt-6 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-xs text-slate-400">Email</label>
              <div className="mt-2 relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-sky-400 outline-none text-white"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs text-slate-400">Password</label>
              <div className="mt-2 relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-sky-400 outline-none text-white"
                  required
                />
              </div>

              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs text-sky-400 hover:text-sky-300"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading || cooldown}
              className="w-full mt-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition disabled:opacity-50"
            >
              {loading
                ? "Sending OTP..."
                : cooldown
                ? "Please wait..."
                : "Continue"}
            </button>
          </form>

          {/* FOOTER LINKS */}
          <p className="text-center text-sm text-slate-400 mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-sky-400 hover:text-sky-300">
              Sign up
            </Link>
          </p>

          <p className="text-center text-sm text-slate-500 mt-3">
            Admin access?{" "}
            <Link to="/admin-login" className="text-red-400 hover:text-red-300">
              Use admin login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}