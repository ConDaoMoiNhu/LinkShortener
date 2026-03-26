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

export default function DashboardClient({ user }: { user: User }) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [baseUrl, setBaseUrl] = useState("");

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
  const thisWeek = links.filter(l => Date.now() - new Date(l.createdAt).getTime() < 7 * 86400000).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span className="display-font" style={{
            fontSize: "18px",
            fontWeight: 700,
            fontStyle: "italic",
            color: "var(--accent)",
            letterSpacing: "-0.04em",
          }}>ls·</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user.image && (
            <img
              src={user.image}
              alt=""
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                border: "1.5px solid var(--border-strong)",
              }}
            />
          )}
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {user.name ?? user.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn-ghost"
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Greeting */}
        <div className="fade-up" style={{ marginBottom: "32px" }}>
          <h1 className="display-font" style={{
            fontSize: "26px",
            fontWeight: 700,
            fontStyle: "italic",
            color: "var(--text)",
            letterSpacing: "-0.03em",
            marginBottom: "4px",
          }}>
            {user.name ? `Xin chào, ${user.name.split(" ").pop()}` : "Dashboard"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Quản lý và theo dõi links của bạn
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: "Tổng link", value: links.length },
            { label: "Lượt click", value: totalClicks },
            { label: "Tuần này", value: thisWeek },
          ].map((s, i) => (
            <div
              key={s.label}
              className="fade-up card"
              style={{
                padding: "18px 20px",
                animationDelay: `${i * 0.07}s`,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow)";
              }}
            >
              <p style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                fontWeight: 500,
              }}>
                {s.label}
              </p>
              <p className="display-font" style={{
                fontSize: "32px",
                fontWeight: 700,
                fontStyle: "italic",
                color: "var(--text)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                animationDelay: `${i * 0.07 + 0.1}s`,
              }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Create form */}
        <div className="fade-up card" style={{ marginBottom: "28px", animationDelay: "0.22s", overflow: "hidden" }}>
          <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{
              width: "20px",
              height: "20px",
              borderRadius: "5px",
              background: "var(--accent-subtle)",
              border: "1px solid var(--accent-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: "var(--accent)",
              fontWeight: 700,
              flexShrink: 0,
            }}>+</span>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
              Tạo link mới
            </span>
          </div>
          <div style={{ padding: "18px 20px" }}>
            <CreateLinkForm onCreated={fetchLinks} />
          </div>
        </div>

        {/* Links list */}
        <div className="fade-up" style={{ animationDelay: "0.28s" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
              Links của bạn
            </p>
            {links.length > 0 && (
              <span className="mono" style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                {links.length} link{links.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {links.length === 0 ? (
            <div style={{
              border: "1px dashed var(--border-strong)",
              borderRadius: "12px",
              padding: "56px 24px",
              textAlign: "center",
            }}>
              <p className="display-font" style={{
                fontSize: "32px",
                fontStyle: "italic",
                color: "var(--border-strong)",
                marginBottom: "12px",
                letterSpacing: "-0.03em",
              }}>ls/—</p>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                Chưa có link nào
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Dán URL vào ô trên để tạo link đầu tiên
              </p>
            </div>
          ) : (
            <div className="card" style={{ overflow: "hidden" }}>
              {links.map((link, i) => (
                <div key={link.id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                  <LinkCard link={link} baseUrl={baseUrl} onDeleted={fetchLinks} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
