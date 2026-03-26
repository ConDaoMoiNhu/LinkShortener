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
    setLinks(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const totalClicks = links.reduce((sum, l) => sum + l._count.clicks, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b"
        style={{
          background: "var(--bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect width="20" height="20" rx="5" fill="var(--accent)" />
            <path d="M6 10h8M10 6l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>LinkShort</span>
        </div>

        <div className="flex items-center gap-3">
          {user.image && (
            <img src={user.image} alt="" className="w-6 h-6 rounded-full" />
          )}
          <span className="hidden sm:block text-sm" style={{ color: "var(--text-secondary)" }}>
            {user.name ?? user.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs px-3 py-1.5 rounded-md border transition-colors"
            style={{
              color: "var(--text-secondary)",
              borderColor: "var(--border)",
              background: "transparent",
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Tổng links", value: links.length },
            { label: "Tổng clicks", value: totalClicks },
            { label: "Tuần này", value: links.filter(l => {
              const d = new Date(l.createdAt);
              return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
            }).length },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border px-4 py-3"
              style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
            >
              <p className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>{s.label}</p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text)" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Create form */}
        <div
          className="rounded-lg border mb-6 overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{
              background: "var(--bg-subtle)",
              borderColor: "var(--border)",
            }}
          >
            <h2 className="text-sm font-medium" style={{ color: "var(--text)" }}>
              Tạo link mới
            </h2>
          </div>
          <div className="p-4" style={{ background: "var(--bg)" }}>
            <CreateLinkForm onCreated={fetchLinks} />
          </div>
        </div>

        {/* Links */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium" style={{ color: "var(--text)" }}>
              Links của bạn
            </h2>
            {links.length > 0 && (
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {links.length} link
              </span>
            )}
          </div>

          {links.length === 0 ? (
            <div
              className="rounded-lg border border-dashed p-10 text-center"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Chưa có link nào
              </p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Tạo link đầu tiên của bạn ở trên
              </p>
            </div>
          ) : (
            <div
              className="rounded-lg border overflow-hidden divide-y"
              style={{ borderColor: "var(--border)" }}
            >
              {links.map((link) => (
                <LinkCard key={link.id} link={link} baseUrl={baseUrl} onDeleted={fetchLinks} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
