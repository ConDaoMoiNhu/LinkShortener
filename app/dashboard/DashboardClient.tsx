"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Copy, Trash2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { getLinksCache, setLinksCache, invalidateLinksCache, CachedLink } from "@/lib/links-cache";

const CreateLinkModal = dynamic(() => import("./components/CreateLinkModal"), { ssr: false });

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-[#fe81a4] text-[#5a0027]",
  EXPIRED: "bg-[rgba(255,80,80,0.15)] text-[#ff6060]",
};

const AVATAR_COLORS = [
  { bg: "#2c2c2f", text: "#f9f5f8" },
  { bg: "#b28cff", text: "#2e006c" },
  { bg: "#fe81a4", text: "#5a0027" },
  { bg: "#2c2c2f", text: "#f9f5f8" },
];

function getStatus(link: CachedLink): "ACTIVE" | "EXPIRED" {
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return "EXPIRED";
  return "ACTIVE";
}

function formatClicks(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

export default function DashboardClient({ user }: { user: User }) {
  const [links, setLinks] = useState<CachedLink[]>(() => getLinksCache() ?? []);
  const [loading, setLoading] = useState(() => getLinksCache() === null);
  const [filter, setFilter] = useState<"All" | "Active" | "Expired">("All");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const PER_PAGE = 5;

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    if (res.ok) {
      const data: CachedLink[] = await res.json();
      setLinks(data);
      setLinksCache(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const filtered = useMemo(() => links.filter(l => {
    if (filter === "All") return true;
    const s = getStatus(l);
    return filter === "Active" ? s === "ACTIVE" : s === "EXPIRED";
  }), [links, filter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PER_PAGE)), [filtered.length]);
  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);
  const totalClicks = useMemo(() => links.reduce((s, l) => s + (l._count?.clicks ?? 0), 0), [links]);
  const activeCount = useMemo(() => links.filter(l => getStatus(l) === "ACTIVE").length, [links]);
  const avatarStack = useMemo(() => [
    ...links.slice(0, 3).map((l, i) => ({
      initials: l.slug.slice(0, 2).toUpperCase(),
      ...AVATAR_COLORS[i % AVATAR_COLORS.length],
    })),
    links.length > 3 ? { initials: `+${links.length - 3}`, ...AVATAR_COLORS[3] } : null,
  ].filter(Boolean) as { initials: string; bg: string; text: string }[], [links]);

  const handleCopy = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`).catch(() => {});
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = useCallback(async (id: string) => {
    const snapshot = links;
    setLinks(prev => prev.filter(l => l.id !== id));
    invalidateLinksCache();
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (!res.ok) setLinks(snapshot);
      else setLinksCache(links.filter(l => l.id !== id));
    } catch {
      setLinks(snapshot);
    }
  }, [links]);

  const handleCreated = useCallback((link: CachedLink) => {
    setLinks(prev => {
      const updated = [link, ...prev];
      setLinksCache(updated);
      return updated;
    });
  }, []);

  return (
    <>
      <div className="p-4 md:p-8 max-w-[1100px]">
        {/* Header */}
        <div className="flex flex-wrap items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[#f9f5f8] font-black text-4xl md:text-5xl tracking-[-2.4px] leading-tight">Overview</h1>
            <p className="text-[#adaaad] text-base mt-1">Manage your links and monitor reach.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-lg font-bold text-sm md:text-base text-black shadow-[0_20px_40px_0_rgba(189,157,255,0.2)] transition-opacity hover:opacity-90 shrink-0"
            style={{ backgroundImage: "linear-gradient(133deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)" }}
          >
            <span className="text-lg leading-none">+</span>
            Create New Link
          </button>
        </div>

        {/* Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="col-span-1 md:col-span-2 bg-[#131315] rounded-lg border border-[rgba(72,71,74,0.05)] p-6 md:p-8 relative overflow-hidden">
            <div className="absolute bottom-[-39px] right-[-39px] w-64 h-64 bg-[rgba(189,157,255,0.05)] blur-[32px] rounded-xl pointer-events-none" />
            <p className="text-[rgba(173,170,173,0.8)] text-xs font-bold tracking-[1.2px] uppercase mb-4">Total Engagement</p>
            <div className="text-[#bd9dff] font-black text-7xl tracking-[-3.6px] leading-none mb-4">
              {loading ? "—" : formatClicks(totalClicks)}
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                <path d="M1.4 12L0 10.6L7.4 3.15L11.4 7.15L16.6 2H14V0H20V6H18V3.4L11.4 10L7.4 6L1.4 12" fill="#FF8EAC"/>
              </svg>
              <span className="text-[#ff8eac] font-bold text-base">Total clicks across all links</span>
            </div>
          </div>
          <div className="bg-[#19191c] rounded-lg border border-[rgba(72,71,74,0.05)] p-6 md:p-8">
            <p className="text-[rgba(173,170,173,0.8)] text-xs font-bold tracking-[1.2px] uppercase mb-2">Active Links</p>
            <div className="text-[#f9f5f8] font-black text-4xl tracking-[-1.8px] leading-tight mb-6">
              {loading ? "—" : activeCount}
            </div>
            <div className="flex items-center">
              {avatarStack.map((av, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border-2 border-[#19191c] -ml-2 first:ml-0 shrink-0"
                  style={{ backgroundColor: av.bg, color: av.text, zIndex: avatarStack.length - i }}
                >
                  {av.initials}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Links */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <h2 className="text-[#f9f5f8] font-bold text-xl">Recent Links</h2>
              <div className="flex items-center gap-2">
                {(["All", "Active", "Expired"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setPage(1); }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      filter === f
                        ? "bg-[#19191c] text-[#bd9dff] border border-[rgba(189,157,255,0.2)]"
                        : "text-[#adaaad] hover:text-[#f9f5f8]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg px-6 py-5 flex items-center gap-4 opacity-40 animate-pulse">
                  <div className="flex-1">
                    <div className="h-4 bg-[#2c2c2f] rounded w-48 mb-2" />
                    <div className="h-3 bg-[#2c2c2f] rounded w-72" />
                  </div>
                  <div className="h-8 bg-[#2c2c2f] rounded w-16" />
                </div>
              ))
            ) : paginated.length === 0 ? (
              <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg px-6 py-12 text-center text-[#adaaad] text-sm">
                Chưa có link nào. Nhấn "Create New Link" để bắt đầu.
              </div>
            ) : (
              paginated.map((link) => {
                const status = getStatus(link);
                const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${link.slug}`;
                return (
                  <div
                    key={link.id}
                    className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg px-6 py-5 flex items-center gap-4 hover:border-[rgba(189,157,255,0.15)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[#f9f5f8] font-bold text-base truncate">/{link.slug}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.5px] shrink-0 ${STATUS_STYLES[status]}`}>
                          {status}
                        </span>
                      </div>
                      <div className="text-[#bd9dff] text-sm mb-0.5 truncate">{shortUrl}</div>
                      <div className="text-[rgba(173,170,173,0.4)] text-xs truncate">→ {link.originalUrl}</div>
                    </div>
                    <div className="flex gap-8 items-center shrink-0">
                      <div className="text-right">
                        <div className="text-[rgba(173,170,173,0.6)] text-[10px] font-bold tracking-[1px] uppercase mb-0.5">Clicks</div>
                        <div className="text-[#f9f5f8] font-bold text-lg">{formatClicks(link._count?.clicks ?? 0)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <button
                        onClick={() => handleCopy(link.slug)}
                        className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors p-1"
                        title="Copy URL"
                      >
                        {copied === link.slug ? <Check size={16} className="text-[#bd9dff]" /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="text-[#adaaad] hover:text-[#ff6060] transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-[#adaaad] text-sm">
                Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} links
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg text-[#adaaad] hover:text-[#f9f5f8] disabled:opacity-30 transition-colors flex items-center justify-center"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                      style={page === p
                        ? { backgroundImage: "linear-gradient(135deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)", color: "#fff" }
                        : { color: "#adaaad" }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg text-[#adaaad] hover:text-[#f9f5f8] disabled:opacity-30 transition-colors flex items-center justify-center"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CreateLinkModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
