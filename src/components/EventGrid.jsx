import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { fetchAllEvents } from "../services/api";
import { getEventImageUrl, getEventPlaceholderUrl } from "../utils/image.js";

function EventCard({ event, index }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const resolvedImage = getEventImageUrl(
    event.image || event.cover || event.banner || event.image_url
  );

  const displayImage = imageError ? null : resolvedImage;

  return (
    <article className="app-panel-light flex h-full flex-col overflow-hidden rounded-[1.75rem] transition duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden bg-slate-950">
        {displayImage ? (
          <img
            src={displayImage}
            alt={event.title || event.eventName || "Event"}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <img
            src={getEventPlaceholderUrl(event.id || index)}
            alt="Placeholder"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105 opacity-60"
          />
        )}

        {/* Dark contrast gradient overlay to ensure text is perfectly legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/35" />

        {/* Content on top of background image */}
        <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
          <span className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-100 backdrop-blur-sm">
            {event.status || "Active"}
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-300">Featured event</p>
            <h3 className="font-display mt-2 text-xl font-bold leading-tight line-clamp-2">
              {event.title || event.eventName || `Event ${index + 1}`}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-3 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            {event.location || "Location to be announced"}
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            {event.start_date || event.date || "Date to be announced"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/event/${event.id}`)}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export default function EventGrid({ limit, showCreateButton = false }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchAllEvents();
      let eventList = Array.isArray(data) ? data : data?.events || data?.data?.events || [];

      if (limit) {
        eventList = eventList.slice(0, limit);
      }

      setEvents(eventList);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch events right now.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="w-full">
      {showCreateButton && user && (
        <div className="mb-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/create-event")}
            className="rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-400"
          >
            Create Event
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="app-panel-light overflow-hidden rounded-[1.75rem] p-5">
              <div className="h-48 animate-pulse rounded-[1.25rem] bg-slate-200" />
              <div className="mt-5 h-6 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="mt-6 h-11 w-full animate-pulse rounded-2xl bg-slate-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.length > 0 ? (
            events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))
          ) : (
            <div className="app-panel-light col-span-full rounded-[2rem] px-6 py-16 text-center">
              <p className="font-display text-2xl font-semibold text-slate-900">No events found</p>
              <p className="mt-3 text-slate-600">
                Check back soon for new listings or create one if you are an organizer.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
