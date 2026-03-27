"use client";

import { useEffect, useState, useCallback } from "react";
import CreateLinkForm from "./components/CreateLinkForm";

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface LinkItem {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string | null;
  _count: { clicks: number };
}

type FilterType = "all" | "active" | "expired";

const S = {
  surface: "#0e0e10",
  surfaceLow: "#131315",
  surfaceContainer: "#19191c",
  surfaceHigh: "#1f1f22",
  surfaceBright: "#2c2c2f",
  onSurface: "#f9f5f8",
  onSurfaceVariant: "#adaaad",
  primary: "#bd9dff",
};

function isExpired(link: LinkItem): boolean {
  if (!link.expiresAt) return false;
  return new Date(link.expiresAt) < new Date();
}

function isActive(link: LinkItem): boolean {
  return !isExpired(link);
}

function formatClicks(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/* ── Stitch-style link card (horizontal, matches design) ── */
function StitchLinkCard({
  link,
  baseUrl,
  onDeleted,
}: {
  link: LinkItem;
  baseUrl: string;
  onDeleted: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const shortUrl = `${baseUrl}/${link.slug}`;
  const expired = isExpired(link);

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleQr() {
    window.open(
      `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shortUrl)}&size=300x300`,
      "_blank"
    );
  }

  async function handleDelete() {
    if (!confirm("Xoá link này?")) return;
    await fetch(`/api/links/${link.id}`, { method: "DELETE" });
    onDeleted();
  }

  const badge = expired
    ? { bg: "rgba(167,1,56,0.18)", color: "#ff6e84", border: "rgba(167,1,56,0.28)", label: "EXPIRED" }
    : { bg: "rgba(255,142,172,0.15)", color: "#ff8eac", border: "rgba(255,142,172,0.25)", label: "ACTIVE" };

  const btn: React.CSSProperties = {
    width: "40px", height: "40px", borderRadius: "10px",
    background: S.surfaceHigh, border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s", fontFamily: "inherit", color: S.onSurfaceVariant,
    fontSize: "15px",
  };

  return (
    <div
      style={{
        background: S.surfaceContainer, borderRadius: "14px", padding: "20px",
        border: hovered ? "1px solid rgba(189,157,255,0.3)" : "1px solid rgba(72,71,74,0.1)",
        transform: hovered ? "scale(1.01)" : "scale(1)",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left: info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <a
            href={shortUrl} target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: "15px", fontWeight: 700, letterSpacing: "-0.02em",
              color: S.onSurface, textDecoration: "none",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            {shortUrl.replace(/^https?:\/\//, "")}
          </a>
          <span style={{
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", flexShrink: 0,
            padding: "2px 8px", borderRadius: "4px",
            background: badge.bg, color: badge.color,
            border: `1px solid ${badge.border}`,
          }}>{badge.label}</span>
        </div>
        <p style={{
          fontSize: "12px", color: "rgba(173,170,173,0.45)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{link.originalUrl}</p>
      </div>

      {/* Middle: clicks */}
      <div style={{
        textAlign: "center", padding: "0 24px",
        borderLeft: "1px solid rgba(72,71,74,0.12)",
        borderRight: "1px solid rgba(72,71,74,0.12)",
        flexShrink: 0,
      }} className="hidden sm:block">
        <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(173,170,173,0.5)", fontWeight: 700, marginBottom: "4px" }}>Clicks</p>
        <p style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.04em", color: S.onSurface, lineHeight: 1 }}>
          {formatClicks(link._count.clicks)}
        </p>
      </div>

      {/* Right: actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <button onClick={handleCopy} title={copied ? "Đã copy!" : "Copy link"}
          style={{ ...btn, color: copied ? S.primary : S.onSurfaceVariant }}
          onMouseEnter={e => { e.currentTarget.style.background = S.surfaceBright; e.currentTarget.style.color = S.primary; }}
          onMouseLeave={e => { e.currentTarget.style.background = S.surfaceHigh; e.currentTarget.style.color = copied ? S.primary : S.onSurfaceVariant; }}
        >
          {copied
            ? <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check</span>
            : <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>content_copy</span>}
        </button>

        <button onClick={handleQr} title="QR code"
          style={btn}
          onMouseEnter={e => { e.currentTarget.style.background = S.surfaceBright; e.currentTarget.style.color = S.onSurface; }}
          onMouseLeave={e => { e.currentTarget.style.background = S.surfaceHigh; e.currentTarget.style.color = S.onSurfaceVariant; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>qr_code_2</span>
        </button>

        <button onClick={handleDelete} title="Xoá link"
          style={btn}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(167,1,56,0.15)"; e.currentTarget.style.color = "#ff6e84"; }}
          onMouseLeave={e => { e.currentTarget.style.background = S.surfaceHigh; e.currentTarget.style.color = S.onSurfaceVariant; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
        </button>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function DashboardClient({ user }: { user: User }) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [baseUrl, setBaseUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const totalClicks = links.reduce((sum, l) => sum + l._count.clicks, 0);
  const thisWeek = links.filter(
    (l) => Date.now() - new Date(l.createdAt).getTime() < 7 * 86400000
  ).length;

  const filteredLinks = links.filter((l) => {
    if (filter === "active") return isActive(l);
    if (filter === "expired") return isExpired(l);
    return true;
  });

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "expired", label: "Expired" },
  ];

  return (
    <div style={{ padding: "24px 32px", maxWidth: "960px", margin: "0 auto" }}>

      {/* Page header */}
      <div className="fade-up" style={{
        display: "flex", flexWrap: "wrap", alignItems: "flex-end",
        justifyContent: "space-between", gap: "16px", marginBottom: "40px",
      }}>
        <div>
          <h1 style={{
            fontSize: "clamp(28px,4vw,42px)", fontWeight: 900,
            letterSpacing: "-0.04em", color: S.onSurface, lineHeight: 1,
            marginBottom: "6px",
          }}>Overview</h1>
          <p style={{ fontSize: "14px", color: S.onSurfaceVariant, fontWeight: 500 }}>
            {user.name ? `Xin chào, ${user.name.split(" ").pop()}` : "Quản lý links của bạn"}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="liquid-gradient"
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 24px", borderRadius: "12px", border: "none",
            color: "#000", fontSize: "14px", fontWeight: 700,
            cursor: "pointer", flexShrink: 0,
            boxShadow: "0 20px 40px rgba(189,157,255,0.2)",
            transition: "transform 0.2s, filter 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.filter = "brightness(1.08)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.filter = "brightness(1)";
          }}
        >
          <span style={{ fontSize: "18px", fontWeight: 400 }}>+</span>
          Tạo link mới
        </button>
      </div>

      {/* ── Stats Bento Grid (2-col) ── */}
      <div className="fade-up" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px", marginBottom: "48px", animationDelay: "0.07s",
      }}>

        {/* Total Engagement — spans 2 cols */}
        <div style={{
          gridColumn: "span 2",
          background: S.surfaceLow, borderRadius: "16px", padding: "32px", minHeight: "160px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          position: "relative", overflow: "hidden",
          border: "1px solid rgba(72,71,74,0.05)",
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{
              fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em",
              color: S.onSurfaceVariant, fontWeight: 700, marginBottom: "12px",
            }}>Total Engagement</p>
            <p style={{
              fontSize: "clamp(44px,7vw,68px)", fontWeight: 900,
              letterSpacing: "-0.05em", color: S.primary, lineHeight: 1,
            }}>
              {formatClicks(totalClicks)}
            </p>
          </div>
          <p style={{ fontSize: "13px", color: "#ff8eac", fontWeight: 700, position: "relative", zIndex: 1 }}>
            {thisWeek > 0 ? `+${thisWeek} link tuần này` : "Chưa có link tuần này"}
          </p>
          <div style={{
            position: "absolute", right: "-40px", bottom: "-40px",
            width: "200px", height: "200px",
            background: "rgba(189,157,255,0.05)", borderRadius: "50%",
            filter: "blur(40px)", pointerEvents: "none",
          }} />
        </div>

        {/* Active Links */}
        <div style={{
          background: S.surfaceContainer, borderRadius: "16px", padding: "32px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          border: "1px solid rgba(72,71,74,0.05)",
        }}>
          <p style={{
            fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em",
            color: S.onSurfaceVariant, fontWeight: 700, marginBottom: "8px",
          }}>Active Links</p>
          <p style={{
            fontSize: "48px", fontWeight: 900, letterSpacing: "-0.05em",
            color: S.onSurface, lineHeight: 1,
          }}>{links.length}</p>
        </div>
      </div>

      {/* ── Recent Links header ── */}
      <div className="fade-up" style={{ animationDelay: "0.14s" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "16px",
          flexWrap: "wrap", gap: "12px",
        }}>
          {/* Left: title + filter tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h2 style={{
              fontSize: "18px", fontWeight: 700, color: S.onSurface,
              letterSpacing: "-0.02em",
            }}>Recent Links</h2>

            {/* Filter pill tabs */}
            <div style={{ display: "flex", gap: "6px" }}>
              {filterTabs.map((tab) => {
                const active = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    style={{
                      padding: "4px 14px", borderRadius: "999px",
                      border: active ? "1px solid rgba(189,157,255,0.2)" : "1px solid rgba(72,71,74,0.15)",
                      background: active ? S.surfaceContainer : "transparent",
                      color: active ? S.primary : S.onSurfaceVariant,
                      fontSize: "12px", fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                      if (!active) e.currentTarget.style.background = S.surfaceContainer;
                    }}
                    onMouseLeave={e => {
                      if (!active) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Sort button */}
          <button
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 14px", borderRadius: "10px",
              border: "1px solid rgba(72,71,74,0.15)",
              background: "transparent", color: S.onSurfaceVariant,
              fontSize: "12px", fontWeight: 500, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = S.surfaceContainer;
              e.currentTarget.style.color = S.onSurface;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = S.onSurfaceVariant;
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>filter_list</span>
            Sort by: Date
          </button>
        </div>

        {/* ── Link list ── */}
        {filteredLinks.length === 0 ? (
          <div style={{
            background: S.surfaceContainer, borderRadius: "16px",
            padding: "72px 24px", textAlign: "center",
            border: "1px dashed rgba(72,71,74,0.2)",
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: "48px", color: "rgba(189,157,255,0.2)",
              display: "block", marginBottom: "12px",
            }}>link_off</span>
            <p style={{ fontSize: "16px", color: S.onSurfaceVariant, marginBottom: "4px", fontWeight: 600 }}>
              {filter === "all" ? "Chưa có link nào" : `Không có link ${filter}`}
            </p>
            <p style={{ fontSize: "13px", color: "rgba(173,170,173,0.5)" }}>
              {filter === "all" ? `Nhấn "Tạo link mới" để bắt đầu` : "Thử chọn filter khác"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredLinks.map((link) => (
              <StitchLinkCard
                key={link.id}
                link={link}
                baseUrl={baseUrl}
                onDeleted={fetchLinks}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Create link modal ── */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="scale-in glass-card ghost-border"
            style={{
              width: "100%", maxWidth: "560px", borderRadius: "24px",
              overflow: "hidden", position: "relative",
              boxShadow: "0 40px 80px rgba(189,157,255,0.15)",
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: "32px 32px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            }}>
              <div>
                <h2 style={{
                  fontSize: "28px", fontWeight: 900, letterSpacing: "-0.04em",
                  color: S.onSurface, marginBottom: "4px",
                }}>Tạo link mới</h2>
                <p style={{ fontSize: "13px", color: S.onSurfaceVariant, fontWeight: 500 }}>
                  Rút gọn URL của bạn ngay lập tức
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "transparent", border: "none", color: S.onSurfaceVariant,
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "20px", transition: "background 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = S.surfaceBright)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: "8px 32px 32px" }}>
              <CreateLinkForm
                onCreated={() => {
                  fetchLinks();
                  setShowModal(false);
                }}
              />
            </div>

            {/* Decorative glows */}
            <div style={{
              position: "absolute", bottom: "-60px", right: "-60px",
              width: "200px", height: "200px",
              background: "rgba(189,157,255,0.08)", borderRadius: "50%",
              filter: "blur(60px)", pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", top: "-60px", left: "-60px",
              width: "200px", height: "200px",
              background: "rgba(195,139,245,0.06)", borderRadius: "50%",
              filter: "blur(60px)", pointerEvents: "none",
            }} />
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        className="md:hidden liquid-gradient"
        onClick={() => setShowModal(true)}
        style={{
          position: "fixed", bottom: "88px", right: "24px", zIndex: 49,
          width: "56px", height: "56px", borderRadius: "50%",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "26px", fontWeight: 300, color: "#000",
          boxShadow: "0 8px 24px rgba(189,157,255,0.35)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        +
      </button>

    </div>
  );
}
