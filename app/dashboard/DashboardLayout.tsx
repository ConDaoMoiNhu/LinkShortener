"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
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

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Links", href: "/dashboard/links", icon: "link" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "analytics" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
];

function Avatar({ user, size = 32 }: { user: User; size?: number }) {
  if (user.image) {
    return (
      <img
        src={user.image}
        alt=""
        style={{
          width: size, height: size, borderRadius: "50%",
          border: `1px solid rgba(189,157,255,0.25)`, flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: S.surfaceBright, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.375, fontWeight: 700,
      color: S.primary, flexShrink: 0,
    }}>
      {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
    </div>
  );
}

export default function DashboardLayout({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div style={{ minHeight: "100vh", background: S.surface, color: S.onSurface }}>

      {/* ── Header (fixed top) ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: "64px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 24px",
        background: "rgba(14,14,16,0.85)", backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 1px 0 rgba(72,71,74,0.1), 0 20px 40px rgba(189,157,255,0.06)",
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.05em" }}>
            <span style={{ color: S.onSurface }}>ls</span>
            <span style={{ color: S.primary }}>/</span>
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar user={user} size={30} />
          <span style={{ fontSize: "13px", color: S.onSurfaceVariant }}>
            {user.name ?? user.email}
          </span>
          {/* Logout — hidden on mobile (bottom nav handles it) */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              padding: "6px 14px", borderRadius: "10px",
              border: "1px solid rgba(72,71,74,0.2)", background: "transparent",
              color: S.onSurfaceVariant, fontSize: "12px", fontWeight: 500,
              cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = S.surfaceBright;
              e.currentTarget.style.color = S.onSurface;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = S.onSurfaceVariant;
            }}
            className="hidden md:block"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* ── Sidebar (desktop, fixed left) ── */}
      <aside
        className="hidden md:flex"
        style={{
          position: "fixed", left: 0, top: 0, height: "100vh", width: "240px",
          background: S.surfaceLow, padding: "80px 16px 32px",
          flexDirection: "column", gap: "4px", zIndex: 40,
          borderRight: "1px solid rgba(72,71,74,0.06)",
        }}
      >
        {/* Brand area with purple link icon */}
        <div style={{
          marginBottom: "20px", padding: "0 8px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #bd9dff 0%, #8a4cfc 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span className="material-symbols-outlined" style={{ color: "#000", fontSize: "18px" }}>
              link
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "15px", fontWeight: 900, color: S.onSurface, letterSpacing: "-0.04em", lineHeight: 1.2 }}>
              ls<span style={{ color: S.primary }}>/</span>
            </p>
            <p style={{ fontSize: "11px", color: "rgba(173,170,173,0.45)" }}>
              Link Dashboard
            </p>
          </div>
        </div>

        {/* User info */}
        <div style={{
          marginBottom: "20px", padding: "12px",
          background: S.surfaceContainer, borderRadius: "12px",
          display: "flex", alignItems: "center", gap: "10px",
          border: "1px solid rgba(72,71,74,0.08)",
        }}>
          <Avatar user={user} size={34} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: S.onSurface, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name ?? "User"}
            </p>
            <p style={{ fontSize: "11px", color: "rgba(173,170,173,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 12px", borderRadius: "10px", textDecoration: "none",
                  borderLeft: active ? `3px solid ${S.primary}` : "3px solid transparent",
                  background: active ? S.surfaceContainer : "transparent",
                  color: active ? S.primary : "rgba(249,245,248,0.4)",
                  fontSize: "14px", fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(25,25,28,0.6)";
                    e.currentTarget.style.color = S.onSurface;
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(249,245,248,0.4)";
                  }
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}

          {/* Support — static link */}
          <a
            href="mailto:support@example.com"
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 12px", borderRadius: "10px", textDecoration: "none",
              borderLeft: "3px solid transparent",
              color: "rgba(249,245,248,0.4)",
              fontSize: "14px", fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(25,25,28,0.6)";
              e.currentTarget.style.color = S.onSurface;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(249,245,248,0.4)";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              support
            </span>
            Support
          </a>
        </nav>

        {/* Logout at bottom */}
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
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              logout
            </span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main
        className="dashboard-main"
        style={{ paddingTop: "64px", paddingBottom: "80px" }}
      >
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="md:hidden"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          padding: "10px 8px 20px",
          background: "rgba(14,14,16,0.96)", backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(72,71,74,0.12)",
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: "3px", textDecoration: "none",
                color: active ? S.primary : S.onSurfaceVariant,
                fontSize: "10px", fontWeight: active ? 700 : 500,
                transition: "color 0.2s", padding: "4px 12px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
