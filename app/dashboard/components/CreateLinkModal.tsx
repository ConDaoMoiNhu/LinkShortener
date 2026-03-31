"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Download } from "lucide-react";
import type { CachedLink } from "@/lib/links-cache";

interface Props {
  onClose: () => void;
  onCreated?: (link: CachedLink) => void;
}

export default function CreateLinkModal({ onClose, onCreated }: Props) {
  const [destinationUrl, setDestinationUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ slug: string; shortUrl: string; link: CachedLink } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleCreate = async () => {
    if (!destinationUrl) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: destinationUrl,
          customSlug: slug || undefined,
          expiresAt: expiryDate || undefined,
        }),
      });
      if (!res.ok) {
        let errStr = "Failed to create link";
        try {
          const data = await res.json();
          errStr = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
        } catch {
          errStr = `Server Error: ${res.status} ${res.statusText}`;
        }
        setError(errStr);
      } else {
        const data = await res.json();
        const shortUrl = `${window.location.origin}/${data.slug}`;
        const link: CachedLink = { ...data, _count: { clicks: 0 } };
        setResult({ slug: data.slug, shortUrl, link });
        fetch(`/api/qr?url=${encodeURIComponent(shortUrl)}`)
          .then(r => r.json())
          .then(d => setQrDataUrl(d.qr ?? null))
          .catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-xl bg-[rgba(38,37,40,0.98)] rounded-3xl border border-[rgba(72,71,74,0.15)] shadow-[0_40px_80px_0_rgba(189,157,255,0.12)] overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute bottom-[-95px] right-[-95px] w-64 h-64 rounded-xl bg-[rgba(189,157,255,0.1)] blur-[50px] pointer-events-none" />
        <div className="absolute top-[-95px] left-[-95px] w-64 h-64 rounded-xl bg-[rgba(195,139,245,0.1)] blur-[50px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-8 pb-4 relative z-10">
          <div>
            <h2 className="text-[#f9f5f8] font-black text-3xl tracking-tight">Create New Link</h2>
            <p className="text-[#adaaad] text-sm mt-1">Configure your shortlink below.</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#adaaad] hover:text-[#f9f5f8] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pb-8 flex flex-col gap-6 relative z-10">
          {result ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-6 py-2">
              {qrDataUrl ? (
                <div className="relative group">
                  <img src={qrDataUrl} alt="QR code" className="w-40 h-40 rounded-2xl border border-[rgba(189,157,255,0.2)]" />
                  <a
                    href={qrDataUrl}
                    download={`qr-${result.slug}.png`}
                    className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                  >
                    <Download size={28} className="text-white" />
                  </a>
                </div>
              ) : (
                <div className="w-40 h-40 rounded-2xl border border-[rgba(72,71,74,0.2)] bg-[#19191c] flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#bd9dff] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {qrDataUrl && (
                <a href={qrDataUrl} download={`qr-${result.slug}.png`} className="flex items-center gap-1.5 text-[#adaaad] hover:text-[#bd9dff] text-xs font-bold transition-colors -mt-3">
                  <Download size={12} /> Download QR PNG
                </a>
              )}
              <div className="w-full text-center">
                <p className="text-[#adaaad] text-xs mb-2">Link created successfully</p>
                <div className="flex items-center gap-2 bg-[#131315] border border-[rgba(189,157,255,0.2)] rounded-xl px-4 py-3">
                  <span className="text-[#bd9dff] font-bold text-sm flex-1 text-left truncate">{result.shortUrl}</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    style={copied
                      ? { background: "rgba(189,157,255,0.15)", color: "#bd9dff" }
                      : { background: "#2c2c2f", color: "#f9f5f8" }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <button
                onClick={() => { if (result) onCreated?.(result.link); onClose(); }}
                className="w-full py-3 rounded-xl font-bold text-sm text-black transition-opacity hover:opacity-90"
                style={{ backgroundImage: "linear-gradient(135deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)" }}
              >
                Done
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              {/* Destination URL */}
              <div className="flex flex-col gap-2">
                <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase">
                  Destination URL *
                </label>
                <div className="bg-black rounded-lg border border-[rgba(72,71,74,0.15)] px-4 py-[18px] focus-within:border-[rgba(189,157,255,0.4)] transition-colors">
                  <input
                    type="url"
                    placeholder="https://your-destination-url.com"
                    value={destinationUrl}
                    onChange={e => setDestinationUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
                    autoFocus
                    className="bg-transparent text-[#f9f5f8] text-base outline-none w-full placeholder-[rgba(173,170,173,0.4)]"
                  />
                </div>
              </div>

              {/* Slug + Expiry */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase">
                    Custom Slug
                  </label>
                  <div className="bg-black rounded-lg border border-[rgba(72,71,74,0.15)] flex items-center overflow-hidden focus-within:border-[rgba(189,157,255,0.4)] transition-colors">
                    <span className="pl-4 text-[rgba(173,170,173,0.5)] text-xs font-medium shrink-0 truncate max-w-[100px]">
                      {origin ? origin.replace(/^https?:\/\//, "") + "/" : "…/"}
                    </span>
                    <input
                      type="text"
                      placeholder="my-slug"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      className="bg-transparent text-[#f9f5f8] text-sm outline-none flex-1 px-2 py-[18px] placeholder-[rgba(173,170,173,0.4)]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase">
                    Expiry Date
                  </label>
                  <div className="bg-black rounded-lg border border-[rgba(72,71,74,0.15)] px-4 py-[14px] flex items-center gap-2 focus-within:border-[rgba(189,157,255,0.4)] transition-colors">
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={e => setExpiryDate(e.target.value)}
                      className="bg-transparent text-[#f9f5f8] text-base outline-none flex-1 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-[#ff6060] text-sm flex items-center gap-2">
                  <span>✗</span> {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-4 items-center pt-4 border-t border-[rgba(72,71,74,0.1)]">
                <button
                  onClick={handleCreate}
                  disabled={loading || !destinationUrl}
                  className="flex-1 py-4 rounded-lg font-bold text-sm text-[#3c0089] text-center transition-opacity disabled:opacity-50 shadow-[0_20px_40px_0_rgba(189,157,255,0.2)]"
                  style={{ backgroundImage: "linear-gradient(135deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)" }}
                >
                  {loading ? "Creating…" : "Create Link"}
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-4 rounded-lg text-[#adaaad] font-bold text-sm hover:text-[#f9f5f8] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
