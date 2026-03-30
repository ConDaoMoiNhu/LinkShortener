"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  SG: "🇸🇬", KR: "🇰🇷", IN: "🇮🇳", CN: "🇨🇳",
};
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", VN: "Việt Nam", GB: "United Kingdom",
  DE: "Germany", FR: "France", JP: "Japan", AU: "Australia",
  CA: "Canada", SG: "Singapore", KR: "South Korea",
  IN: "India", CN: "China",
};

// Count-up animation hook
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (target === 0) { setValue(0); return; }
    const startTime = performance.now();
    const startVal = 0;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startVal + eased * (target - startVal)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return value;
}

// Animated number component
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const animated = useCountUp(value);
  return <>{animated.toLocaleString()}{suffix}</>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div
        className="px-4 py-3 rounded-2xl shadow-2xl"
        style={{
          background: "rgba(19,19,21,0.97)",
          border: "1px solid rgba(189,157,255,0.25)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="text-[#adaaad] text-[10px] font-bold uppercase tracking-widest mb-1">{label}</div>
        <div className="text-[#f9f5f8] font-black text-2xl tracking-tight">
          {payload[0].value.toLocaleString()}
          <span className="text-[#bd9dff] text-sm font-bold ml-1">clicks</span>
        </div>
      </div>
    );
  }
  return null;
};

const DEVICE_CONFIG = [
  { key: "mobile", icon: "📱", label: "Mobile", color: "#bd9dff" },
  { key: "desktop", icon: "💻", label: "Desktop", color: "#fe81a4" },
  { key: "tablet", icon: "🖥️", label: "Other", color: "#81d4fe" },
];

export default function AnalyticsClient() {
  const [links, setLinks] = useState<CachedLink[]>(() => getLinksCache() ?? []);
  const [selected, setSelected] = useState<CachedLink | null>(() => getLinksCache()?.[0] ?? null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(() => getLinksCache() === null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [activeDevice, setActiveDevice] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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

  // Always generate 13 days, fill missing with 0
  const areaData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 13 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (12 - i));
      const key = d.toISOString().split("T")[0];
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        clicks: analytics?.byDate[key] ?? 0,
      };
    });
  }, [analytics]);

  const topCountries = useMemo(() => analytics
    ? Object.entries(analytics.byCountry)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([code, count]) => ({
          code, count,
          name: COUNTRY_NAMES[code] ?? code,
          flag: COUNTRY_FLAGS[code] ?? "🌐",
        }))
    : [], [analytics]);

  const deviceData = useMemo(() => {
    const total = analytics ? Object.values(analytics.byDevice).reduce((a, b) => a + b, 0) || 1 : 1;
    return DEVICE_CONFIG.map(cfg => ({
      ...cfg,
      count: analytics?.byDevice[cfg.key] ?? 0,
      pct: analytics ? Math.round(((analytics.byDevice[cfg.key] ?? 0) / total) * 100) : 0,
    }));
  }, [analytics]);

  const totalLinksClicks = useMemo(() => links.reduce((s, l) => s + (l._count?.clicks ?? 0), 0), [links]);
  const maxClicks = useMemo(() => links.length > 0 ? Math.max(...links.map(l => l._count?.clicks ?? 0), 1) : 1, [links]);

  const statsData = [
    { label: "Total Clicks", value: analytics?.totalClicks ?? 0, accent: "#bd9dff" },
    { label: "All Links", value: links.length, accent: "#fe81a4" },
    { label: "Total Engagement", value: totalLinksClicks, accent: "#81d4fe" },
    { label: "Top Country", value: topCountries[0]?.flag ?? "—", isText: true, sub: topCountries[0]?.name, accent: "#a8e6cf" },
  ];

  // Empty state — no links at all
  if (!loading && links.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-[1100px]">
        <h1 className="text-[#f9f5f8] font-black text-4xl md:text-5xl tracking-[-2.4px] mb-8">Analytics</h1>
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
    <div className="p-4 md:p-8 max-w-[1100px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase mb-4">
          <span className="text-[rgba(173,170,173,0.5)]">Dashboard</span>
          <span className="text-[rgba(173,170,173,0.3)]">›</span>
          <span className="text-[#bd9dff]">Analytics</span>
        </div>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[#f9f5f8] font-black text-4xl md:text-5xl tracking-[-2.4px] leading-tight">
              {loading ? "Analytics" : selected ? `/${selected.slug}` : "Analytics"}
            </h1>
            {selected && !loading && (
              <p className="text-[#adaaad] text-sm mt-1.5 truncate max-w-md">
                → {selected.originalUrl}
              </p>
            )}
          </div>
          {links.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              {/* Trigger */}
              <button
                onClick={() => setDropdownOpen(o => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderRadius: "12px",
                  background: "#19191c",
                  border: `1px solid ${dropdownOpen ? "rgba(189,157,255,0.4)" : "rgba(72,71,74,0.25)"}`,
                  color: "#f9f5f8", fontSize: "13px", fontWeight: 700,
                  cursor: "pointer", transition: "border-color 0.2s",
                  fontFamily: "inherit", whiteSpace: "nowrap",
                  boxShadow: dropdownOpen ? "0 0 0 3px rgba(189,157,255,0.08)" : "none",
                  minWidth: "200px", justifyContent: "space-between",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "rgba(189,157,255,0.7)", fontWeight: 400 }}>/</span>
                  <span>{selected?.slug ?? "Select link"}</span>
                </span>
                <span style={{
                  color: "#adaaad", fontSize: "11px",
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  display: "inline-block",
                }}>▾</span>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0,
                  minWidth: "100%", zIndex: 100,
                  background: "#19191c",
                  border: "1px solid rgba(72,71,74,0.3)",
                  borderRadius: "14px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
                  overflow: "hidden",
                  animation: "scaleIn 0.15s cubic-bezier(0.16,1,0.3,1) both",
                }}>
                  {links.map((l, i) => {
                    const isActive = l.id === selected?.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => { setSelected(l); setDropdownOpen(false); }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          width: "100%", padding: "10px 14px",
                          background: isActive ? "rgba(189,157,255,0.08)" : "transparent",
                          border: "none",
                          borderBottom: i < links.length - 1 ? "1px solid rgba(72,71,74,0.1)" : "none",
                          color: isActive ? "#bd9dff" : "#f9f5f8",
                          fontSize: "13px", fontWeight: isActive ? 700 : 500,
                          cursor: "pointer", textAlign: "left",
                          fontFamily: "inherit", gap: "16px",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => {
                          if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        }}
                        onMouseLeave={e => {
                          if (!isActive) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ color: isActive ? "rgba(189,157,255,0.6)" : "rgba(249,245,248,0.3)", fontWeight: 400 }}>/</span>
                          {l.slug}
                        </span>
                        <span style={{
                          fontSize: "11px", fontWeight: 600,
                          color: isActive ? "rgba(189,157,255,0.7)" : "rgba(173,170,173,0.5)",
                          whiteSpace: "nowrap",
                        }}>
                          {l._count?.clicks ?? 0} clicks
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statsData.map((stat, i) => (
          <div
            key={i}
            className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-2xl p-5 relative overflow-hidden group"
            style={{
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = `${stat.accent}30`)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(72,71,74,0.1)")}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(circle at 80% 20%, ${stat.accent}08 0%, transparent 70%)` }}
            />
            <p className="text-[#adaaad] text-[10px] font-bold tracking-[1.4px] uppercase mb-3">{stat.label}</p>
            {stat.isText ? (
              <div>
                <div className="text-[#f9f5f8] font-black text-3xl">{stat.value}</div>
                {stat.sub && <div className="text-[#adaaad] text-xs mt-1 truncate">{stat.sub}</div>}
              </div>
            ) : (
              <div
                className="font-black text-3xl md:text-4xl tracking-tight"
                style={{ color: stat.accent }}
              >
                {loading || analyticsLoading ? (
                  <span className="text-[rgba(173,170,173,0.3)]">—</span>
                ) : mounted ? (
                  <AnimatedNumber value={stat.value as number} />
                ) : (
                  (stat.value as number).toLocaleString()
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <h3 className="text-[#f9f5f8] font-bold text-lg">Clicks Over Time</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#bd9dff] animate-pulse" />
            <span className="text-[#adaaad] text-[10px] font-bold uppercase tracking-widest">Organic Traffic</span>
          </div>
        </div>
        <p className="text-[rgba(173,170,173,0.5)] text-xs mb-6">Last 13 days</p>

        {analyticsLoading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#bd9dff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bd9dff" stopOpacity={0.35} />
                    <stop offset="75%" stopColor="#bd9dff" stopOpacity={0.04} />
                    <stop offset="100%" stopColor="#bd9dff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(72,71,74,0.08)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(173,170,173,0.5)", fontSize: 10, fontWeight: 600 }}
                  interval={2}
                />
                <YAxis
                  hide={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(173,170,173,0.4)", fontSize: 10 }}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(189,157,255,0.2)", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#bd9dff"
                  strokeWidth={2.5}
                  fill="url(#clickGradient)"
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.clicks === 0) return <g key={cx} />;
                    return (
                      <circle
                        key={cx}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#bd9dff"
                        stroke="rgba(19,19,21,0.8)"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={{ r: 6, fill: "#bd9dff", stroke: "rgba(189,157,255,0.3)", strokeWidth: 6 }}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* All Links breakdown */}
        <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-2xl p-6">
          <h3 className="text-[#f9f5f8] font-bold text-base mb-5">Link Performance</h3>
          {links.length === 0 ? (
            <p className="text-[rgba(173,170,173,0.4)] text-sm">No links yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {links.slice(0, 5).map((l, i) => {
                const clicks = l._count?.clicks ?? 0;
                const pct = Math.round((clicks / maxClicks) * 100);
                const colors = ["#bd9dff", "#fe81a4", "#81d4fe", "#a8e6cf", "#ffd180"];
                return (
                  <div key={l.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#f9f5f8] text-sm font-bold truncate max-w-[140px]">/{l.slug}</span>
                      <span className="text-[#adaaad] text-xs font-bold shrink-0 ml-2">{clicks.toLocaleString()} clicks</span>
                    </div>
                    <div className="bg-[rgba(44,44,47,0.6)] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: colors[i % colors.length],
                          transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: `0 0 8px ${colors[i % colors.length]}60`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Traffic by Region */}
        <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-2xl p-6">
          <h3 className="text-[#f9f5f8] font-bold text-base mb-5">Traffic by Region</h3>
          {topCountries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3">
              <div className="text-3xl opacity-30">🌍</div>
              <p className="text-[rgba(173,170,173,0.4)] text-sm text-center">
                No geographic data yet.<br />Share your link to see traffic.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {topCountries.map((c, i) => {
                const maxCount = topCountries[0].count;
                const pct = Math.round((c.count / maxCount) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.flag}</span>
                        <span className="text-[#adaaad] text-sm">{c.name}</span>
                      </div>
                      <span className="text-[#f9f5f8] text-sm font-bold">{c.count.toLocaleString()}</span>
                    </div>
                    <div className="bg-[rgba(44,44,47,0.6)] h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#bd9dff]"
                        style={{
                          width: `${pct}%`,
                          transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                          transitionDelay: `${i * 80}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Device Distribution */}
        <div className="bg-[#19191c] border border-[rgba(72,71,74,0.1)] rounded-2xl p-6">
          <h3 className="text-[#f9f5f8] font-bold text-base mb-5">Device Split</h3>
          <div className="flex flex-col gap-4">
            {deviceData.map((d, i) => (
              <button
                key={i}
                onClick={() => setActiveDevice(i)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{d.icon}</span>
                    <span
                      className="text-sm font-bold transition-colors"
                      style={{ color: activeDevice === i ? d.color : "#adaaad" }}
                    >
                      {d.label}
                    </span>
                  </div>
                  <span
                    className="text-sm font-black transition-colors"
                    style={{ color: activeDevice === i ? d.color : "rgba(173,170,173,0.6)" }}
                  >
                    {d.pct}%
                  </span>
                </div>
                <div className="bg-[rgba(44,44,47,0.6)] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${d.pct}%`,
                      background: d.color,
                      opacity: activeDevice === i ? 1 : 0.35,
                      boxShadow: activeDevice === i ? `0 0 12px ${d.color}50` : "none",
                    }}
                  />
                </div>
              </button>
            ))}

            {/* Big number highlight */}
            <div
              className="mt-2 rounded-xl p-4 text-center"
              style={{ background: `${deviceData[activeDevice].color}10`, border: `1px solid ${deviceData[activeDevice].color}20` }}
            >
              <div className="text-4xl mb-1">{deviceData[activeDevice].icon}</div>
              <div
                className="font-black text-3xl tracking-tight"
                style={{ color: deviceData[activeDevice].color }}
              >
                {mounted ? <AnimatedNumber value={deviceData[activeDevice].pct} suffix="%" /> : `${deviceData[activeDevice].pct}%`}
              </div>
              <div className="text-[#adaaad] text-xs font-bold uppercase tracking-widest mt-1">
                {deviceData[activeDevice].label}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
