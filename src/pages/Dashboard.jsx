import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BanknoteArrowUp, CalendarRange, Ticket } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { getMyEvents, getOrganizerDashboard } from "../services/api";

function StatCard({ label, value, note, tone = "blue" }) {
  const tones = {
    blue: "from-blue-500/18 to-sky-400/8 border-blue-400/20 text-sky-200",
    green: "from-emerald-500/18 to-green-400/8 border-emerald-400/20 text-emerald-200",
    amber: "from-amber-500/18 to-orange-400/8 border-amber-400/20 text-amber-200",
    slate: "from-slate-500/18 to-slate-400/8 border-slate-400/20 text-slate-200",
  };

  return (
    <div className={`rounded-[1.75rem] border bg-gradient-to-br p-5 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <p className="font-display mt-4 text-3xl font-semibold text-white">{value}</p>
      {note && <p className="mt-2 text-sm text-slate-300">{note}</p>}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dash, setDash] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!stored || stored === "undefined" || !token) {
        localStorage.clear();
        navigate("/signin");
        return;
      }

      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);

      Promise.all([
        getOrganizerDashboard().then(setDash).catch(() => {}),
        getMyEvents()
          .then((data) => setEvents(data.events || data.data?.events || []))
          .catch((err) => console.warn("Failed to fetch events:", err)),
      ]).finally(() => setLoading(false));
    } catch {
      localStorage.clear();
      navigate("/signin");
    }
  }, [navigate]);

  if (!user) {
    return null;
  }

  const revenue = dash?.total_revenue ?? dash?.data?.total_revenue ?? 0;
  const balance = dash?.available_balance ?? dash?.data?.available_balance ?? 0;
  const pending = dash?.pending_balance ?? dash?.data?.pending_balance ?? 0;
  const ticketsSold = dash?.tickets_sold ?? dash?.data?.tickets_sold ?? 0;
  const payouts = dash?.recent_payouts ?? dash?.data?.recent_payouts ?? [];

  const upcoming = events
    .filter((event) => {
      const date = new Date(event.start_date || event.date || "");
      return Number.isNaN(date.getTime()) || date >= new Date();
    })
    .slice(0, 4);

  return (
    <div className="app-shell flex">
      <Sidebar user={user} />

      <main className="app-main">
        <div className="app-topbar mt-16 flex flex-col gap-4 px-6 py-5 md:mt-0 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">Overview</p>
            <h1 className="font-display mt-2 text-2xl font-semibold text-white md:text-3xl">Organizer Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">Monitor your events, revenue, and attendee activity.</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/create-event")}
            className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/25 transition hover:bg-blue-400"
          >
            Create Event
          </button>
        </div>

        <div className="dashboard-grid px-6 py-8 md:px-8">
          <div className="app-panel rounded-[2rem] px-6 py-6">
            <p className="text-sm text-slate-400">Welcome back</p>
            <h2 className="font-display mt-2 text-3xl font-semibold text-white">{user.name}</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Your workspace now uses a cleaner layout with better card spacing, more consistent typography, and improved navigation behavior across screen sizes.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Revenue"
              value={loading ? "..." : `₦${Number(revenue).toLocaleString()}`}
              note="All completed sales"
              tone="green"
            />
            <StatCard
              label="Available Balance"
              value={loading ? "..." : `₦${Number(balance).toLocaleString()}`}
              note="Ready to withdraw"
              tone="blue"
            />
            <StatCard
              label="Pending Balance"
              value={loading ? "..." : `₦${Number(pending).toLocaleString()}`}
              note="Awaiting settlement"
              tone="amber"
            />
            <StatCard
              label="Tickets Sold"
              value={loading ? "..." : Number(ticketsSold).toLocaleString()}
              note="Across all events"
              tone="slate"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="app-panel overflow-hidden rounded-[2rem]">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <h2 className="font-display text-xl font-semibold text-white">Upcoming Events</h2>
                  <p className="mt-1 text-sm text-slate-400">A quick look at your nearest live events.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/event")}
                  className="text-sm font-semibold text-sky-300 transition hover:text-white"
                >
                  View all
                </button>
              </div>

              {loading ? (
                <div className="space-y-4 p-6">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-20 animate-pulse rounded-3xl bg-white/5" />
                  ))}
                </div>
              ) : upcoming.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {upcoming.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => navigate(`/event/${event.id}`)}
                      className="flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-white/5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-sky-300">
                        <CalendarRange className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold text-white">{event.title || event.eventName}</p>
                        <p className="mt-1 truncate text-sm text-slate-400">
                          {event.location || "Location TBA"} • {event.start_date || event.date || "Date TBA"}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium capitalize text-slate-300">
                        {event.status || "active"}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="font-display text-2xl font-semibold text-white">No events yet</p>
                  <p className="mt-2 text-sm text-slate-400">Create your first event to start selling tickets.</p>
                </div>
              )}
            </section>

            <div className="space-y-6">
              <section className="app-panel rounded-[2rem] px-6 py-6">
                <h2 className="font-display text-xl font-semibold text-white">Quick Actions</h2>
                <div className="mt-5 space-y-3">
                  {[
                    { label: "Create Event", path: "/create-event", icon: CalendarRange },
                    { label: "View My Tickets", path: "/my-tickets", icon: Ticket },
                    { label: "Request Withdrawal", path: "/wallet", icon: BanknoteArrowUp },
                  ].map(({ label, path, icon: Icon }) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => navigate(path)}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-sky-300" />
                        {label}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="app-panel rounded-[2rem] px-6 py-6">
                <h2 className="font-display text-xl font-semibold text-white">Recent Payouts</h2>
                {payouts.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {payouts.slice(0, 4).map((payout, index) => (
                      <div key={index} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {payout.created_at ? new Date(payout.created_at).toLocaleDateString() : "Recent payout"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                            {payout.status || "Processing"}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-emerald-300">₦{Number(payout.amount || 0).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-slate-400">No payouts yet.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
