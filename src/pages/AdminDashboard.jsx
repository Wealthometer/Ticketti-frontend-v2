import React, { useEffect, useState } from "react";
import { Activity, CalendarCog, CreditCard, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { getAdminDashboard } from "../services/api.js";
import { isAdminUser } from "../utils/auth.js";

function AdminStat({ label, value, icon: Icon, tone }) {
  return (
    <div className={`rounded-[1.75rem] border p-5 ${tone}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
          <p className="font-display mt-4 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3 text-sky-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalTransactions: 0,
    revenue: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/signin");
      return;
    }

    const userData = JSON.parse(storedUser);
    if (!isAdminUser(userData)) {
      navigate("/dashboard");
      return;
    }

    setUser(userData);

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminDashboard();
        const data = response?.data || response;

        setStats({
          totalUsers: data?.totals?.users ?? 0,
          totalEvents: data?.totals?.events ?? 0,
          totalTransactions: data?.totals?.bookings ?? 0,
          revenue: data?.financial?.total_sales ?? 0,
        });
      } catch (err) {
        setError(err.message || "Failed to load admin dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell flex">
      <AdminSidebar user={user} />

      <main className="app-main">
        <div className="app-topbar mt-16 px-6 py-5 md:mt-0 md:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">Admin</p>
          <h1 className="font-display mt-2 text-2xl font-semibold text-white md:text-3xl">System Overview</h1>
          <p className="mt-1 text-sm text-slate-400">Track the health of users, events, and transactions.</p>
        </div>

        <div className="dashboard-grid px-6 py-8 md:px-8">
          {error && (
            <div className="rounded-[1.5rem] border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminStat
              label="Total Users"
              value={loading ? "..." : stats.totalUsers}
              icon={Users}
              tone="bg-gradient-to-br from-blue-500/18 to-sky-400/8 border-blue-400/20"
            />
            <AdminStat
              label="Total Events"
              value={loading ? "..." : stats.totalEvents}
              icon={CalendarCog}
              tone="bg-gradient-to-br from-emerald-500/18 to-green-400/8 border-emerald-400/20"
            />
            <AdminStat
              label="Transactions"
              value={loading ? "..." : stats.totalTransactions}
              icon={CreditCard}
              tone="bg-gradient-to-br from-amber-500/18 to-orange-400/8 border-amber-400/20"
            />
            <AdminStat
              label="Revenue"
              value={loading ? "..." : `₦${Number(stats.revenue).toLocaleString()}`}
              icon={Activity}
              tone="bg-gradient-to-br from-cyan-500/18 to-blue-400/8 border-cyan-400/20"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="app-panel rounded-[2rem] px-6 py-6">
              <h2 className="font-display text-xl font-semibold text-white">Quick Actions</h2>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Manage Users", path: "/admin/users" },
                  { label: "Manage Events", path: "/admin/events" },
                  { label: "Review Reports", path: "/admin/dashboard" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="app-panel rounded-[2rem] px-6 py-6">
              <h2 className="font-display text-xl font-semibold text-white">System Status</h2>
              <div className="mt-5 space-y-4">
                {[
                  { label: "Server Status", value: "Online", ok: true },
                  { label: "Database", value: "Connected", ok: true },
                  { label: "API Status", value: error ? "Unavailable" : "Operational", ok: !error },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <span className="text-sm text-slate-300">{item.label}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.ok ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
