"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import CreateLinkForm from "./components/CreateLinkForm";
import LinkCard from "./components/LinkCard";
import Link from "next/link";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface LinkItem {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
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
  outlineVariant: "rgba(72,71,74,0.15)",
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
    <div style={{ minHeight: "100vh", background: S.surface, color: S.onSurface }}>

      {/* ── Header ── */}
      <header style={{
        position: "fixed", top: 0, width: "100%", zIndex: 50,
        height: "64px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 24px",
        background: "rgba(14,14,16,0.85)", backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 1px 0 rgba(72,71,74,0.1), 0 20px 40px rgba(189,157,255,0.06)",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontSize: "22px", fontWeight: 900, letterSpacing: "-0.05em",
            color: S.onSurface,
          }}>ls/</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user.image ? (
            <img src={user.image} alt="" style={{
              width: "30px", height: "30px", borderRadius: "50%",
              border: `1px solid rgba(189,157,255,0.25)`,
            }} />
          ) : (
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: S.surfaceBright, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "12px", fontWeight: 700, color: S.primary,
            }}>
              {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: "13px", color: S.onSurfaceVariant }}>
            {user.name ?? user.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              padding: "6px 14px", borderRadius: "10px",
              border: "1px solid rgba(72,71,74,0.2)", background: "transparent",
              color: S.onSurfaceVariant, fontSize: "12px", fontWeight: 500,
              cursor: "pointer", transition: "all 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = S.surfaceBright;
              e.currentTarget.style.color = S.onSurface;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = S.onSurfaceVariant;
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* ── Sidebar (desktop) ── */}
      <aside style={{
        position: "fixed", left: 0, top: 0, height: "100vh", width: "240px",
        background: S.surfaceLow, padding: "80px 16px 32px",
        flexDirection: "column", gap: "4px", zIndex: 40,
      }} className="hidden md:flex">

        <div style={{
          marginBottom: "28px", padding: "0 8px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px",
            background: "rgba(189,157,255,0.1)", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "18px", fontWeight: 900, color: S.primary,
          }}>↗</div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: S.onSurface, lineHeight: 1.2 }}>ls/</p>
            <p style={{ fontSize: "11px", color: "rgba(173,170,173,0.5)" }}>Link Shortener</p>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {[
            { label: "Dashboard", active: true },
            { label: "Links", active: false },
            { label: "Analytics", active: false },
            { label: "Settings", active: false },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 12px", borderRadius: "10px",
              borderLeft: item.active ? `3px solid ${S.primary}` : "3px solid transparent",
              background: item.active ? S.surfaceContainer : "transparent",
              color: item.active ? S.primary : "rgba(249,245,248,0.4)",
              fontSize: "14px", fontWeight: 500, cursor: "pointer",
              transition: "all 0.2s",
            }}>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{
          marginTop: "auto", borderTop: "1px solid rgba(72,71,74,0.1)",
          paddingTop: "16px",
        }}>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 12px", borderRadius: "10px", background: "transparent",
              border: "none", color: "rgba(249,245,248,0.4)", fontSize: "14px",
              fontWeight: 500, cursor: "pointer", width: "100%", textAlign: "left",
              transition: "color 0.2s", fontFamily: "inherit",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = S.onSurface)}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(249,245,248,0.4)")}
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="md:ml-60" style={{ paddingTop: "88px", paddingLeft: "32px", paddingRight: "32px", paddingBottom: "96px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          {/* Page header */}
          <div className="fade-up" style={{
            display: "flex", flexDirection: "column", gap: "24px",
            marginBottom: "48px",
          }}>
            <div style={{
              display: "flex", flexWrap: "wrap", alignItems: "flex-end",
              justifyContent: "space-between", gap: "16px",
            }}>
              <div>
                <h1 style={{
                  fontSize: "clamp(32px,5vw,48px)", fontWeight: 900,
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
          </div>

          {/* Stats bento grid */}
          <div className="fade-up" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px", marginBottom: "48px", animationDelay: "0.07s",
          }}>
            {/* Total clicks — hero stat */}
            <div style={{
              gridColumn: "span 2",
              background: S.surfaceLow, borderRadius: "16px",
              padding: "32px", minHeight: "180px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              position: "relative", overflow: "hidden",
              border: "1px solid rgba(72,71,74,0.05)",
            }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{
                  fontSize: "10px", textTransform: "uppercase",
                  letterSpacing: "0.12em", color: S.onSurfaceVariant,
                  fontWeight: 700, marginBottom: "12px",
                }}>Total Clicks</p>
                <p style={{
                  fontSize: "clamp(48px,8vw,72px)", fontWeight: 900,
                  letterSpacing: "-0.05em", color: S.primary, lineHeight: 1,
                }}>
                  {totalClicks >= 1000
                    ? `${(totalClicks / 1000).toFixed(1)}k`
                    : totalClicks}
                </p>
              </div>
              <p style={{
                fontSize: "13px", color: "#ff8eac", fontWeight: 700,
                position: "relative", zIndex: 1,
              }}>
                {thisWeek > 0 ? `+${thisWeek} link tuần này` : "Chưa có link tuần này"}
              </p>
              {/* decorative glow */}
              <div style={{
                position: "absolute", right: "-40px", bottom: "-40px",
                width: "200px", height: "200px",
                background: "rgba(189,157,255,0.05)", borderRadius: "50%",
                filter: "blur(40px)", pointerEvents: "none",
              }} />
            </div>

            {/* Active links */}
            <div style={{
              background: S.surfaceContainer, borderRadius: "16px", padding: "32px",
              display: "flex", flexDirection: "column", justifyContent: "center",
              border: "1px solid rgba(72,71,74,0.05)",
            }}>
              <p style={{
                fontSize: "10px", textTransform: "uppercase",
                letterSpacing: "0.12em", color: S.onSurfaceVariant,
                fontWeight: 700, marginBottom: "8px",
              }}>Links</p>
              <p style={{
                fontSize: "48px", fontWeight: 900,
                letterSpacing: "-0.05em", color: S.onSurface, lineHeight: 1,
              }}>{links.length}</p>
            </div>
          </div>

          {/* Links list */}
          <div className="fade-up" style={{ animationDelay: "0.14s" }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: "16px",
            }}>
              <h2 style={{
                fontSize: "18px", fontWeight: 700,
                color: S.onSurface, letterSpacing: "-0.02em",
              }}>Recent Links</h2>
              {links.length > 0 && (
                <span style={{ fontSize: "11px", color: S.onSurfaceVariant, fontWeight: 500 }}>
                  {links.length} link{links.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {links.length === 0 ? (
              /* Empty state */
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
        </div>
      </main>

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

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden" style={{
        position: "fixed", bottom: 0, width: "100%", zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-around",
        padding: "12px 24px 20px",
        background: "rgba(14,14,16,0.95)", backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(72,71,74,0.1)",
      }}>
        {["Dashboard", "Links", "Analytics", "Settings"].map((item, i) => (
          i === 1 ? (
            <div key="fab" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", marginTop: "-28px" }}>
              <button
                onClick={() => setShowModal(true)}
                className="liquid-gradient"
                style={{
                  width: "52px", height: "52px", borderRadius: "50%",
                  border: "none", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: "24px", fontWeight: 300, color: "#000",
                  boxShadow: "0 8px 24px rgba(189,157,255,0.3)",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >+</button>
              <span style={{ fontSize: "9px", color: S.primary, fontWeight: 700 }}>New</span>
            </div>
          ) : (
            <button key={item} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
              background: "none", border: "none", color: i === 0 ? S.primary : S.onSurfaceVariant,
              fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>{item}</button>
          )
        ))}
      </nav>

    </div>
  );
}
