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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 28px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(12px)",
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{
            fontFamily: "var(--font-geist-mono)",
            fontWeight: 700,
            fontSize: "15px",
            color: "var(--accent)",
            letterSpacing: "-0.03em",
          }}>ls/</span>
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>dashboard</span>
        </Link>

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user.image && (
            <img
              src={user.image}
              alt=""
              style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid var(--border-strong)" }}
            />
          )}
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "none" }}
            className="sm:block">
            {user.name ?? user.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              fontSize: "11px",
              padding: "5px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border-strong)",
              background: "transparent",
              color: "var(--text-tertiary)",
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "var(--text)";
              e.currentTarget.style.borderColor = "var(--text-tertiary)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "var(--text-tertiary)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 20px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "Links", value: links.length },
            { label: "Clicks", value: totalClicks },
            { label: "Tuần này", value: thisWeek },
          ].map(s => (
            <div key={s.label} style={{
              padding: "16px 18px",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
            }}>
              <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.label}
              </p>
              <p style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                fontFamily: "var(--font-geist-mono)",
              }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Create form */}
        <div style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border-strong)",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "24px",
        }}>
          <div style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "12px",
              color: "var(--accent)",
              fontWeight: 700,
            }}>+</span>
            <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}>
              Tạo link mới
            </span>
          </div>
          <div style={{ padding: "16px 18px" }}>
            <CreateLinkForm onCreated={fetchLinks} />
          </div>
        </div>

        {/* Links list */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}>
              Links của bạn
            </p>
            {links.length > 0 && (
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-geist-mono)" }}>
                {links.length}
              </span>
            )}
          </div>

          {links.length === 0 ? (
            <div style={{
              border: "1px dashed var(--border-strong)",
              borderRadius: "12px",
              padding: "48px 24px",
              textAlign: "center",
            }}>
              <p style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "24px",
                color: "var(--border-strong)",
                marginBottom: "12px",
                letterSpacing: "-0.04em",
              }}>ls/—</p>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>Chưa có link nào</p>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Dán URL vào ô trên để tạo link đầu tiên</p>
            </div>
          ) : (
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: "12px",
              overflow: "hidden",
            }}>
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
