import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Nav */}
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-1.5">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect width="20" height="20" rx="5" fill="var(--accent)" />
            <path d="M6 10h8M10 6l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            LinkShort
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm transition-colors"
            style={{ color: "var(--text-secondary)" }}
            prefetch={false}
          >
            Đăng nhập
          </Link>
          <Link
            href="/dashboard"
            prefetch={false}
            className="text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors"
            style={{
              background: "var(--accent)",
              color: "#fff",
            }}
          >
            Bắt đầu miễn phí
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8 border"
          style={{
            background: "var(--accent-subtle)",
            color: "var(--accent)",
            borderColor: "transparent",
          }}
        >
          Miễn phí · Không giới hạn · Không cần thẻ
        </div>

        <h1
          className="text-5xl sm:text-6xl font-bold tracking-tight max-w-2xl leading-tight"
          style={{ color: "var(--text)" }}
        >
          Rút gọn link.{" "}
          <span style={{ color: "var(--accent)" }}>Cực nhanh.</span>
        </h1>

        <p
          className="mt-5 text-base max-w-md leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Redirect tại Edge CDN — không qua server. Analytics thời gian thực.
          QR code tức thì. Miễn phí 100%.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/dashboard"
            prefetch={false}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Bắt đầu miễn phí →
          </Link>
          <a
            href="https://github.com/ConDaoMoiNhu/LinkShortener"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors"
            style={{
              color: "var(--text-secondary)",
              borderColor: "var(--border)",
              background: "var(--bg)",
            }}
          >
            GitHub
          </a>
        </div>

        {/* Feature grid */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full">
          {[
            { icon: "⚡", label: "Edge Redirect", desc: "Không qua server" },
            { icon: "📊", label: "Analytics", desc: "Click theo thời gian thực" },
            { icon: "🔗", label: "Custom Alias", desc: "Slug tuỳ chỉnh" },
            { icon: "📱", label: "QR Code", desc: "Tạo ngay tức thì" },
          ].map((f) => (
            <div
              key={f.label}
              className="p-4 rounded-xl border text-left"
              style={{
                background: "var(--bg-subtle)",
                borderColor: "var(--border)",
              }}
            >
              <div className="text-lg mb-2">{f.icon}</div>
              <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                {f.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer
        className="border-t px-6 py-4 flex items-center justify-center"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          © 2026 LinkShort — Built with Next.js & Vercel
        </p>
      </footer>
    </div>
  );
}
