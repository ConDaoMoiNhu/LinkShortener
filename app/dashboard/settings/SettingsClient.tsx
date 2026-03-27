"use client";

import { useState } from "react";

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
  error: "#ff6e84",
};

export default function SettingsClient({ user }: { user: User }) {
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");

  async function handleDeleteAllLinks() {
    if (!confirm("Bạn chắc chắn muốn xoá TẤT CẢ links? Hành động này không thể hoàn tác.")) return;
    setDeleting(true);
    setDeleteMsg("");
    try {
      const res = await fetch("/api/links", { method: "DELETE" });
      if (res.ok) {
        setDeleteMsg("Đã xoá tất cả links thành công.");
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteMsg(data.error ?? "Có lỗi xảy ra khi xoá.");
      }
    } catch {
      setDeleteMsg("Không thể kết nối server.");
    }
    setDeleting(false);
  }

  const initial = (user.name ?? user.email ?? "U").charAt(0).toUpperCase();

  return (
    <div style={{ padding: "24px 32px", maxWidth: "720px", margin: "0 auto" }}>

      {/* Page header */}
      <div className="fade-up" style={{ marginBottom: "40px" }}>
        <h1 style={{
          fontSize: "clamp(28px,4vw,42px)", fontWeight: 900,
          letterSpacing: "-0.04em", color: S.onSurface, lineHeight: 1, marginBottom: "6px",
        }}>Settings</h1>
        <p style={{ fontSize: "14px", color: S.onSurfaceVariant, fontWeight: 500 }}>
          Quản lý tài khoản của bạn
        </p>
      </div>

      {/* ── Account Profile card ── */}
      <div className="fade-up" style={{
        background: S.surfaceLow, borderRadius: "20px",
        border: "1px solid rgba(72,71,74,0.1)", marginBottom: "20px",
        overflow: "hidden", animationDelay: "0.07s",
      }}>
        {/* Card header */}
        <div style={{
          padding: "24px 28px 20px",
          borderBottom: "1px solid rgba(72,71,74,0.08)",
        }}>
          <p style={{
            fontSize: "13px", fontWeight: 700, color: S.onSurface, letterSpacing: "-0.01em",
          }}>Account Profile</p>
          <p style={{ fontSize: "12px", color: S.onSurfaceVariant, marginTop: "2px" }}>
            Thông tin tài khoản của bạn
          </p>
        </div>

        {/* Card body */}
        <div style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
            {/* Avatar */}
            {user.image ? (
              <img
                src={user.image}
                alt=""
                style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  border: `2px solid rgba(189,157,255,0.3)`, flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "rgba(189,157,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px", fontWeight: 900, color: S.primary, flexShrink: 0,
                border: `2px solid rgba(189,157,255,0.2)`,
              }}>
                {initial}
              </div>
            )}
            <div>
              <p style={{ fontSize: "20px", fontWeight: 800, color: S.onSurface, letterSpacing: "-0.02em" }}>
                {user.name ?? "—"}
              </p>
              <p style={{ fontSize: "13px", color: S.onSurfaceVariant, marginTop: "2px" }}>
                {user.email}
              </p>
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <p style={{
                fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em",
                color: S.onSurfaceVariant, fontWeight: 700, marginBottom: "8px",
              }}>Full Name</p>
              <div style={{
                padding: "12px 16px", borderRadius: "10px",
                background: S.surfaceContainer,
                border: "1px solid rgba(72,71,74,0.12)",
                fontSize: "14px", color: S.onSurface, fontWeight: 500,
              }}>
                {user.name ?? "—"}
              </div>
            </div>
            <div>
              <p style={{
                fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em",
                color: S.onSurfaceVariant, fontWeight: 700, marginBottom: "8px",
              }}>Email Address</p>
              <div style={{
                padding: "12px 16px", borderRadius: "10px",
                background: S.surfaceContainer,
                border: "1px solid rgba(72,71,74,0.12)",
                fontSize: "14px", color: S.onSurface, fontWeight: 500,
              }}>
                {user.email ?? "—"}
              </div>
            </div>
          </div>

          <p style={{
            marginTop: "16px", fontSize: "12px", color: "rgba(173,170,173,0.45)",
          }}>
            Thông tin được đồng bộ từ tài khoản OAuth của bạn.
          </p>
        </div>
      </div>

      {/* ── Danger Zone card ── */}
      <div className="fade-up" style={{
        background: S.surfaceLow, borderRadius: "20px",
        border: "1px solid rgba(255,110,132,0.15)",
        overflow: "hidden", animationDelay: "0.14s",
      }}>
        {/* Card header */}
        <div style={{
          padding: "24px 28px 20px",
          borderBottom: "1px solid rgba(255,110,132,0.08)",
        }}>
          <p style={{
            fontSize: "13px", fontWeight: 700, color: S.error, letterSpacing: "-0.01em",
          }}>Danger Zone</p>
          <p style={{ fontSize: "12px", color: S.onSurfaceVariant, marginTop: "2px" }}>
            Các hành động không thể hoàn tác
          </p>
        </div>

        {/* Card body */}
        <div style={{ padding: "28px" }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
          }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: S.onSurface }}>
                Xoá tất cả Links
              </p>
              <p style={{ fontSize: "12px", color: S.onSurfaceVariant, marginTop: "4px" }}>
                Xoá vĩnh viễn tất cả links và dữ liệu click. Hành động này không thể hoàn tác.
              </p>
            </div>
            <button
              onClick={handleDeleteAllLinks}
              disabled={deleting}
              style={{
                padding: "10px 20px", borderRadius: "10px",
                background: "rgba(255,110,132,0.1)",
                border: "1px solid rgba(255,110,132,0.3)",
                color: S.error, fontSize: "13px", fontWeight: 700,
                cursor: deleting ? "not-allowed" : "pointer",
                opacity: deleting ? 0.6 : 1,
                transition: "all 0.2s", flexShrink: 0, fontFamily: "inherit",
              }}
              onMouseEnter={e => {
                if (!deleting) {
                  e.currentTarget.style.background = "rgba(255,110,132,0.18)";
                  e.currentTarget.style.borderColor = "rgba(255,110,132,0.5)";
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,110,132,0.1)";
                e.currentTarget.style.borderColor = "rgba(255,110,132,0.3)";
              }}
            >
              {deleting ? "Đang xoá..." : "Xoá tất cả"}
            </button>
          </div>

          {deleteMsg && (
            <p style={{
              marginTop: "16px", fontSize: "13px",
              color: deleteMsg.includes("thành công") ? "#4ade80" : S.error,
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <span>{deleteMsg.includes("thành công") ? "✓" : "✗"}</span>
              {deleteMsg}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
