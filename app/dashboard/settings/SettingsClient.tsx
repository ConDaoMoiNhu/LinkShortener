"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, RefreshCw, BookOpen, Shield, MessageCircle, Check, ExternalLink } from "lucide-react";
import { signOut } from "next-auth/react";

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const HELP_LINKS = [
  {
    icon: BookOpen,
    title: "Documentation",
    desc: "API and usage guide",
    href: "https://github.com/ConDaoMoiNhu/LinkShortener#readme",
  },
  {
    icon: Shield,
    title: "Privacy Policy",
    desc: "Data and compliance",
    href: "https://github.com/ConDaoMoiNhu/LinkShortener/blob/master/README.md",
  },
  {
    icon: MessageCircle,
    title: "Support",
    desc: "Contact our team",
    href: "https://github.com/ConDaoMoiNhu/LinkShortener/issues",
  },
];

export default function SettingsClient({ user, apiKey }: { user: User; apiKey: string }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerated, setRegenerated] = useState(false);

  const maskedKey = apiKey.slice(0, 10) + "••••••••••••••••••••••••••••••••";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setRegenerating(false);
      setRegenerated(true);
      setTimeout(() => setRegenerated(false), 3000);
    }, 1200);
  };

  const handlePurge = async () => {
    if (!confirm("Xóa tất cả links? Hành động này không thể hoàn tác.")) return;
    setDeleting(true);
    await fetch("/api/links", { method: "DELETE" }).catch(() => {});
    setDeleting(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1100px]">
      <div className="mb-8">
        <h1 className="text-[#f9f5f8] font-black text-4xl md:text-5xl tracking-[-2.4px] leading-tight">
          Workspace Settings
        </h1>
        <p className="text-[#adaaad] text-base mt-2">
          Manage your account, API integration, and workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
          {/* Account Profile */}
          <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[#f9f5f8] font-bold text-xl">Account Profile</h2>
                <p className="text-[#adaaad] text-sm mt-0.5">Your account details.</p>
              </div>
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
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex items-center gap-1.5 text-[#bd9dff] font-bold text-sm hover:text-[#d4baff] transition-colors disabled:opacity-60"
              >
                <RefreshCw
                  size={14}
                  className={regenerating ? "animate-spin" : regenerated ? "text-green-400" : ""}
                />
                {regenerating ? "Regenerating..." : regenerated ? "Regenerated!" : "Regenerate"}
              </button>
            </div>
            <div>
              <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase block mb-2">Secret API Key</label>
              <div className="flex gap-3">
                <div className="flex-1 bg-black border border-[rgba(72,71,74,0.1)] rounded-lg px-4 py-3 flex items-center justify-between min-w-0">
                  <span
                    className="text-[#f9f5f8] text-sm font-mono truncate transition-all duration-300"
                    style={{ letterSpacing: showApiKey ? "0" : "0.05em" }}
                  >
                    {showApiKey ? apiKey : maskedKey}
                  </span>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors ml-3 shrink-0"
                    title={showApiKey ? "Hide key" : "Show key"}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm shrink-0 transition-all duration-200 active:scale-95"
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
            <div className="flex flex-col gap-2">
              {HELP_LINKS.map(({ icon: Icon, title, desc, href }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgba(189,157,255,0.06)] transition-all duration-150 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#2c2c2f] flex items-center justify-center shrink-0 group-hover:bg-[rgba(189,157,255,0.15)] transition-colors">
                    <Icon size={14} className="text-[#adaaad] group-hover:text-[#bd9dff] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#f9f5f8] text-sm font-bold group-hover:text-[#bd9dff] transition-colors flex items-center gap-1">
                      {title}
                      <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                    </div>
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
