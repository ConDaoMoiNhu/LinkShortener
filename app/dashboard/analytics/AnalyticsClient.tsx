"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { getLinksCache, setLinksCache, CachedLink } from "@/lib/links-cache";

interface AnalyticsData {
  totalClicks: number;
  byDevice: Record<string, number>;
  byCountry: Record<string, number>;
  byDate: Record<string, number>;
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", VN: "🇻🇳", GB: "🇬🇧", DE: "🇩🇪",
  FR: "🇫🇷", JP: "🇯🇵", AU: "🇦🇺", CA: "🇨🇦",
  SG: "🇸🇬", KR: "🇰🇷",
};
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", VN: "Việt Nam", GB: "United Kingdom",
  DE: "Germany", FR: "France", JP: "Japan", AU: "Australia",
  CA: "Canada", SG: "Singapore", KR: "South Korea",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#19191c] border border-[rgba(189,157,255,0.2)] px-4 py-3 rounded-xl shadow-xl">
        <div className="text-[#adaaad] text-[11px] font-bold uppercase tracking-wider mb-1">{label}</div>
        <div className="text-[#f9f5f8] font-bold text-lg">{payload[0].value.toLocaleString()} Clicks</div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsClient() {
  const [links, setLinks] = useState<CachedLink[]>(() => getLinksCache() ?? []);
  const [selected, setSelected] = useState<CachedLink | null>(() => getLinksCache()?.[0] ?? null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(() => getLinksCache() === null);
  const [activeDevice, setActiveDevice] = useState(0);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/links");
    if (res.ok) {
      const data: CachedLink[] = await res.json();
      setLinks(data);
      setLinksCache(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    }
    setLoading(false);
  }, [selected]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/analytics/${selected.slug}`)
      .then(r => r.json())
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  }, [selected]);

  const areaData = useMemo(() => analytics
    ? Object.entries(analytics.byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-13)
        .map(([date, clicks]) => ({
          date: new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
          clicks,
        }))
    : [], [analytics]);

  const topCountries = useMemo(() => analytics
    ? Object.entries(analytics.byCountry)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([code, count]) => ({
          code, count,
          name: COUNTRY_NAMES[code] ?? code,
          flag: COUNTRY_FLAGS[code] ?? "🌐",
        }))
    : [], [analytics]);

  const deviceData = useMemo(() => {
    const total = analytics ? Object.values(analytics.byDevice).reduce((a, b) => a + b, 0) || 1 : 1;
    return analytics
      ? [
          { icon: "📱", label: "Mobile", pct: Math.round(((analytics.byDevice.mobile ?? 0) / total) * 100) },
          { icon: "💻", label: "Desktop", pct: Math.round(((analytics.byDevice.desktop ?? 0) / total) * 100) },
          { icon: "🖥️", label: "Other", pct: Math.round(((analytics.byDevice.other ?? 0) / total) * 100) },
        ]
      : [
          { icon: "📱", label: "Mobile", pct: 0 },
          { icon: "💻", label: "Desktop", pct: 0 },
          { icon: "🖥️", label: "Other", pct: 0 },
        ];
  }, [analytics]);

  const totalLinksClicks = useMemo(() => links.reduce((s, l) => s + (l._count?.clicks ?? 0), 0), [links]);

  return (
    <div className="p-4 md:p-8 max-w-[1100px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase mb-3">
          <span className="text-[#adaaad]">Dashboard</span>
          <span className="text-[rgba(173,170,173,0.4)]">›</span>
          <span className="text-[#bd9dff]">Analytics</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[#f9f5f8] font-black text-4xl md:text-5xl tracking-[-2.4px]">
              {selected ? `/${selected.slug}` : "Analytics"}
            </h1>
            {selected && (
              <p className="text-[#adaaad] text-sm mt-1 truncate max-w-lg">→ {selected.originalUrl}</p>
            )}
          </div>
          <div className="flex gap-3 items-center">
            {links.length > 1 && (
              <select
                value={selected?.id ?? ""}
                onChange={e => setSelected(links.find(l => l.id === e.target.value) ?? null)}
                className="bg-[#19191c] border border-[rgba(72,71,74,0.2)] rounded-lg px-4 py-2.5 text-[#f9f5f8] text-sm font-bold outline-none"
              >
                {links.map(l => (
                  <option key={l.id} value={l.id}>/{l.slug} ({l._count?.clicks ?? 0} clicks)</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Clicks", value: analytics ? analytics.totalClicks.toLocaleString() : "—" },
          { label: "All Links", value: links.length.toString() },
          { label: "Total Engagement", value: totalLinksClicks.toLocaleString() },
          { label: "Top Country", value: topCountries[0] ? `${topCountries[0].flag} ${topCountries[0].code}` : "—" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-6">
            <p className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase mb-3">{stat.label}</p>
            <div className="text-[#f9f5f8] font-black text-4xl tracking-[-1.8px]">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Area chart */}
      {analytics && (
        <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[#f9f5f8] font-bold text-xl">Clicks Over Time</h3>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#bd9dff]" />
              <span className="text-[#adaaad] text-xs font-bold uppercase tracking-wider">Organic Clicks</span>
            </div>
          </div>
          <p className="text-[#adaaad] text-sm mb-6">Last 13 days</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bd9dff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#bd9dff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(72,71,74,0.1)" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#adaaad", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#bd9dff"
                  strokeWidth={2}
                  fill="url(#clickGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Top Links */}
        <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-6">
          <h3 className="text-[#f9f5f8] font-bold text-base mb-5">All Links</h3>
          <div className="flex flex-col gap-4">
            {links.slice(0, 5).map(l => {
              const pct = totalLinksClicks > 0 ? Math.round((l._count?.clicks ?? 0) / totalLinksClicks * 100) : 0;
              return (
                <div key={l.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#adaaad] text-sm truncate max-w-[120px]">/{l.slug}</span>
                    <span className="text-[#adaaad] text-sm font-bold">{pct}%</span>
                  </div>
                  <div className="bg-[#2c2c2f] h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: "linear-gradient(90deg, #bd9dff, #8a4cfc)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic by Region */}
        <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-6">
          <h3 className="text-[#f9f5f8] font-bold text-base mb-4">Traffic by Region</h3>
          <div className="relative rounded-lg overflow-hidden mb-4 h-28 bg-[#0e0e10]">
            <img
              src="/59c491d915420b50f25192c7f9ba93ecb1fd2747.png"
              alt="World Map"
              className="w-full h-full object-cover opacity-60"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col gap-2">
            {topCountries.length === 0 ? (
              <p className="text-[#adaaad] text-sm">No data yet</p>
            ) : topCountries.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{c.flag}</span>
                  <span className="text-[#adaaad] text-sm">{c.name}</span>
                </div>
                <span className="text-[#adaaad] text-sm font-bold">{c.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-6">
          <h3 className="text-[#f9f5f8] font-bold text-base mb-5">Device Distribution</h3>
          <div className="flex items-center justify-center mb-5">
            <div
              className="w-28 h-28 rounded-2xl border-2 border-[#bd9dff] flex flex-col items-center justify-center cursor-pointer"
              style={{ backgroundColor: "rgba(189,157,255,0.05)" }}
            >
              <span className="text-3xl">{deviceData[activeDevice].icon}</span>
              <div className="text-[#f9f5f8] font-bold text-2xl mt-1">{deviceData[activeDevice].pct}%</div>
              <div className="text-[#adaaad] text-[10px] font-bold uppercase tracking-wider">{deviceData[activeDevice].label}</div>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            {deviceData.map((d, i) => (
              <button
                key={i}
                onClick={() => setActiveDevice(i)}
                className={`flex flex-col items-center gap-1 transition-opacity ${activeDevice === i ? "opacity-100" : "opacity-40"}`}
              >
                <span className="text-xl">{d.icon}</span>
                <span className="text-[#adaaad] text-xs font-bold">{d.pct}%</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
