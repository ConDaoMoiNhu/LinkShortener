"use client";

import { useEffect, useState, useCallback } from "react";
import CreateLinkForm from "./components/CreateLinkForm";
import LinkCard from "./components/LinkCard";

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

export default function DashboardClient({ user }: { user: User }) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [baseUrl, setBaseUrl] = useState("");
  const [showModal, setShowModal] = useState(false);

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

      {/* Stats bento grid */}
      <div className="fade-up" style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px", marginBottom: "48px", animationDelay: "0.07s",
      }}>
        {/* Total clicks */}
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
            }}>Total Clicks</p>
            <p style={{
              fontSize: "clamp(44px,7vw,68px)", fontWeight: 900,
              letterSpacing: "-0.05em", color: S.primary, lineHeight: 1,
            }}>
              {totalClicks >= 1000
                ? `${(totalClicks / 1000).toFixed(1)}k`
                : totalClicks}
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

        {/* Links count */}
        <div style={{
          background: S.surfaceContainer, borderRadius: "16px", padding: "32px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          border: "1px solid rgba(72,71,74,0.05)",
        }}>
          <p style={{
            fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em",
            color: S.onSurfaceVariant, fontWeight: 700, marginBottom: "8px",
          }}>Links</p>
          <p style={{
            fontSize: "48px", fontWeight: 900, letterSpacing: "-0.05em",
            color: S.onSurface, lineHeight: 1,
          }}>{links.length}</p>
        </div>
      </div>

      {/* Recent links */}
      <div className="fade-up" style={{ animationDelay: "0.14s" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "16px",
        }}>
          <h2 style={{
            fontSize: "18px", fontWeight: 700, color: S.onSurface, letterSpacing: "-0.02em",
          }}>Recent Links</h2>
          {links.length > 0 && (
            <span style={{ fontSize: "11px", color: S.onSurfaceVariant, fontWeight: 500 }}>
              {links.length} link{links.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {links.length === 0 ? (
          <div style={{
            background: S.surfaceContainer, borderRadius: "16px",
            padding: "72px 24px", textAlign: "center",
            border: "1px dashed rgba(72,71,74,0.2)",
          }}>
            <p style={{
              fontSize: "48px", fontWeight: 900, letterSpacing: "-0.05em",
              color: "rgba(189,157,255,0.2)", marginBottom: "12px", lineHeight: 1,
            }}>↗</p>
            <p style={{ fontSize: "16px", color: S.onSurfaceVariant, marginBottom: "4px", fontWeight: 600 }}>
              Chưa có link nào
            </p>
            <p style={{ fontSize: "13px", color: "rgba(173,170,173,0.5)" }}>
              Nhấn "Tạo link mới" để bắt đầu
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {links.map((link) => (
              <LinkCard
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
