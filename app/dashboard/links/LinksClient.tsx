"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Copy, Trash2, ChevronLeft, ChevronRight, Check, Search, ExternalLink } from "lucide-react";
import { getLinksCache, setLinksCache, invalidateLinksCache, CachedLink } from "@/lib/links-cache";

const CreateLinkModal = dynamic(() => import("../components/CreateLinkModal"), { ssr: false });

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
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const matchesSearch = !q || l.slug.toLowerCase().includes(q) || l.originalUrl.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  }), [links, filter, search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PER_PAGE)), [filtered.length]);
  const paginated = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);

  const handleCopy = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`).catch(() => {});
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Xóa link này?")) return;
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

  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 200);
  };

  const handleFilterChange = (f: "All" | "Active" | "Expired") => {
    setFilter(f);
    setPage(1);
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-[1100px]">
        {/* Header */}
        <div className="flex flex-wrap items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[#f9f5f8] font-black text-4xl md:text-5xl tracking-[-2.4px] leading-tight">
              All Links
            </h1>
            <p className="text-[#adaaad] text-base mt-1">
              {loading ? "Loading…" : `${links.length} link${links.length !== 1 ? "s" : ""} total`}
            </p>
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

        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#adaaad] pointer-events-none" />
            <input
              type="text"
              placeholder="Search slug or URL…"
              value={searchInput}
              onChange={e => handleSearchInput(e.target.value)}
              className="w-full bg-[#19191c] border border-[rgba(72,71,74,0.2)] rounded-lg pl-9 pr-4 py-2.5 text-[#f9f5f8] text-sm outline-none placeholder-[rgba(173,170,173,0.4)] focus:border-[rgba(189,157,255,0.4)] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-1">
            {(["All", "Active", "Expired"] as const).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  filter === f
                    ? "bg-[#2c2c2f] text-[#bd9dff]"
                    : "text-[#adaaad] hover:text-[#f9f5f8]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 mb-2">
          <span className="text-[#adaaad] text-[10px] font-bold tracking-[1.2px] uppercase">Link</span>
          <span className="text-[#adaaad] text-[10px] font-bold tracking-[1.2px] uppercase w-16 text-center">Clicks</span>
          <span className="text-[#adaaad] text-[10px] font-bold tracking-[1.2px] uppercase w-24 text-center">Created</span>
          <span className="text-[#adaaad] text-[10px] font-bold tracking-[1.2px] uppercase w-20 text-right">Actions</span>
        </div>

        {/* Links list */}
        <div className="flex flex-col gap-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg px-4 py-4 flex items-center gap-4 animate-pulse opacity-40">
                <div className="flex-1">
                  <div className="h-4 bg-[#2c2c2f] rounded w-32 mb-2" />
                  <div className="h-3 bg-[#2c2c2f] rounded w-64" />
                </div>
                <div className="h-8 bg-[#2c2c2f] rounded w-12" />
              </div>
            ))
          ) : paginated.length === 0 ? (
            <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg px-6 py-16 text-center">
              <div className="text-[#adaaad] text-sm mb-2">
                {search ? `No links matching "${search}"` : "No links yet."}
              </div>
              {!search && (
                <button
                  onClick={() => setShowModal(true)}
                  className="text-[#bd9dff] text-sm font-bold hover:text-[#d4baff] transition-colors"
                >
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
                  className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg px-4 py-4 grid md:grid-cols-[1fr_auto_auto_auto] gap-4 items-center hover:border-[rgba(189,157,255,0.15)] transition-colors"
                >
                  {/* Link info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[#f9f5f8] font-bold text-sm">/{link.slug}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-[0.5px] shrink-0 ${
                        status === "ACTIVE"
                          ? "bg-[rgba(254,129,164,0.15)] text-[#fe81a4]"
                          : "bg-[rgba(255,80,80,0.1)] text-[#ff6060]"
                      }`}>
                        {status}
                      </span>
                      {link.expiresAt && status === "ACTIVE" && (
                        <span className="text-[rgba(173,170,173,0.5)] text-[10px]">
                          Expires {formatDate(link.expiresAt)}
                        </span>
                      )}
                    </div>
                    <div className="text-[#bd9dff] text-xs mb-0.5 truncate font-medium">{shortUrl}</div>
                    <div className="text-[rgba(173,170,173,0.4)] text-xs truncate">→ {link.originalUrl}</div>
                  </div>

                  {/* Clicks */}
                  <div className="w-16 text-center">
                    <div className="text-[#f9f5f8] font-bold text-lg leading-none">{formatClicks(link._count?.clicks ?? 0)}</div>
                    <div className="text-[rgba(173,170,173,0.4)] text-[10px] font-bold uppercase tracking-wider mt-0.5">clicks</div>
                  </div>

                  {/* Date */}
                  <div className="w-24 text-center hidden md:block">
                    <div className="text-[#adaaad] text-xs">{formatDate(link.createdAt)}</div>
                  </div>

                  {/* Actions */}
                  <div className="w-20 flex items-center justify-end gap-1">
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#adaaad] hover:text-[#f9f5f8] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      title="Open original URL"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => handleCopy(link.slug)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#adaaad] hover:text-[#f9f5f8] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      title="Copy short URL"
                    >
                      {copied === link.slug ? <Check size={14} className="text-[#bd9dff]" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#adaaad] hover:text-[#ff6060] hover:bg-[rgba(255,96,96,0.08)] transition-colors"
                      title="Delete link"
                    >
                      <Trash2 size={14} />
                    </button>
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
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg text-[#adaaad] hover:text-[#f9f5f8] disabled:opacity-30 transition-colors flex items-center justify-center"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                  style={page === i + 1
                    ? { backgroundImage: "linear-gradient(135deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)", color: "#fff" }
                    : { color: "#adaaad" }}
                >
                  {i + 1}
                </button>
              ))}
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

      {showModal && (
        <CreateLinkModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
