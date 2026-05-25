import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { getAdminUsers } from "../services/api";
import { isAdminUser } from "../utils/auth.js";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
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

    const loadUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getAdminUsers();
        const usersData = response?.users || [];
        setUsers(usersData);
        setTotalUsers(response?.totals?.users ?? usersData.length);
      } catch (err) {
        console.error("Failed to load users:", err);
        setError("Failed to load users. Showing local data if available.");
        const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
        setUsers(storedUsers);
        setTotalUsers(storedUsers.length);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [navigate]);

  const handleDeleteUser = (email) => {
    const updatedUsers = users.filter((item) => item.email !== email);
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const handleToggleStatus = (email) => {
    const updatedUsers = users.map((item) =>
      item.email === email
        ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" }
        : item,
    );

    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell flex">
      <AdminSidebar user={user} />

      <main className="app-main">
        <div className="app-topbar mt-16 px-6 py-5 md:mt-0 md:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">Users</p>
          <h1 className="font-display mt-2 text-2xl font-semibold text-white md:text-3xl">User Management</h1>
          <p className="mt-1 text-sm text-slate-400">Review account activity and manage access.</p>
        </div>

        <div className="dashboard-grid px-6 py-8 md:px-8">
          {error && (
            <div className="rounded-[1.5rem] border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading && <div className="text-sm text-slate-400">Loading users...</div>}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="app-panel rounded-[1.75rem] px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Total Users</p>
              <p className="font-display mt-4 text-3xl font-semibold text-white">{totalUsers}</p>
            </div>
            <div className="app-panel rounded-[1.75rem] px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Active Users</p>
              <p className="font-display mt-4 text-3xl font-semibold text-emerald-300">
                {users.filter((item) => item.status === "Active").length}
              </p>
            </div>
            <div className="app-panel rounded-[1.75rem] px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Inactive Users</p>
              <p className="font-display mt-4 text-3xl font-semibold text-amber-300">
                {users.filter((item) => item.status === "Inactive").length}
              </p>
            </div>
          </div>

          <section className="app-panel overflow-hidden rounded-[2rem]">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-white/10 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-sm text-slate-400">
                        {loading
                          ? "Loading users..."
                          : "The dashboard endpoint provides total counts, but not a detailed user list."}
                      </td>
                    </tr>
                  ) : (
                    users.map((item) => (
                      <tr key={item.email} className="border-b border-white/10 text-sm text-slate-200">
                        <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                        <td className="px-6 py-4 text-slate-300">{item.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.status === "Active"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-amber-500/15 text-amber-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item.email)}
                              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                            >
                              Toggle
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(item.email)}
                              className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/15"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
