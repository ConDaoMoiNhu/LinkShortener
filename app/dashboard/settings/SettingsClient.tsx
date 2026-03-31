"use client";

import { useState, useRef } from "react";
import { Eye, EyeOff, Copy, RefreshCw, BookOpen, Shield, MessageCircle, Check, Pencil } from "lucide-react";
import { signOut } from "next-auth/react";

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  location?: string | null;
  timezone?: string | null;
}

const HELP_LINKS = [
  { icon: BookOpen, title: "API Documentation", desc: "Full SDK and endpoint guide", href: "https://github.com/ConDaoMoiNhu/LinkShortener#readme" },
  { icon: Shield, title: "Security & Privacy", desc: "GDPR and Data Compliance", href: "https://github.com/ConDaoMoiNhu/LinkShortener/blob/master/README.md" },
  { icon: MessageCircle, title: "Priority Support", desc: "Chat with our engineers", href: "https://github.com/ConDaoMoiNhu/LinkShortener/issues" },
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh",
  "Belgium", "Bolivia", "Brazil", "Cambodia", "Canada", "Chile", "China", "Colombia",
  "Czech Republic", "Denmark", "Egypt", "Ethiopia", "Finland", "France", "Germany",
  "Ghana", "Greece", "Hungary", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kenya", "South Korea",
  "Malaysia", "Mexico", "Morocco", "Myanmar", "Netherlands", "New Zealand", "Nigeria",
  "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Romania",
  "Russia", "Saudi Arabia", "Singapore", "South Africa", "Spain", "Sri Lanka",
  "Sweden", "Switzerland", "Taiwan", "Tanzania", "Thailand", "Turkey", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Venezuela", "Vietnam",
];

const TIMEZONES = [
  "Pacific/Honolulu", "America/Anchorage", "America/Los_Angeles", "America/Denver",
  "America/Chicago", "America/New_York", "America/Sao_Paulo", "Atlantic/Azores",
  "UTC", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok",
  "Asia/Ho_Chi_Minh", "Asia/Singapore", "Asia/Shanghai", "Asia/Tokyo",
  "Asia/Seoul", "Australia/Sydney", "Pacific/Auckland",
];

export default function SettingsClient({ user, apiKey }: { user: User; apiKey: string }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerated, setRegenerated] = useState(false);
  const [currentKey, setCurrentKey] = useState(apiKey);

  // Profile state
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [location, setLocation] = useState(user.location ?? "");
  const [timezone, setTimezone] = useState(user.timezone ?? "UTC");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const maskedKey = currentKey.slice(0, 10) + "••••••••••••••••••••••••••••••••";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!confirm("Regenerating the key will immediately break any apps using the old key. Continue?")) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/user/key", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setCurrentKey(data.apiKey);
        setRegenerated(true);
        setTimeout(() => setRegenerated(false), 3000);
      } else {
        alert("Failed to regenerate key");
      }
    } catch {
      alert("Network error");
    } finally {
      setRegenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, location: location || undefined, timezone }),
      });
      if (res.ok) {
        setSaveStatus("saved");
        setEditingName(false);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  };

  const startEditName = () => {
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 30);
  };

  const handlePurge = async () => {
    if (!confirm("Delete all links? This action cannot be undone.")) return;
    setDeleting(true);
    await fetch("/api/links", { method: "DELETE" }).catch(() => {});
    setDeleting(false);
  };

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="mb-8">
        <h1 className="text-[#f9f5f8] font-black text-5xl tracking-[-2.4px] leading-tight">
          Workspace Settings
        </h1>
        <p className="text-[#adaaad] text-base mt-2">
          Manage your account, API integration, and editorial plan.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Account Profile */}
          <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[#f9f5f8] font-bold text-xl">Account Profile</h2>
                <p className="text-[#adaaad] text-sm mt-0.5">Update your personal details and avatar.</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-[#bd9dff] font-bold text-sm hover:text-[#d4baff] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "✗ Error" : "Save Changes"}
              </button>
            </div>

            <div className="flex gap-8">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#2c2c2f] flex items-center justify-center">
                  {user.image ? (
                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#bd9dff] font-black text-3xl">
                      {(name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                {/* Full Name — inline edit on click */}
                <div>
                  <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase block mb-2">Full Name</label>
                  {editingName ? (
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onBlur={() => setEditingName(false)}
                      onKeyDown={e => { if (e.key === "Enter") { setEditingName(false); } if (e.key === "Escape") { setName(user.name ?? ""); setEditingName(false); } }}
                      className="w-full bg-black border border-[rgba(189,157,255,0.4)] rounded-lg px-4 py-3 text-[#f9f5f8] text-sm outline-none"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={startEditName}
                      className="w-full bg-black border border-[rgba(72,71,74,0.1)] rounded-lg px-4 py-3 text-[#f9f5f8] text-sm text-left flex items-center justify-between group hover:border-[rgba(189,157,255,0.3)] transition-colors"
                    >
                      <span className={name ? "" : "text-[rgba(173,170,173,0.4)]"}>{name || "Click to edit…"}</span>
                      <Pencil size={13} className="text-[rgba(173,170,173,0.3)] group-hover:text-[#bd9dff] transition-colors shrink-0" />
                    </button>
                  )}
                </div>

                {/* Email — read only (OAuth) */}
                <div>
                  <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase block mb-2">Email Address</label>
                  <div className="w-full bg-black border border-[rgba(72,71,74,0.1)] rounded-lg px-4 py-3 text-[rgba(173,170,173,0.6)] text-sm truncate select-all">
                    {user.email ?? "—"}
                  </div>
                </div>

                {/* Location — native select dropdown */}
                <div>
                  <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase block mb-2">Location</label>
                  <div className="relative">
                    <select
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full appearance-none bg-black border border-[rgba(72,71,74,0.1)] rounded-lg px-4 py-3 text-[#f9f5f8] text-sm outline-none focus:border-[rgba(189,157,255,0.4)] transition-colors cursor-pointer [color-scheme:dark] pr-8"
                    >
                      <option value="">Select country…</option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#adaaad]" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Timezone — native select dropdown */}
                <div>
                  <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase block mb-2">Timezone</label>
                  <div className="relative">
                    <select
                      value={timezone}
                      onChange={e => setTimezone(e.target.value)}
                      className="w-full appearance-none bg-black border border-[rgba(72,71,74,0.1)] rounded-lg px-4 py-3 text-[#f9f5f8] text-sm outline-none focus:border-[rgba(189,157,255,0.4)] transition-colors cursor-pointer [color-scheme:dark] pr-8"
                    >
                      {TIMEZONES.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#adaaad]" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API Credentials */}
          <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[#f9f5f8] font-bold text-xl">API Credentials</h2>
                <p className="text-[#adaaad] text-sm mt-0.5">Use these keys to integrate SnapLink with your apps.</p>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex items-center gap-1.5 text-[#bd9dff] font-bold text-sm hover:text-[#d4baff] transition-colors disabled:opacity-60"
              >
                <RefreshCw size={14} className={regenerating ? "animate-spin" : ""} />
                {regenerating ? "Regenerating…" : regenerated ? "Regenerated!" : "Regenerate"}
              </button>
            </div>

            <div>
              <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase block mb-2">
                Secret API Key
              </label>
              <div className="flex gap-3">
                <div className="flex-1 bg-black border border-[rgba(72,71,74,0.1)] rounded-lg px-4 py-3 flex items-center justify-between min-w-0">
                  <span className="text-[#f9f5f8] text-sm font-mono truncate">
                    {showApiKey ? currentKey : maskedKey}
                  </span>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors ml-3 shrink-0"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm shrink-0 transition-all active:scale-95"
                  style={{
                    backgroundImage: copied
                      ? "linear-gradient(135deg, rgb(74,222,128) 0%, rgb(34,197,94) 100%)"
                      : "linear-gradient(135deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)",
                    color: copied ? "#14532d" : "#3c0089",
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-[rgba(173,170,173,0.5)] text-xs mt-3 leading-relaxed">
                Note: Do not share your API keys in public spaces or include them in client-side code. If compromised, regenerate them immediately.
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#19191c] border border-[rgba(255,80,80,0.15)] rounded-lg p-8">
            <h2 className="text-[#ff6060] font-bold text-xl mb-1">Danger Zone</h2>
            <p className="text-[#adaaad] text-sm mb-6">Irreversible actions that affect your entire account data.</p>
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between py-4 border-b border-[rgba(72,71,74,0.1)]">
                <div>
                  <div className="text-[#f9f5f8] font-bold text-sm">Purge Link History</div>
                  <div className="text-[#adaaad] text-xs mt-0.5">Delete all historical click data and analytics. Links remain active.</div>
                </div>
                <button
                  onClick={handlePurge}
                  disabled={deleting}
                  className="text-[#ff6060] font-bold text-sm hover:text-[#ff8080] transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Purge Data"}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[#f9f5f8] font-bold text-sm">Deactivate Account</div>
                  <div className="text-[#adaaad] text-xs mt-0.5">Sign out and deactivate your session.</div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-5 py-2.5 bg-[#ff6060] rounded-lg text-white font-bold text-sm hover:bg-[#ff4040] transition-colors active:scale-95"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Plan card */}
          <div
            className="rounded-lg p-6 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 100%)" }}
          >
            <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 80% 20%, #bd9dff 0%, transparent 60%)" }} />
            <div className="relative z-10">
              <span className="bg-[#fe81a4] text-[#5a0027] text-[10px] font-bold tracking-[0.5px] px-2 py-0.5 rounded mb-4 inline-block">
                FREE PLAN
              </span>
              <div className="text-[#f9f5f8] font-black text-4xl tracking-tight mb-0.5">
                $0<span className="text-lg font-normal text-[#adaaad]">/mo</span>
              </div>
              <p className="text-[#adaaad] text-xs mb-5">Unlimited links, analytics included</p>

              <div className="flex flex-col gap-3 mb-5">
                {[
                  { label: "Active Links", value: "Unlimited" },
                  { label: "Analytics Depth", value: "30 days" },
                  { label: "Custom Slug", value: "Yes" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[rgba(173,170,173,0.7)] text-sm">{item.label}</span>
                    <span className="text-[#f9f5f8] font-bold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>

              <button
                className="w-full py-3 rounded-lg font-bold text-sm text-[#3c0089] mt-2 hover:opacity-90 transition-opacity"
                style={{ backgroundImage: "linear-gradient(135deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)" }}
              >
                Upgrade Plan
              </button>
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-6">
            <h3 className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase mb-4">Need Help?</h3>
            <div className="flex flex-col gap-4">
              {HELP_LINKS.map(({ icon: Icon, title, desc, href }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#2c2c2f] flex items-center justify-center shrink-0 group-hover:bg-[rgba(189,157,255,0.1)] transition-colors">
                    <Icon size={14} className="text-[#adaaad] group-hover:text-[#bd9dff] transition-colors" />
                  </div>
                  <div>
                    <div className="text-[#f9f5f8] text-sm font-bold group-hover:text-[#bd9dff] transition-colors">{title}</div>
                    <div className="text-[#adaaad] text-xs">{desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
