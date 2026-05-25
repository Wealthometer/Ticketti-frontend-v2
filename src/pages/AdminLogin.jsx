import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminLogin } from "../services/api";
import { getDefaultRouteForUser, isAdminUser } from "../utils/auth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      navigate(getDefaultRouteForUser(storedUser));
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown) return;

    setLoading(true);
    setError("");

    try {
      const response = await adminLogin(form.email, form.password);

      // Expected format: { success: true, data: { token: "...", user: { ... } } }
      const token = response?.data?.token || response?.token;
      const user = response?.data?.user || response?.user;

      if (!token) {
        throw new Error("Admin login succeeded but no bearer token was returned.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(isAdminUser(user) ? user : { ...user, role: "admin" })
      );
      navigate("/admin/dashboard");
    } catch (err) {
      const msg = err.message || "";

      if (msg.includes("wait") || msg.includes("cooldown")) {
        setCooldown(true);
        setError("Too many attempts. Please wait before retrying.");
        setTimeout(() => setCooldown(false), 30000);
      } else if (msg.includes("restricted")) {
        setError("Your account is temporarily restricted. Contact support.");
      } else if (msg.includes("blocked") || msg.includes("Access denied")) {
        setError("Access denied. This account is not allowed to use admin login.");
      } else {
        setError(msg || "Invalid admin username or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#14090a]">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80"
          alt="Admin workspace"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/90 via-red-900/70 to-black/30" />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 mb-8 w-fit">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-white/80 text-sm font-medium">Restricted admin access</span>
          </div>
          <h2
            className="text-5xl font-black text-white leading-tight mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Admin<br />control room.
          </h2>
          <p className="text-white/60 text-lg max-w-sm">
            Sign in with your admin account credentials. Only verified admin users
            can complete access to the dashboard.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span
              className="text-white text-xl font-bold tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Ticketii Admin
            </span>
          </div>

          <h1
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Admin Sign In
          </h1>
          <p className="text-white/40 mb-8 text-sm">
            Use your admin account email and password to get the admin bearer token
            from the backend.
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
                Admin Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="admin@example.com"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-red-500 focus:bg-white/8 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
                Admin Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-red-500 focus:bg-white/8 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || cooldown}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm mt-2"
            >
              {loading ? "Signing in..." : cooldown ? "Please wait..." : "Sign in to admin"}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-8">
            Standard user account?{" "}
            <Link to="/signin" className="text-red-400 hover:text-red-300 font-medium transition">
              Go to user login
            </Link>
          </p>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&display=swap');`}</style>
    </div>
  );
}
