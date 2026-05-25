import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { scanTicket } from "../services/api";

const STATES = { IDLE: "idle", SCANNING: "scanning", SUCCESS: "success", USED: "used", INVALID: "invalid", ERROR: "error" };

export default function TicketScanner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [scanState, setScanState] = useState(STATES.IDLE);
  const [result, setResult] = useState(null);
  const [manualToken, setManualToken] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) { navigate("/signin"); return; }
    setUser(JSON.parse(stored));
  }, [navigate]);

  // Dynamically load jsQR for QR decoding
  useEffect(() => {
    if (!document.getElementById("jsqr-script")) {
      const script = document.createElement("script");
      script.id = "jsqr-script";
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js";
      document.head.appendChild(script);
    }
  }, []);

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      setScanState(STATES.SCANNING);
      startScanning();
    } catch (err) {
      setCameraError("Camera access denied. Please allow camera permission or use manual entry below.");
    }
  };

  const stopCamera = () => {
    clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  };

  const startScanning = () => {
    intervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !window.jsQR) return;
      const video = videoRef.current;
      if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
      if (code?.data) {
        clearInterval(intervalRef.current);
        handleScan(code.data);
      }
    }, 300);
  };

  const handleScan = async (token) => {
    stopCamera();
    setScanState(STATES.SCANNING);
    try {
      const data = await scanTicket(token);
      setScanState(STATES.SUCCESS);
      setResult(data.data || data);
    } catch (err) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("already used")) setScanState(STATES.USED);
      else if (msg.includes("invalid")) setScanState(STATES.INVALID);
      else { setScanState(STATES.ERROR); setResult({ error: err.message }); }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualToken.trim()) handleScan(manualToken.trim());
  };

  const reset = () => {
    setScanState(STATES.IDLE);
    setResult(null);
    setManualToken("");
    stopCamera();
  };

  useEffect(() => () => stopCamera(), []);

  if (!user) return null;

  const stateConfig = {
    [STATES.SUCCESS]: { bg: "from-emerald-600/30 to-emerald-900/10", border: "border-emerald-500/40", icon: "✅", title: "Ticket Valid!", titleColor: "text-emerald-400" },
    [STATES.USED]:    { bg: "from-amber-600/30 to-amber-900/10",   border: "border-amber-500/40",   icon: "⚠️", title: "Already Used",  titleColor: "text-amber-400" },
    [STATES.INVALID]: { bg: "from-red-600/30 to-red-900/10",       border: "border-red-500/40",     icon: "❌", title: "Invalid Ticket", titleColor: "text-red-400" },
    [STATES.ERROR]:   { bg: "from-red-600/30 to-red-900/10",       border: "border-red-500/40",     icon: "🚫", title: "Scan Error",     titleColor: "text-red-400" },
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]" style={{ fontFamily: "'Syne', sans-serif" }}>
      <Sidebar user={user} />

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur border-b border-white/5 px-6 py-4 mt-12 md:mt-0">
          <h1 className="text-xl font-bold text-white">Ticket Scanner</h1>
          <p className="text-white/30 text-xs">Scan QR codes to validate entry</p>
        </div>

        <div className="p-6 max-w-lg mx-auto space-y-5">
          {/* Result states */}
          {[STATES.SUCCESS, STATES.USED, STATES.INVALID, STATES.ERROR].includes(scanState) && (() => {
            const cfg = stateConfig[scanState];
            return (
              <div className={`bg-gradient-to-br ${cfg.bg} border ${cfg.border} rounded-2xl p-8 text-center`}>
                <div className="text-6xl mb-4">{cfg.icon}</div>
                <h2 className={`text-2xl font-black mb-2 ${cfg.titleColor}`}>{cfg.title}</h2>
                {result?.event && <p className="text-white/60 text-sm">Event: <span className="text-white font-medium">{result.event}</span></p>}
                {result?.user && <p className="text-white/60 text-sm mt-1">Attendee: <span className="text-white font-medium">{result.user}</span></p>}
                {result?.error && <p className="text-red-400/70 text-xs mt-2">{result.error}</p>}
                <button
                  onClick={reset}
                  className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition"
                >
                  Scan Another
                </button>
              </div>
            );
          })()}

          {/* Camera */}
          {scanState !== STATES.SUCCESS && scanState !== STATES.USED && scanState !== STATES.INVALID && scanState !== STATES.ERROR && (
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="relative bg-black aspect-video flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <canvas ref={canvasRef} className="hidden" />

                {!scanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="text-4xl">📷</span>
                    </div>
                    <button
                      onClick={startCamera}
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition"
                    >
                      Start Camera
                    </button>
                    {cameraError && <p className="text-red-400 text-xs text-center px-4">{cameraError}</p>}
                  </div>
                )}

                {scanning && (
                  <>
                    {/* Scan overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-52 h-52 border-2 border-violet-400 rounded-2xl relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-violet-400 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-violet-400 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-violet-400 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-violet-400 rounded-br-lg" />
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-violet-400/60 animate-pulse" />
                      </div>
                    </div>
                    <button
                      onClick={() => { stopCamera(); setScanState(STATES.IDLE); }}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/60 text-white rounded-lg flex items-center justify-center text-sm"
                    >
                      ✕
                    </button>
                  </>
                )}

                {scanState === STATES.SCANNING && !scanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-white/60 text-sm">Validating...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manual entry */}
          {![STATES.SUCCESS, STATES.USED, STATES.INVALID, STATES.ERROR].includes(scanState) && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-1">Manual Entry</h3>
              <p className="text-white/30 text-xs mb-4">Enter QR token manually if camera is unavailable</p>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text" value={manualToken} onChange={e => setManualToken(e.target.value)}
                  placeholder="Paste QR token here..."
                  className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition"
                />
                <button
                  type="submit" disabled={!manualToken.trim() || scanState === STATES.SCANNING}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition flex-shrink-0"
                >
                  Validate
                </button>
              </form>
            </div>
          )}

          {/* Instructions */}
          {scanState === STATES.IDLE && (
            <div className="bg-white/2 border border-white/5 rounded-xl p-4">
              <p className="text-white/30 text-xs leading-relaxed">
                📷 Point camera at attendee's QR code · Results appear instantly · Green = valid entry · 
                Orange = ticket already used · Red = invalid ticket
              </p>
            </div>
          )}
        </div>
      </main>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&display=swap');`}</style>
    </div>
  );
}
