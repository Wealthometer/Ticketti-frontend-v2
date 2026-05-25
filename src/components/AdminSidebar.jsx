import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Users,
  CalendarCog,
  X,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Events", path: "/admin/events", icon: CalendarCog },
];

export default function AdminSidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const closeSidebar = () => setIsOpen(false);

  const sidebarBody = (
    <div className="flex h-full flex-col overflow-hidden rounded-none border-r border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl md:rounded-[28px] md:border md:border-white/10 md:bg-slate-950/80 md:backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <Link to="/admin/dashboard" className="flex items-center gap-3" onClick={closeSidebar}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 shadow-lg shadow-blue-950/50">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">Admin Panel</p>
            <p className="text-xs text-slate-400">Operations center</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={closeSidebar}
          className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 md:hidden"
          aria-label="Close admin menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-white/10 px-5 py-5">
        <div className="app-panel rounded-3xl px-4 py-4">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Signed in as</p>
          <p className="mt-2 truncate text-sm font-semibold text-white">{user?.name || "Administrator"}</p>
          <p className="truncate text-xs text-slate-400">{user?.email || "Admin account"}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {menuItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;

          return (
            <Link
              key={path}
              to={path}
              onClick={closeSidebar}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-blue-950/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-400 group-hover:text-cyan-300"}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/15"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-4 z-50 rounded-2xl border border-white/10 bg-slate-950/90 p-3 text-white shadow-xl shadow-slate-950/40 backdrop-blur md:hidden"
        aria-label="Open admin menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
