import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Nav */}
      <nav style={{
        padding: "18px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(12px)",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{
            fontFamily: "var(--font-geist-mono)",
            fontWeight: 700,
            fontSize: "16px",
            color: "var(--accent)",
            letterSpacing: "-0.03em",
          }}>ls/</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a
            href="https://github.com/ConDaoMoiNhu/LinkShortener"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            GitHub ↗
          </a>
          <Link
            href="/login"
            prefetch={false}
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              padding: "6px 14px",
              border: "1px solid var(--border-strong)",
              borderRadius: "6px",
            }}
          >
            Đăng nhập
          </Link>
          <Link
            href="/login"
            prefetch={false}
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#fff",
              textDecoration: "none",
              padding: "6px 16px",
              background: "var(--accent)",
              borderRadius: "6px",
              letterSpacing: "-0.01em",
            }}
          >
            Dùng miễn phí →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 96px",
        textAlign: "center",
        position: "relative",
      }}>
        {/* Dot grid bg */}
        <div className="dot-grid" style={{
          position: "absolute",
          inset: 0,
          opacity: 0.4,
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Badge */}
          <div className="fade-up" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "28px",
            padding: "4px 12px",
            border: "1px solid var(--border-strong)",
            borderRadius: "9999px",
            background: "var(--bg-subtle)",
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--accent)",
              display: "inline-block",
              animation: "pulse-glow 2s ease-in-out infinite",
            }} />
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-geist-mono)", letterSpacing: "0.04em" }}>
              free · unlimited · instant
            </span>
          </div>

          {/* Headline */}
          <h1 className="fade-up" style={{
            fontSize: "clamp(3rem, 8vw, 5.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.045em",
            lineHeight: 1.05,
            color: "var(--text)",
            marginBottom: "20px",
            maxWidth: "600px",
            animationDelay: "0.05s",
          }}>
            Short links<br />
            <span style={{ color: "var(--accent)" }}>that work.</span>
          </h1>

          {/* Subtext */}
          <p className="fade-up" style={{
            fontSize: "15px",
            color: "var(--text-secondary)",
            maxWidth: "360px",
            lineHeight: 1.7,
            marginBottom: "48px",
            animationDelay: "0.1s",
          }}>
            Rút gọn URL trong một giây. Theo dõi click, tạo QR code. Miễn phí, không giới hạn.
          </p>

          {/* URL Demo Card */}
          <div className="fade-up" style={{
            width: "100%",
            maxWidth: "460px",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-strong)",
            borderRadius: "14px",
            overflow: "hidden",
            marginBottom: "36px",
            animationDelay: "0.15s",
          }}>
            {/* Window chrome */}
            <div style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ff5f57", display: "block" }} />
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#febc2e", display: "block" }} />
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#28c840", display: "block" }} />
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: "10px", fontFamily: "var(--font-geist-mono)", color: "var(--text-tertiary)" }}>ls/ demo</span>
            </div>

            <div style={{ padding: "20px 22px" }}>
              {/* Input URL */}
              <div style={{
                background: "var(--bg-muted)",
                border: "1px solid var(--border-strong)",
                borderRadius: "7px",
                padding: "9px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "14px",
              }}>
                <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font-geist-mono)", flexShrink: 0 }}>URL</span>
                <span style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-geist-mono)",
                  color: "var(--text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
                </span>
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>↓</span>
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              </div>

              {/* Short URL result */}
              <div style={{
                background: "var(--accent-subtle)",
                border: "1px solid var(--accent-border)",
                borderRadius: "7px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{
                  fontSize: "14px",
                  fontFamily: "var(--font-geist-mono)",
                  fontWeight: 600,
                  color: "var(--accent)",
                  letterSpacing: "-0.02em",
                }}>
                  ls/docs23
                </span>
                <span style={{
                  fontSize: "10px",
                  color: "var(--accent)",
                  background: "rgba(249,115,22,0.12)",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontFamily: "var(--font-geist-mono)",
                }}>
                  copied ✓
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/login"
            prefetch={false}
            className="fade-up"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              textDecoration: "none",
              padding: "11px 28px",
              background: "var(--accent)",
              borderRadius: "8px",
              letterSpacing: "-0.01em",
              animationDelay: "0.2s",
              display: "inline-block",
            }}
          >
            Bắt đầu miễn phí →
          </Link>

          {/* Stats row */}
          <div className="fade-up" style={{
            marginTop: "56px",
            display: "flex",
            gap: "40px",
            flexWrap: "wrap",
            justifyContent: "center",
            animationDelay: "0.25s",
          }}>
            {[
              { n: "< 10ms", label: "edge latency" },
              { n: "∞", label: "links & clicks" },
              { n: "100%", label: "gratis" },
              { n: "QR", label: "instant" },
            ].map(f => (
              <div key={f.label} style={{ textAlign: "center" }}>
                <p style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--text)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  marginBottom: "4px",
                  fontFamily: "var(--font-geist-mono)",
                }}>{f.n}</p>
                <p style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "14px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <p style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-geist-mono)" }}>
          © 2026 ls/ — built with Next.js & Vercel
        </p>
      </footer>
    </div>
  );
}
