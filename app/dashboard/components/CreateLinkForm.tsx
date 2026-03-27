"use client";

import { useState } from "react";

interface Props {
  onCreated: () => void;
}

export default function CreateLinkForm({ onCreated }: Props) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // min date = today in local YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body: Record<string, string> = { originalUrl: url };
    if (alias) body.customSlug = alias;
    if (expiresAt) body.expiresAt = expiresAt;

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Có lỗi xảy ra");
      return;
    }

    setUrl("");
    setAlias("");
    setExpiresAt("");
    onCreated();
  }

  const labelStyle: React.CSSProperties = {
    fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em",
    fontWeight: 700, color: "#adaaad",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Destination URL */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={labelStyle}>URL gốc</label>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com/đường-dẫn-rất-dài"
          required
          className="input-base"
        />
      </div>

      {/* Custom slug + Expiry date — side by side on wider screens */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Custom slug */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={labelStyle}>Alias tuỳ chọn</label>
          <div style={{
            display: "flex", alignItems: "center",
            background: "#000", borderRadius: "12px",
            border: "1px solid rgba(72,71,74,0.15)",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
            onFocusCapture={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(189,157,255,0.5)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 4px rgba(189,157,255,0.08)";
            }}
            onBlurCapture={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(72,71,74,0.15)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <span style={{
              paddingLeft: "12px", fontSize: "13px",
              color: "rgba(173,170,173,0.45)", fontWeight: 500, whiteSpace: "nowrap",
            }}>
              {typeof window !== "undefined" ? window.location.host : "ls"}/
            </span>
            <input
              type="text"
              value={alias}
              onChange={e => setAlias(e.target.value)}
              placeholder="my-link"
              style={{
                flex: 1, background: "transparent", border: "none",
                padding: "13px 12px 13px 3px", color: "#f9f5f8",
                fontSize: "13px", outline: "none", fontFamily: "var(--font-mono), monospace",
                minWidth: 0,
              }}
            />
          </div>
        </div>

        {/* Expiry date */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={labelStyle}>Hết hạn (tuỳ chọn)</label>
          <input
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            min={todayStr}
            style={{
              background: "#000", borderRadius: "12px",
              border: "1px solid rgba(72,71,74,0.15)",
              padding: "13px 16px", color: expiresAt ? "#f9f5f8" : "rgba(173,170,173,0.45)",
              fontSize: "13px", outline: "none", fontFamily: "inherit",
              transition: "border-color 0.2s, box-shadow 0.2s",
              colorScheme: "dark",
              width: "100%", boxSizing: "border-box",
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = "rgba(189,157,255,0.5)";
              e.currentTarget.style.boxShadow = "0 0 0 4px rgba(189,157,255,0.08)";
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = "rgba(72,71,74,0.15)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        borderTop: "1px solid rgba(72,71,74,0.1)", paddingTop: "20px",
      }}>
        <button
          type="submit"
          disabled={loading}
          className="liquid-gradient"
          style={{
            flex: 1, padding: "14px", borderRadius: "12px",
            border: "none", color: "#000", fontSize: "14px", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "filter 0.2s, transform 0.15s",
            boxShadow: "0 20px 40px rgba(189,157,255,0.2)",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = "brightness(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
        >
          {loading ? "Đang tạo…" : "Rút gọn →"}
        </button>
      </div>

      {error && (
        <p style={{
          fontSize: "13px", color: "#ff6e84",
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          <span>✗</span> {error}
        </p>
      )}
    </form>
  );
}
