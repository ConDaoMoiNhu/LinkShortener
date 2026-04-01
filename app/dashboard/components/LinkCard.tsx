"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Check, Pencil, Trash2, X } from "lucide-react";
import type { CachedLink } from "@/lib/links-cache";

const EditLinkModal = dynamic(() => import("./EditLinkModal"), { ssr: false });

interface LinkItem {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string | null;
  _count: { clicks: number };
}

interface Props {
  link: LinkItem;
  baseUrl: string;
  onDeleted: () => void;
  onUpdated?: (updated: LinkItem) => void;
}

function StatusBadge({ expiresAt }: { expiresAt?: string | null }) {
  const badgeBase: React.CSSProperties = {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    padding: "2px 8px",
    borderRadius: "4px",
    flexShrink: 0,
    userSelect: "none",
  };

  if (!expiresAt) {
    return (
      <span style={{
        ...badgeBase,
        background: "rgba(74,222,128,0.12)",
        color: "#4ade80",
      }}>
        ACTIVE
      </span>
    );
  }

  const expDate = new Date(expiresAt);
  const now = new Date();

  if (expDate < now) {
    return (
      <span style={{
        ...badgeBase,
        background: "rgba(255,110,132,0.12)",
        color: "#ff6e84",
      }}>
        EXPIRED
      </span>
    );
  }

  const formatted = expDate.toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <span
      title={`Hết hạn: ${formatted}`}
      style={{
        ...badgeBase,
        background: "rgba(74,222,128,0.12)",
        color: "#4ade80",
        cursor: "default",
      }}
    >
      ACTIVE
    </span>
  );
}

export default function LinkCard({ link, baseUrl, onDeleted, onUpdated }: Props) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [editLink, setEditLink] = useState<LinkItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const shortUrl = `${baseUrl}/${link.slug}`;
  const domain = baseUrl.replace(/^https?:\/\//, "");

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    await fetch(`/api/links/${link.id}`, { method: "DELETE" });
    onDeleted();
  }

  const date = new Date(link.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  const btnBase: React.CSSProperties = {
    width: "40px", height: "40px", borderRadius: "10px",
    background: "#1f1f22", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s",
  };

  return (
    <div
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
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
    >
      {/* URL info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontSize: "15px", fontWeight: 700, letterSpacing: "-0.02em",
              color: "#f9f5f8", display: "block",
            }}
          >
            <span style={{ color: "rgba(249,245,248,0.35)", fontWeight: 400 }}>{domain}/</span>
            <span style={{ color: "#bd9dff" }}>{link.slug}</span>
          </a>
          <StatusBadge expiresAt={link.expiresAt} />
        </div>
        <p style={{
          fontSize: "12px", color: "rgba(173,170,173,0.5)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {link.originalUrl}
        </p>
      </div>

      {/* Clicks */}
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
          fontSize: "20px", fontWeight: 900, letterSpacing: "-0.04em", color: "#f9f5f8",
        }}>
          {link._count.clicks}
        </p>
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
            ...btnBase,
            color: copied ? "#bd9dff" : "rgba(173,170,173,0.6)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#2c2c2f"; e.currentTarget.style.color = "#bd9dff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#1f1f22"; e.currentTarget.style.color = copied ? "#bd9dff" : "rgba(173,170,173,0.6)"; }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
        <button
          onClick={() => setEditLink(link)}
          title="Edit link"
          style={{
            ...btnBase,
            color: "rgba(173,170,173,0.6)",
            opacity: hovered ? 1 : 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(189,157,255,0.1)"; e.currentTarget.style.color = "#bd9dff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#1f1f22"; e.currentTarget.style.color = "rgba(173,170,173,0.6)"; }}
        >
          <Pencil size={14} />
        </button>

        {confirmDelete ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={handleDelete}
              title="Confirm delete"
              style={{ ...btnBase, background: "rgba(167,1,56,0.2)", color: "#ff6e84", width: "auto", padding: "0 10px", fontSize: "11px", fontWeight: 700 }}
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              title="Cancel"
              style={{ ...btnBase, color: "rgba(173,170,173,0.6)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#2c2c2f"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1f1f22"; }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            title="Delete link"
            style={{
              ...btnBase,
              color: "rgba(173,170,173,0.6)",
              opacity: hovered ? 1 : 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(167,1,56,0.15)"; e.currentTarget.style.color = "#ff6e84"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1f1f22"; e.currentTarget.style.color = "rgba(173,170,173,0.6)"; }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {editLink && (
        <EditLinkModal
          link={editLink as unknown as CachedLink}
          onClose={() => setEditLink(null)}
          onUpdated={(updated) => {
            setEditLink(null);
            onUpdated?.({ ...link, originalUrl: updated.originalUrl, slug: updated.slug });
          }}
        />
      )}
    </div>
  );
}
