"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function CreateLinkModal({ onClose }: Props) {
  const [destinationUrl, setDestinationUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ slug: string } | null>(null);

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
        const data = await res.json();
        setError(data.error ?? "Lỗi tạo link");
      } else {
        const data = await res.json();
        setResult(data);
        setTimeout(onClose, 1500);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[rgba(38,37,40,0.95)] rounded-3xl border border-[rgba(72,71,74,0.15)] shadow-[0_40px_80px_0_rgba(189,157,255,0.12)] overflow-hidden">
        <div className="absolute bottom-[-95px] right-[-95px] w-64 h-64 rounded-xl bg-[rgba(189,157,255,0.1)] blur-[50px] pointer-events-none" />
        <div className="absolute top-[-95px] left-[-95px] w-64 h-64 rounded-xl bg-[rgba(195,139,245,0.1)] blur-[50px] pointer-events-none" />

        <div className="flex items-start justify-between px-8 pt-8 pb-4 relative z-10">
          <div>
            <h2 className="text-[#f9f5f8] font-black text-3xl tracking-tight">Create New Link</h2>
            <p className="text-[#adaaad] text-sm mt-1">Configure your shortlink.</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#adaaad] hover:text-[#f9f5f8] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-6 relative z-10">
          <div className="flex flex-col gap-2">
            <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase">
              Destination URL *
            </label>
            <div className="bg-black rounded-lg border border-[rgba(72,71,74,0.15)] px-4 py-[18px]">
              <input
                type="url"
                placeholder="https://your-destination-url.com"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                className="bg-transparent text-[#f9f5f8] text-base outline-none w-full placeholder-[rgba(173,170,173,0.4)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase">
                Custom Slug
              </label>
              <div className="bg-black rounded-lg border border-[rgba(72,71,74,0.15)] flex items-center">
                <span className="pl-4 text-[rgba(173,170,173,0.5)] text-sm font-medium shrink-0">sn.lk/</span>
                <input
                  type="text"
                  placeholder="my-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent text-[#f9f5f8] text-sm outline-none flex-1 px-2 py-[18px] placeholder-[rgba(173,170,173,0.4)]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase">
                Expiry Date
              </label>
              <div className="bg-black rounded-lg border border-[rgba(72,71,74,0.15)] px-4 py-[14px] flex items-center gap-2">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="bg-transparent text-[#f9f5f8] text-base outline-none flex-1 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-[#ff6060] text-sm">{error}</p>
          )}

          {result && (
            <p className="text-[#bd9dff] text-sm font-bold">
              ✓ Link tạo thành công: /{result.slug}
            </p>
          )}

          <div className="flex gap-4 items-center pt-4 border-t border-[rgba(72,71,74,0.1)]">
            <button
              onClick={handleCreate}
              disabled={loading || !!result}
              className="flex-1 py-4 rounded-lg font-bold text-sm text-[#3c0089] text-center transition-opacity disabled:opacity-70 shadow-[0_20px_40px_0_rgba(189,157,255,0.2)]"
              style={{ backgroundImage: "linear-gradient(135deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)" }}
            >
              {loading ? "Creating..." : result ? "Created! ✓" : "Create Link"}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 rounded-lg text-[#adaaad] font-bold text-sm hover:text-[#f9f5f8] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
