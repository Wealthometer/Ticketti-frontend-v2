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
