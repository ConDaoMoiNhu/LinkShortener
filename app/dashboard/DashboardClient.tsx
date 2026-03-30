"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Copy, Trash2, ChevronLeft, ChevronRight, Check, QrCode, Edit2 } from "lucide-react";
import { getLinksCache, setLinksCache, invalidateLinksCache, CachedLink } from "@/lib/links-cache";
import Link from "next/link";

const CreateLinkModal = dynamic(() => import("./components/CreateLinkModal"), { ssr: false });
const EditLinkModal = dynamic(() => import("./components/EditLinkModal"), { ssr: false });

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-[#fe81a4] text-[#5a0027]",
  PAUSED: "bg-[#2c2c2f] text-[#adaaad] border border-[rgba(72,71,74,0.3)]",
  EXPIRED: "bg-[rgba(255,80,80,0.15)] text-[#ff6060]",
};

const AVATAR_COLORS = [
  { bg: "#b28cff", text: "#2e006c" },
  { bg: "#fe81a4", text: "#5a0027" },
  { bg: "#2c2c2f", text: "#f9f5f8" },
  { bg: "#81d4fe", text: "#003c52" },
  { bg: "#a8e6cf", text: "#1b4332" },
];

function getStatus(link: CachedLink): "ACTIVE" | "PAUSED" | "EXPIRED" {
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return "EXPIRED";
  return "ACTIVE";
}

function formatClicks(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function getInitials(slug: string): string {
  return slug.slice(0, 2).toUpperCase();
}

export default function DashboardClient({ user }: { user: User }) {
  const [links, setLinks] = useState<CachedLink[]>(() => getLinksCache() ?? []);
  const [loading, setLoading] = useState(() => getLinksCache() === null);
  const [filter, setFilter] = useState<"All" | "Active" | "Paused">("All");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<CachedLink | null>(null);
  const [qrModalSlug, setQrModalSlug] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"Newest" | "Oldest">("Newest");
  const PER_PAGE = 5;

  useEffect(() => {
    if (qrModalSlug) {
      setQrDataUrl(null);
      const shortUrl = `${window.location.origin}/${qrModalSlug}`;
      fetch(`/api/qr?url=${encodeURIComponent(shortUrl)}`)
        .then(r => r.json())
        .then(d => setQrDataUrl(d.qr ?? null))
        .catch(() => {});
    }
  }, [qrModalSlug]);

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

  const filtered = useMemo(() => {
    const sorted = [...links].sort((a, b) => {
      const db = new Date(b.createdAt).getTime();
      const da = new Date(a.createdAt).getTime();
      return sortOrder === "Newest" ? db - da : da - db;
    });
    return sorted.filter(l => {
      if (filter === "All") return true;
      const s = getStatus(l);
      if (filter === "Active") return s === "ACTIVE";
      if (filter === "Paused") return s === "PAUSED";
      return true;
    });
  }, [links, filter, sortOrder]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PER_PAGE)), [filtered.length]);
  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);
  const totalClicks = useMemo(() => links.reduce((s, l) => s + (l._count?.clicks ?? 0), 0), [links]);
  const activeCount = useMemo(() => links.filter(l => getStatus(l) === "ACTIVE").length, [links]);
  const avatarLinks = useMemo(() => links.slice(0, 4), [links]);

  const handleDelete = useCallback(async (id: string) => {
    const snapshot = links;
    setLinks(prev => prev.filter(l => l.id !== id));
    invalidateLinksCache();
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (!res.ok) setLinks(snapshot);
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

  const handleUpdated = useCallback((updated: CachedLink) => {
    setLinks(prev => {
      const next = prev.map(l => l.id === updated.id ? { ...l, ...updated } : l);
      setLinksCache(next);
      return next;
    });
    setEditingLink(null);
  }, []);

  const handleCopy = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`).catch(() => {});
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <div className="p-8 max-w-[1100px]">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-[#f9f5f8] font-black text-5xl tracking-[-2.4px] leading-tight">Overview</h1>
            <p className="text-[#adaaad] text-base mt-1">Manage your digital architecture and monitor reach.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold text-base text-black shadow-[0_20px_40px_0_rgba(189,157,255,0.2)] transition-opacity hover:opacity-90"
            style={{ backgroundImage: "linear-gradient(133deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)" }}
          >
            <span className="text-lg leading-none">+</span>
            Create New Link
          </button>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Total Engagement — spans 2 cols */}
          <div className="col-span-2 bg-[#131315] rounded-lg border border-[rgba(72,71,74,0.05)] p-8 relative overflow-hidden">
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

          {/* Active Links */}
          <div className="bg-[#19191c] rounded-lg border border-[rgba(72,71,74,0.05)] p-8">
            <p className="text-[rgba(173,170,173,0.8)] text-xs font-bold tracking-[1.2px] uppercase mb-2">Active Links</p>
            <div className="text-[#f9f5f8] font-black text-4xl tracking-[-1.8px] leading-tight mb-6">
              {loading ? "—" : activeCount}
            </div>
            {/* Avatar stack */}
            <div className="flex items-center">
              {avatarLinks.length > 0 ? (
                <>
                  {avatarLinks.map((l, i) => {
                    const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                    return (
                      <div
                        key={l.id}
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border-2 border-[#19191c] shrink-0"
                        style={{
                          backgroundColor: color.bg,
                          color: color.text,
                          marginLeft: i === 0 ? 0 : "-8px",
                          zIndex: avatarLinks.length - i,
                          position: "relative",
                        }}
                      >
                        {getInitials(l.slug)}
                      </div>
                    );
                  })}
                  {links.length > 4 && (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border-2 border-[#19191c] bg-[#2c2c2f] text-[#f9f5f8] shrink-0"
                      style={{ marginLeft: "-8px", position: "relative", zIndex: 0 }}
                    >
                      +{links.length - 4}
                    </div>
                  )}
                </>
              ) : !loading && (
                <span className="text-[rgba(173,170,173,0.4)] text-xs">No links yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Recent Links */}
        <div>
          {/* List header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <h2 className="text-[#f9f5f8] font-bold text-xl">Recent Links</h2>
              <div className="flex items-center gap-2">
                {(["All", "Active", "Paused"] as const).map((f) => (
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
            <button 
              onClick={() => setSortOrder(o => o === "Newest" ? "Oldest" : "Newest")} 
              className="flex items-center gap-2 text-[#adaaad] text-sm font-medium hover:text-[#f9f5f8] transition-colors"
            >
              <svg width="10.5" height="7" viewBox="0 0 10.5 7" fill="none" style={{ transform: sortOrder === "Oldest" ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <path d="M4.08333 7V5.83333H6.41667V7H4.08333M1.75 4.08333V2.91667H8.75V4.08333H1.75M0 1.16667V0H10.5V1.16667H0" fill="currentColor"/>
              </svg>
              Sort by Date: {sortOrder}
            </button>
          </div>

          {/* Links list */}
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
                No links yet. Click &quot;Create New Link&quot; to get started.
              </div>
            ) : (
              <>
                {paginated.map((link) => {
                  const status = getStatus(link);
                  const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${link.slug}`;
                  return (
                    <Link
                      key={link.id}
                      href="/dashboard/analytics"
                      className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg px-6 py-5 flex items-center gap-4 hover:border-[rgba(189,157,255,0.15)] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[#f9f5f8] font-bold text-base truncate">{link.slug}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.5px] shrink-0 ${STATUS_STYLES[status]}`}>
                            {status}
                          </span>
                        </div>
                        <div className="text-[#bd9dff] text-sm mb-0.5 truncate">{shortUrl}</div>
                        <div className="text-[rgba(173,170,173,0.4)] text-xs truncate">Target: {link.originalUrl}</div>
                      </div>
                      <div className="flex gap-8 items-center shrink-0">
                        <div className="text-right">
                          <div className="text-[rgba(173,170,173,0.6)] text-[10px] font-bold tracking-[1px] uppercase mb-0.5">Clicks</div>
                          <div className="text-[#f9f5f8] font-bold text-lg">{formatClicks(link._count?.clicks ?? 0)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[rgba(173,170,173,0.6)] text-[10px] font-bold tracking-[1px] uppercase mb-0.5">CTR</div>
                          <div className="text-[#f9f5f8] font-bold text-lg">—</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <button
                          onClick={(e) => { e.preventDefault(); handleCopy(link.slug); }}
                          className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors p-1"
                          title="Copy"
                        >
                          {copied === link.slug ? <Check size={16} className="text-[#bd9dff]" /> : <Copy size={16} />}
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); setEditingLink(link); }}
                          className="text-[#adaaad] hover:text-[#bd9dff] transition-colors p-1"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); setQrModalSlug(link.slug); }}
                          className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors p-1"
                          title="QR Code"
                        >
                          <QrCode size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); handleDelete(link.id); }}
                          className="text-[#adaaad] hover:text-[#ff6060] transition-colors p-1"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Link>
                  );
                })}

                {/* Skeleton row at bottom */}
                <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg px-6 py-5 flex items-center gap-4 opacity-40">
                  <div className="flex-1">
                    <div className="h-4 bg-[#2c2c2f] rounded w-48 mb-2" />
                    <div className="h-3 bg-[#2c2c2f] rounded w-72" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-8 bg-[#2c2c2f] rounded w-12" />
                    <div className="h-8 bg-[#2c2c2f] rounded w-12" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-7 bg-[#2c2c2f] rounded w-7" />
                    <div className="h-7 bg-[#2c2c2f] rounded w-7" />
                    <div className="h-7 bg-[#2c2c2f] rounded w-7" />
                  </div>
                </div>
              </>
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
                {totalPages > 5 && (
                  <>
                    <span className="text-[#adaaad] text-sm px-1">...</span>
                    <button
                      onClick={() => setPage(totalPages)}
                      className="w-8 h-8 rounded-lg text-sm font-medium text-[#adaaad] hover:text-[#f9f5f8] transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
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
        <CreateLinkModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
      {editingLink && (
        <EditLinkModal link={editingLink} onClose={() => setEditingLink(null)} onUpdated={handleUpdated} />
      )}

      {qrModalSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setQrModalSlug(null)}>
          <div className="relative bg-[#19191c] p-8 rounded-3xl border border-[rgba(72,71,74,0.2)] flex flex-col items-center shadow-[0_40px_80px_0_rgba(189,157,255,0.12)]" onClick={e => e.stopPropagation()}>
            <h3 className="text-[#f9f5f8] font-black text-2xl tracking-tight mb-2">QR Code</h3>
            <p className="text-[#adaaad] text-xs mb-6 font-medium">/{qrModalSlug}</p>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR code" className="w-48 h-48 rounded-2xl border border-[rgba(189,157,255,0.2)] mb-6" />
            ) : (
              <div className="w-48 h-48 rounded-2xl border border-[rgba(72,71,74,0.2)] bg-[#131315] flex items-center justify-center mb-6">
                 <div className="w-6 h-6 border-2 border-[#bd9dff] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <button
              onClick={() => setQrModalSlug(null)}
              className="px-8 py-2.5 rounded-xl font-bold text-sm bg-[#2c2c2f] hover:bg-[#3c3c40] text-[#f9f5f8] transition-colors w-full"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
