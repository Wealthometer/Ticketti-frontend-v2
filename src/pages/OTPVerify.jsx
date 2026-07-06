import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP, resendOTP } from "../services/api";
import { getDefaultRouteForUser } from "../utils/auth";

export default function OTPVerify() {
  const navigate = useNavigate();
  const location = useLocation();

  // Expect: { email, type: "login"|"register"|"forgot_password", redirect, resetToken? }
  const { email = "", type = "login", redirect = "/dashboard" } = location.state || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) { navigate("/signin"); return; }
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleDigit = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("Enter all 6 digits."); return; }
    setLoading(true);
    setError("");
    try {
      const response = await verifyOTP(email, code, type);
      const token = response?.token || response?.data?.token;
      const userData = response?.user || response?.data?.user;

      if (type === "login") {
        if (!token) {
          throw new Error("Login succeeded but no token was returned.");
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData || { email }));
        setSuccess("Login successful! Redirecting to dashboard...");
        navigate(getDefaultRouteForUser(userData) || redirect);
      } else if (type === "register") {
        setSuccess("Email verified! You can now sign in.");
        setTimeout(() => navigate("/signin"), 2000);
      } else if (type === "forgot_password") {
        navigate("/reset-password", { state: { email, token: token || code } });
      }
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError("");
    try {
      await resendOTP(email, type);
      setSuccess("New OTP sent!");
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const typeLabels = {
    login: "Complete Login",
    register: "Verify Your Email",
    forgot_password: "Reset Password",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12 justify-center">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">T</span>
          </div>
          <span className="text-white text-xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Ticketii</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📩</span>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            {typeLabels[type] || "Enter OTP"}
          </h1>
          <p className="text-white/40 text-sm text-center mb-8">
            We sent a 6-digit code to<br />
            <span className="text-violet-400 font-medium">{email}</span>
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center">
              {success}
            </div>
          )}

          {/* OTP inputs */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="text" inputMode="numeric" maxLength={1}
                value={digit}
                onChange={e => handleDigit(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="w-11 h-14 text-center text-xl font-bold text-white bg-white/5 border-2 border-white/10 rounded-xl focus:border-violet-500 focus:outline-none transition"
              />
            ))}
          </div>

          <button
            onClick={handleVerify} disabled={loading || otp.join("").length < 6}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm"
          >
            {loading ? "Verifying..." : "Verify Code →"}
          </button>

          <div className="text-center mt-6">
            {canResend ? (
              <button
                onClick={handleResend} disabled={resending}
                className="text-violet-400 hover:text-violet-300 text-sm font-medium transition"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            ) : (
              <span className="text-white/30 text-sm">
                Resend code in <span className="text-white/60 font-mono">{countdown}s</span>
              </span>
            )}
          </div>

          <button
            onClick={() => navigate(-1)}
            className="w-full text-center text-white/30 hover:text-white/60 text-xs mt-4 transition"
          >
            ← Go back
          </button>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&display=swap');`}</style>
    </div>
  );
}
