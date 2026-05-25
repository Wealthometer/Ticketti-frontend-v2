import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { getAdminEvents } from "../services/api";
import { isAdminUser } from "../utils/auth.js";

export default function AdminEvents() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/signin");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (!isAdminUser(parsedUser)) {
      navigate("/dashboard");
      return;
    }

    setUser(parsedUser);

    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getAdminEvents();
        const eventList = response?.events || [];
        setEvents(eventList);
        setTotalEvents(response?.totals?.events ?? eventList.length);
      } catch (err) {
        console.error("Error fetching admin events:", err);
        setError("Failed to load events. Showing local data if available.");
        const storedEvents = JSON.parse(localStorage.getItem("events")) || [];
        setEvents(storedEvents);
        setTotalEvents(storedEvents.length);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = events.filter((event) => event.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));
  };

  const handleApproveEvent = (eventId) => {
    const updatedEvents = events.map((event) =>
      event.id === eventId ? { ...event, status: "Approved" } : event,
    );
    setEvents(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell flex">
      <AdminSidebar user={user} />

      <main className="app-main">
        <div className="app-topbar mt-16 px-6 py-5 md:mt-0 md:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">Events</p>
          <h1 className="font-display mt-2 text-2xl font-semibold text-white md:text-3xl">Event Management</h1>
          <p className="mt-1 text-sm text-slate-400">Moderate submitted events and keep listings healthy.</p>
        </div>

        <div className="dashboard-grid px-6 py-8 md:px-8">
          {error && (
            <div className="rounded-[1.5rem] border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading && <div className="text-sm text-slate-400">Syncing with server...</div>}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="app-panel rounded-[1.75rem] px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Total Events</p>
              <p className="font-display mt-4 text-3xl font-semibold text-white">{totalEvents}</p>
            </div>
            <div className="app-panel rounded-[1.75rem] px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Approved</p>
              <p className="font-display mt-4 text-3xl font-semibold text-emerald-300">
                {events.filter((event) => event.status === "published" || event.status === "Approved").length}
              </p>
            </div>
            <div className="app-panel rounded-[1.75rem] px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Pending</p>
              <p className="font-display mt-4 text-3xl font-semibold text-amber-300">
                {events.filter((event) => !event.status || event.status === "draft" || event.status === "pending").length}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="app-panel rounded-[2rem] px-6 py-12 text-center text-slate-400">No events found.</div>
            ) : (
              events.map((event) => (
                <article key={event.id} className="app-panel rounded-[2rem] px-6 py-6">
                  <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr_0.75fr_0.7fr]">
                    <div>
                      <p className="font-display text-xl font-semibold text-white">{event.title || event.eventName}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{event.description || "No description provided."}</p>
                    </div>

                    <div className="space-y-2 text-sm text-slate-300">
                      <p>{event.start_date || event.date || "Date not set"}</p>
                      <p>{event.location || "Location not set"}</p>
                    </div>

                    <div className="space-y-2 text-sm text-slate-300">
                      <p>₦{Number(event.ticketPrice || 0).toLocaleString()}</p>
                      <p>{event.totalTickets || 0} tickets</p>
                    </div>

                    <div className="space-y-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          event.status === "Approved" || event.status === "published"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {event.status || "Pending"}
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {!event.status && (
                          <button
                            type="button"
                            onClick={() => handleApproveEvent(event.id)}
                            className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/15"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
