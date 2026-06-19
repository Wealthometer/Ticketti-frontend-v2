import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { Mail, Lock, User } from "lucide-react";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard");
  }, [navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerUser(form.name, form.email, form.password);
      navigate("/verify-otp", {
        state: {
          email: form.email,
          type: "register",
          redirect: "/signin",
        },
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white">

      {/* LEFT FORM */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          {/* <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <span className="text-sky-300 font-bold">T</span>
            </div>
            <span className="text-xl font-bold">Ticketii</span>
          </div> */}

          {/* Heading */}
          <h1 className="text-3xl font-bold">Create account</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Join Ticketii and start discovering events instantly.
          </p>

          {/* Error */}
          {error && (
            <div className="mt-6 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            {/* Name */}
            <div>
              <label className="text-xs text-slate-400">Full Name</label>
              <div className="mt-2 relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-sky-400 outline-none text-white"
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="text-xs text-slate-400">Password</label>
              <div className="mt-2 relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-sky-400 outline-none text-white"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            {/* Login */}
            <p className="text-center text-sm text-slate-400 mt-6">
              Already have an account?{" "}
              <Link to="/signin" className="text-sky-400 hover:text-sky-300">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE (CLEANED, NOT EMPTY) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_60%)]" />

        <div className="relative z-10 flex flex-col justify-center px-16">

          <h2 className="text-3xl font-bold text-white">
            Experience events differently
          </h2>

          <p className="mt-4 text-slate-400 leading-7">
            Ticketii helps you discover, book, and manage event tickets without stress.
            Everything is fast, simple, and mobile-ready.
          </p>

          <div className="mt-8 space-y-4 text-slate-300 text-sm">

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-sky-500/10 border border-sky-400/20 flex items-center justify-center">
                ✓
              </div>
              Instant ticket booking
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-sky-500/10 border border-sky-400/20 flex items-center justify-center">
                ✓
              </div>
              QR-based check-in system
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-sky-500/10 border border-sky-400/20 flex items-center justify-center">
                ✓
              </div>
              Discover events near you
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}