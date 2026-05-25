import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { getMyTickets } from "../services/api";

export default function MyTickets() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyTickets();
      setTickets(data.tickets || data.bookings || data.data || []);
    } catch (err) {
      const errMsg = err.message || "Failed to load tickets.";
      if (errMsg.includes("CORS") || errMsg.includes("Failed to fetch")) {
        setError("Unable to load tickets. Backend CORS configuration needed. Contact support.");
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) { navigate("/signin"); return; }
    setUser(JSON.parse(stored));
    fetchTickets();
  }, [navigate, fetchTickets]);

  if (!user) return null;

  return (
    <div className="app-shell flex">
      <Sidebar user={user} />

      <main className="app-main overflow-auto">
        <div className="app-topbar mt-16 flex items-center justify-between px-6 py-4 md:mt-0">
          <div>
            <h1 className="text-xl font-bold text-white">My Tickets</h1>
            <p className="text-white/30 text-xs">Your purchased tickets & QR codes linked to your account</p>
          </div>
          <button onClick={fetchTickets} disabled={loading} className="text-violet-400 hover:text-violet-300 text-xs font-medium transition disabled:opacity-40">
            ↻ Refresh
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(n => <div key={n} className="h-64 bg-white/5 rounded-2xl animate-pulse border border-white/5" />)}
            </div>
          ) : tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tickets.map((ticket) => (
                <div
                  key={ticket.ticket_id || ticket.id}
                  className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/30 transition"
                >
                  {/* Header strip */}
                  <div className="bg-gradient-to-r from-violet-600/30 to-purple-800/20 px-5 py-4 border-b border-white/5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">
                        {ticket.event_name || "Event Ticket"}
                      </h3>
                      <span className="bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs px-2 py-0.5 rounded-lg flex-shrink-0 font-mono">
                        #{ticket.ticket_id || ticket.id}
                      </span>
                    </div>
                    {ticket.ticket_type && (
                      <span className="inline-block mt-2 text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-lg">{ticket.ticket_type}</span>
                    )}
                  </div>

                  {/* QR Code */}
                  <div className="p-5">
                    {ticket.qr_url ? (
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-3 rounded-xl mb-3 inline-block">
                          <img src={ticket.qr_url} alt="QR Code" className="w-32 h-32 object-contain" />
                        </div>
                        <p className="text-white/30 text-xs font-mono text-center break-all">{ticket.qr_token}</p>
                        <p className="text-white/20 text-xs mt-1">Scan at venue entry</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-4">
                        <div className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                          <span className="text-3xl opacity-30">🎟</span>
                        </div>
                        {ticket.qr_token ? (
                          <p className="text-white/40 text-xs font-mono text-center break-all">{ticket.qr_token}</p>
                        ) : (
                          <p className="text-white/20 text-xs">QR code not yet available</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <span className="text-5xl">🎟</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">No tickets yet</h3>
              <p className="text-white/30 text-sm mb-2">Browse events and purchase your first ticket!</p>
              <p className="text-white/20 text-xs mb-6 text-center max-w-md">
                Only bookings saved with your authenticated <span className="font-mono">user_id</span> will appear here.
              </p>
              <button
                onClick={() => navigate("/event")}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition"
              >
                Browse Events →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
