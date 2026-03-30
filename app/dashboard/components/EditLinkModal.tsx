"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import type { CachedLink } from "@/lib/links-cache";

interface Props {
  link: CachedLink;
  onClose: () => void;
  onUpdated: (link: CachedLink) => void;
}

export default function EditLinkModal({ link, onClose, onUpdated }: Props) {
  const [url, setUrl] = useState(link.originalUrl);
  const [slug, setSlug] = useState(link.slug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    const body: Record<string, string> = {};
    if (url !== link.originalUrl) body.originalUrl = url;
    if (slug !== link.slug) body.customSlug = slug;
    if (Object.keys(body).length === 0) { onClose(); return; }

    const res = await fetch(`/api/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(typeof d.error === "string" ? d.error : "Lỗi cập nhật");
      return;
    }
    const updated = await res.json();
    onUpdated({ ...link, originalUrl: updated.originalUrl, slug: updated.slug });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[rgba(38,37,40,0.97)] rounded-2xl border border-[rgba(72,71,74,0.2)] shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute bottom-[-80px] right-[-80px] w-48 h-48 bg-[rgba(189,157,255,0.08)] blur-[40px] rounded-xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-[#f9f5f8] font-black text-xl tracking-tight">Edit Link</h2>
            <p className="text-[#adaaad] text-xs mt-0.5 font-mono">/{link.slug}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#adaaad] hover:text-[#f9f5f8] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 flex flex-col gap-4 relative z-10">
          <div>
            <label className="text-[#adaaad] text-[10px] font-bold tracking-[1.2px] uppercase block mb-1.5">Destination URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-black border border-[rgba(72,71,74,0.2)] rounded-lg px-4 py-3 text-[#f9f5f8] text-sm outline-none focus:border-[rgba(189,157,255,0.4)] transition-colors"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-[#adaaad] text-[10px] font-bold tracking-[1.2px] uppercase block mb-1.5">Custom Slug</label>
            <div className="flex items-center bg-black border border-[rgba(72,71,74,0.2)] rounded-lg overflow-hidden focus-within:border-[rgba(189,157,255,0.4)] transition-colors">
              <span className="pl-4 text-[rgba(173,170,173,0.4)] text-xs shrink-0 truncate max-w-[140px]">
                {origin.replace(/^https?:\/\//, "") || "…"}/
              </span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="bg-transparent text-[#bd9dff] text-sm font-mono outline-none flex-1 px-2 py-3"
              />
            </div>
          </div>

          {error && <p className="text-[#ff6060] text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-black transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundImage: "linear-gradient(135deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)" }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={onClose} className="px-6 py-3 rounded-xl text-[#adaaad] font-bold text-sm hover:text-[#f9f5f8] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
