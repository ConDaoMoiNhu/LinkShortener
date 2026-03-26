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

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com/đường-dẫn-dài"
          required
          className="input-base"
          style={{ flex: "1 1 200px" }}
        />
        <input
          type="text"
          value={alias}
          onChange={e => setAlias(e.target.value)}
          placeholder="alias (tuỳ chọn)"
          className="input-base mono"
          style={{ width: "148px", flexShrink: 0, flex: "none" }}
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{
            opacity: loading ? 0.65 : 1,
            cursor: loading ? "not-allowed" : "pointer",
            flexShrink: 0,
            transform: "none",
          }}
        >
          {loading ? (
            <span style={{ opacity: 0.8 }}>Đang tạo…</span>
          ) : (
            <>Rút gọn →</>
          )}
        </button>
      </div>

      {error && (
        <p className="mono" style={{
          marginTop: "10px",
          fontSize: "12px",
          color: "var(--danger)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <span>✗</span> {error}
        </p>
      )}
    </form>
  );
}
