import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07070C] flex flex-col overflow-hidden">
      {/* Background glow blobs */}
      <div
        className="fixed top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212,255,92,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212,255,92,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <header className="relative z-10 px-6 md:px-10 py-5 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span
            className="font-display text-base font-700 tracking-tight"
            style={{ color: "#D4FF5C" }}
          >
            LS
          </span>
          <span className="font-display text-base font-600 text-[#F0EEFF]">
            LinkShort
          </span>
        </div>
        <Link
          href="/dashboard"
          prefetch={false}
          className="text-xs font-medium px-4 py-2 rounded-full border border-white/10 text-[#F0EEFF]/60 hover:text-[#F0EEFF] hover:border-white/20 transition-all duration-200"
        >
          Dashboard →
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <div className="animate-fade-up mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D4FF5C]/20 bg-[#D4FF5C]/[0.06]">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#D4FF5C" }}
          />
          <span className="text-xs font-medium" style={{ color: "#D4FF5C" }}>
            Miễn phí 100% · Không giới hạn
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up-delay-1 font-display text-[clamp(3rem,10vw,7rem)] font-800 leading-[0.92] tracking-[-0.03em] text-[#F0EEFF] max-w-4xl">
          Rút gọn link.
          <br />
          <span style={{ color: "#D4FF5C" }}>Cực nhanh.</span>
        </h1>

        <p className="animate-fade-up-delay-2 mt-6 text-[#58566E] text-base md:text-lg max-w-md leading-relaxed">
          Redirect tại Edge CDN — không qua server.
          <br />
          Analytics thời gian thực. QR code tức thì.
        </p>

        {/* CTA */}
        <div className="animate-fade-up-delay-3 mt-10 flex items-center gap-3">
          <Link
            href="/dashboard"
            prefetch={false}
            className="group relative px-6 py-3 rounded-xl font-display font-600 text-sm text-[#07070C] overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "#D4FF5C" }}
          >
            <span className="relative z-10">Bắt đầu miễn phí →</span>
          </Link>
          <a
            href="https://github.com/ConDaoMoiNhu/LinkShortener"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl font-display font-500 text-sm text-[#F0EEFF]/50 border border-white/[0.08] hover:text-[#F0EEFF]/80 hover:border-white/[0.15] transition-all duration-200"
          >
            GitHub
          </a>
        </div>

        {/* Feature pills */}
        <div className="animate-fade-up-delay-3 mt-16 flex flex-wrap justify-center gap-2">
          {[
            "⚡ Edge Redirect",
            "📊 Click Analytics",
            "🔗 Custom Alias",
            "📱 QR Code",
            "🔐 OAuth Login",
          ].map((f) => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-lg text-xs text-[#58566E] border border-white/[0.06] bg-white/[0.02]"
            >
              {f}
            </span>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-5 flex items-center justify-center border-t border-white/[0.04]">
        <p className="text-xs text-[#2E2E42]">
          © 2026 LinkShort — Built with Next.js + Vercel
        </p>
      </footer>
    </div>
  );
}
