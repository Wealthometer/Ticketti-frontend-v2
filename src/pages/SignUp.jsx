import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard");
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerUser(form.name, form.email, form.password);
      navigate("/verify-otp", { state: { email: form.email, type: "register", redirect: "/signin" } });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <span className="text-white text-xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Ticketii</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Create account</h1>
          <p className="text-white/40 mb-8 text-sm">Join thousands of event-goers. We'll send an OTP to verify your email.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠</span> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Full Name", name: "name", type: "text", placeholder: "John Doe" },
              { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
              { label: "Password", name: "password", type: "password", placeholder: "Min. 6 characters" },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">{label}</label>
                <input
                  type={type} name={name} value={form[name]} onChange={handleChange} required minLength={name === "password" ? 6 : 1}
                  placeholder={placeholder}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm mt-2"
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-8">
            Already have an account?{" "}
            <Link to="/signin" className="text-violet-400 hover:text-violet-300 font-medium transition">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"
          alt="Event" className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-violet-900/80 via-purple-900/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="space-y-6">
            {["Discover amazing events", "Book tickets instantly", "Scan & go — no printing"].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-500/30 border border-violet-400/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-300 text-xs">✓</span>
                </div>
                <span className="text-white/70 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&display=swap');`}</style>
    </div>
  );
}
