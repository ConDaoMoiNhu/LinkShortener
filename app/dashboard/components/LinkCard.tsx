"use client";

import { useState } from "react";

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  _count: { clicks: number };
}

interface Props {
  link: Link;
  baseUrl: string;
  onDeleted: () => void;
}

export default function LinkCard({ link, baseUrl, onDeleted }: Props) {
  const [copied, setCopied] = useState(false);
  const shortUrl = `${baseUrl}/${link.slug}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm("Xoá link này?")) return;
    await fetch(`/api/links/${link.id}`, { method: "DELETE" });
    onDeleted();
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-blue-600 font-medium text-sm truncate">{shortUrl}</p>
          <p className="text-gray-400 text-xs truncate mt-0.5">{link.originalUrl}</p>
        </div>
        <span className="text-xs text-gray-500 shrink-0">{link._count.clicks} clicks</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          {copied ? "Đã copy!" : "Copy"}
        </button>
        <button
          onClick={handleDelete}
          className="text-xs px-3 py-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition"
        >
          Xoá
        </button>
      </div>
    </div>
  );
}
