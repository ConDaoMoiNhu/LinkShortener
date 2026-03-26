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
  const [hovered, setHovered] = useState(false);
  const shortUrl = `${baseUrl}/${link.slug}`;
  const displayShort = shortUrl.replace(/^https?:\/\//, "");

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

  const date = new Date(link.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

  return (
    <div
      className="link-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "12px 16px",
        background: hovered ? "var(--bg-subtle)" : "transparent",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* URLs */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "var(--font-geist-mono)",
            color: "var(--accent)",
            textDecoration: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            letterSpacing: "-0.02em",
            marginBottom: "2px",
          }}
        >
          {displayShort}
        </a>
        <p style={{
          fontSize: "11px",
          color: "var(--text-tertiary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {link.originalUrl}
        </p>
      </div>

      {/* Clicks */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "4px" }}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="2.5" fill="var(--text-tertiary)" />
          <path d="M6 1v1.5M6 9.5V11M1 6h1.5M9.5 6H11" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span style={{
          fontSize: "11px",
          fontFamily: "var(--font-geist-mono)",
          color: "var(--text-secondary)",
          tabularNums: "true",
        } as React.CSSProperties}>
          {link._count.clicks}
        </span>
      </div>

      {/* Date */}
      <span style={{
        fontSize: "11px",
        color: "var(--text-tertiary)",
        fontFamily: "var(--font-geist-mono)",
        flexShrink: 0,
        display: "none",
      }} className="md:block">
        {date}
      </span>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        <button
          onClick={handleCopy}
          style={{
            padding: "4px 10px",
            borderRadius: "5px",
            border: copied ? "1px solid var(--accent-border)" : "1px solid var(--border-strong)",
            background: copied ? "var(--accent-subtle)" : "transparent",
            color: copied ? "var(--accent)" : "var(--text-tertiary)",
            fontSize: "11px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
            fontFamily: "var(--font-geist-mono)",
            transform: copied ? "scale(0.96)" : "scale(1)",
          }}
        >
          {copied ? "✓ copied" : "copy"}
        </button>
        <button
          onClick={handleDelete}
          style={{
            padding: "4px 8px",
            borderRadius: "5px",
            border: "1px solid transparent",
            background: "transparent",
            color: "var(--text-tertiary)",
            fontSize: "11px",
            cursor: "pointer",
            transition: "color 0.15s",
            opacity: hovered ? 1 : 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}
        >
          del
        </button>
      </div>
    </div>
  );
}
