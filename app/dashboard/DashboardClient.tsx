"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import CreateLinkForm from "./components/CreateLinkForm";
import LinkCard from "./components/LinkCard";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  _count: { clicks: number };
}

export default function DashboardClient({ user }: { user: User }) {
  const [links, setLinks] = useState<Link[]>([]);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const totalClicks = links.reduce((sum, l) => sum + l._count.clicks, 0);

  return (
    <div className="min-h-screen bg-[#07070C] flex flex-col">
      {/* Header */}
      <header
        className="px-6 md:px-10 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#07070C" }}
      >
        <div className="flex items-center gap-2">
          <span className="font-display text-base font-800" style={{ color: "#D4FF5C" }}>
            LS
          </span>
          <span className="font-display text-base font-600 text-[#F0EEFF]">LinkShort</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            {user.image && (
              <img
                src={user.image}
                alt={user.name ?? ""}
                className="w-7 h-7 rounded-full ring-1 ring-white/10"
              />
            )}
            <span className="text-xs text-[#58566E]">{user.email}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs px-3 py-1.5 rounded-lg text-[#58566E] hover:text-[#F0EEFF] border border-transparent hover:border-white/10 transition-all duration-200"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-8 space-y-6">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Tổng links", value: links.length },
            { label: "Tổng clicks", value: totalClicks },
            { label: "Active", value: links.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4 border"
              style={{
                background: "#0D0D16",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <p className="text-xs text-[#58566E] mb-1">{stat.label}</p>
              <p className="font-display text-2xl font-700 text-[#F0EEFF]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Create form */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            background: "#0D0D16",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="px-5 py-4 border-b flex items-center gap-2"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "#D4FF5C" }} />
            <h2 className="font-display text-sm font-600 text-[#F0EEFF]">Tạo link mới</h2>
          </div>
          <div className="p-5">
            <CreateLinkForm onCreated={fetchLinks} />
          </div>
        </div>

        {/* Links list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-sm font-600 text-[#F0EEFF]">Links của bạn</h2>
            {links.length > 0 && (
              <span className="text-xs text-[#58566E]">{links.length} link</span>
            )}
          </div>

          {links.length === 0 ? (
            <div
              className="rounded-xl border p-12 flex flex-col items-center justify-center text-center"
              style={{
                background: "#0D0D16",
                borderColor: "rgba(255,255,255,0.05)",
                borderStyle: "dashed",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(212,255,92,0.08)" }}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#D4FF5C" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#F0EEFF]/60">Chưa có link nào</p>
              <p className="text-xs text-[#58566E] mt-1">Tạo link đầu tiên của bạn ở trên</p>
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((link, i) => (
                <div
                  key={link.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <LinkCard link={link} baseUrl={baseUrl} onDeleted={fetchLinks} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
