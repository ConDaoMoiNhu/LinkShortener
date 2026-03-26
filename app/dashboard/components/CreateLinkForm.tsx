"use client";

import { useState } from "react";

interface Props {
  onCreated: () => void;
}

export default function CreateLinkForm({ onCreated }: Props) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalUrl: url, customSlug: alias || undefined }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Có lỗi xảy ra");
      return;
    }

    setUrl("");
    setAlias("");
    onCreated();
  }

  const baseInput: React.CSSProperties = {
    background: "var(--bg-muted)",
    border: "1px solid var(--border-strong)",
    color: "var(--text)",
    borderRadius: "7px",
    padding: "9px 12px",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "var(--font-geist-sans)",
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com/duong-dan-dai"
          required
          style={{ ...baseInput, flex: "1 1 200px" }}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
        />
        <input
          type="text"
          value={alias}
          onChange={e => setAlias(e.target.value)}
          placeholder="alias (tuỳ chọn)"
          style={{ ...baseInput, fontFamily: "var(--font-geist-mono)", width: "148px", flexShrink: 0 }}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "7px",
            padding: "9px 18px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            whiteSpace: "nowrap",
            flexShrink: 0,
            letterSpacing: "-0.01em",
            transition: "opacity 0.15s",
          }}
        >
          {loading ? "..." : "Rút gọn →"}
        </button>
      </div>

      {error && (
        <p style={{ marginTop: "8px", fontSize: "12px", color: "var(--danger)", fontFamily: "var(--font-geist-mono)" }}>
          ✗ {error}
        </p>
      )}
    </form>
  );
}
