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
    year: "numeric",
  });

  return (
    <div
      className="link-row"
      style={{
        display: "flex", alignItems: "center", gap: "16px",
        padding: "18px 20px", borderRadius: "14px",
        background: hovered ? "#1f1f22" : "#19191c",
        border: hovered ? "1px solid rgba(189,157,255,0.25)" : "1px solid rgba(72,71,74,0.1)",
        transform: hovered ? "scale(1.005)" : "scale(1)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* URL info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontSize: "15px", fontWeight: 700, letterSpacing: "-0.02em",
              color: "#f9f5f8",
              display: "block",
            }}
          >
            <span style={{ color: "rgba(249,245,248,0.35)", fontWeight: 400 }}>{domain}/</span>
            <span style={{ color: "#bd9dff" }}>{link.slug}</span>
          </a>
        </div>
        <p style={{
          fontSize: "12px", color: "rgba(173,170,173,0.5)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {link.originalUrl}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        flexShrink: 0, textAlign: "center",
        padding: "0 20px", borderLeft: "1px solid rgba(72,71,74,0.1)",
        borderRight: "1px solid rgba(72,71,74,0.1)",
      }} className="hidden sm:block">
        <p style={{
          fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em",
          color: "rgba(173,170,173,0.5)", fontWeight: 700, marginBottom: "4px",
        }}>Clicks</p>
        <p style={{
          fontSize: "20px", fontWeight: 900, letterSpacing: "-0.04em",
          color: "#f9f5f8",
        }}>{link._count.clicks}</p>
      </div>

      {/* Date */}
      <span style={{
        fontSize: "11px", color: "rgba(173,170,173,0.4)",
        flexShrink: 0, fontVariantNumeric: "tabular-nums",
      }} className="hidden lg:block">
        {date}
      </span>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={handleCopy}
          title="Copy link"
          style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "#1f1f22", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: copied ? "#bd9dff" : "rgba(173,170,173,0.6)",
            transition: "all 0.2s", fontSize: "15px",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#2c2c2f";
            e.currentTarget.style.color = "#bd9dff";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#1f1f22";
            e.currentTarget.style.color = copied ? "#bd9dff" : "rgba(173,170,173,0.6)";
          }}
        >
          {copied ? "✓" : "⎘"}
        </button>

        <button
          onClick={handleDelete}
          title="Xoá link"
          style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "#1f1f22", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(173,170,173,0.6)",
            transition: "all 0.2s", fontSize: "14px",
            opacity: hovered ? 1 : 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(167,1,56,0.15)";
            e.currentTarget.style.color = "#ff6e84";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#1f1f22";
            e.currentTarget.style.color = "rgba(173,170,173,0.6)";
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
