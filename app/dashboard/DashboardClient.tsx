"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import CreateLinkForm from "./components/CreateLinkForm";
import LinkCard from "./components/LinkCard";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  _count: { clicks: number };
}

export default function DashboardClient({ user }: { user: User }) {
  const [links, setLinks] = useState<Link[]>([]);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">LinkShort</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Tạo link mới</h2>
          <CreateLinkForm onCreated={fetchLinks} />
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Links của bạn</h2>
          {links.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Chưa có link nào.</p>
          ) : (
            links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                baseUrl={baseUrl}
                onDeleted={fetchLinks}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
