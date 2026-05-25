import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarRange,
  Camera,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Ticket,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Events", path: "/event", icon: CalendarRange },
  { label: "My Tickets", path: "/my-tickets", icon: Ticket },
  { label: "Scanner", path: "/scanner", icon: Camera },
  { label: "Wallet", path: "/wallet", icon: CreditCard },
  { label: "Settings", path: "/settings", icon: Settings },
  { label: "Contact", path: "/contact", icon: MessageSquare },
];

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const initials = (user?.name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/signin");
  };

  const close = () => setOpen(false);

  const sidebarBody = (
    <div className="flex h-full flex-col overflow-hidden rounded-none border-r border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl md:rounded-[28px] md:border md:border-white/10 md:bg-slate-950/80 md:backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={close}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 shadow-lg shadow-blue-950/50">
            <span className="font-display text-base font-bold text-white">T</span>
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">Ticketii</p>
            <p className="text-xs text-slate-400">Creator workspace</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={close}
          className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 md:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-white/10 px-5 py-5">
        <div className="app-panel flex items-center gap-3 rounded-3xl px-4 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/90 to-cyan-400/90 font-display text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name || "User"}</p>
            <p className="truncate text-xs text-slate-400">{user?.email || "Organizer account"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;

          return (
            <Link
              key={path}
              to={path}
              onClick={close}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-950/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-400 group-hover:text-sky-300"}`} />
              <span className="truncate">{label}</span>
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
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-2xl border border-white/10 bg-slate-950/90 p-3 text-white shadow-xl shadow-slate-950/40 backdrop-blur md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <div className="hidden md:block md:w-[288px] md:shrink-0">
        <div className="sticky top-0 h-screen overflow-hidden p-4">{sidebarBody}</div>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[288px] max-w-[85vw] transform transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarBody}
      </div>
    </>
  );
}
