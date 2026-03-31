"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Link2, BarChart2, Settings,
  HelpCircle, LogOut, Bell, Search,
} from "lucide-react";

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/links", label: "Links", icon: Link2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      // Set value in query and navigate
      router.push(`/dashboard/links?search=${encodeURIComponent(e.currentTarget.value.trim())}`);
    }
  };

  return (
    <div className="flex h-screen bg-[#0e0e10] text-[#f9f5f8] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-[220px] shrink-0 bg-[#131315] flex flex-col h-full border-r border-[rgba(72,71,74,0.1)]">
        {/* Logo */}
        <div className="px-4 pt-6 pb-6">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-[rgba(189,157,255,0.1)] w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                <path
                  d="M9 10H5C3.61667 10 2.4375 9.5125 1.4625 8.5375C0.4875 7.5625 0 6.38333 0 5C0 3.61667 0.4875 2.4375 1.4625 1.4625C2.4375 0.4875 3.61667 0 5 0H9V2H5C4.16667 2 3.45833 2.29167 2.875 2.875C2.29167 3.45833 2 4.16667 2 5C2 5.83333 2.29167 6.54167 2.875 7.125C3.45833 7.70833 4.16667 8 5 8H9V10M6 6V4H14V6H6M11 10V8H15C15.8333 8 16.5417 7.70833 17.125 7.125C17.7083 6.54167 18 5.83333 18 5C18 4.16667 17.7083 3.45833 17.125 2.875C16.5417 2.29167 15.8333 2 15 2H11V0H15C16.3833 0 17.5625 0.4875 18.5375 1.4625C19.5125 2.4375 20 3.61667 20 5C20 6.38333 19.5125 7.5625 18.5375 8.5375C17.5625 9.5125 16.3833 10 15 10H11"
                  fill="#BD9DFF"
                />
              </svg>
            </div>
            <div>
              <div className="text-[#f9f5f8] font-bold text-sm leading-tight">SnapLink</div>
              <div className="text-[rgba(249,245,248,0.5)] text-xs">Editorial Curator</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-2 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                  active
                    ? "bg-[#19191c] text-[#bd9dff]"
                    : "text-[rgba(249,245,248,0.5)] hover:text-[rgba(249,245,248,0.8)] hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#bd9dff] rounded-l-lg" />
                )}
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-6 border-t border-[rgba(72,71,74,0.1)] pt-4 flex flex-col gap-1">
          <a
            href="mailto:support@example.com"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[rgba(249,245,248,0.5)] hover:text-[rgba(249,245,248,0.8)] hover:bg-[rgba(255,255,255,0.03)] transition-colors"
          >
            <HelpCircle size={16} />
            Support
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[rgba(249,245,248,0.5)] hover:text-[rgba(249,245,248,0.8)] hover:bg-[rgba(255,255,255,0.03)] transition-colors w-full text-left"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header */}
        <header className="h-16 border-b border-[rgba(72,71,74,0.1)] flex items-center justify-between px-6 shrink-0 bg-[#0e0e10]">
          <div className="flex items-center gap-3 bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg px-3 h-9 w-64">
            <Search size={14} className="text-[#adaaad] shrink-0" />
            <input
              type="text"
              placeholder="Search links… (Enter)"
              className="bg-transparent text-sm text-[#f9f5f8] placeholder-[rgba(173,170,173,0.5)] outline-none flex-1"
              onKeyDown={handleSearch}
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors relative">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#bd9dff] rounded-full" />
            </button>
            <button className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors">
              <HelpCircle size={18} />
            </button>
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#262528] flex items-center justify-center shrink-0">
              {user.image ? (
                <img src={user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#bd9dff] font-bold text-xs">
                  {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
