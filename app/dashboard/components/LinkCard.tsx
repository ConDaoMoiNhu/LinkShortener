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
  const shortUrl = `${baseUrl}/${link.slug}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm("Xoá link này?")) return;
    await fetch(`/api/links/${link.id}`, { method: "DELETE" });
    onDeleted();
  }

  const date = new Date(link.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div
      className="group flex items-center gap-4 px-4 py-3 transition-colors"
      style={{ background: "var(--bg)" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-subtle)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--bg)")}
    >
      {/* URLs */}
      <div className="flex-1 min-w-0">
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium font-mono hover:underline block truncate"
          style={{ color: "var(--accent)" }}
        >
          {shortUrl.replace(/^https?:\/\//, "")}
        </a>
        <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-tertiary)" }}>
          {link.originalUrl}
        </p>
      </div>

      {/* Clicks */}
      <div className="hidden sm:flex items-center gap-1 shrink-0">
        <span className="text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
          {link._count.clicks} clicks
        </span>
      </div>

      {/* Date */}
      <span className="hidden md:block text-xs shrink-0" style={{ color: "var(--text-tertiary)" }}>
        {date}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleCopy}
          className="px-2.5 py-1 rounded text-xs font-medium border transition-colors"
          style={{
            background: copied ? "var(--accent-subtle)" : "transparent",
            color: copied ? "var(--accent)" : "var(--text-tertiary)",
            borderColor: copied ? "transparent" : "var(--border)",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          onClick={handleDelete}
          className="px-2 py-1 rounded text-xs transition-colors opacity-0 group-hover:opacity-100"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--danger)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)")}
        >
          Xoá
        </button>
      </div>
    </div>
  );
}
