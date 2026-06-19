import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/event" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "FAQ", href: "#faqs" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : previous || "";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
<Link to="/" className="flex items-center gap-4">
            <div className="flex h-12 w-24 items-center justify-center overflow-hidden">
              <img src={logo} alt="Ticketii" className="h-full w-auto object-contain" />
            </div>
            {/* <div>
              <p className="font-display text-lg font-semibold tracking-tight text-white">Ticketii</p>
              <p className="text-xs text-slate-400">Modern event ticketing</p>
            </div> */}
          </Link>

        <div className="hidden items-center gap-8 md:flex">
          <nav className="flex items-center gap-7 text-sm text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
          className="rounded-2xl border border-white/10 p-3 text-white transition hover:bg-white/5 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-white/10 bg-slate-950/95 transition-[max-height] duration-300 md:hidden ${
          open ? "max-h-[420px]" : "max-h-0"
        }`}
      >
        <div className="space-y-2 px-4 py-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5"
            >
              {link.name}
            </a>
          ))}

          <div className="grid gap-3 pt-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-white"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl bg-blue-500 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
