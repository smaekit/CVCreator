import { Link } from 'react-router-dom'
import {
  Sparkles, Globe2, FileCheck2, Layers, Download, Wand2, ArrowRight,
  Building2, Star, ShieldCheck, Languages, Palette,
} from 'lucide-react'

const isAuthed = () => !!localStorage.getItem('token')

export default function LandingPage() {
  const authed = isAuthed()

  return (
    <div
      className="min-h-screen text-zinc-900"
      style={{
        background: '#FAF7F2',
        fontFamily: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Top nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-zinc-900/5 bg-[#FAF7F2]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white shadow-sm transition group-hover:rotate-[-4deg]">
              <span
                className="absolute inset-0 rounded-xl opacity-50"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                  backgroundSize: '6px 6px',
                }}
              />
              <FileCheck2 className="relative h-4 w-4" />
            </span>
            <span
              className="text-[19px] font-bold tracking-tight"
              style={{ fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif" }}
            >
              Pitchpaper
            </span>
            <span className="hidden rounded-full bg-zinc-900 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider text-amber-300 sm:inline-flex">
              Beta
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-zinc-600 md:flex">
            <a href="#how" className="transition hover:text-zinc-900">How it works</a>
            <a href="#themes" className="transition hover:text-zinc-900">Themes</a>
            <a href="#features" className="transition hover:text-zinc-900">Features</a>
          </nav>

          <div className="flex items-center gap-2">
            {authed ? (
              <Link
                to="/cvs"
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
              >
                Go to dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-900/5 hover:text-zinc-900"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
                >
                  Start free
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Decorative grain dots */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #1c1917 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* Decorative gradient blobs */}
        <div aria-hidden className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
        <div aria-hidden className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
          {/* Hero text */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-700 ring-1 ring-zinc-900/10">
              <span className="relative grid h-1.5 w-1.5 place-items-center">
                <span className="absolute h-full w-full animate-ping rounded-full bg-rose-400" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-rose-500" />
              </span>
              AI · Bilingual SV/EN · A4-perfect
            </span>

            <h1
              className="mt-5 text-[44px] leading-[1.02] tracking-[-0.025em] sm:text-[56px] lg:text-[64px]"
              style={{
                fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif",
                fontWeight: 800,
              }}
            >
              One CV per company.<br />
              <span className="relative inline-block">
                <span className="relative z-10">Each one yours.</span>
                <span
                  aria-hidden
                  className="absolute bottom-1 left-0 right-0 h-3.5 bg-gradient-to-r from-amber-200 via-rose-200 to-fuchsia-200"
                  style={{ zIndex: 0 }}
                />
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-zinc-600">
              Pitchpaper turns your profile into pixel-perfect A4 CVs —
              <span className="font-semibold text-zinc-900"> bilingual</span>,
              <span className="font-semibold text-zinc-900"> AI-polished</span>,
              and <span className="font-semibold text-zinc-900">tailored</span> for the
              company you're chasing. Build once, compose forever.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={authed ? '/cvs' : '/register'}
                className="group inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_2px_0_rgba(0,0,0,0.2)] transition hover:translate-y-[-1px] hover:bg-zinc-800 hover:shadow-[0_4px_0_rgba(0,0,0,0.2)]"
              >
                <Sparkles className="h-4 w-4" />
                {authed ? 'Open your dashboard' : 'Start building free'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              {!authed && (
                <Link
                  to="/login"
                  className="rounded-xl border border-zinc-900/15 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  I already have an account
                </Link>
              )}
            </div>

            <div className="mt-7 flex items-center gap-4 text-xs text-zinc-500">
              <div className="flex -space-x-2">
                {['from-rose-400 to-amber-300', 'from-indigo-400 to-fuchsia-300', 'from-emerald-400 to-sky-300', 'from-amber-400 to-rose-300'].map((g, i) => (
                  <div key={i} className={`h-6 w-6 rounded-full bg-gradient-to-br ${g} ring-2 ring-[#FAF7F2]`} />
                ))}
              </div>
              <span>Built for consultants chasing the right project</span>
            </div>
          </div>

          {/* Hero visual — stacked CV mockups */}
          <div className="relative h-[440px] sm:h-[500px]">
            <CvMockup
              variant="burgundy"
              className="absolute right-12 top-0 rotate-[6deg] shadow-[0_30px_60px_-15px_rgba(181,33,63,0.4),0_15px_25px_-10px_rgba(0,0,0,0.2)]"
            />
            <CvMockup
              variant="charcoal"
              className="absolute left-0 top-16 rotate-[-7deg] shadow-[0_30px_60px_-15px_rgba(13,17,23,0.4),0_15px_25px_-10px_rgba(0,0,0,0.2)]"
            />
            <CvMockup
              variant="nordic"
              className="absolute left-1/2 top-40 -translate-x-1/2 rotate-[2deg] shadow-[0_30px_60px_-15px_rgba(30,58,95,0.4),0_15px_25px_-10px_rgba(0,0,0,0.2)] z-10"
            />
            {/* Floating annotation tags */}
            <span className="absolute right-0 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-rose-700 shadow-md ring-1 ring-rose-200">
              <Palette className="h-3 w-3" />
              3 themes
            </span>
            <span className="absolute -left-2 bottom-12 z-20 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-indigo-700 shadow-md ring-1 ring-indigo-200">
              <Wand2 className="h-3 w-3" />
              AI assist
            </span>
            <span className="absolute bottom-0 right-8 z-20 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-emerald-700 shadow-md ring-1 ring-emerald-200">
              <Languages className="h-3 w-3" />
              SV / EN
            </span>
          </div>
        </div>
      </section>

      {/* ── Pain points strip ───────────────────────────────────────────── */}
      <section className="border-y border-zinc-900/[0.06] bg-white">
        <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-none bg-zinc-100 px-4 py-0 sm:px-6 md:grid-cols-3">
          <PainPoint
            problem="One generic CV for every job"
            solution="Compose a fresh CV per company in 2 minutes."
          />
          <PainPoint
            problem="Translation hell every time"
            solution="Bilingual fields side-by-side. Missing translations are flagged."
          />
          <PainPoint
            problem="Word docs that break on export"
            solution="Pixel-perfect A4 PDF, every single time."
          />
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how" className="relative py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">The flow</p>
            <h2
              className="mt-2 text-3xl tracking-tight sm:text-4xl"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}
            >
              Three steps. Infinite CVs.
            </h2>
          </div>

          <div className="relative grid gap-6 md:grid-cols-3">
            {/* Connector line behind cards */}
            <div aria-hidden className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent md:block" />
            <Step
              n={1}
              icon={<Layers className="h-4 w-4" />}
              tone="indigo"
              title="Build your profile"
              body="Add assignments, skills, education and certifications — once. Bilingual fields keep SV and EN in sync."
            />
            <Step
              n={2}
              icon={<Wand2 className="h-4 w-4" />}
              tone="rose"
              title="Compose a CV"
              body="Pick the company. Choose which assignments and skills to feature. Let AI polish the intro and descriptions."
            />
            <Step
              n={3}
              icon={<Download className="h-4 w-4" />}
              tone="emerald"
              title="Export A4 PDF"
              body="Pick a theme. Hit export. Send a CV that looks like it was hand-designed for the role."
            />
          </div>
        </div>
      </section>

      {/* ── Theme showcase ──────────────────────────────────────────────── */}
      <section id="themes" className="bg-zinc-900 py-24 text-zinc-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Themes</p>
            <h2
              className="mt-2 text-3xl tracking-tight text-white sm:text-4xl"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}
            >
              Three CVs. One profile. Zero copy-paste.
            </h2>
            <p className="mt-3 text-zinc-400">
              Every theme is tuned for a different audience — editorial elegance, Scandinavian
              calm, or developer-grade engineering polish. Switch with a click; the content
              stays the same.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <ThemeCard
              name="Burgundy"
              tagline="Editorial · Bold"
              detail="Bricolage Grotesque + IBM Plex Sans, mono skill chips. For roles that value gravitas."
              variant="burgundy"
            />
            <ThemeCard
              name="Nordic"
              tagline="Calm · Modern"
              detail="DM Sans throughout, deep navy sidebar. For Scandinavian consultancies and design-minded teams."
              variant="nordic"
            />
            <ThemeCard
              name="Charcoal"
              tagline="Dev · Technical"
              detail="Mona Sans + JetBrains Mono chips, GitHub-blue accent. Built for engineers."
              variant="charcoal"
            />
          </div>
        </div>
      </section>

      {/* ── Features grid ───────────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">Features</p>
            <h2
              className="mt-2 text-3xl tracking-tight sm:text-4xl"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}
            >
              Tiny touches that add up.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={<Globe2 className="h-5 w-5" />}
              tone="emerald"
              title="Bilingual by default"
              body="Every text field is a SV/EN pair. Fall back silently — never block on a missing translation."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              tone="violet"
              title="AI that writes your voice"
              body="Stream-rewrite intros and project descriptions. Accept, edit, or reject inline."
            />
            <Feature
              icon={<Star className="h-5 w-5" />}
              tone="rose"
              title="Featured projects"
              body="Pick up to two assignments to spotlight on the front page. Recruiters skim — make them stop."
            />
            <Feature
              icon={<Palette className="h-5 w-5" />}
              tone="amber"
              title="Three crafted themes"
              body="Burgundy editorial, Nordic calm, Charcoal developer. Each one typographically tuned."
            />
            <Feature
              icon={<Building2 className="h-5 w-5" />}
              tone="sky"
              title="One per company"
              body="Compose a fresh CV for every opportunity. Override the intro, swap projects, ship faster."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              tone="indigo"
              title="A4 PDF, every time"
              body="Server-side Puppeteer rendering. Pixel-perfect pages, exact margins, no surprises."
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-rose-50 to-fuchsia-50 py-24">
        <div aria-hidden className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #1c1917 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }} />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">Free while in beta</p>
          <h2
            className="mt-3 text-3xl tracking-tight sm:text-5xl"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800 }}
          >
            Your next CV is two clicks away.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-700">
            Sign up free, fill your profile once, then spin up a tailored CV every time the right
            opportunity lands in your inbox.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={authed ? '/cvs' : '/register'}
              className="group inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_2px_0_rgba(0,0,0,0.2)] transition hover:translate-y-[-1px] hover:bg-zinc-800"
            >
              <Sparkles className="h-4 w-4" />
              {authed ? 'Open dashboard' : 'Create your first CV'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {!authed && (
              <Link
                to="/login"
                className="rounded-xl border border-zinc-900/15 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900/10 bg-[#FAF7F2] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-900 text-white">
              <FileCheck2 className="h-3.5 w-3.5" />
            </span>
            <span
              className="text-sm font-bold tracking-tight"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Pitchpaper
            </span>
            <span className="text-xs text-zinc-500">· One CV per company.</span>
          </div>
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Pitchpaper. Made for consultants who win projects.
          </p>
        </div>
      </footer>
    </div>
  )
}

// ── Pain point block ──────────────────────────────────────────────────────────

function PainPoint({ problem, solution }: { problem: string; solution: string }) {
  return (
    <div className="bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Problem</p>
      <p className="mt-1 text-base font-semibold text-zinc-900 line-through decoration-rose-300 decoration-2 underline-offset-4">
        {problem}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        <span className="mr-1 font-bold text-emerald-700">→</span>
        {solution}
      </p>
    </div>
  )
}

// ── Step ──────────────────────────────────────────────────────────────────────

function Step({
  n, icon, title, body, tone,
}: {
  n: number; icon: React.ReactNode; title: string; body: string;
  tone: 'indigo' | 'rose' | 'emerald';
}) {
  const tones = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-100' },
  }[tone]
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-md ring-1 ring-zinc-900/5">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tones.bg} ${tones.text} ring-1 ${tones.ring}`}>
          {icon}
        </span>
        <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
          {n}
        </span>
      </div>
      <h3
        className="mt-5 text-lg font-bold tracking-tight"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
      >
        {title}
      </h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-600">{body}</p>
    </div>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────

function Feature({
  icon, title, body, tone,
}: {
  icon: React.ReactNode; title: string; body: string;
  tone: 'emerald' | 'violet' | 'rose' | 'amber' | 'sky' | 'indigo';
}) {
  const tones = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' },
  }[tone]
  return (
    <div className="group relative rounded-2xl border border-zinc-900/[0.07] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones.bg} ${tones.text} ring-1 ${tones.ring}`}>
        {icon}
      </span>
      <h3
        className="mt-4 text-base font-bold tracking-tight"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
      >
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{body}</p>
    </div>
  )
}

// ── Theme showcase card ──────────────────────────────────────────────────────

function ThemeCard({
  name, tagline, detail, variant,
}: {
  name: string; tagline: string; detail: string;
  variant: 'burgundy' | 'nordic' | 'charcoal';
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-zinc-50 p-5 ring-1 ring-white/10 transition hover:ring-white/30">
      <div className="flex h-72 items-center justify-center overflow-hidden rounded-xl bg-zinc-800/40 p-6">
        <CvMockup variant={variant} className="rotate-[-3deg] transition-transform duration-500 group-hover:rotate-0 group-hover:scale-[1.04]" />
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h3
          className="text-xl font-bold tracking-tight text-zinc-900"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          {name}
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{tagline}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{detail}</p>
    </div>
  )
}

// ── CV mockup — mini A4 visualization per theme ──────────────────────────────

function CvMockup({
  variant,
  className = '',
}: {
  variant: 'burgundy' | 'nordic' | 'charcoal'
  className?: string
}) {
  const themes = {
    burgundy: {
      headerBg: '#F0E8E0',
      sidebarBg: '#912c4c',
      sidebarLabel: '#E8A98A',
      sidebarText: '#DDD5CF',
      avatarBg: '#5C1028',
      accent: '#B5213F',
      bodyBg: 'white',
      nameColor: '#1A1A1A',
      titleColor: '#B5213F',
      chipBg: '#B5213F15',
      chipText: '#B5213F',
      displayFont: "'Bricolage Grotesque', sans-serif",
      bodyFont: "'IBM Plex Sans', sans-serif",
      monoFont: "'IBM Plex Mono', monospace",
      sectionLine: '#B5213F',
    },
    nordic: {
      headerBg: '#C8DDEF',
      sidebarBg: '#0F2540',
      sidebarLabel: '#82B8E0',
      sidebarText: '#C0D8EE',
      avatarBg: '#0A1E35',
      accent: '#1E3A5F',
      bodyBg: 'white',
      nameColor: '#0A1929',
      titleColor: '#1E3A5F',
      chipBg: '#1E3A5F15',
      chipText: '#1E3A5F',
      displayFont: "'DM Sans', sans-serif",
      bodyFont: "'DM Sans', sans-serif",
      monoFont: undefined,
      sectionLine: '#1E3A5F',
    },
    charcoal: {
      headerBg: '#0D1117',
      sidebarBg: '#0D1117',
      sidebarLabel: '#7D8590',
      sidebarText: '#E6EDF3',
      avatarBg: '#161B22',
      accent: '#1F6FEB',
      bodyBg: 'white',
      nameColor: '#0D1117',
      titleColor: '#1F6FEB',
      chipBg: 'white',
      chipText: '#1F2328',
      displayFont: "'Mona Sans', sans-serif",
      bodyFont: "'Mona Sans', sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      sectionLine: '#0D1117',
    },
  }[variant]

  return (
    <div
      className={`relative w-[208px] shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-black/10 ${className}`}
      style={{
        aspectRatio: '794 / 1123',
        fontFamily: themes.bodyFont,
      }}
    >
      {/* Header band */}
      <div style={{ height: 20, background: themes.headerBg }} />
      <div className="flex" style={{ height: 'calc(100% - 20px)' }}>
        {/* Sidebar */}
        <div className="shrink-0 flex flex-col" style={{ width: 62, background: themes.sidebarBg }}>
          {/* Avatar circle */}
          <div className="flex justify-center pt-2 pb-2" style={{ background: 'white' }}>
            <div
              className="rounded-full"
              style={{ width: 44, height: 44, background: themes.avatarBg }}
            />
          </div>
          {/* Sidebar content */}
          <div className="px-2 pt-2.5 flex-1 flex flex-col gap-2">
            <SidebarGroup label="ROLES" color={themes.sidebarLabel} items={['Tech Lead', 'Architect']} textColor={themes.sidebarText} font={themes.displayFont} />
            <SidebarGroup label="TECHNIQUES" color={themes.sidebarLabel} items={['React', '.NET', 'Azure']} textColor={themes.sidebarText} font={themes.displayFont} />
          </div>
        </div>
        {/* Body */}
        <div className="flex-1 p-2.5" style={{ background: themes.bodyBg }}>
          {/* Name */}
          <div
            style={{
              fontFamily: themes.displayFont,
              fontWeight: 800,
              fontSize: 11,
              lineHeight: 1.05,
              color: themes.nameColor,
              letterSpacing: '-0.02em',
            }}
          >
            Marcus<br />Jakobsson
          </div>
          {/* Title */}
          <div
            style={{
              fontSize: 4.5,
              fontWeight: 700,
              color: themes.titleColor,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            Senior Engineer
          </div>
          {/* Intro paragraph */}
          <div className="mt-2 flex flex-col gap-0.5">
            {[100, 95, 88, 70].map((w, i) => (
              <div
                key={i}
                style={{ width: `${w}%`, height: 2, background: '#0000000F', borderRadius: 1 }}
              />
            ))}
          </div>
          {/* Divider */}
          <div style={{ height: 0.5, background: '#00000010', margin: '6px 0' }} />
          {/* Section header */}
          <div className="flex items-center gap-1">
            <span
              style={{
                fontFamily: themes.displayFont,
                fontSize: 4.5,
                fontWeight: 700,
                color: themes.sectionLine,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Highlighted
            </span>
            <span style={{ flex: 1, height: 0.5, background: themes.sectionLine, opacity: 0.3 }} />
          </div>
          {/* Project block */}
          <div className="mt-1.5">
            <div style={{ fontSize: 5, fontWeight: 700, color: themes.nameColor }}>
              Platform migration
            </div>
            <div style={{ fontSize: 4, color: '#7A7370', fontWeight: 600, marginTop: 1 }}>
              Volvo · 2023 — now
            </div>
            <div className="mt-1 flex flex-col gap-0.5">
              {[100, 92, 80].map((w, i) => (
                <div key={i} style={{ width: `${w}%`, height: 1.5, background: '#0000000A', borderRadius: 1 }} />
              ))}
            </div>
          </div>
          {/* Skill chips */}
          <div className="mt-2 flex flex-wrap gap-0.5">
            {['React', '.NET', 'Azure', 'Postgres'].map(s => (
              <span
                key={s}
                style={{
                  fontSize: 3.5,
                  border: `0.5px solid ${themes.chipText}40`,
                  background: themes.chipBg,
                  color: themes.chipText,
                  borderRadius: 999,
                  padding: '0.5px 3px',
                  fontFamily: themes.monoFont ?? themes.bodyFont,
                  letterSpacing: themes.monoFont ? '0.02em' : undefined,
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarGroup({
  label, color, items, textColor, font,
}: {
  label: string; color: string; items: string[]; textColor: string; font: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 4,
          fontWeight: 700,
          color,
          letterSpacing: '0.18em',
          marginBottom: 1.5,
          fontFamily: font,
        }}
      >
        {label}
      </div>
      <div className="flex flex-col gap-0.5">
        {items.map(it => (
          <span key={it} style={{ fontSize: 4.5, color: textColor, fontWeight: 500, lineHeight: 1.2 }}>
            {it}
          </span>
        ))}
      </div>
    </div>
  )
}
