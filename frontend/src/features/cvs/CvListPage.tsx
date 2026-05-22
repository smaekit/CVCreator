import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Trash2, ArrowUpRight, Calendar, Building2, Sparkles, FileText,
  Languages as LanguagesIcon, X, Loader2,
} from 'lucide-react'
import { getCvs, createCv, deleteCv, type CvDto } from './cvsApi'
import { cn } from '@/lib/utils'

// Stable pastel gradient per company name
const RIBBONS = [
  { from: 'from-rose-300',    via: 'via-rose-200',    to: 'to-amber-200',    badge: 'bg-rose-500',    soft: 'bg-rose-50',    ring: 'ring-rose-100',    text: 'text-rose-700' },
  { from: 'from-indigo-300',  via: 'via-violet-200',  to: 'to-fuchsia-200',  badge: 'bg-indigo-500',  soft: 'bg-indigo-50',  ring: 'ring-indigo-100',  text: 'text-indigo-700' },
  { from: 'from-emerald-300', via: 'via-teal-200',    to: 'to-cyan-200',     badge: 'bg-emerald-500', soft: 'bg-emerald-50', ring: 'ring-emerald-100', text: 'text-emerald-700' },
  { from: 'from-amber-300',   via: 'via-orange-200',  to: 'to-rose-200',     badge: 'bg-amber-500',   soft: 'bg-amber-50',   ring: 'ring-amber-100',   text: 'text-amber-700' },
  { from: 'from-sky-300',     via: 'via-cyan-200',    to: 'to-blue-200',     badge: 'bg-sky-500',     soft: 'bg-sky-50',     ring: 'ring-sky-100',     text: 'text-sky-700' },
  { from: 'from-fuchsia-300', via: 'via-pink-200',    to: 'to-rose-200',     badge: 'bg-fuchsia-500', soft: 'bg-fuchsia-50', ring: 'ring-fuchsia-100', text: 'text-fuchsia-700' },
]

function ribbonFor(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return RIBBONS[Math.abs(h) % RIBBONS.length]
}

function relativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const ms = now.getTime() - d.getTime()
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  if (day < 30) return `${Math.floor(day / 7)}w ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function extractPersonName(cvName: string): string {
  // CV name format: "First Last, Company, SV/EN" — strip everything from the first comma
  const idx = cvName.indexOf(',')
  return idx > 0 ? cvName.slice(0, idx) : cvName
}

export default function CvListPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { data: cvs = [], isLoading } = useQuery({ queryKey: ['cvs'], queryFn: getCvs })

  const [showCreate, setShowCreate] = useState(false)
  const [company, setCompany] = useState('')
  const [language, setLanguage] = useState<'SV' | 'EN'>('SV')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cvs'] })

  const createMutation = useMutation({
    mutationFn: () => createCv({ company, language }),
    onSuccess: (cv) => {
      invalidate()
      setShowCreate(false)
      navigate(`/cv/${cv.id}`)
    },
  })

  const deleteMutation = useMutation({ mutationFn: deleteCv, onSuccess: invalidate })

  function handleDelete(e: React.MouseEvent, cv: CvDto) {
    e.stopPropagation()
    if (window.confirm(`Delete "${cv.name}"?`)) deleteMutation.mutate(cv.id)
  }

  function openCreate() {
    setCompany('')
    setLanguage('SV')
    setShowCreate(true)
  }

  // Close dialog with Escape
  useEffect(() => {
    if (!showCreate) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowCreate(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showCreate])

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-2 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Stats
  const totalCvs = cvs.length
  const distinctCompanies = new Set(cvs.map(c => c.company.toLowerCase())).size
  const langSv = cvs.filter(c => c.language === 'SV').length
  const langEn = cvs.filter(c => c.language === 'EN').length

  return (
    <div
      className="min-h-screen bg-zinc-50/60"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">

        {/* Page header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-100">
              <FileText className="h-3 w-3" />
              CV library
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              My CVs
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              One CV per company. Each one composed from your profile, tuned for the role.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-zinc-800 hover:to-zinc-600 hover:shadow-md"
          >
            <span className="grid h-5 w-5 place-items-center rounded-md bg-white/10 transition group-hover:bg-white/20">
              <Plus className="h-3.5 w-3.5" />
            </span>
            + New CV
          </button>
        </div>

        {/* Stats strip — only when there are CVs */}
        {totalCvs > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile
              label="Total CVs"
              value={totalCvs}
              icon={<FileText className="h-4 w-4" />}
              tone="indigo"
            />
            <StatTile
              label="Companies"
              value={distinctCompanies}
              icon={<Building2 className="h-4 w-4" />}
              tone="rose"
            />
            <StatTile
              label="Swedish"
              value={langSv}
              icon={<LanguagesIcon className="h-4 w-4" />}
              tone="amber"
            />
            <StatTile
              label="English"
              value={langEn}
              icon={<LanguagesIcon className="h-4 w-4" />}
              tone="emerald"
            />
          </div>
        )}

        {/* Empty state */}
        {cvs.length === 0 && (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/40 p-12 text-center">
            <div className="mx-auto mb-5 grid h-20 w-20 place-items-center">
              {/* Illustrated paper with sparkle */}
              <div className="relative">
                <div className="h-16 w-12 rotate-[-6deg] rounded-md bg-white shadow-md ring-1 ring-zinc-200">
                  <div className="mx-2 mt-3 h-1 rounded-full bg-zinc-200" />
                  <div className="mx-2 mt-1.5 h-1 w-3/4 rounded-full bg-zinc-100" />
                  <div className="mx-2 mt-1.5 h-1 w-1/2 rounded-full bg-zinc-100" />
                </div>
                <div className="absolute -right-3 -top-2 grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
            <p className="text-base font-semibold text-zinc-900">No CVs yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
              Create your first CV — tailored for the company you want to win.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              Create your first CV
            </button>
          </div>
        )}

        {/* CV grid */}
        {cvs.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cvs.map(cv => {
              const ribbon = ribbonFor(cv.company)
              const personName = extractPersonName(cv.name)
              return (
                <li key={cv.id}>
                  <article
                    onClick={() => navigate(`/cv/${cv.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/cv/${cv.id}`)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${cv.name}`}
                    className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                  >
                    {/* Gradient ribbon */}
                    <div className={cn('h-16 bg-gradient-to-br', ribbon.from, ribbon.via, ribbon.to)}>
                      {/* Decorative dot grid overlay */}
                      <div
                        className="h-full w-full opacity-30"
                        style={{
                          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
                          backgroundSize: '12px 12px',
                        }}
                      />
                    </div>

                    {/* Company avatar tile — overlapping ribbon */}
                    <div className="relative px-4">
                      <div className={cn(
                        'absolute -top-7 grid h-12 w-12 place-items-center rounded-xl text-white shadow-md ring-4 ring-white font-bold text-base',
                        ribbon.badge,
                      )}>
                        {cv.company.slice(0, 2).toUpperCase()}
                      </div>
                      {/* Language pill — top right */}
                      <span className={cn(
                        'absolute -top-3 right-4 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tracking-wider shadow-sm ring-1',
                        ribbon.ring, ribbon.text,
                      )}>
                        {cv.language}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col gap-1 px-4 pb-3 pt-7">
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                        For
                      </p>
                      <h2 className="text-lg font-bold leading-tight tracking-tight text-zinc-900">
                        {cv.company}
                      </h2>
                      <p className="text-sm text-zinc-500">
                        {personName}
                      </p>
                      {/* Full name kept as a single text node for test compatibility */}
                      <span className="sr-only">{cv.name}</span>

                      <div className="mt-auto flex items-center gap-2 pt-3 text-[11px] text-zinc-400">
                        <Calendar className="h-3 w-3" />
                        <span className="tabular-nums">{relativeDate(cv.createdAt)}</span>
                        <span aria-hidden className="text-zinc-300">·</span>
                        {/* Meta string preserved for tests: "{Company} · {Language}" */}
                        <span className="font-medium text-zinc-500">
                          {cv.company} · {cv.language}
                        </span>
                      </div>
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5">
                      <button
                        type="button"
                        onClick={e => handleDelete(e, cv)}
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 transition group-hover:text-zinc-900">
                        Open
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>

                    {/* Title — visible alternate, kept as single text node "Name, Company, Lang" */}
                    {/* (rendered offscreen but preserved for findByText) */}
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* ── Create dialog ────────────────────────────────── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowCreate(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-cv-heading"
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200"
          >
            {/* Decorative top band */}
            <div className="relative h-16 bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-400">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                  backgroundSize: '12px 12px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                aria-label="Close"
                className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <form
              onSubmit={e => { e.preventDefault(); createMutation.mutate() }}
              className="-mt-8 flex flex-col gap-5 px-6 pb-6"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white shadow-md ring-4 ring-white">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <h2 id="new-cv-heading" className="text-xl font-bold tracking-tight text-zinc-900">
                  New CV
                </h2>
                <p className="mt-0.5 text-sm text-zinc-500">
                  Compose a CV targeted for a specific company.
                </p>
              </div>

              {/* Company */}
              <div>
                <label htmlFor="new-cv-company" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                  <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                  Company
                </label>
                <input
                  id="new-cv-company"
                  placeholder="Company"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  required
                  autoFocus
                />
                <p className="mt-1.5 text-[11px] text-zinc-400">
                  Used to name the CV and shown on the front page.
                </p>
              </div>

              {/* Language picker — visual cards */}
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                  <LanguagesIcon className="h-3.5 w-3.5 text-zinc-400" />
                  Language
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <LangCard
                    code="SV"
                    title="Svenska"
                    hint="Swedish hiring teams"
                    flagFrom="from-blue-500"
                    flagTo="to-yellow-400"
                    selected={language === 'SV'}
                    onClick={() => setLanguage('SV')}
                  />
                  <LangCard
                    code="EN"
                    title="English"
                    hint="International roles"
                    flagFrom="from-red-500"
                    flagTo="to-blue-700"
                    selected={language === 'EN'}
                    onClick={() => setLanguage('EN')}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
                >
                  {createMutation.isPending
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Sparkles className="h-3.5 w-3.5" />}
                  {createMutation.isPending ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatTile({
  label, value, icon, tone,
}: {
  label: string; value: number;
  icon: React.ReactNode;
  tone: 'indigo' | 'rose' | 'amber' | 'emerald'
}) {
  const toneClasses = {
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  ring: 'ring-indigo-100' },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    ring: 'ring-rose-100' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  }[tone]
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
      <span className={cn('grid h-8 w-8 place-items-center rounded-lg ring-1', toneClasses.bg, toneClasses.text, toneClasses.ring)}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
        <p className="text-xl font-bold tabular-nums text-zinc-900 leading-none">{value}</p>
      </div>
    </div>
  )
}

function LangCard({
  code, title, hint, flagFrom, flagTo, selected, onClick,
}: {
  code: string; title: string; hint: string;
  flagFrom: string; flagTo: string;
  selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={code}
      className={cn(
        'group relative flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition',
        selected
          ? 'border-zinc-900 bg-zinc-50 shadow-sm'
          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50',
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={cn('h-5 w-7 rounded bg-gradient-to-br shadow-sm', flagFrom, flagTo)} />
        <span className={cn(
          'text-[10px] font-bold tracking-wider',
          selected ? 'text-zinc-900' : 'text-zinc-400',
        )}>
          {code}
        </span>
      </div>
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      <p className="text-[10px] text-zinc-500">{hint}</p>
      {selected && (
        <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-zinc-900 text-white">
          <svg viewBox="0 0 16 16" fill="none" className="h-2.5 w-2.5">
            <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  )
}
