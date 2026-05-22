import { Link } from 'react-router-dom'
import { FileCheck2, ArrowLeft, Quote } from 'lucide-react'

interface Props {
  /** small uppercase eyebrow above the title — e.g. "Welcome back" */
  eyebrow: string
  /** main heading (rendered in Bricolage Grotesque) */
  title: string
  /** short paragraph beneath the title */
  subtitle: string
  /** Form content — already styled by the page */
  children: React.ReactNode
  /** Bottom link row, e.g. <span>New here? <Link>Create account</Link></span> */
  footer: React.ReactNode
  /** Optional pull quote / kicker line for the dark side panel */
  sideQuote: string
}

export function AuthShell({ eyebrow, title, subtitle, children, footer, sideQuote }: Props) {
  return (
    <div
      className="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]"
      style={{ fontFamily: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* ── LEFT — branded panel ───────────────────────────────────────── */}
      <aside
        className="relative hidden overflow-hidden bg-zinc-900 text-zinc-100 lg:flex lg:flex-col"
      >
        {/* dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* warm gradient blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full opacity-50 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #B5213F, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-24 h-[28rem] w-[28rem] rounded-full opacity-40 blur-[140px]"
          style={{ background: 'radial-gradient(circle, #4F46E5, transparent 70%)' }}
        />

        {/* Header — wordmark + back link */}
        <header className="relative z-10 flex items-center justify-between px-10 pt-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-white text-zinc-900 shadow-sm transition group-hover:rotate-[-4deg]">
              <FileCheck2 className="h-4 w-4" />
            </span>
            <span
              className="text-[19px] font-bold tracking-tight text-white"
              style={{ fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif" }}
            >
              Pitchpaper
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Link>
        </header>

        {/* Editorial pull-quote */}
        <div className="relative z-10 flex flex-1 items-center px-10">
          <div className="max-w-md">
            <Quote className="h-7 w-7 text-rose-300/70" />
            <p
              className="mt-5 text-[34px] leading-[1.12] tracking-tight text-white"
              style={{ fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif", fontWeight: 700 }}
            >
              {sideQuote}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="h-px w-10 bg-rose-300/50" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-300/80">
                Pitchpaper Studio
              </span>
            </div>
          </div>
        </div>

        {/* Decorative angled CV peek */}
        <div className="pointer-events-none absolute -right-20 bottom-10 z-0 w-72 rotate-[14deg] opacity-90">
          <div
            className="aspect-[794/1123] rounded-md bg-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
          >
            <div className="h-3 w-full rounded-t-md bg-[#F0E8E0]" />
            <div className="flex h-[calc(100%-12px)]">
              <div className="flex w-[26%] flex-col bg-[#912c4c]">
                <div className="bg-white px-1.5 pt-1.5 pb-1">
                  <div className="mx-auto h-6 w-6 rounded-full bg-[#5C1028]" />
                </div>
                <div className="flex flex-col gap-1 px-1.5 pt-1.5">
                  <div className="h-0.5 w-2/3 rounded-full bg-[#E8A98A]" />
                  <div className="h-0.5 w-full rounded-full bg-[#DDD5CF]/60" />
                  <div className="h-0.5 w-3/4 rounded-full bg-[#DDD5CF]/60" />
                  <div className="mt-1.5 h-0.5 w-2/3 rounded-full bg-[#E8A98A]" />
                  <div className="h-0.5 w-full rounded-full bg-[#DDD5CF]/60" />
                </div>
              </div>
              <div className="flex-1 px-2 pt-2">
                <div className="h-1.5 w-3/4 rounded bg-zinc-900" />
                <div className="mt-0.5 h-0.5 w-1/2 rounded-full bg-[#B5213F]" />
                <div className="mt-1.5 flex flex-col gap-0.5">
                  {[100, 92, 88, 60].map((w, i) => (
                    <div key={i} style={{ width: `${w}%` }} className="h-0.5 rounded-full bg-zinc-200" />
                  ))}
                </div>
                <div className="my-1.5 h-px bg-zinc-200" />
                <div className="h-0.5 w-1/3 rounded-full bg-[#B5213F]" />
                <div className="mt-1 h-1 w-3/4 rounded bg-zinc-800" />
                <div className="mt-0.5 h-0.5 w-2/5 rounded-full bg-zinc-300" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT — form panel ─────────────────────────────────────────── */}
      <main
        className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:py-16"
        style={{ background: '#FAF7F2' }}
      >
        {/* mobile-only top bar with brand + home link */}
        <header className="absolute left-6 right-6 top-6 flex items-center justify-between lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-white">
              <FileCheck2 className="h-3.5 w-3.5" />
            </span>
            <span
              className="text-base font-bold tracking-tight"
              style={{ fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif" }}
            >
              Pitchpaper
            </span>
          </Link>
          <Link
            to="/"
            className="text-xs font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Home
          </Link>
        </header>

        {/* page-bg dot grid (subtle) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #1c1917 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />

        <div className="relative w-full max-w-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-rose-600">
            {eyebrow}
          </p>
          <h1
            className="mt-2 text-[34px] leading-[1.05] tracking-tight text-zinc-900"
            style={{ fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif", fontWeight: 800 }}
          >
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            {subtitle}
          </p>

          <div className="mt-7">
            {children}
          </div>

          <div className="mt-7 border-t border-zinc-900/10 pt-5 text-center text-sm text-zinc-600">
            {footer}
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Shared form primitives ────────────────────────────────────────────────────

export function TextField({
  id, label, type = 'text', value, onChange, placeholder, required, autoComplete, autoFocus, leadingIcon, trailing,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  autoComplete?: string
  autoFocus?: boolean
  leadingIcon?: React.ReactNode
  trailing?: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-700">
        {label}
      </label>
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            {leadingIcon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`w-full rounded-xl border border-zinc-900/10 bg-white py-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 ${leadingIcon ? 'pl-10' : 'pl-3'} ${trailing ? 'pr-10' : 'pr-3'}`}
        />
        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
    </div>
  )
}

export function SubmitButton({
  pending, children,
}: { pending?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_2px_0_rgba(0,0,0,0.2)] transition hover:translate-y-[-1px] hover:bg-zinc-800 hover:shadow-[0_4px_0_rgba(0,0,0,0.2)] disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  )
}
