"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const { data: session } = useSession();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function handleShorten(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalUrl: url }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError("URL không hợp lệ hoặc có lỗi xảy ra");
      return;
    }

    setResult(`${window.location.origin}/${data.slug}`);
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* Nav */}
      <nav style={{
        padding: "0 24px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "rgba(14,14,16,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(72,71,74,0.12)",
        zIndex: 50,
      }}>
        <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1 }}>
          <span style={{ color: "#f9f5f8" }}>ls</span><span style={{ color: "#bd9dff" }}>/</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <a
            href="https://github.com/ConDaoMoiNhu/LinkShortener"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            style={{ padding: "6px 10px" }}
          >
            GitHub ↗
          </a>
          {session ? (
            <Link href="/dashboard" prefetch={false} className="btn-primary" style={{ padding: "6px 14px", fontSize: "13px" }}>
              Dashboard →
            </Link>
          ) : (
            <Link href="/login" prefetch={false} className="btn-ghost" style={{ padding: "6px 14px", fontSize: "13px" }}>
              Đăng nhập
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 20px 100px",
        textAlign: "center",
      }}>

        {/* Eyebrow */}
        <p className="fade-up" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--accent)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "24px",
          animationDelay: "0s",
          background: "rgba(189,157,255,0.08)",
          border: "1px solid rgba(189,157,255,0.2)",
          borderRadius: "999px",
          padding: "5px 14px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#bd9dff", display: "inline-block" }} />
          Miễn phí · Không giới hạn
        </p>

        {/* Headline */}
        <h1 className="fade-up display-font hero-title" style={{
          fontSize: "clamp(2.8rem, 7vw, 5rem)",
          fontWeight: 700,
          fontStyle: "italic",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color: "var(--text)",
          marginBottom: "20px",
          maxWidth: "560px",
          animationDelay: "0.05s",
        }}>
          Rút gọn link,<br />
          <span style={{ color: "var(--accent)" }}>không phức tạp.</span>
        </h1>

        {/* Sub */}
        <p className="fade-up" style={{
          fontSize: "15px",
          color: "var(--text-secondary)",
          maxWidth: "360px",
          lineHeight: 1.75,
          marginBottom: "44px",
          animationDelay: "0.1s",
        }}>
          Dán đường dẫn dài, nhận link ngắn gọn tức thì.
          Theo dõi lượt click, tạo QR code. Hoàn toàn miễn phí.
        </p>

        {/* Shortener form */}
        <div className="fade-up" style={{
          width: "100%",
          maxWidth: "520px",
          animationDelay: "0.15s",
        }}>
          {!result ? (
            <form onSubmit={handleShorten} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="shorten-row" style={{ display: "flex", gap: "10px", alignItems: "stretch" }}>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://đường-dẫn-rất-dài-của-bạn.com/..."
                  required
                  className="input-base"
                  style={{ flex: 1, fontSize: "14px", padding: "13px 16px" }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="liquid-gradient shorten-btn"
                  style={{
                    padding: "13px 22px",
                    borderRadius: "12px",
                    border: "none",
                    color: "#000",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                    transition: "filter 0.2s, transform 0.15s",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {loading ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  ) : "Rút gọn →"}
                </button>
              </div>
              {error && (
                <p style={{ fontSize: "13px", color: "#ff6e84", textAlign: "left", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>✗</span> {error}
                </p>
              )}
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", textAlign: "left" }}>
                {session ? (
                  <>
                    Đã đăng nhập.{" "}
                    <Link href="/dashboard" prefetch={false} style={{ color: "var(--accent)", textDecoration: "none" }}>
                      Vào Dashboard →
                    </Link>
                  </>
                ) : (
                  <>
                    Không cần đăng ký.{" "}
                    <Link href="/login" prefetch={false} style={{ color: "var(--accent)", textDecoration: "none" }}>
                      Đăng nhập
                    </Link>{" "}
                    để quản lý links.
                  </>
                )}
              </p>
            </form>
          ) : (
            <div className="scale-in result-card" style={{
              background: "#19191c",
              border: "1px solid rgba(189,157,255,0.2)",
              borderRadius: "16px",
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              boxShadow: "0 0 40px rgba(189,157,255,0.08)",
            }}>
              <div style={{ textAlign: "left", minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "6px", letterSpacing: "0.04em" }}>Link đã rút gọn</p>
                <p style={{
                  fontSize: "16px", fontWeight: 700, color: "#bd9dff",
                  letterSpacing: "-0.02em",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{result}</p>
              </div>
              <div className="result-actions" style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: "10px 18px", borderRadius: "10px", border: "none",
                    background: copied ? "rgba(189,157,255,0.15)" : "#2c2c2f",
                    color: copied ? "#bd9dff" : "#f9f5f8",
                    fontSize: "13px", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.2s", fontFamily: "inherit",
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copied ? "✓ Đã copy" : "Copy"}
                </button>
                <button
                  onClick={() => { setResult(null); setUrl(""); }}
                  style={{
                    padding: "10px 14px", borderRadius: "10px", border: "none",
                    background: "#2c2c2f", color: "#adaaad",
                    fontSize: "13px", fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "background 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1f1f22")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#2c2c2f")}
                >
                  Rút gọn khác
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="fade-up stats-row" style={{
          marginTop: "72px",
          display: "flex",
          gap: "40px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          animationDelay: "0.25s",
          borderTop: "1px solid rgba(72,71,74,0.12)",
          paddingTop: "40px",
          width: "100%",
          maxWidth: "520px",
        }}>
          {[
            { n: "< 10ms", label: "redirect time" },
            { n: "∞", label: "links & clicks" },
            { n: "QR", label: "built-in" },
            { n: "100%", label: "miễn phí" },
          ].map(f => (
            <div key={f.label} style={{ textAlign: "center" }}>
              <p className="display-font" style={{
                fontSize: "22px", fontWeight: 700, fontStyle: "italic",
                color: "var(--text)", letterSpacing: "-0.03em",
                lineHeight: 1, marginBottom: "4px",
              }}>{f.n}</p>
              <p style={{
                fontSize: "10px", color: "var(--text-tertiary)",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>{f.label}</p>
            </div>
          ))}
        </div>
      </main>

      <footer style={{
        borderTop: "1px solid rgba(72,71,74,0.1)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "8px",
      }}>
        <p style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "inherit" }}>
          © 2026 <strong style={{ color: "var(--text-secondary)" }}>ls/</strong>
        </p>
        <p style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "inherit" }}>
          Built with Next.js &amp; Vercel
        </p>
      </footer>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
