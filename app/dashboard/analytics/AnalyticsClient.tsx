"use client";

import { useEffect, useState, useCallback } from "react";

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

export default function AnalyticsClient() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const totalClicks = links.reduce((sum, l) => sum + l._count.clicks, 0);
  const thisWeek = links.filter(
    (l) => Date.now() - new Date(l.createdAt).getTime() < 7 * 86400000
  ).length;
  const maxClicks = Math.max(...links.map((l) => l._count.clicks), 1);

  return (
    <div style={{ padding: "24px 32px", maxWidth: "960px", margin: "0 auto" }}>

      {/* Page header */}
      <div className="fade-up" style={{ marginBottom: "40px" }}>
        <h1 style={{
          fontSize: "clamp(28px,4vw,42px)", fontWeight: 900,
          letterSpacing: "-0.04em", color: S.onSurface, lineHeight: 1, marginBottom: "6px",
        }}>Analytics</h1>
        <p style={{ fontSize: "14px", color: S.onSurfaceVariant, fontWeight: 500 }}>
          Theo dõi hiệu suất tất cả links của bạn
        </p>
      </div>

      {/* Stats cards */}
      <div className="fade-up" style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px", marginBottom: "40px", animationDelay: "0.07s",
      }}>

        {/* Total clicks */}
        <div style={{
          background: S.surfaceLow, borderRadius: "16px", padding: "28px",
          position: "relative", overflow: "hidden",
          border: "1px solid rgba(72,71,74,0.05)",
        }}>
          <p style={{
            fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em",
            color: S.onSurfaceVariant, fontWeight: 700, marginBottom: "12px",
          }}>Total Clicks</p>
          <p style={{
            fontSize: "clamp(40px,6vw,56px)", fontWeight: 900,
            letterSpacing: "-0.05em", color: S.primary, lineHeight: 1,
          }}>
            {totalClicks >= 1000 ? `${(totalClicks / 1000).toFixed(1)}k` : totalClicks}
          </p>
          <div style={{
            position: "absolute", right: "-30px", bottom: "-30px",
            width: "120px", height: "120px",
            background: "rgba(189,157,255,0.06)", borderRadius: "50%",
            filter: "blur(30px)", pointerEvents: "none",
          }} />
        </div>

        {/* Total links */}
        <div style={{
          background: S.surfaceContainer, borderRadius: "16px", padding: "28px",
          border: "1px solid rgba(72,71,74,0.05)",
        }}>
          <p style={{
            fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em",
            color: S.onSurfaceVariant, fontWeight: 700, marginBottom: "12px",
          }}>Total Links</p>
          <p style={{
            fontSize: "clamp(40px,6vw,56px)", fontWeight: 900,
            letterSpacing: "-0.05em", color: S.onSurface, lineHeight: 1,
          }}>{links.length}</p>
        </div>

        {/* Created this week */}
        <div style={{
          background: S.surfaceContainer, borderRadius: "16px", padding: "28px",
          border: "1px solid rgba(72,71,74,0.05)",
        }}>
          <p style={{
            fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em",
            color: S.onSurfaceVariant, fontWeight: 700, marginBottom: "12px",
          }}>This Week</p>
          <p style={{
            fontSize: "clamp(40px,6vw,56px)", fontWeight: 900,
            letterSpacing: "-0.05em", color: "#4ade80", lineHeight: 1,
          }}>{thisWeek}</p>
          <p style={{ fontSize: "12px", color: S.onSurfaceVariant, marginTop: "8px" }}>
            links mới
          </p>
        </div>
      </div>

      {/* Links analytics table */}
      <div className="fade-up" style={{ animationDelay: "0.14s" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "16px",
        }}>
          <h2 style={{
            fontSize: "18px", fontWeight: 700, color: S.onSurface, letterSpacing: "-0.02em",
          }}>Tất cả Links</h2>
          {links.length > 0 && (
            <span style={{ fontSize: "11px", color: S.onSurfaceVariant, fontWeight: 500 }}>
              {links.length} link{links.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{
            background: S.surfaceContainer, borderRadius: "16px", padding: "48px 24px",
            textAlign: "center", border: "1px solid rgba(72,71,74,0.1)",
          }}>
            <p style={{ fontSize: "14px", color: S.onSurfaceVariant }}>Đang tải...</p>
          </div>
        ) : links.length === 0 ? (
          <div style={{
            background: S.surfaceContainer, borderRadius: "16px", padding: "72px 24px",
            textAlign: "center", border: "1px dashed rgba(72,71,74,0.2)",
          }}>
            <p style={{
              fontSize: "48px", fontWeight: 900, letterSpacing: "-0.05em",
              color: "rgba(189,157,255,0.2)", marginBottom: "12px", lineHeight: 1,
            }}>↗</p>
            <p style={{ fontSize: "16px", color: S.onSurfaceVariant, marginBottom: "4px", fontWeight: 600 }}>
              Chưa có dữ liệu
            </p>
            <p style={{ fontSize: "13px", color: "rgba(173,170,173,0.5)" }}>
              Tạo link đầu tiên để xem analytics
            </p>
          </div>
        ) : (
          <div style={{
            background: S.surfaceLow, borderRadius: "16px",
            border: "1px solid rgba(72,71,74,0.08)", overflow: "hidden",
          }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 140px",
              padding: "12px 20px",
              borderBottom: "1px solid rgba(72,71,74,0.1)",
            }}>
              {["Link / URL", "Clicks", "Traffic"].map((col) => (
                <span key={col} style={{
                  fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em",
                  color: S.onSurfaceVariant, fontWeight: 700,
                }}>
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {links.map((link, idx) => {
              const pct = maxClicks > 0 ? (link._count.clicks / maxClicks) * 100 : 0;
              const isExpired = link.expiresAt
                ? new Date(link.expiresAt) < new Date()
                : false;

              return (
                <div
                  key={link.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 140px",
                    padding: "16px 20px",
                    alignItems: "center",
                    borderBottom: idx < links.length - 1
                      ? "1px solid rgba(72,71,74,0.07)"
                      : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = S.surfaceContainer)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Slug + URL */}
                  <div style={{ minWidth: 0, paddingRight: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                      <span style={{
                        fontSize: "14px", fontWeight: 700, color: S.primary,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        /{link.slug}
                      </span>
                      {isExpired && (
                        <span style={{
                          fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em",
                          padding: "2px 8px", borderRadius: "4px",
                          background: "rgba(255,110,132,0.12)", color: "#ff6e84",
                          flexShrink: 0,
                        }}>
                          EXPIRED
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: "12px", color: "rgba(173,170,173,0.5)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {link.originalUrl}
                    </p>
                  </div>

                  {/* Click count */}
                  <div>
                    <span style={{
                      fontSize: "20px", fontWeight: 900, letterSpacing: "-0.04em",
                      color: S.onSurface,
                    }}>
                      {link._count.clicks >= 1000
                        ? `${(link._count.clicks / 1000).toFixed(1)}k`
                        : link._count.clicks}
                    </span>
                  </div>

                  {/* Bar */}
                  <div style={{ paddingRight: "8px" }}>
                    <div style={{
                      height: "6px", borderRadius: "3px",
                      background: "rgba(72,71,74,0.2)",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: "3px",
                        width: `${pct}%`,
                        background: isExpired
                          ? "rgba(255,110,132,0.5)"
                          : `linear-gradient(90deg, #bd9dff, #c38bf5)`,
                        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                      }} />
                    </div>
                    <p style={{
                      fontSize: "10px", color: S.onSurfaceVariant, marginTop: "4px",
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {pct.toFixed(0)}% of max
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
