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
