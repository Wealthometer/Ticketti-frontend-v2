import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateTicketType from "../components/CreateTicketType";
import Sidebar from "../components/Sidebar.jsx";
import { createEvent } from "../services/api";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdEventId, setCreatedEventId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    endTime: "",
    image: null,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/signin");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      image: event.target.files?.[0] ?? null,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const eventPayload = {
        title: formData.title,
        description: formData.description,
        price: 0,
        date: formData.date,
      };

      const data = await createEvent(eventPayload);
      setSuccess("Event created successfully. Add ticket types below.");
      const localImage = formData.image
        ? URL.createObjectURL(formData.image)
        : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80";

      const newEvent = {
        ...formData,
        id: data.event?.id || Date.now(),
        eventName: formData.title,
        ticketPrice: 0,
        totalTickets: 0,
        image: data.event?.image || localImage,
        description: formData.description,
        location: formData.location,
        date: formData.date,
        time: formData.time,
        ticketTypeId: null,
      };

      const existingEvents = JSON.parse(localStorage.getItem("events") || "[]");
      localStorage.setItem("events", JSON.stringify([...existingEvents, newEvent]));
      setCreatedEventId(data.event?.id || newEvent.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    navigate("/event");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell flex">
      <Sidebar user={user} />

      <main className="app-main">
        <div className="app-topbar mt-16 px-6 py-5 md:mt-0 md:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">Create</p>
          <h1 className="font-display mt-2 text-2xl font-semibold text-white md:text-3xl">Create an Event</h1>
          <p className="mt-1 text-sm text-slate-400">Launch a polished event page with the essentials in one flow.</p>
        </div>

        <div className="px-6 py-8 md:px-8">
          {error && (
            <div className="mb-5 rounded-[1.5rem] border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && !createdEventId && (
            <div className="mb-5 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
              {success}
            </div>
          )}

          {!createdEventId ? (
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="app-panel mx-auto max-w-4xl rounded-[2rem] p-6 md:p-8"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Event title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Start time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    End time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Event image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    name="image"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="w-full rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-300"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Event"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/event")}
                  disabled={loading}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="app-panel rounded-[2rem] px-6 py-6">
                <h2 className="font-display text-2xl font-semibold text-white">{formData.title}</h2>
                <p className="mt-2 text-sm text-emerald-300">Event created successfully. Add ticket types to complete setup.</p>
              </div>

              <CreateTicketType
                eventId={createdEventId}
                onComplete={(ticketType) => {
                  const events = JSON.parse(localStorage.getItem("events") || "[]");
                  const updatedEvents = events.map((item) => {
                    if (item.id === createdEventId) {
                      const types = item.ticketTypes || [];
                      const newTypes = [...types, ticketType];
                      const displayPrice = types.length === 0 ? ticketType.price : item.ticketPrice;
                      const totalTickets = (item.totalTickets || 0) + Number(ticketType.stock);

                      return {
                        ...item,
                        ticketTypes: newTypes,
                        ticketPrice: displayPrice,
                        totalTickets,
                        ticketTypeId: ticketType.id,
                      };
                    }

                    return item;
                  });

                  localStorage.setItem("events", JSON.stringify(updatedEvents));
                }}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Finish and Go to Events
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
