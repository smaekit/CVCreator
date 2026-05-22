import { useState } from 'react'
import {
  BarChart3, Users, FileText, Download, TrendingUp, TrendingDown,
  Sparkles, Building2, Activity, Palette, Calendar, Check, X,
  Target, Zap, AlertCircle, Repeat,
} from 'lucide-react'
import { adminMock, type TimePoint } from './adminMock'
import { cn } from '@/lib/utils'

// ─── Utils ────────────────────────────────────────────────────────────────────

function fmtNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function fmtPercent(delta: number): string {
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${(delta * 100).toFixed(1)}%`
}

function deltaPct(curr: number, prev: number): number {
  if (prev === 0) return curr === 0 ? 0 : 1
  return (curr - prev) / prev
}

function shortDate(d: Date, granularity: 'day' | 'week' | 'month'): string {
  if (granularity === 'month') return d.toLocaleDateString('en-US', { month: 'short' })
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const data = adminMock
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const usersDelta = deltaPct(data.kpis.totalUsers.value, data.kpis.totalUsers.prev)
  const cvsDelta = deltaPct(data.kpis.totalCvs.value, data.kpis.totalCvs.prev)
  const pdfsDelta = deltaPct(data.kpis.pdfDownloads.value, data.kpis.pdfDownloads.prev)
  const avgDelta = deltaPct(data.kpis.avgCvsPerUser.value, data.kpis.avgCvsPerUser.prev)

  const cvSeries = data.cvsCreated[period]

  return (
    <div
      className="min-h-screen text-zinc-900"
      style={{
        background: '#FAF7F2',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        fontFamily: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
              <BarChart3 className="h-3 w-3" />
              Admin
            </p>
            <h1
              className="text-3xl tracking-tight"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800 }}
            >
              Command center
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Operations, growth, and pricing readiness — at a glance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200"
              title="Backend stats endpoint not wired yet — replace adminMock.ts with API data."
            >
              <AlertCircle className="h-3 w-3" />
              Mock data
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              <Calendar className="h-3 w-3" />
              Last 30 days
            </button>
          </div>
        </header>

        {/* ── KPI strip (dark, inverted — Charcoal vibe) ─────────────── */}
        <section className="mb-6 grid gap-3 rounded-2xl bg-zinc-900 p-3 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.4)] sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            icon={<Users className="h-4 w-4" />}
            label="Registered users"
            value={fmtNumber(data.kpis.totalUsers.value)}
            delta={usersDelta}
            spark={data.kpis.totalUsers.spark}
            tone="indigo"
          />
          <Kpi
            icon={<FileText className="h-4 w-4" />}
            label="CVs created"
            value={fmtNumber(data.kpis.totalCvs.value)}
            delta={cvsDelta}
            spark={data.kpis.totalCvs.spark}
            tone="rose"
          />
          <Kpi
            icon={<Download className="h-4 w-4" />}
            label="PDFs downloaded"
            value={fmtNumber(data.kpis.pdfDownloads.value)}
            delta={pdfsDelta}
            spark={data.kpis.pdfDownloads.spark}
            tone="emerald"
          />
          <Kpi
            icon={<Repeat className="h-4 w-4" />}
            label="Avg CVs / user"
            value={data.kpis.avgCvsPerUser.value.toFixed(2)}
            delta={avgDelta}
            spark={[]}
            tone="amber"
          />
        </section>

        {/* ── CV creation chart ──────────────────────────────────────── */}
        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                className="text-lg tracking-tight"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}
              >
                CVs created
              </h2>
              <p className="text-xs text-zinc-500">When the work happens.</p>
            </div>
            <PeriodTabs value={period} onChange={setPeriod} />
          </header>

          <BarChart series={cvSeries} accent="#E11D48" granularity={period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month'} />

          <footer className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-zinc-500">
            <Stat label="Total" value={fmtNumber(cvSeries.reduce((s, p) => s + p.value, 0))} />
            <Stat label="Peak" value={fmtNumber(Math.max(...cvSeries.map(p => p.value)))} />
            <Stat label="Avg" value={(cvSeries.reduce((s, p) => s + p.value, 0) / cvSeries.length).toFixed(1)} />
          </footer>
        </section>

        {/* ── User growth + theme usage ──────────────────────────────── */}
        <section className="mb-6 grid gap-6 lg:grid-cols-5">
          {/* User growth — area chart */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:col-span-3">
            <header className="mb-5 flex items-center justify-between">
              <div>
                <h2
                  className="text-lg tracking-tight"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}
                >
                  User growth
                </h2>
                <p className="text-xs text-zinc-500">Cumulative — last 30 days.</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-700 ring-1 ring-indigo-100">
                <TrendingUp className="h-3 w-3" />
                {data.pricing.weeklyUserGrowth}/wk
              </span>
            </header>
            <AreaChart series={data.userGrowth} accent="#4F46E5" />
          </div>

          {/* Theme usage */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:col-span-2">
            <header className="mb-5 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                <Palette className="h-3.5 w-3.5" />
              </span>
              <div>
                <h2
                  className="text-lg tracking-tight"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}
                >
                  Theme usage
                </h2>
                <p className="text-xs text-zinc-500">Which template wins.</p>
              </div>
            </header>
            <div className="flex flex-col gap-3">
              {data.themeUsage.map((t, i) => {
                const total = data.themeUsage.reduce((s, x) => s + x.count, 0)
                const pct = (t.count / total) * 100
                return (
                  <div key={t.key}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-800">
                        <span className="h-3 w-3 rounded-sm ring-1 ring-black/10" style={{ background: t.swatch }} />
                        {t.label}
                      </span>
                      <span
                        className="text-xs font-bold tabular-nums text-zinc-700"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {t.count} · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: t.swatch,
                          animation: `growBar 700ms cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 80}ms both`,
                          transformOrigin: 'left',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Top companies + activity ──────────────────────────────── */}
        <section className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Top companies */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <header className="mb-4 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                <Building2 className="h-3.5 w-3.5" />
              </span>
              <div>
                <h2
                  className="text-lg tracking-tight"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}
                >
                  Top companies targeted
                </h2>
                <p className="text-xs text-zinc-500">Where everyone wants to work.</p>
              </div>
            </header>
            <ol className="flex flex-col gap-1.5">
              {(() => {
                const max = Math.max(...data.topCompanies.map(c => c.count))
                return data.topCompanies.map((c, i) => {
                  const pct = (c.count / max) * 100
                  return (
                    <li key={c.name} className="grid grid-cols-[18px_1fr_44px] items-center gap-2">
                      <span
                        className="text-[10px] font-bold tabular-nums text-zinc-400"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        #{(i + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="relative">
                        <div className="h-7 overflow-hidden rounded-md bg-zinc-50">
                          <div
                            className="h-full bg-gradient-to-r from-rose-100 to-rose-200"
                            style={{
                              width: `${pct}%`,
                              animation: `growBar 700ms cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 40}ms both`,
                              transformOrigin: 'left',
                            }}
                          />
                        </div>
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-900">
                          {c.name}
                        </span>
                      </div>
                      <span
                        className="text-right text-xs font-bold tabular-nums text-zinc-700"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {c.count}
                      </span>
                    </li>
                  )
                })
              })()}
            </ol>
          </div>

          {/* Activity feed */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <header className="mb-4 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <Activity className="h-3.5 w-3.5" />
              </span>
              <div>
                <h2
                  className="text-lg tracking-tight"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}
                >
                  Live activity
                </h2>
                <p className="text-xs text-zinc-500">Recent events in the system.</p>
              </div>
            </header>
            <ul className="flex flex-col gap-2">
              {data.activity.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-zinc-100 px-3 py-2 transition hover:bg-zinc-50"
                >
                  <ActivityIcon type={a.type} />
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-xs font-semibold text-zinc-800"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {a.who}
                    </p>
                    {'meta' in a && a.meta && (
                      <p className="text-[10px] text-zinc-500">{a.meta}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] font-medium text-zinc-400 tabular-nums">{a.when}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Pricing readiness ──────────────────────────────────────── */}
        <PricingReadiness data={data.pricing} />

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-zinc-400">
          Generated {data.generatedAt.toLocaleString()} · Replace
          <code className="mx-1 rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] text-zinc-700">adminMock.ts</code>
          with a real <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] text-zinc-700">/admin/stats</code> endpoint to wire live data.
        </p>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes growBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes growUp  { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes drawLine { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  )
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function Kpi({
  icon, label, value, delta, spark, tone,
}: {
  icon: React.ReactNode; label: string; value: string; delta: number; spark: number[];
  tone: 'indigo' | 'rose' | 'emerald' | 'amber'
}) {
  const tones = {
    indigo:  { stroke: '#818CF8', dot: 'bg-indigo-400',  tag: 'bg-indigo-500/20 text-indigo-300' },
    rose:    { stroke: '#FB7185', dot: 'bg-rose-400',    tag: 'bg-rose-500/20 text-rose-300' },
    emerald: { stroke: '#34D399', dot: 'bg-emerald-400', tag: 'bg-emerald-500/20 text-emerald-300' },
    amber:   { stroke: '#FBBF24', dot: 'bg-amber-400',   tag: 'bg-amber-500/20 text-amber-300' },
  }[tone]
  const up = delta >= 0
  return (
    <div className="relative overflow-hidden rounded-xl bg-zinc-800 p-4 ring-1 ring-white/5">
      {/* faint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '14px 14px',
        }}
      />
      <div className="relative flex items-start justify-between">
        <span className={cn('grid h-7 w-7 place-items-center rounded-lg text-white', tones.tag)}>
          {icon}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ring-1',
            up
              ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20'
              : 'bg-rose-500/15 text-rose-300 ring-rose-500/20',
          )}
        >
          {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
          {fmtPercent(delta)}
        </span>
      </div>
      <p className="relative mt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <p
        className="relative mt-1 leading-none tracking-tight text-white"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 36 }}
      >
        {value}
      </p>
      {spark.length > 0 && (
        <div className="relative mt-3">
          <Sparkline values={spark} color={tones.stroke} />
        </div>
      )}
    </div>
  )
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function BarChart({
  series, accent, granularity,
}: {
  series: TimePoint[]; accent: string; granularity: 'day' | 'week' | 'month'
}) {
  const max = Math.max(...series.map(p => p.value), 1)
  const w = 1200
  const h = 200
  const padY = 28
  const barAreaH = h - padY
  const barW = w / series.length
  const barInner = Math.max(2, barW * 0.6)

  return (
    <div className="relative">
      {/* Y-axis hint lines */}
      <div className="absolute inset-x-0 top-0 flex flex-col justify-between" style={{ height: barAreaH }}>
        {[0, 0.5, 1].map(p => (
          <div key={p} className="border-t border-dashed border-zinc-100" />
        ))}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="relative w-full" style={{ height: 220 }}>
        {series.map((p, i) => {
          const barH = (p.value / max) * (barAreaH - 8)
          const x = i * barW + (barW - barInner) / 2
          const y = barAreaH - barH
          return (
            <g key={i}>
              <title>{p.date.toLocaleDateString()} · {p.value} CVs</title>
              <rect
                x={x}
                y={y}
                width={barInner}
                height={barH}
                rx={Math.min(barInner / 2, 4)}
                fill={accent}
                style={{
                  transformOrigin: `${x + barInner / 2}px ${barAreaH}px`,
                  animation: `growUp 600ms cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 12}ms both`,
                }}
                opacity={0.92}
              />
              {/* Value label on top of bar (only every Nth to avoid crowding) */}
              {series.length <= 14 && (
                <text
                  x={x + barInner / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#52525B"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}
                >
                  {p.value}
                </text>
              )}
              {/* X label every other bar for daily, every for weekly/monthly */}
              {(granularity !== 'day' || i % 3 === 0) && (
                <text
                  x={x + barInner / 2}
                  y={h - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#A1A1AA"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {shortDate(p.date, granularity)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Area chart ───────────────────────────────────────────────────────────────

function AreaChart({ series, accent }: { series: TimePoint[]; accent: string }) {
  const w = 600
  const h = 180
  const padY = 24
  const min = Math.min(...series.map(p => p.value))
  const max = Math.max(...series.map(p => p.value))
  const range = max - min || 1

  const pts = series.map((p, i) => {
    const x = (i / (series.length - 1)) * w
    const y = padY + (1 - (p.value - min) / range) * (h - padY * 2)
    return { x, y }
  })
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${path} L ${w} ${h} L 0 ${h} Z`
  const gradId = `area-grad-${accent.replace('#', '')}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 200 }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
          <stop offset="100%" stopColor={accent} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Y gridlines */}
      {[0, 0.5, 1].map(p => (
        <line
          key={p}
          x1={0}
          x2={w}
          y1={padY + p * (h - padY * 2)}
          y2={padY + p * (h - padY * 2)}
          stroke="#E4E4E7"
          strokeDasharray="2 4"
          strokeWidth={0.75}
        />
      ))}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={path}
        fill="none"
        stroke={accent}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray="1200"
        strokeDashoffset="0"
        style={{ animation: `drawLine 1800ms cubic-bezier(0.2, 0.8, 0.2, 1) both` }}
      />
      {/* Endpoint marker */}
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={4} fill={accent} />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={8} fill={accent} opacity={0.25}>
        <animate attributeName="r" values="8;14;8" dur="1800ms" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0;0.25" dur="1800ms" repeatCount="indefinite" />
      </circle>
      {/* Max/min labels */}
      <text x={4} y={padY - 6} fontSize="10" fill="#71717A" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        {max}
      </text>
      <text x={4} y={h - padY + 14} fontSize="10" fill="#71717A" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        {min}
      </text>
    </svg>
  )
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 200
  const h = 32
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 28 }}>
      <path d={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
    </svg>
  )
}

// ─── PeriodTabs ───────────────────────────────────────────────────────────────

function PeriodTabs({ value, onChange }: { value: 'daily' | 'weekly' | 'monthly'; onChange: (v: 'daily' | 'weekly' | 'monthly') => void }) {
  const opts: Array<{ key: typeof value; label: string }> = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ]
  return (
    <div className="inline-flex rounded-lg bg-zinc-100 p-0.5">
      {opts.map(o => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-semibold transition',
            value === o.key
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Stat — inline ───────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
      <span
        className="font-bold tabular-nums text-zinc-900"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {value}
      </span>
    </span>
  )
}

// ─── Activity icon ────────────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: 'register' | 'cv' | 'pdf' }) {
  const config = {
    register: { icon: <Users className="h-3 w-3" />, bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100', label: 'Sign up' },
    cv:       { icon: <FileText className="h-3 w-3" />, bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', label: 'CV' },
    pdf:      { icon: <Download className="h-3 w-3" />, bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', label: 'PDF' },
  }[type]
  return (
    <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-md ring-1', config.bg, config.text, config.ring)} title={config.label}>
      {config.icon}
    </span>
  )
}

// ─── PricingReadiness ────────────────────────────────────────────────────────

function PricingReadiness({ data }: { data: typeof adminMock.pricing }) {
  const verdictTone = {
    emerald: { bg: 'from-emerald-500 to-teal-600', chip: 'bg-emerald-100 text-emerald-800' },
    amber:   { bg: 'from-amber-500 to-orange-500', chip: 'bg-amber-100 text-amber-800' },
    rose:    { bg: 'from-rose-500 to-fuchsia-500', chip: 'bg-rose-100 text-rose-800' },
  }[data.verdict.tone]

  const progressPct = Math.min(100, (data.currentUsers / data.targetUsers) * 100)

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <header className={cn('relative overflow-hidden bg-gradient-to-br p-6 text-white', verdictTone.bg)}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20">
              <Sparkles className="h-3 w-3" />
              Pricing readiness
            </span>
            <h2
              className="mt-2 text-3xl leading-none tracking-tight"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800 }}
            >
              {data.verdict.label}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/90">{data.verdict.body}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Score</span>
            <span
              className="leading-none tabular-nums"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 60 }}
            >
              {data.score}
              <span className="text-2xl text-white/60">/100</span>
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1fr]">
        {/* Criteria checklist */}
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Criteria
          </h3>
          <ul className="flex flex-col gap-2">
            {data.criteria.map(c => (
              <li
                key={c.label}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg border px-3 py-2',
                  c.met ? 'border-emerald-200 bg-emerald-50/40' : 'border-zinc-200 bg-zinc-50/40',
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={cn(
                    'grid h-5 w-5 place-items-center rounded-full',
                    c.met ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500',
                  )}>
                    {c.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  </span>
                  <span className="text-sm text-zinc-800">{c.label}</span>
                </span>
                <span
                  className={cn(
                    'text-xs font-bold tabular-nums',
                    c.met ? 'text-emerald-700' : 'text-zinc-500',
                  )}
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {c.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Projection */}
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Projection to monetization
          </h3>
          <div className="rounded-xl border border-zinc-200 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-zinc-600">Path to {data.targetUsers} users</span>
              <span
                className="text-xs font-bold tabular-nums text-zinc-700"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {data.currentUsers} / {data.targetUsers}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className={cn('h-full rounded-full bg-gradient-to-r', verdictTone.bg)}
                style={{
                  width: `${progressPct}%`,
                  animation: 'growBar 900ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
                  transformOrigin: 'left',
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <ProjStat
                icon={<Zap className="h-3.5 w-3.5" />}
                label="Weekly growth"
                value={`${data.weeklyUserGrowth}`}
                unit="users"
              />
              <ProjStat
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="ETA"
                value={data.projectedWeeksToTarget === 0 ? 'Now' : `${data.projectedWeeksToTarget}w`}
                unit={data.projectedWeeksToTarget === 0 ? '' : data.projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <ProjStat
                icon={<Target className="h-3.5 w-3.5" />}
                label="Activation"
                value={`${Math.round(data.activationRate * 100)}%`}
                unit="of users"
              />
            </div>

            <div className="mt-5 rounded-lg bg-zinc-900 p-3 text-xs text-zinc-300">
              <p className="flex items-center gap-1.5 text-amber-300">
                <Sparkles className="h-3 w-3" />
                <span className="font-bold uppercase tracking-wider">Recommendation</span>
              </p>
              <p className="mt-1.5 leading-relaxed">
                {data.score >= 80
                  ? `Set up Stripe + a single Pro tier ($9-12/mo). Grandfather current users for 60 days as thanks.`
                  : data.score >= 60
                    ? `Soft-launch a Pro tier with the top ${Math.round(data.activationRate * 100)}% of users. Validate willingness-to-pay before scaling marketing.`
                    : `Stay free. Drive activation up first — onboarding nudges + an "AI-polished sample CV" hook should move the needle fastest.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProjStat({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-2.5 ring-1 ring-zinc-100">
      <div className="flex items-center gap-1 text-zinc-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p
        className="mt-1 leading-none tracking-tight text-zinc-900"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 22 }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-zinc-500">{unit}</p>
    </div>
  )
}
