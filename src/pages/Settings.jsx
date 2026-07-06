import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) { navigate("/signin"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setForm({ name: u.name || "", email: u.email || "", phone: u.phone || "" });
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    setProfileMsg({ type: "", text: "" });
    const updated = { ...user, ...form };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    setProfileMsg({
      type: "success",
      text: "Profile saved locally. Profile updates are not part of the current API contract.",
    });
    setSaving(false);
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { setPwMsg({ type: "error", text: "Passwords don't match." }); return; }
    if (pwForm.new_password.length < 6) { setPwMsg({ type: "error", text: "Min. 6 characters." }); return; }
    setPwLoading(true);
    setPwMsg({ type: "", text: "" });
    localStorage.setItem("password_last_changed_at", new Date().toISOString());
    setPwMsg({
      type: "success",
      text: "Password updated locally. Password changes are not available in the current API contract.",
    });
    setPwForm({ current_password: "", new_password: "", confirm: "" });
    setTimeout(() => { setShowPwModal(false); setPwMsg({ type: "", text: "" }); }, 2000);
    setPwLoading(false);
  };

  if (!user) return null;

  return (
    <div className="app-shell flex">
      <Sidebar user={user} />

      <main className="app-main overflow-auto">
        <div className="app-topbar mt-16 px-6 py-4 md:mt-0">
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-white/30 text-xs">Manage your account and preferences</p>
        </div>

        <div className="p-6 max-w-2xl space-y-5">
          {/* Profile */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-1">Profile Information</h2>
            <p className="text-white/30 text-xs mb-5">Update your name, email and phone number.</p>

            {profileMsg.text && (
              <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${profileMsg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
                {profileMsg.text}
              </div>
            )}

            <div className="space-y-4">
              {[
                { label: "Full Name", name: "name", type: "text", placeholder: "John Doe" },
                { label: "Email Address", name: "email", type: "email", placeholder: "you@example.com" },
                { label: "Phone Number", name: "phone", type: "tel", placeholder: "+234 800 000 0000" },
              ].map(({ label, name, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">{label}</label>
                  <input
                    type={type} name={name} value={form[name]}
                    onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => { const u = user; setForm({ name: u.name||"", email: u.email||"", phone: u.phone||"" }); setProfileMsg({ type: "", text: "" }); }}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/50 text-sm rounded-xl transition border border-white/10">
                  Discard
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-1">Security</h2>
            <p className="text-white/30 text-xs mb-5">Update your password to keep your account secure.</p>
            <button
              onClick={() => { setShowPwModal(true); setPwMsg({ type: "", text: "" }); setPwForm({ current_password: "", new_password: "", confirm: "" }); }}
              className="px-6 py-2.5 bg-amber-600/20 border border-amber-500/30 hover:bg-amber-600/30 text-amber-300 text-sm font-semibold rounded-xl transition"
            >
              🔒 Change Password
            </button>
          </div>

          {/* Danger */}
          <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6">
            <h2 className="text-red-400 font-bold mb-1">Danger Zone</h2>
            <p className="text-white/30 text-xs mb-4">Permanently delete your account and all associated data.</p>
            <button className="px-6 py-2.5 bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-semibold rounded-xl hover:bg-red-600/30 transition">
              Delete Account
            </button>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Change Password</h3>
              <button onClick={() => setShowPwModal(false)} className="text-white/30 hover:text-white/70 text-2xl leading-none">&times;</button>
            </div>
            {pwMsg.text && (
              <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${pwMsg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
                {pwMsg.text}
              </div>
            )}
            <form onSubmit={handlePwSubmit} className="space-y-4">
              {[
                { label: "Current Password", name: "current_password", placeholder: "••••••••" },
                { label: "New Password", name: "new_password", placeholder: "Min. 6 characters" },
                { label: "Confirm New Password", name: "confirm", placeholder: "Repeat new password" },
              ].map(({ label, name, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">{label}</label>
                  <input
                    type="password" required minLength={name !== "current_password" ? 6 : 1}
                    value={pwForm[name]} onChange={e => setPwForm(f => ({ ...f, [name]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={pwLoading}
                  className="flex-1 py-3 bg-amber-600/80 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition text-sm">
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
                <button type="button" onClick={() => setShowPwModal(false)}
                  className="flex-1 py-3 bg-white/5 text-white/50 rounded-xl transition text-sm hover:bg-white/10">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
