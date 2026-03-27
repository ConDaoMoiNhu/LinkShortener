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

interface LinkAnalytics {
  totalClicks: number;
  byDevice: Record<string, number>;
  byCountry: Record<string, number>;
  byDate: Record<string, number>;
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
  primaryDim: "#8a4cfc",
  tertiary: "#ff8eac",
};

function formatClicks(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", VN: "🇻🇳", GB: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷",
  JP: "🇯🇵", KR: "🇰🇷", SG: "🇸🇬", AU: "🇦🇺", CA: "🇨🇦",
  IN: "🇮🇳", BR: "🇧🇷", TH: "🇹🇭", ID: "🇮🇩", PH: "🇵🇭",
};

export default function AnalyticsClient() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null);
  const [topSlug, setTopSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    const data: LinkItem[] = await res.json();
    const list = Array.isArray(data) ? data : [];
    setLinks(list);

    // Fetch analytics for the top clicked link
    const top = [...list].sort((a, b) => b._count.clicks - a._count.clicks)[0];
    if (top) {
      setTopSlug(top.slug);
      const ar = await fetch(`/api/analytics/${top.slug}`);
      if (ar.ok) setAnalytics(await ar.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const totalClicks = links.reduce((s, l) => s + l._count.clicks, 0);
  const thisWeek = links.filter(l => Date.now() - new Date(l.createdAt).getTime() < 7 * 86400000).length;
  const maxClicks = Math.max(...links.map(l => l._count.clicks), 1);

  // Bar chart: last 7 dates from byDate
  const barDates = analytics
    ? Object.entries(analytics.byDate)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-7)
    : [];
  const barMax = Math.max(...barDates.map(([, v]) => v), 1);

  // Devices
  const mobile = analytics?.byDevice?.mobile ?? analytics?.byDevice?.Mobile ?? 0;
  const desktop = analytics?.byDevice?.desktop ?? analytics?.byDevice?.Desktop ?? 0;
  const deviceTotal = Object.values(analytics?.byDevice ?? {}).reduce((s, v) => s + v, 0) || 1;
  const mobilePct = Math.round((mobile / deviceTotal) * 100);
  const desktopPct = Math.round((desktop / deviceTotal) * 100);
  const otherPct = 100 - mobilePct - desktopPct;

  // Countries top 3
  const countries = Object.entries(analytics?.byCountry ?? {})
    .sort((a, b) => b[1] - a[1]).slice(0, 3);
  const countryTotal = countries.reduce((s, [, v]) => s + v, 0) || 1;

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1100px", margin: "0 auto" }}>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, letterSpacing: "-0.04em", color: S.onSurface, lineHeight: 1, marginBottom: "6px" }}>
          Analytics
        </h1>
        <p style={{ fontSize: "14px", color: S.onSurfaceVariant, fontWeight: 500 }}>
          Monitor your link performance and reach.
        </p>
      </div>

      {/* Top stats — 4 cards */}
      <div className="fade-up" style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px", marginBottom: "32px", animationDelay: "0.05s",
      }}>
        {[
          { label: "Total Clicks", value: formatClicks(totalClicks), color: S.primary, glow: true },
          { label: "Total Links", value: String(links.length), color: S.onSurface },
          { label: "This Week", value: String(thisWeek), color: S.tertiary },
          { label: "Top Link", value: topSlug ? `/${topSlug}` : "—", color: S.primary, small: true },
        ].map(({ label, value, color, glow, small }) => (
          <div key={label} style={{
            background: glow ? S.surfaceLow : S.surfaceContainer,
            borderRadius: "16px", padding: "24px",
            border: "1px solid rgba(72,71,74,0.06)",
            position: "relative", overflow: "hidden",
          }}>
            <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: S.onSurfaceVariant, fontWeight: 700, marginBottom: "10px" }}>
              {label}
            </p>
            <p style={{
              fontSize: small ? "18px" : "clamp(32px,5vw,48px)",
              fontWeight: 900, letterSpacing: "-0.04em",
              color, lineHeight: 1,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{value}</p>
            {glow && <div style={{
              position: "absolute", right: "-20px", bottom: "-20px",
              width: "100px", height: "100px",
              background: "rgba(189,157,255,0.07)", borderRadius: "50%",
              filter: "blur(30px)", pointerEvents: "none",
            }} />}
          </div>
        ))}
      </div>

      {/* Main section: chart + referrers */}
      <div className="fade-up" style={{
        display: "grid", gridTemplateColumns: "1fr", gap: "16px",
        marginBottom: "16px", animationDelay: "0.1s",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }} className="hidden md:grid">

          {/* Bar chart */}
          <div style={{
            background: S.surfaceContainer, borderRadius: "16px", padding: "28px",
            border: "1px solid rgba(72,71,74,0.08)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: S.onSurface, marginBottom: "4px" }}>Click Performance</h2>
                <p style={{ fontSize: "12px", color: S.onSurfaceVariant }}>
                  {topSlug ? `/${topSlug} — last 7 days` : "No data yet"}
                </p>
              </div>
              <div style={{
                display: "flex", background: "#000", borderRadius: "999px", padding: "4px", gap: "2px",
              }}>
                {["30D", "7D", "24H"].map((t, i) => (
                  <span key={t} style={{
                    padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 700,
                    background: i === 0 ? S.primary : "transparent",
                    color: i === 0 ? "#000" : S.onSurfaceVariant,
                    cursor: "default",
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Bars */}
            <div style={{ height: "160px", display: "flex", alignItems: "flex-end", gap: "8px", position: "relative" }}>
              {/* Grid lines */}
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  position: "absolute", left: 0, right: 0,
                  top: `${i * 33}%`,
                  borderTop: "1px solid rgba(72,71,74,0.15)",
                  pointerEvents: "none",
                }} />
              ))}
              {barDates.length === 0
                ? Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} style={{
                      flex: 1, background: "rgba(189,157,255,0.08)",
                      borderRadius: "6px 6px 0 0", height: `${20 + Math.random() * 60}%`,
                    }} />
                  ))
                : barDates.map(([date, count], i) => {
                    const isToday = date === new Date().toISOString().split("T")[0];
                    const h = Math.max((count / barMax) * 100, 4);
                    return (
                      <div key={date} style={{ flex: 1, position: "relative", display: "flex", alignItems: "flex-end" }}>
                        {i === barDates.length - 1 && (
                          <div style={{
                            position: "absolute", top: `-28px`, left: "50%", transform: "translateX(-50%)",
                            background: S.primary, color: "#000",
                            padding: "2px 8px", borderRadius: "4px",
                            fontSize: "10px", fontWeight: 700, whiteSpace: "nowrap",
                          }}>
                            {count} Today
                          </div>
                        )}
                        <div style={{
                          width: "100%", height: `${h}%`,
                          background: isToday
                            ? `linear-gradient(180deg, ${S.primary}, ${S.primaryDim})`
                            : "rgba(189,157,255,0.2)",
                          borderRadius: "5px 5px 0 0",
                          transition: "background 0.2s",
                        }} />
                      </div>
                    );
                  })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", padding: "0 4px" }}>
              {barDates.length > 0
                ? [barDates[0]?.[0], barDates[Math.floor(barDates.length / 2)]?.[0], barDates[barDates.length - 1]?.[0]]
                    .filter(Boolean).map(d => (
                      <span key={d} style={{ fontSize: "10px", fontWeight: 700, color: S.onSurfaceVariant, letterSpacing: "0.05em" }}>
                        {d?.slice(5)}
                      </span>
                    ))
                : ["—", "—", "Today"].map(l => (
                    <span key={l} style={{ fontSize: "10px", fontWeight: 700, color: S.onSurfaceVariant }}>{l}</span>
                  ))}
            </div>
          </div>

          {/* Top links sidebar */}
          <div style={{
            background: S.surfaceContainer, borderRadius: "16px", padding: "28px",
            border: "1px solid rgba(72,71,74,0.08)",
          }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: S.onSurface, marginBottom: "4px" }}>Top Links</h2>
            <p style={{ fontSize: "12px", color: S.onSurfaceVariant, marginBottom: "24px" }}>By click count</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {links.slice(0, 4).map(link => {
                const pct = (link._count.clicks / maxClicks) * 100;
                return (
                  <div key={link.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: S.onSurface, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                        /{link.slug}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: S.onSurface }}>{formatClicks(link._count.clicks)}</span>
                    </div>
                    <div style={{ height: "6px", background: "#000", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${S.primary}, ${S.primaryDim})`, borderRadius: "3px", transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
                    </div>
                  </div>
                );
              })}
              {links.length === 0 && (
                <p style={{ fontSize: "13px", color: S.onSurfaceVariant }}>Chưa có link</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Geographic + Devices */}
      <div className="fade-up" style={{
        display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px",
        animationDelay: "0.15s",
      }}>
        {/* Geographic */}
        <div style={{
          background: S.surfaceContainer, borderRadius: "16px",
          border: "1px solid rgba(72,71,74,0.08)", overflow: "hidden",
          display: "flex",
        }}>
          <div style={{ padding: "28px", flex: 1 }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: S.onSurface, marginBottom: "4px" }}>Geographic</h2>
            <p style={{ fontSize: "12px", color: S.onSurfaceVariant, marginBottom: "24px" }}>Top clicking countries</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {countries.length > 0
                ? countries.map(([code, count]) => (
                    <div key={code} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 12px", borderRadius: "10px",
                      transition: "background 0.15s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = S.surfaceHigh)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>{COUNTRY_FLAGS[code] ?? "🌐"}</span>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: S.onSurface }}>{code}</span>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: S.onSurface }}>
                        {Math.round((count / countryTotal) * 100)}%
                      </span>
                    </div>
                  ))
                : (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "rgba(189,157,255,0.2)", display: "block", marginBottom: "8px" }}>public</span>
                    <p style={{ fontSize: "13px", color: S.onSurfaceVariant }}>Chưa có dữ liệu</p>
                  </div>
                )}
            </div>
          </div>
          {/* Map placeholder */}
          <div style={{
            width: "180px", flexShrink: 0,
            background: S.surfaceHigh,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "12px",
          }} className="hidden lg:flex">
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "rgba(189,157,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "28px", color: S.primary }}>public</span>
            </div>
            <p style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "0.1em", color: S.primary, textTransform: "uppercase" }}>Live Traffic</p>
          </div>
        </div>

        {/* Devices */}
        <div style={{
          background: S.surfaceContainer, borderRadius: "16px", padding: "28px",
          border: "1px solid rgba(72,71,74,0.08)",
        }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: S.onSurface, marginBottom: "4px" }}>Devices</h2>
          <p style={{ fontSize: "12px", color: S.onSurfaceVariant, marginBottom: "24px" }}>Hardware split</p>

          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            {[
              { icon: "smartphone", label: "Mobile", pct: mobilePct, color: S.primary },
              { icon: "laptop", label: "Desktop", pct: desktopPct, color: S.onSurfaceVariant },
            ].map(({ icon, label, pct, color }) => (
              <div key={label} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                padding: "16px", background: "#000", borderRadius: "14px",
                border: "1px solid rgba(72,71,74,0.12)",
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px", color, marginBottom: "8px" }}>{icon}</span>
                <span style={{ fontSize: "20px", fontWeight: 900, color: S.onSurface, letterSpacing: "-0.04em" }}>{pct}%</span>
                <span style={{ fontSize: "9px", fontWeight: 700, color: S.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Browser bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "Mobile", pct: mobilePct },
              { label: "Desktop", pct: desktopPct },
              { label: "Other", pct: otherPct },
            ].map(({ label, pct }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: S.onSurfaceVariant, width: "52px", flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: "6px", background: "#000", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${analytics ? pct : 0}%`, background: "rgba(249,245,248,0.25)", borderRadius: "3px", transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: S.onSurface, width: "30px", textAlign: "right", flexShrink: 0 }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All links table */}
      {links.length > 0 && (
        <div className="fade-up" style={{ marginTop: "16px", animationDelay: "0.2s" }}>
          <div style={{
            background: S.surfaceLow, borderRadius: "16px",
            border: "1px solid rgba(72,71,74,0.08)", overflow: "hidden",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 80px 160px",
              padding: "12px 20px", borderBottom: "1px solid rgba(72,71,74,0.1)",
            }}>
              {["Link / URL", "Clicks", "Traffic"].map(col => (
                <span key={col} style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: S.onSurfaceVariant, fontWeight: 700 }}>
                  {col}
                </span>
              ))}
            </div>
            {links.map((link, idx) => {
              const pct = (link._count.clicks / maxClicks) * 100;
              const expired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;
              return (
                <div key={link.id} style={{
                  display: "grid", gridTemplateColumns: "1fr 80px 160px",
                  padding: "14px 20px", alignItems: "center",
                  borderBottom: idx < links.length - 1 ? "1px solid rgba(72,71,74,0.07)" : "none",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = S.surfaceContainer)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ minWidth: 0, paddingRight: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: S.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        /{link.slug}
                      </span>
                      {expired && (
                        <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "3px", background: "rgba(255,110,132,0.12)", color: "#ff6e84", flexShrink: 0 }}>
                          EXPIRED
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "11px", color: "rgba(173,170,173,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {link.originalUrl}
                    </p>
                  </div>
                  <span style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.04em", color: S.onSurface }}>
                    {formatClicks(link._count.clicks)}
                  </span>
                  <div style={{ paddingRight: "8px" }}>
                    <div style={{ height: "6px", borderRadius: "3px", background: "rgba(72,71,74,0.2)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "3px", width: `${pct}%`, background: expired ? "rgba(255,110,132,0.4)" : `linear-gradient(90deg, ${S.primary}, ${S.primaryDim})`, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <p style={{ fontSize: "14px", color: S.onSurfaceVariant }}>Đang tải...</p>
        </div>
      )}
    </div>
  );
}
