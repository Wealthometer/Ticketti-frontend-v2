import React, { useEffect, useState } from "react";
import EventGrid from "../components/EventGrid.jsx";
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function Event() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (user) {
    return (
      <div className="app-shell flex">
        <Sidebar user={user} />

        <main className="app-main">
          <div className="app-topbar mt-16 px-6 py-5 md:mt-0 md:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">Events</p>
            <h1 className="font-display mt-2 text-2xl font-semibold text-white md:text-3xl">
              Discover what is happening next
            </h1>
          </div>

          <div className="px-6 py-8 md:px-8">
            <EventGrid showCreateButton={true} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">All Events</p>
            <h1 className="font-display mt-4 text-4xl font-semibold text-white sm:text-5xl">
              Find events that deserve a cleaner stage.
            </h1>
            <p className="mt-5 text-lg text-slate-300">
              Browse current listings and book experiences through a more polished ticketing flow.
            </p>
          </div>

          <EventGrid />
        </div>
      </section>
    </div>
  );
}
