"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  return (
    <div className="min-h-screen bg-[#07070C] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(212,255,92,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-display text-lg font-800" style={{ color: "#D4FF5C" }}>
              LS
            </span>
            <span className="font-display text-lg font-600 text-[#F0EEFF]">LinkShort</span>
          </Link>
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl p-8 border"
          style={{
            background: "#0D0D16",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <h1 className="font-display text-xl font-700 text-[#F0EEFF] mb-1">
            Đăng nhập
          </h1>
          <p className="text-sm text-[#58566E] mb-7">
            Tiếp tục để quản lý links của bạn
          </p>

          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "#131320",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F0EEFF",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.16)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              {/* Google icon */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Tiếp tục với Google
            </button>

            {/* GitHub */}
            <button
              onClick={() => signIn("github", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-700 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] font-display"
              style={{
                background: "#D4FF5C",
                color: "#07070C",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#C5F040";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#D4FF5C";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              Tiếp tục với GitHub
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-[#2E2E42]">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <span className="text-[#58566E]">điều khoản sử dụng</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
