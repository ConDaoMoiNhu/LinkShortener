import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <span className="text-lg font-bold text-gray-900">LinkShort</span>
        <Link
          href="/dashboard"
          prefetch={false}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Dashboard →
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-xl">
          Rút gọn link.<br />
          <span className="text-blue-600">Cực nhanh.</span>
        </h1>
        <p className="mt-4 text-gray-500 text-lg max-w-md">
          Redirect tại edge CDN — không qua server. Analytics thời gian thực. Miễn phí 100%.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard"
            prefetch={false}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Bắt đầu miễn phí
          </Link>
          <a
            href="https://github.com"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
