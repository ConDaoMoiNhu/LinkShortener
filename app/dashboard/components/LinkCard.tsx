"use client";

import { useState } from "react";

interface LinkItem {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  _count: { clicks: number };
}

interface Props {
  link: LinkItem;
  baseUrl: string;
  onDeleted: () => void;
}

export default function LinkCard({ link, baseUrl, onDeleted }: Props) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const shortUrl = `${baseUrl}/${link.slug}`;
  const domain = baseUrl.replace(/^https?:\/\//, "");

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
      className="link-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "14px 18px",
        background: hovered ? "var(--bg-subtle)" : "transparent",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* URLs */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Short URL — domain dim, slug prominent */}
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textDecoration: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: "3px",
          }}
        >
          <span className="mono" style={{
            fontSize: "12px",
            color: "var(--text-tertiary)",
            letterSpacing: "-0.01em",
          }}>
            {domain}/
          </span>
          <span className="mono" style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "-0.01em",
          }}>
            {link.slug}
          </span>
        </a>

        {/* Original URL */}
        <p style={{
          fontSize: "12px",
          color: "var(--text-tertiary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {link.originalUrl}
        </p>
      </div>

      {/* Clicks */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 8px",
        background: "var(--bg-muted)",
        borderRadius: "5px",
      }}>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M6 1C3.24 1 1 3.24 1 6s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill="var(--text-tertiary)"/>
        </svg>
        <span className="mono" style={{
          fontSize: "11px",
          color: "var(--text-secondary)",
          fontVariantNumeric: "tabular-nums",
        }}>
          {link._count.clicks}
        </span>
      </div>

      {/* Date */}
      <span className="mono" style={{
        fontSize: "11px",
        color: "var(--text-tertiary)",
        flexShrink: 0,
        display: window?.innerWidth > 480 ? "block" : "none",
      }}>
        {date}
      </span>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        <button
          onClick={handleCopy}
          className="mono"
          style={{
            padding: "4px 10px",
            borderRadius: "6px",
            border: copied
              ? "1px solid var(--accent-border)"
              : "1px solid var(--border)",
            background: copied ? "var(--accent-subtle)" : "transparent",
            color: copied ? "var(--accent)" : "var(--text-tertiary)",
            fontSize: "11px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
            transform: copied ? "scale(0.95)" : "scale(1)",
          }}
        >
          {copied ? "✓ copied" : "copy"}
        </button>

        <button
          onClick={handleDelete}
          className="mono"
          style={{
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid transparent",
            background: "transparent",
            color: "var(--text-tertiary)",
            fontSize: "11px",
            cursor: "pointer",
            transition: "color 0.15s, opacity 0.15s",
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
