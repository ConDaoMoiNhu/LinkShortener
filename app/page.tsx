import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* Nav */}
      <nav style={{
        padding: "0 32px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        background: "var(--bg)",
        zIndex: 50,
      }}>
        <div className="display-font" style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "var(--accent)",
          letterSpacing: "-0.04em",
          fontStyle: "italic",
        }}>
          ls·
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <a
            href="https://github.com/ConDaoMoiNhu/LinkShortener"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            GitHub ↗
          </a>
          <Link href="/login" prefetch={false} className="btn-ghost" style={{ padding: "6px 14px" }}>
            Đăng nhập
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
        padding: "72px 24px 96px",
        textAlign: "center",
      }}>

        {/* Eyebrow */}
        <p className="fade-up mono" style={{
          fontSize: "11px",
          color: "var(--accent)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "20px",
          animationDelay: "0s",
        }}>
          miễn phí · không giới hạn
        </p>

        {/* Headline */}
        <h1 className="fade-up display-font" style={{
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
          maxWidth: "380px",
          lineHeight: 1.75,
          marginBottom: "44px",
          animationDelay: "0.1s",
        }}>
          Dán đường dẫn dài, nhận link ngắn gọn tức thì.
          Theo dõi lượt click, tạo QR code. Hoàn toàn miễn phí.
        </p>

        {/* CTA */}
        <div className="fade-up" style={{ animationDelay: "0.15s", display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/login" prefetch={false} className="btn-primary">
            Bắt đầu miễn phí →
          </Link>
        </div>

        {/* Demo card */}
        <div className="fade-up card" style={{
          marginTop: "56px",
          width: "100%",
          maxWidth: "420px",
          padding: "24px",
          textAlign: "left",
          animationDelay: "0.2s",
        }}>
          {/* Long URL row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            background: "var(--bg-muted)",
            borderRadius: "8px",
            marginBottom: "12px",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span className="mono" style={{
              fontSize: "11px",
              color: "var(--text-tertiary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
            </span>
          </div>

          {/* Arrow */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>↓</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Short URL */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "var(--accent-subtle)",
            border: "1px solid var(--accent-border)",
            borderRadius: "8px",
          }}>
            <div>
              <span className="mono" style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-secondary)",
                letterSpacing: "-0.01em",
              }}>yourdomain.com/</span>
              <span className="mono" style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--accent)",
                letterSpacing: "-0.01em",
              }}>docs23</span>
            </div>
            <span style={{
              fontSize: "10px",
              color: "var(--accent)",
              background: "var(--accent-subtle)",
              border: "1px solid var(--accent-border)",
              padding: "3px 8px",
              borderRadius: "4px",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}>
              ✓ copied
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="fade-up" style={{
          marginTop: "52px",
          display: "flex",
          gap: "48px",
          flexWrap: "wrap",
          justifyContent: "center",
          animationDelay: "0.25s",
        }}>
          {[
            { n: "< 10ms", label: "redirect time" },
            { n: "∞", label: "links & clicks" },
            { n: "QR", label: "codes built-in" },
            { n: "100%", label: "gratis" },
          ].map(f => (
            <div key={f.label} style={{ textAlign: "center" }}>
              <p className="display-font" style={{
                fontSize: "24px",
                fontWeight: 700,
                fontStyle: "italic",
                color: "var(--text)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                marginBottom: "4px",
              }}>{f.n}</p>
              <p style={{
                fontSize: "10px",
                color: "var(--text-tertiary)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>{f.label}</p>
            </div>
          ))}
        </div>
      </main>

      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "14px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <p className="mono" style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
          © 2026 ls/ — built with Next.js & Vercel
        </p>
      </footer>
    </div>
  );
}
