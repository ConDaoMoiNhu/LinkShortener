"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Copy, Trash2, ChevronLeft, ChevronRight, Check, Search, ExternalLink, QrCode, BarChart2, X } from "lucide-react";
import { getLinksCache, setLinksCache, CachedLink } from "@/lib/links-cache";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CreateLinkModal = dynamic(() => import("../components/CreateLinkModal"), { ssr: false });

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-[#fe81a4] text-[#5a0027]",
  PAUSED: "bg-[#2c2c2f] text-[#adaaad] border border-[rgba(72,71,74,0.3)]",
  EXPIRED: "bg-[rgba(255,80,80,0.15)] text-[#ff6060]",
};

function getStatus(link: CachedLink): "ACTIVE" | "EXPIRED" {
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return "EXPIRED";
  return "ACTIVE";
}

function formatClicks(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const PER_PAGE = 10;

export default function LinksClient() {
  const [links, setLinks] = useState<CachedLink[]>(() => getLinksCache() ?? []);
  const [loading, setLoading] = useState(() => getLinksCache() === null);
  const [filter, setFilter] = useState<"All" | "Active" | "Expired">("All");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [qrModalSlug, setQrModalSlug] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = searchParams.get("search") || "";
    setSearch(q);
    setSearchInput(q);
    setPage(1);
  }, [searchParams]);

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

  const filtered = useMemo(() => links.filter(l => {
    const matchesFilter =
      filter === "All" ? true :
      filter === "Active" ? getStatus(l) === "ACTIVE" :
      getStatus(l) === "EXPIRED";
    const q = search.toLowerCase();
    return matchesFilter && (!q || l.slug.toLowerCase().includes(q) || l.originalUrl.toLowerCase().includes(q));
  }), [links, filter, search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PER_PAGE)), [filtered.length]);
  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);

  const handleCopy = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`).catch(() => {});
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = useCallback(async (id: string) => {
    setConfirmDeleteId(null);
    const snapshot = links;
    setLinks(prev => {
      const updated = prev.filter(l => l.id !== id);
      setLinksCache(updated);
      return updated;
    });
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setLinks(snapshot);
        setLinksCache(snapshot);
      }
    } catch {
      setLinks(snapshot);
      setLinksCache(snapshot);
    }
  }, [links]);

  const handleCreated = useCallback((link: CachedLink) => {
    setLinks(prev => {
      const updated = [link, ...prev];
      setLinksCache(updated);
      return updated;
    });
  }, []);

  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(val); setPage(1); }, 200);
  };

  return (
    <>
      <div className="p-8 max-w-[1100px]">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[#f9f5f8] font-black text-5xl tracking-[-2.4px] leading-tight">All Links</h1>
            <p className="text-[#adaaad] text-base mt-1">
              {loading ? "Loading…" : `${links.length} link${links.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold text-base text-black shadow-[0_20px_40px_0_rgba(189,157,255,0.2)] transition-opacity hover:opacity-90 shrink-0"
            style={{ backgroundImage: "linear-gradient(133deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)" }}
          >
            <span className="text-lg leading-none">+</span>
            Create New Link
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6">
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
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#adaaad] pointer-events-none" />
            <input
              type="text"
              placeholder="Search slug or URL…"
              value={searchInput}
              onChange={e => handleSearchInput(e.target.value)}
              className="bg-[#19191c] border border-[rgba(72,71,74,0.2)] rounded-lg pl-8 pr-4 py-2 text-[#f9f5f8] text-xs outline-none placeholder-[rgba(173,170,173,0.4)] focus:border-[rgba(189,157,255,0.4)] transition-colors w-52"
            />
          </div>
        </div>

        {/* Links list */}
        <div className="flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg px-6 py-5 flex items-center gap-4 animate-pulse opacity-40">
                <div className="flex-1">
                  <div className="h-4 bg-[#2c2c2f] rounded w-48 mb-2" />
                  <div className="h-3 bg-[#2c2c2f] rounded w-72" />
                </div>
                <div className="h-8 bg-[#2c2c2f] rounded w-16" />
              </div>
            ))
          ) : paginated.length === 0 ? (
            <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg px-6 py-16 text-center">
              <div className="text-[#adaaad] text-sm mb-2">
                {search ? `No links matching "${search}"` : "No links yet."}
              </div>
              {!search && (
                <button onClick={() => setShowModal(true)} className="text-[#bd9dff] text-sm font-bold hover:text-[#d4baff] transition-colors">
                  Create your first link →
                </button>
              )}
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
                      <span className="text-[#f9f5f8] font-bold text-base truncate">{link.slug}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.5px] shrink-0 ${STATUS_STYLES[status]}`}>
                        {status}
                      </span>
                      {link.expiresAt && status === "ACTIVE" && (
                        <span className="text-[rgba(173,170,173,0.4)] text-xs shrink-0">
                          Expires {formatDate(link.expiresAt)}
                        </span>
                      )}
                    </div>
                    <div className="text-[#bd9dff] text-sm mb-0.5 truncate">{shortUrl}</div>
                    <div className="text-[rgba(173,170,173,0.4)] text-xs truncate">Target: {link.originalUrl}</div>
                  </div>
                  <div className="flex gap-8 items-center shrink-0">
                    <div className="text-right">
                      <div className="text-[rgba(173,170,173,0.6)] text-[10px] font-bold tracking-[1px] uppercase mb-0.5">Clicks</div>
                      <div className="text-[#f9f5f8] font-bold text-lg">{formatClicks(link._count?.clicks ?? 0)}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-[rgba(173,170,173,0.6)] text-[10px] font-bold tracking-[1px] uppercase mb-0.5">Created</div>
                      <div className="text-[#adaaad] text-sm">{formatDate(link.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors p-1"
                      title="Open original URL"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => handleCopy(link.slug)}
                      className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors p-1"
                      title="Copy short URL"
                    >
                      {copied === link.slug ? <Check size={16} className="text-[#bd9dff]" /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={() => setQrModalSlug(link.slug)}
                      className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors p-1"
                      title="Show QR Code"
                    >
                      <QrCode size={16} />
                    </button>
                    <Link
                      href={`/dashboard/analytics?slug=${link.slug}`}
                      className="text-[#adaaad] hover:text-[#bd9dff] transition-colors p-1"
                      title="View analytics"
                    >
                      <BarChart2 size={16} />
                    </Link>
                    {confirmDeleteId === link.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="px-2.5 py-1 rounded-lg text-[#ff6060] bg-[rgba(255,96,96,0.1)] hover:bg-[rgba(255,96,96,0.2)] font-bold text-[11px] transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors p-1"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(link.id)}
                        className="text-[#adaaad] hover:text-[#ff6060] transition-colors p-1"
                        title="Delete link"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > PER_PAGE && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-[#adaaad] text-sm">
              {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg text-[#adaaad] hover:text-[#f9f5f8] disabled:opacity-30 transition-colors flex items-center justify-center">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                  style={page === i + 1
                    ? { backgroundImage: "linear-gradient(135deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)", color: "#fff" }
                    : { color: "#adaaad" }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg text-[#adaaad] hover:text-[#f9f5f8] disabled:opacity-30 transition-colors flex items-center justify-center">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <CreateLinkModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
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
