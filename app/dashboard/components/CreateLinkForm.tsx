"use client";

import { useState } from "react";

interface Props {
  onCreated: () => void;
}

export default function CreateLinkForm({ onCreated }: Props) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalUrl: url,
        customSlug: alias || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Có lỗi xảy ra");
      return;
    }

    setUrl("");
    setAlias("");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/duong-dan-dai"
          required
          className="flex-1 px-4 py-2.5 rounded-lg text-sm text-[#F0EEFF] placeholder-[#2E2E42] focus:outline-none transition-all duration-200"
          style={{
            background: "#131320",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(212,255,92,0.4)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,255,92,0.06)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <input
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="alias (tuỳ chọn)"
          className="sm:w-40 px-4 py-2.5 rounded-lg text-sm text-[#F0EEFF] placeholder-[#2E2E42] focus:outline-none font-mono transition-all duration-200"
          style={{
            background: "#131320",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(212,255,92,0.4)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,255,92,0.06)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg text-sm font-display font-700 disabled:opacity-40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          style={{ background: "#D4FF5C", color: "#07070C" }}
          onMouseEnter={(e) => {
            if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#C5F040";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#D4FF5C";
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang tạo
            </span>
          ) : (
            "Rút gọn →"
          )}
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{ background: "rgba(255,77,77,0.08)", border: "1px solid rgba(255,77,77,0.2)", color: "#FF4D4D" }}
        >
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}
    </form>
  );
}
