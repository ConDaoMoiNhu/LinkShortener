"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { getLinksCache, setLinksCache, CachedLink } from "@/lib/links-cache";

interface AnalyticsData {
  totalClicks: number;
  byDevice: Record<string, number>;
  byCountry: Record<string, number>;
  byDate: Record<string, number>;
  byReferer: Record<string, number>;
  weekGrowth: number | null;
}

const REFERER_ICONS: Record<string, string> = {
  "instagram.com": "📸", "t.co": "🐦", "twitter.com": "🐦", "x.com": "🐦",
  "facebook.com": "👤", "fb.com": "👤", "youtube.com": "▶️", "tiktok.com": "🎵",
  "linkedin.com": "💼", "reddit.com": "🔸", "github.com": "⚙️",
  "direct": "🔗",
};

type TimeRange = "30D" | "7D" | "24H";

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", VN: "🇻🇳", GB: "🇬🇧", DE: "🇩🇪",
  FR: "🇫🇷", JP: "🇯🇵", AU: "🇦🇺", CA: "🇨🇦",
  SG: "🇸🇬", KR: "🇰🇷", IN: "🇮🇳", CN: "🇨🇳",
};
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", VN: "Việt Nam", GB: "United Kingdom",
  DE: "Germany", FR: "France", JP: "Japan", AU: "Australia",
  CA: "Canada", SG: "Singapore", KR: "South Korea", IN: "India", CN: "China",
};

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#bd9dff] text-[#2e006c] px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
        {payload[0].value.toLocaleString()}
        <div className="text-[10px] font-normal opacity-70">clicks</div>
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
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("30D");
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const [activeDevice, setActiveDevice] = useState(0);
  const [showAllSources, setShowAllSources] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setAnalyticsLoading(true);
    setAnalytics(null);
    fetch(`/api/analytics/${selected.slug}`)
      .then(r => r.json())
      .then(data => { setAnalytics(data); setAnalyticsLoading(false); })
      .catch(() => { setAnalytics(null); setAnalyticsLoading(false); });
  }, [selected]);

  const barData = useMemo(() => {
    const today = new Date();
    if (timeRange === "24H") {
      return Array.from({ length: 24 }, (_, i) => {
        const h = new Date(today);
        h.setHours(today.getHours() - (23 - i), 0, 0, 0);
        const key = h.toISOString().split("T")[0];
        const dayClicks = analytics?.byDate[key] ?? 0;
        return { date: `${h.getHours()}h`, clicks: i === 23 ? dayClicks : 0 };
      });
    }
    const days = timeRange === "7D" ? 7 : 30;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      const key = d.toISOString().split("T")[0];
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        clicks: analytics?.byDate[key] ?? 0,
      };
    });
  }, [analytics, timeRange]);

  const topReferrers = useMemo(() => {
    if (!analytics?.byReferer) return [];
    const total = Object.values(analytics.byReferer).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(analytics.byReferer)
      .sort(([, a], [, b]) => b - a)
      .map(([src, count], i) => ({
        src, count,
        pct: Math.round((count / total) * 100),
        icon: REFERER_ICONS[src] ?? "🌐",
        label: src === "direct" ? "Direct / Other" : src,
      }));
  }, [analytics]);

  const visibleReferrers = useMemo(() => {
    return showAllSources ? topReferrers : topReferrers.slice(0, 4);
  }, [topReferrers, showAllSources]);

  const topCountries = useMemo(() => analytics
    ? Object.entries(analytics.byCountry)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([code, count]) => ({
          code, count,
          name: COUNTRY_NAMES[code] ?? code,
          flag: COUNTRY_FLAGS[code] ?? "🌐",
          pct: "",
        }))
    : [], [analytics]);

  const deviceData = useMemo(() => {
    const total = analytics ? Object.values(analytics.byDevice).reduce((a, b) => a + b, 0) || 1 : 1;
    const configs = [
      { key: "mobile", icon: "📱", label: "Mobile" },
      { key: "desktop", icon: "💻", label: "Desktop" },
      { key: "tablet", icon: "🖥️", label: "Tablet" },
    ];
    return configs.map(cfg => ({
      ...cfg,
      count: analytics?.byDevice[cfg.key] ?? 0,
      pct: analytics ? Math.round(((analytics.byDevice[cfg.key] ?? 0) / total) * 100) : 0,
    }));
  }, [analytics]);

  // Empty state
  if (!loading && links.length === 0) {
    return (
      <div className="p-8 max-w-[1100px]">
        <h1 className="text-[#f9f5f8] font-black text-5xl tracking-[-2.4px] mb-8">Analytics</h1>
        <div className="flex flex-col items-center justify-center py-24 gap-5 bg-[#19191c] rounded-2xl border border-[rgba(72,71,74,0.1)]">
          <div className="text-5xl opacity-30">📊</div>
          <div className="text-center">
            <p className="text-[#f9f5f8] font-bold text-lg mb-2">No data yet</p>
            <p className="text-[#adaaad] text-sm max-w-xs">
              Create a short link and share it — analytics will appear here as clicks come in.
            </p>
          </div>
          <a href="/dashboard" className="px-6 py-2.5 rounded-xl font-bold text-sm text-black transition-opacity hover:opacity-90"
            style={{ backgroundImage: "linear-gradient(135deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)" }}>
            Create your first link →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1100px]">
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase mb-3">
          <span className="text-[#adaaad]">Dashboard</span>
          <span className="text-[rgba(173,170,173,0.4)]">›</span>
          <span className="text-[#bd9dff]">Analytics</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-[#f9f5f8] font-black text-5xl tracking-[-2.4px]">
            {loading ? "Analytics" : selected ? `/${selected.slug}` : "Analytics"}
          </h1>
          <div className="flex gap-3 items-center flex-wrap">
            {/* Link selector */}
            {links.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#19191c] border border-[rgba(72,71,74,0.2)] rounded-lg text-[#adaaad] text-sm font-bold hover:text-[#f9f5f8] transition-colors"
                  style={{ borderColor: dropdownOpen ? "rgba(189,157,255,0.4)" : undefined }}
                >
                  <span>📅</span>
                  {selected ? `/${selected.slug}` : "Select link"}
                  <span className="text-xs" style={{ transform: dropdownOpen ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▾</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute top-[calc(100%+6px)] right-0 min-w-full z-50 bg-[#19191c] border border-[rgba(72,71,74,0.2)] rounded-xl shadow-xl overflow-hidden">
                    {links.map((l, i) => (
                      <button
                        key={l.id}
                        onClick={() => { setSelected(l); setDropdownOpen(false); }}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-left hover:bg-[rgba(189,157,255,0.06)] transition-colors"
                        style={{
                          borderBottom: i < links.length - 1 ? "1px solid rgba(72,71,74,0.1)" : "none",
                          color: l.id === selected?.id ? "#bd9dff" : "#f9f5f8",
                          fontWeight: l.id === selected?.id ? 700 : 500,
                        }}
                      >
                        <span>/{l.slug}</span>
                        <span className="text-[#adaaad] text-xs ml-4">{l._count?.clicks ?? 0} clicks</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => {
                if (!analytics || !selected) return;
                const headers = ["Date", "Clicks"];
                const rows = barData.map(d => `${d.date},${d.clicks}`);
                const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `analytics_${selected.slug}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#19191c] border border-[rgba(72,71,74,0.2)] rounded-lg text-[#adaaad] text-sm font-bold hover:text-[#f9f5f8] transition-colors"
            >
              <span>⬇</span> Export
            </button>
            <button
              onClick={() => {
                if (!selected) return;
                const url = `${window.location.origin}/dashboard/analytics?slug=${selected.slug}`;
                navigator.clipboard.writeText(url).catch(() => {});
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              }}
              className="px-6 py-2.5 rounded-lg font-bold text-sm text-[#3c0089] shadow-[0_10px_20px_0_rgba(189,157,255,0.2)] hover:opacity-90 transition-all flex items-center justify-center min-w-[140px]"
              style={{ backgroundImage: "linear-gradient(163deg, rgb(189,157,255) 0%, rgb(138,76,252) 100%)" }}
            >
              {shareCopied ? "✓ Copied!" : "Share Analytics"}
            </button>
          </div>
        </div>
        {selected && !loading && (
          <p className="text-[#adaaad] text-sm mt-2 flex items-center gap-2">
            <span className="bg-[#fe81a4] text-[#5a0027] text-[10px] font-bold tracking-[0.5px] px-2 py-0.5 rounded">ACTIVE</span>
            <span>Forwarding to</span>
            <span className="text-[#bd9dff] truncate max-w-sm">{selected.originalUrl}</span>
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Clicks",
            value: analyticsLoading ? "—" : (analytics?.totalClicks ?? 0).toLocaleString(),
            sub: analytics?.weekGrowth != null ? `+${analytics.weekGrowth}% this week` : "No data yet",
            subColor: "#ff97b2",
            isUp: analytics?.weekGrowth != null && analytics.weekGrowth > 0,
          },
          {
            label: "Unique Visitors",
            value: "—",
            sub: "Tracking not enabled",
            subColor: "#adaaad",
            isUp: false,
          },
          {
            label: "Avg. Time to Click",
            value: "—",
            sub: "Tracking not enabled",
            subColor: "#bd9dff",
            isUp: false,
          },
          {
            label: "Top Region",
            value: topCountries[0]?.flag ?? "—",
            sub: topCountries[0]?.name ?? "No data",
            subColor: "#adaaad",
            isUp: false,
          },
        ].map((stat, i) => (
          <div key={i} className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-6">
            <p className="text-[#adaaad] text-[11px] font-bold tracking-[1.2px] uppercase mb-3">{stat.label}</p>
            <div className="text-[#f9f5f8] font-black text-5xl tracking-[-2.4px] leading-none mb-3">{stat.value}</div>
            <div className="flex items-center gap-1.5">
              {stat.isUp && (
                <svg width="8.75" height="8.75" viewBox="0 0 8.75 8.75" fill="none">
                  <path d="M0.816667 8.75L0 7.93333L6.76667 1.16667H2.91667V0H8.75V5.83333H7.58333V1.98333L0.816667 8.75" fill="#FF97B2"/>
                </svg>
              )}
              <span className="text-xs font-bold" style={{ color: stat.subColor }}>{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Bar chart — spans 2 cols */}
        <div className="col-span-2 bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[#f9f5f8] font-bold text-xl">Click Performance</h3>
            <div className="flex items-center gap-1 bg-[#0e0e10] rounded-full p-1">
              {(["30D", "7D", "24H"] as TimeRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    timeRange === r
                      ? "bg-[#bd9dff] text-[#2e006c]"
                      : "text-[#adaaad] hover:text-[#f9f5f8]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[#adaaad] text-sm mb-6">
            Performance trends over the last {timeRange === "24H" ? "24 hours" : timeRange === "7D" ? "7 days" : "30 days"}
          </p>
          {analyticsLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#bd9dff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : barData.every(d => d.clicks === 0) ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <div className="text-[#adaaad] text-sm mb-1 font-bold">No clicks in this period</div>
              <div className="text-[rgba(173,170,173,0.4)] text-xs">Share your shortlink to see performance progress</div>
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  barCategoryGap="20%"
                  onMouseLeave={() => setActiveBar(null)}
                >
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#adaaad", fontSize: 11 }}
                    interval={Math.floor(barData.length / 4)}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomBarTooltip />} cursor={false} />
                  <Bar
                    dataKey="clicks"
                    radius={[3, 3, 0, 0]}
                    onMouseEnter={(_: any, index: number) => setActiveBar(index)}
                  >
                    {barData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={index === activeBar ? "#bd9dff" : "rgba(189,157,255,0.25)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-6">
          <h3 className="text-[#f9f5f8] font-bold text-xl mb-1">Top Referrers</h3>
          <p className="text-[#adaaad] text-sm mb-6">Sources driving the most traffic</p>
          {visibleReferrers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="text-3xl opacity-30">🔗</div>
              <p className="text-[rgba(173,170,173,0.4)] text-sm text-center">No referrer data yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {visibleReferrers.map((ref, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm bg-[#2c2c2f] flex items-center justify-center shrink-0 text-[10px]">
                        {ref.icon}
                      </div>
                      <span className="text-[#f9f5f8] text-sm font-medium">{ref.label}</span>
                    </div>
                    <span className="text-[#f9f5f8] font-bold text-sm">{ref.count.toLocaleString()}</span>
                  </div>
                  <div className="bg-black h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#bd9dff] h-full rounded-full transition-all duration-700"
                      style={{ width: `${ref.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {topReferrers.length > 4 && (
            <button 
              onClick={() => setShowAllSources(s => !s)} 
              className="w-full mt-6 py-2.5 rounded-lg border border-[rgba(189,157,255,0.2)] text-[#bd9dff] text-sm font-bold hover:bg-[rgba(189,157,255,0.05)] transition-colors"
            >
              {showAllSources ? "Show less" : `View all sources (${topReferrers.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Geographic + Devices */}
      <div className="grid grid-cols-3 gap-6">
        {/* Geographic */}
        <div className="col-span-2 bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-6">
          <h3 className="text-[#f9f5f8] font-bold text-xl mb-1">Geographic</h3>
          <p className="text-[#adaaad] text-sm mb-6">Top clicking countries</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              {topCountries.length === 0 ? (
                <p className="text-[rgba(173,170,173,0.4)] text-sm">No country data yet.</p>
              ) : topCountries.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(72,71,74,0.1)] last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="text-[#f9f5f8] text-sm font-medium">{c.name}</span>
                  </div>
                  <span className="text-[#adaaad] text-sm font-bold">{c.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
            {/* World map stylized visual */}
            <div className="relative rounded-lg overflow-hidden bg-[#0e0e10] flex items-center justify-center min-h-[120px]">
              <style>{`
                @keyframes pulse-op {
                  0%, 100% { opacity: 0.1; transform: scale(0.95); }
                  50% { opacity: 0.6; transform: scale(1.05); }
                }
              `}</style>
              <svg viewBox="0 0 200 120" className="w-full h-full opacity-50" fill="none">
                <ellipse cx="50" cy="50" rx="30" ry="25" fill="#bd9dff" style={{ animation: "pulse-op 4s ease-in-out infinite" }} />
                <ellipse cx="100" cy="45" rx="35" ry="20" fill="#bd9dff" style={{ animation: "pulse-op 5s ease-in-out infinite 1s" }} />
                <ellipse cx="155" cy="48" rx="22" ry="18" fill="#bd9dff" style={{ animation: "pulse-op 3s ease-in-out infinite 0.5s" }} />
                <ellipse cx="75" cy="80" rx="20" ry="22" fill="#bd9dff" style={{ animation: "pulse-op 4.5s ease-in-out infinite 2s" }} />
                <ellipse cx="155" cy="75" rx="18" ry="20" fill="#bd9dff" style={{ animation: "pulse-op 3.5s ease-in-out infinite 1.5s" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-[rgba(189,157,255,0.2)] flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border border-[#bd9dff]" style={{ animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
                  <div className="w-4 h-4 rounded-full bg-[#bd9dff] shadow-[0_0_15px_#bd9dff]" />
                </div>
                <span className="text-[#f9f5f8] text-[10px] font-bold tracking-widest mt-3 bg-[rgba(14,14,16,0.8)] px-2.5 py-1 rounded backdrop-blur-md border border-[rgba(189,157,255,0.2)]">
                  LIVE TRAFFIC
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Devices */}
        <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-lg p-6">
          <h3 className="text-[#f9f5f8] font-bold text-xl mb-1">Devices</h3>
          <p className="text-[#adaaad] text-sm mb-6">Hardware &amp; browser split</p>

          {/* Mobile / Desktop / Tablet */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {deviceData.slice(0, 2).map((d, i) => (
              <div
                key={i}
                className="bg-black border border-[rgba(72,71,74,0.1)] rounded-xl p-4 text-center cursor-pointer transition-colors"
                style={{ borderColor: activeDevice === i ? "rgba(189,157,255,0.3)" : undefined }}
                onClick={() => setActiveDevice(i)}
              >
                <div className="text-2xl mb-1">{d.icon}</div>
                <div className="text-[#f9f5f8] font-bold text-2xl tracking-tight">{d.pct}%</div>
                <div className="text-[#adaaad] text-[10px] font-bold tracking-widest uppercase mt-0.5">{d.label}</div>
              </div>
            ))}
          </div>

          {/* Browser / device breakdown bars */}
          <div className="flex flex-col gap-3">
            {deviceData.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center shrink-0">{d.icon}</span>
                <div className="flex-1">
                  <div className="bg-[#2c2c2f] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[rgba(189,157,255,0.6)] h-full rounded-full transition-all duration-700"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[#adaaad] text-xs font-bold w-8 text-right">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
