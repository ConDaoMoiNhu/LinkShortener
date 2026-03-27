"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, RefreshCw, BookOpen, Shield, MessageCircle } from "lucide-react";
import { signOut } from "next-auth/react";

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const API_KEY_MASKED = "sk_••••••••••••••••••••••••••••••••••";
const API_KEY_REAL = "sk_demo_placeholder_key_not_real_value";

export default function SettingsClient({ user }: { user: User }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(API_KEY_REAL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const handlePurge = async () => {
    if (!confirm("Xóa tất cả links? Hành động này không thể hoàn tác.")) return;
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
          Manage your account, API integration, and workspace.
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
                <p className="text-[#adaaad] text-sm mt-0.5">Your account details.</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-[#bd9dff] font-bold text-sm hover:text-[#d4baff] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : saved ? "Saved ✓" : "Edit Profile"}
              </button>
            </div>
            <div className="flex gap-8">
              <div className="shrink-0">
                {user.image ? (
                  <img src={user.image} alt="" className="w-20 h-20 rounded-xl object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-[#2c2c2f] flex items-center justify-center text-[#bd9dff] font-black text-3xl">
                    {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase block mb-2">Full Name</label>
                  <div className="w-full bg-black border border-[rgba(72,71,74,0.1)] rounded-lg px-4 py-3 text-[#f9f5f8] text-sm">
                    {user.name ?? "—"}
                  </div>
                </div>
                <div>
                  <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase block mb-2">Email Address</label>
                  <div className="w-full bg-black border border-[rgba(72,71,74,0.1)] rounded-lg px-4 py-3 text-[#f9f5f8] text-sm">
                    {user.email ?? "—"}
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
                <p className="text-[#adaaad] text-sm mt-0.5">Use these keys to integrate with your apps.</p>
              </div>
              <button className="flex items-center gap-1.5 text-[#bd9dff] font-bold text-sm hover:text-[#d4baff] transition-colors">
                <RefreshCw size={14} />
                Regenerate
              </button>
            </div>
            <div>
              <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase block mb-2">Secret API Key</label>
              <div className="flex gap-3">
                <div className="flex-1 bg-black border border-[rgba(72,71,74,0.1)] rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-[#f9f5f8] text-sm font-mono">
                    {showApiKey ? API_KEY_REAL : API_KEY_MASKED}
                  </span>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors ml-2 shrink-0"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm text-[#3c0089] shrink-0 transition-opacity hover:opacity-90"
                  style={{ backgroundImage: "linear-gradient(135deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)" }}
                >
                  <Copy size={14} />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-[rgba(173,170,173,0.5)] text-xs mt-3 leading-relaxed">
                Do not share your API keys publicly or include them in client-side code.
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#19191c] border border-[rgba(255,80,80,0.15)] rounded-lg p-8">
            <h2 className="text-[#ff6060] font-bold text-xl mb-1">Danger Zone</h2>
            <p className="text-[#adaaad] text-sm mb-6">Irreversible actions that affect your entire account.</p>
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between py-4 border-b border-[rgba(72,71,74,0.1)]">
                <div>
                  <div className="text-[#f9f5f8] font-bold text-sm">Purge All Links</div>
                  <div className="text-[#adaaad] text-xs mt-0.5">Permanently delete all your shortened links.</div>
                </div>
                <button
                  onClick={handlePurge}
                  disabled={deleting}
                  className="text-[#ff6060] font-bold text-sm hover:text-[#ff8080] transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Purge All"}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[#f9f5f8] font-bold text-sm">Sign Out</div>
                  <div className="text-[#adaaad] text-xs mt-0.5">Sign out from your account.</div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-5 py-2.5 bg-[#ff6060] rounded-lg text-white font-bold text-sm hover:bg-[#ff4040] transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Free Plan */}
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
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-6">
            <h3 className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase mb-4">Need Help?</h3>
            <div className="flex flex-col gap-4">
              {[
                { icon: BookOpen, title: "Documentation", desc: "API and usage guide" },
                { icon: Shield, title: "Privacy Policy", desc: "Data and compliance" },
                { icon: MessageCircle, title: "Support", desc: "Contact our team" },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-[#2c2c2f] flex items-center justify-center shrink-0 group-hover:bg-[rgba(189,157,255,0.1)] transition-colors">
                    <Icon size={14} className="text-[#adaaad] group-hover:text-[#bd9dff] transition-colors" />
                  </div>
                  <div>
                    <div className="text-[#f9f5f8] text-sm font-bold group-hover:text-[#bd9dff] transition-colors">{title}</div>
                    <div className="text-[#adaaad] text-xs">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
