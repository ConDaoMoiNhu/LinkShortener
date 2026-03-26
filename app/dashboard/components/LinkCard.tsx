"use client";

import { useState } from "react";

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  _count: { clicks: number };
}

interface Props {
  link: Link;
  baseUrl: string;
  onDeleted: () => void;
}

export default function LinkCard({ link, baseUrl, onDeleted }: Props) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const shortUrl = `${baseUrl}/${link.slug}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm("Xoá link này?")) return;
    setDeleting(true);
    await fetch(`/api/links/${link.id}`, { method: "DELETE" });
    onDeleted();
  }

  const date = new Date(link.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div
      className="group rounded-xl px-4 py-4 border flex items-center gap-4 transition-all duration-200"
      style={{
        background: "#0D0D16",
        borderColor: "rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.12)";
        (e.currentTarget as HTMLDivElement).style.background = "#0F0F1A";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLDivElement).style.background = "#0D0D16";
      }}
    >
      {/* Accent bar */}
      <div
        className="w-0.5 h-8 rounded-full shrink-0"
        style={{ background: "#D4FF5C", opacity: 0.6 }}
      />

      {/* URLs */}
      <div className="flex-1 min-w-0">
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm font-medium hover:underline block truncate"
          style={{ color: "#D4FF5C" }}
        >
          {shortUrl.replace(/^https?:\/\//, "")}
        </a>
        <p className="text-xs truncate mt-0.5" style={{ color: "#58566E" }}>
          {link.originalUrl}
        </p>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-1 shrink-0">
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#58566E" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <span className="text-xs font-mono" style={{ color: "#58566E" }}>
          {link._count.clicks}
        </span>
      </div>

      {/* Date */}
      <span className="hidden md:block text-xs shrink-0" style={{ color: "#2E2E42" }}>
        {date}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
          style={{
            background: copied ? "rgba(212,255,92,0.12)" : "rgba(255,255,255,0.04)",
            color: copied ? "#D4FF5C" : "#58566E",
            border: `1px solid ${copied ? "rgba(212,255,92,0.2)" : "transparent"}`,
          }}
        >
          {copied ? (
            <>
              <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy
            </>
          )}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{ color: "#58566E" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#FF4D4D";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,77,77,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#58566E";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
