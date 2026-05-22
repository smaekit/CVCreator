import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User, Sparkles as SparklesIcon, Rocket, GraduationCap, Award, Languages as LanguagesIcon,
  ChevronDown, Pencil, Plus, ArrowLeft, Download, Loader2, Sparkles, LayoutGrid,
  Star, Calendar, Building2, Tag, AlertCircle, Check, Briefcase, FileEdit,
} from 'lucide-react'
import { CV_THEMES, type CvThemeKey } from '../cv-preview/cvThemes'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  getCv, updateSelections, updateOverrides, downloadPdf,
  type SelectionsBody,
} from './cvBuilderApi'
import {
  getAssignments, getSkills, getEducations, getCertifications, getLanguages,
  setAssignmentSkills, type SkillDto,
} from '../profile/collectionsApi'
import { CVPreview } from '../cv-preview/CVPreview'
import { FrontPageGroupsEditor } from './FrontPageGroupsEditor'
import { useMissingTranslations } from './useMissingTranslations'
import { AIModal } from './AIModal'

interface SelAssignment { id: string; isHighlighted: boolean; descriptionOverride?: string | null }

// ─── Section accent palette ───────────────────────────────────────────────────

type SectionAccent =
  | 'indigo' | 'rose' | 'violet' | 'amber' | 'emerald' | 'sky' | 'fuchsia'

const ACCENT: Record<SectionAccent, {
  iconBg: string; iconText: string; ring: string;
  countBg: string; countText: string;
  borderL: string; selectedBg: string;
  formBorder: string; formBg: string;
  focusRing: string; focusBorder: string;
}> = {
  indigo:  { iconBg: 'bg-indigo-50',  iconText: 'text-indigo-600',  ring: 'ring-indigo-100',
             countBg: 'bg-indigo-100', countText: 'text-indigo-700',
             borderL: 'border-indigo-400', selectedBg: 'bg-indigo-50/40',
             formBorder: 'border-indigo-200', formBg: 'bg-indigo-50/30',
             focusRing: 'focus:ring-indigo-100', focusBorder: 'focus:border-indigo-400' },
  rose:    { iconBg: 'bg-rose-50',    iconText: 'text-rose-600',    ring: 'ring-rose-100',
             countBg: 'bg-rose-100',   countText: 'text-rose-700',
             borderL: 'border-rose-400',  selectedBg: 'bg-rose-50/40',
             formBorder: 'border-rose-200',  formBg: 'bg-rose-50/30',
             focusRing: 'focus:ring-rose-100',  focusBorder: 'focus:border-rose-400' },
  violet:  { iconBg: 'bg-violet-50',  iconText: 'text-violet-600',  ring: 'ring-violet-100',
             countBg: 'bg-violet-100', countText: 'text-violet-700',
             borderL: 'border-violet-400', selectedBg: 'bg-violet-50/40',
             formBorder: 'border-violet-200', formBg: 'bg-violet-50/30',
             focusRing: 'focus:ring-violet-100', focusBorder: 'focus:border-violet-400' },
  amber:   { iconBg: 'bg-amber-50',   iconText: 'text-amber-600',   ring: 'ring-amber-100',
             countBg: 'bg-amber-100',  countText: 'text-amber-700',
             borderL: 'border-amber-400',  selectedBg: 'bg-amber-50/40',
             formBorder: 'border-amber-200',  formBg: 'bg-amber-50/30',
             focusRing: 'focus:ring-amber-100',  focusBorder: 'focus:border-amber-400' },
  emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', ring: 'ring-emerald-100',
             countBg: 'bg-emerald-100', countText: 'text-emerald-700',
             borderL: 'border-emerald-400', selectedBg: 'bg-emerald-50/40',
             formBorder: 'border-emerald-200', formBg: 'bg-emerald-50/30',
             focusRing: 'focus:ring-emerald-100', focusBorder: 'focus:border-emerald-400' },
  sky:     { iconBg: 'bg-sky-50',     iconText: 'text-sky-600',     ring: 'ring-sky-100',
             countBg: 'bg-sky-100',    countText: 'text-sky-700',
             borderL: 'border-sky-400',   selectedBg: 'bg-sky-50/40',
             formBorder: 'border-sky-200',   formBg: 'bg-sky-50/30',
             focusRing: 'focus:ring-sky-100',   focusBorder: 'focus:border-sky-400' },
  fuchsia: { iconBg: 'bg-fuchsia-50', iconText: 'text-fuchsia-600', ring: 'ring-fuchsia-100',
             countBg: 'bg-fuchsia-100', countText: 'text-fuchsia-700',
             borderL: 'border-fuchsia-400', selectedBg: 'bg-fuchsia-50/40',
             formBorder: 'border-fuchsia-200', formBg: 'bg-fuchsia-50/30',
             focusRing: 'focus:ring-fuchsia-100', focusBorder: 'focus:border-fuchsia-400' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function monthsBetween(start: string, end: string | null): string {
  if (!start) return ''
  const s = new Date(start)
  const e = end ? new Date(end) : new Date()
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
  if (months < 1) return '< 1 mo'
  if (months < 12) return `${months} mo`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem === 0 ? `${years} yr` : `${years} yr ${rem} mo`
}

function shortDate(d: string): string {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

// ─── SkillTagInput ────────────────────────────────────────────────────────────

function SkillTagInput({
  skillIds,
  allSkills,
  onSave,
}: {
  skillIds: string[]
  allSkills: SkillDto[]
  onSave: (names: string[]) => void
}) {
  const [tags, setTags] = useState<string[]>(() =>
    skillIds.map(id => allSkills.find(s => s.id === id)?.name).filter(Boolean) as string[]
  )
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setTags(skillIds.map(id => allSkills.find(s => s.id === id)?.name).filter(Boolean) as string[])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillIds.join(','), allSkills.map(s => s.id).join(',')])

  function commit(names: string[]) {
    setTags(names)
    onSave(names)
  }

  function addTag(raw: string) {
    const name = raw.trim()
    if (!name || tags.includes(name)) { setInput(''); return }
    commit([...tags, name])
    setInput('')
  }

  function removeTag(name: string) {
    commit(tags.filter(t => t !== name))
  }

  return (
    <div className="flex flex-wrap items-center gap-1 px-4 pb-3 pt-1">
      <Tag className="mr-1 h-3 w-3 text-zinc-400" />
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-100"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove skill ${tag}`}
            onClick={() => removeTag(tag)}
            className="leading-none text-indigo-400 transition hover:text-indigo-900"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        className={cn(
          'min-w-[80px] rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[10px] outline-none transition placeholder:text-zinc-300',
          focused && 'border-zinc-300 bg-white',
        )}
        placeholder={tags.length === 0 ? 'Add skills…' : '+ more'}
        value={input}
        onChange={e => setInput(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input) }
          if (e.key === 'Backspace' && !input && tags.length > 0) removeTag(tags[tags.length - 1])
        }}
        onBlur={() => { setFocused(false); if (input.trim()) addTag(input) }}
      />
    </div>
  )
}

// ─── BuilderSection ──────────────────────────────────────────────────────────

function BuilderSection({
  icon: Icon,
  title,
  description,
  defaultOpen = true,
  children,
  accent,
  count,
  activeCount,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  defaultOpen?: boolean
  children: React.ReactNode
  accent: SectionAccent
  count?: number
  activeCount?: number
}) {
  const [open, setOpen] = useState(defaultOpen)
  const t = ACCENT[accent]
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <button
        type="button"
        className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-zinc-50/60"
        onClick={() => setOpen(o => !o)}
      >
        <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1', t.iconBg, t.iconText, t.ring)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold tracking-tight text-zinc-900">{title}</span>
            {typeof count === 'number' && count > 0 && (
              <span className="rounded-full bg-zinc-100 px-1.5 py-0 text-[10px] font-semibold tabular-nums text-zinc-500">
                {count}
              </span>
            )}
            {typeof activeCount === 'number' && activeCount > 0 && (
              <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[10px] font-bold tabular-nums', t.countBg, t.countText)}>
                <Check className="h-2.5 w-2.5" />
                {activeCount} on CV
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-relaxed text-zinc-400">{description}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-zinc-300 transition-transform duration-200 group-hover:text-zinc-500',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && <div className="border-t border-zinc-100">{children}</div>}
    </div>
  )
}

// ─── EmptyBlock ───────────────────────────────────────────────────────────────

function EmptyBlock({ icon: Icon, message, ctaHref }: {
  icon: React.ComponentType<{ className?: string }>
  message: string
  ctaHref?: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-7 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-50 text-zinc-400 ring-1 ring-zinc-200">
        <Icon className="h-5 w-5" />
      </span>
      <p className="max-w-[260px] text-[11px] leading-relaxed text-zinc-500">{message}</p>
      {ctaHref && (
        <Link
          to={ctaHref}
          className="mt-1 inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-zinc-800"
        >
          <Plus className="h-3 w-3" />
          Add in profile
        </Link>
      )}
    </div>
  )
}

// ─── ItemRow primitive ────────────────────────────────────────────────────────

function ItemRow({
  isSelected, accent, children,
}: { isSelected: boolean; accent: SectionAccent; children: React.ReactNode }) {
  const t = ACCENT[accent]
  return (
    <div
      className={cn(
        'border-b border-zinc-100 transition-colors last:border-0',
        isSelected ? `${t.selectedBg} border-l-[3px] ${t.borderL} pl-[1px]` : 'border-l-[3px] border-transparent',
      )}
    >
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CvBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  const { data: cv } = useQuery({ queryKey: ['cv', id], queryFn: () => getCv(id!) })
  const { data: allAssignments = [] } = useQuery({ queryKey: ['assignments'], queryFn: getAssignments })
  const { data: allSkills = [] } = useQuery({ queryKey: ['skills'], queryFn: getSkills })
  const { data: allEducations = [] } = useQuery({ queryKey: ['educations'], queryFn: getEducations })
  const { data: allCertifications = [] } = useQuery({ queryKey: ['certifications'], queryFn: getCertifications })
  const { data: allLanguages = [] } = useQuery({ queryKey: ['languages'], queryFn: getLanguages })

  const [initialized, setInitialized] = useState(false)
  const [selAssignments, setSelAssignments] = useState<SelAssignment[]>([])
  const [selSkillIds, setSelSkillIds] = useState<string[]>([])
  const [selEducationIds, setSelEducationIds] = useState<string[]>([])
  const [selCertIds, setSelCertIds] = useState<string[]>([])
  const [selLanguageIds, setSelLanguageIds] = useState<string[]>([])
  const [introductionOverride, setIntroductionOverride] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [aiModal, setAiModal] = useState<{ text: string; onAccept: (text: string) => void } | null>(null)
  const [themeKey, setThemeKey] = useState<CvThemeKey>(() =>
    (localStorage.getItem('cv-theme') as CvThemeKey | null) ?? 'burgundy'
  )

  function switchTheme(key: CvThemeKey) {
    setThemeKey(key)
    localStorage.setItem('cv-theme', key)
  }

  useEffect(() => {
    if (cv && !initialized) {
      setSelAssignments(cv.assignments.map(a => ({
        id: a.id,
        isHighlighted: a.isHighlighted,
        descriptionOverride: a.isDescriptionOverridden ? a.description.text : null,
      })))
      setSelSkillIds(cv.skills.map(s => s.id))
      setSelEducationIds(cv.educations.map(e => e.id))
      setSelCertIds(cv.certifications.map(c => c.id))
      setSelLanguageIds(cv.languages.map(l => l.id))
      setIntroductionOverride(cv.isIntroductionOverridden ? cv.introduction.text : '')
      setYearsOfExperience(cv.yearsOfExperience ?? '')
      setInitialized(true)
    }
  }, [cv, initialized])

  const saveMutation = useMutation({
    mutationFn: (body: SelectionsBody) => updateSelections(id!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cv', id] }),
  })

  const setSkillsMutation = useMutation({
    mutationFn: ({ assignmentId, skillNames }: { assignmentId: string; skillNames: string[] }) =>
      setAssignmentSkills(assignmentId, skillNames),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] })
      qc.invalidateQueries({ queryKey: ['skills'] })
    },
  })

  const overridesMutation = useMutation({
    mutationFn: (body: { introductionOverride: string | null; yearsOfExperience: string | null }) =>
      updateOverrides(id!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cv', id] }),
  })

  function buildBody(
    assignments: SelAssignment[],
    skillIds: string[],
    educationIds: string[],
    certIds: string[],
    languageIds: string[],
  ): SelectionsBody {
    return {
      assignments: assignments.map((a, i) => ({
        id: a.id, displayOrder: i, isHighlighted: a.isHighlighted,
        descriptionOverride: a.descriptionOverride,
      })),
      skills: skillIds.map((sid, i) => ({ id: sid, displayOrder: i })),
      educations: educationIds.map((eid, i) => ({ id: eid, displayOrder: i })),
      certifications: certIds.map((cid, i) => ({ id: cid, displayOrder: i })),
      languages: languageIds.map((lid, i) => ({ id: lid, displayOrder: i })),
    }
  }

  function toggleAssignment(assignmentId: string) {
    const isSelected = selAssignments.some(a => a.id === assignmentId)
    const next = isSelected
      ? selAssignments.filter(a => a.id !== assignmentId)
      : [...selAssignments, { id: assignmentId, isHighlighted: false }]
    setSelAssignments(next)
    saveMutation.mutate(buildBody(next, selSkillIds, selEducationIds, selCertIds, selLanguageIds))
  }

  function toggleHighlight(assignmentId: string) {
    const next = selAssignments.map(a =>
      a.id === assignmentId ? { ...a, isHighlighted: !a.isHighlighted } : a
    )
    setSelAssignments(next)
    saveMutation.mutate(buildBody(next, selSkillIds, selEducationIds, selCertIds, selLanguageIds))
  }

  function toggleSkill(skillId: string) {
    const next = selSkillIds.includes(skillId)
      ? selSkillIds.filter(s => s !== skillId)
      : [...selSkillIds, skillId]
    setSelSkillIds(next)
    saveMutation.mutate(buildBody(selAssignments, next, selEducationIds, selCertIds, selLanguageIds))
  }

  function toggleEducation(educationId: string) {
    const next = selEducationIds.includes(educationId)
      ? selEducationIds.filter(e => e !== educationId)
      : [...selEducationIds, educationId]
    setSelEducationIds(next)
    saveMutation.mutate(buildBody(selAssignments, selSkillIds, next, selCertIds, selLanguageIds))
  }

  function toggleCertification(certId: string) {
    const next = selCertIds.includes(certId)
      ? selCertIds.filter(c => c !== certId)
      : [...selCertIds, certId]
    setSelCertIds(next)
    saveMutation.mutate(buildBody(selAssignments, selSkillIds, selEducationIds, next, selLanguageIds))
  }

  function toggleLanguage(languageId: string) {
    const next = selLanguageIds.includes(languageId)
      ? selLanguageIds.filter(l => l !== languageId)
      : [...selLanguageIds, languageId]
    setSelLanguageIds(next)
    saveMutation.mutate(buildBody(selAssignments, selSkillIds, selEducationIds, selCertIds, next))
  }

  function saveOverrides(intro: string, years: string) {
    overridesMutation.mutate({
      introductionOverride: intro || null,
      yearsOfExperience: years || null,
    })
  }

  async function handleExportPdf() {
    if (!id) return
    setIsExporting(true)
    try {
      const blob = await downloadPdf(id, themeKey)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cv.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const highlightCount = selAssignments.filter(a => a.isHighlighted).length
  const missingCount = cv ? useMissingTranslations(cv) : 0
  const selectedAssignments = allAssignments.filter(a => selAssignments.some(s => s.id === a.id))

  // Skill grouping for the builder
  const skillCategories = Array.from(new Set(allSkills.map(s => s.category || 'Other')))

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      {/* ── Command bar ── */}
      <header className="flex shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <Link
          to="/cvs"
          aria-label="Back to CVs"
          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {/* Avatar — tiny inline */}
          {cv?.pictureUrl
            ? (
              <img
                src={cv.pictureUrl}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white ring-offset-1 ring-offset-zinc-200"
              />
            )
            : (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-500 text-[10px] font-bold text-white">
                {cv?.firstName?.[0] ?? '?'}{cv?.lastName?.[0] ?? ''}
              </span>
            )
          }
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[11px] font-medium text-zinc-400">Composing</p>
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold tracking-tight text-zinc-900">
                {cv?.firstName} {cv?.lastName}
              </span>
              {cv?.language && (
                <span className="rounded bg-zinc-900 px-1 py-0 text-[9px] font-bold tracking-wide text-white">
                  {cv.language}
                </span>
              )}
              <span className="inline-flex items-center gap-0.5 rounded bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-1 py-0 text-[9px] font-bold text-white">
                <Sparkles className="h-2 w-2" />
                AI
              </span>
              {missingCount > 0 && (
                <span
                  aria-label={`${missingCount} missing translations`}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200"
                >
                  <AlertCircle className="h-2.5 w-2.5" />
                  {missingCount} missing
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Save indicator */}
        <div className="hidden items-center sm:flex">
          {saveMutation.isPending
            ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
                <span className="relative grid h-2 w-2 place-items-center">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-indigo-500" />
                </span>
                Saving…
              </span>
            )
            : saveMutation.isSuccess
              ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  <Check className="h-3 w-3" />
                  Saved
                </span>
              )
              : null
          }
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/profile"
            className="hidden rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 md:inline"
          >
            ← Profile
          </Link>

          {/* Theme swatches */}
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50/60 px-1.5 py-1">
            <span className="px-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">Theme</span>
            {(['burgundy', 'nordic', 'charcoal'] as CvThemeKey[]).map(key => (
              <button
                key={key}
                type="button"
                title={CV_THEMES[key].label}
                onClick={() => switchTheme(key)}
                className={cn(
                  'relative h-5 w-5 rounded-full transition-all',
                  themeKey === key
                    ? 'ring-2 ring-zinc-900 ring-offset-2 ring-offset-white scale-105'
                    : 'opacity-60 hover:opacity-100 hover:scale-110',
                )}
                style={{ background: CV_THEMES[key].swatch }}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Export PDF"
            onClick={handleExportPdf}
            disabled={isExporting || !cv}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-zinc-800 hover:to-zinc-600 disabled:opacity-50"
          >
            {isExporting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Download className="h-3.5 w-3.5" />}
            {isExporting ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel ── */}
        <aside
          className="w-1/2 min-w-[440px] shrink-0 space-y-3 overflow-y-auto border-r border-zinc-200 bg-zinc-50 p-4"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.035) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        >
          {/* Presentation */}
          <BuilderSection
            icon={User}
            title="Presentation"
            description="The opening pitch — name, headshot, and intro paragraph."
            accent="indigo"
          >
            <div className="flex flex-col gap-4 p-4">
              {cv?.pictureUrl && (
                <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-indigo-50/50 to-transparent p-2 ring-1 ring-indigo-100/60">
                  <img
                    src={cv.pictureUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white"
                  />
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{cv.firstName} {cv.lastName}</p>
                    {cv.language && (
                      <p className="text-[11px] font-medium text-indigo-700">Targeted for {cv.language === 'SV' ? 'Swedish' : 'English'} readers</p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="intro-override" className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Introduction
                  </label>
                  {introductionOverride && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
                      <FileEdit className="h-2.5 w-2.5" />
                      Overridden
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <textarea
                    id="intro-override"
                    aria-label="Introduction override"
                    className="flex-1 resize-none rounded-lg border border-zinc-200 bg-white p-3 text-sm leading-relaxed text-zinc-700 placeholder:text-zinc-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    rows={3}
                    value={introductionOverride}
                    placeholder={cv?.introduction.text || 'Override the introduction for this CV…'}
                    onChange={e => setIntroductionOverride(e.target.value)}
                    onBlur={() => saveOverrides(introductionOverride, yearsOfExperience)}
                  />
                  <button
                    type="button"
                    aria-label="AI assist introduction"
                    className="group grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm transition hover:scale-105 hover:shadow"
                    onClick={() => setAiModal({
                      text: introductionOverride || cv?.introduction.text || '',
                      onAccept: (text) => {
                        setIntroductionOverride(text)
                        saveOverrides(text, yearsOfExperience)
                      },
                    })}
                  >
                    <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="years-exp" className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Years of experience
                </label>
                <div className="relative">
                  <input
                    id="years-exp"
                    aria-label="Years of experience"
                    className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm tabular-nums text-zinc-700 placeholder:text-zinc-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={yearsOfExperience}
                    placeholder="e.g. 10"
                    onChange={e => setYearsOfExperience(e.target.value)}
                    onBlur={() => saveOverrides(introductionOverride, yearsOfExperience)}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">
                    years
                  </span>
                </div>
              </div>
            </div>
          </BuilderSection>

          {/* Projects and assignments — selection + highlight inline */}
          <BuilderSection
            icon={Rocket}
            title="Projects & assignments"
            description="Pick which assignments appear. Star up to 2 to feature on the front page."
            accent="rose"
            count={allAssignments.length}
            activeCount={selectedAssignments.length}
          >
            {allAssignments.length === 0
              ? <EmptyBlock icon={Briefcase} message="No assignments in your profile yet." ctaHref="/profile" />
              : (
                <div>
                  {/* Highlight counter strip */}
                  {selectedAssignments.length > 0 && (
                    <div className="flex items-center justify-between gap-3 border-b border-rose-100/70 bg-rose-50/40 px-4 py-2 text-[11px]">
                      <span className="inline-flex items-center gap-1.5 font-medium text-rose-700">
                        <Star className="h-3 w-3 fill-rose-500 text-rose-500" />
                        Highlighted {highlightCount} / 2
                      </span>
                      <span className="text-zinc-500">
                        {selectedAssignments.length} on CV · {allAssignments.length - selectedAssignments.length} available
                      </span>
                    </div>
                  )}
                  {allAssignments.map(a => {
                    const isSelected = selAssignments.some(s => s.id === a.id)
                    const selEntry = selAssignments.find(s => s.id === a.id)
                    const isHighlighted = selEntry?.isHighlighted ?? false
                    const atLimit = highlightCount >= 2 && !isHighlighted
                    const title = a.titleSv || a.titleEn || 'Untitled'
                    const descOverride = selEntry?.descriptionOverride ?? ''
                    const profileDesc = a.descriptionSv || a.descriptionEn || ''
                    const hasSv = !!(a.titleSv || a.descriptionSv)
                    const hasEn = !!(a.titleEn || a.descriptionEn)

                    return (
                      <ItemRow key={a.id} isSelected={isSelected} accent="rose">
                        <div className="flex items-start gap-3 px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <p className="text-sm font-semibold leading-tight text-zinc-900">
                                {title}
                              </p>
                              {isHighlighted && (
                                <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-100 px-1.5 py-0 text-[9px] font-bold text-rose-700">
                                  <Star className="h-2.5 w-2.5 fill-rose-700" />
                                  FEATURED
                                </span>
                              )}
                              <LangDot active={hasSv} label="SV" />
                              <LangDot active={hasEn} label="EN" />
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500">
                              <span className="inline-flex items-center gap-0.5">
                                <Building2 className="h-2.5 w-2.5" />
                                <span className="font-medium text-zinc-700">{a.client}</span>
                              </span>
                              <span className="inline-flex items-center gap-0.5 tabular-nums">
                                <Calendar className="h-2.5 w-2.5" />
                                {shortDate(a.startDate)} → {a.endDate ? shortDate(a.endDate) : 'now'}
                              </span>
                              <span className="rounded bg-zinc-100 px-1 py-0 text-[9px] font-semibold text-zinc-600 tabular-nums">
                                {monthsBetween(a.startDate, a.endDate)}
                              </span>
                            </div>
                            {/* Always-visible description preview */}
                            {(profileDesc || descOverride) && (
                              <p className={cn(
                                'mt-2 line-clamp-2 text-[11px] leading-relaxed',
                                descOverride ? 'italic text-amber-700' : 'text-zinc-600',
                              )}>
                                {descOverride || profileDesc}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                            <Switch
                              checked={isSelected}
                              onCheckedChange={() => toggleAssignment(a.id)}
                              aria-label={`Select assignment ${title}`}
                            />
                            {isSelected && (
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isHighlighted}
                                aria-label={isHighlighted ? 'Remove highlight' : 'Highlight'}
                                title={atLimit ? 'Max 2 highlights' : isHighlighted ? 'Remove from highlights' : 'Mark as featured'}
                                disabled={atLimit}
                                onClick={() => toggleHighlight(a.id)}
                                className={cn(
                                  'group grid h-7 w-7 place-items-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-30',
                                  isHighlighted
                                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                                    : 'bg-zinc-100 text-zinc-400 hover:bg-rose-100 hover:text-rose-600',
                                )}
                              >
                                <Star className={cn('h-3.5 w-3.5', isHighlighted && 'fill-current')} />
                              </button>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="px-4 pb-3">
                            <div className="flex items-start gap-1.5">
                              <textarea
                                aria-label={`Description override for ${title}`}
                                className="flex-1 resize-none rounded-md border border-zinc-200 bg-white p-2 text-[11px] leading-relaxed focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                                rows={2}
                                value={descOverride}
                                placeholder="Override description… (leave empty to use profile default)"
                                onChange={e => {
                                  const val = e.target.value || null
                                  setSelAssignments(prev => prev.map(s =>
                                    s.id === a.id ? { ...s, descriptionOverride: val } : s
                                  ))
                                }}
                                onBlur={() => saveMutation.mutate(
                                  buildBody(selAssignments, selSkillIds, selEducationIds, selCertIds, selLanguageIds)
                                )}
                              />
                              <button
                                type="button"
                                aria-label={`AI assist description for ${title}`}
                                className="group grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm transition hover:scale-105"
                                onClick={() => {
                                  const current = descOverride || cv?.assignments.find(ca => ca.id === a.id)?.description.text || ''
                                  setAiModal({
                                    text: current,
                                    onAccept: (text) => {
                                      const next = selAssignments.map(s =>
                                        s.id === a.id ? { ...s, descriptionOverride: text } : s
                                      )
                                      setSelAssignments(next)
                                      saveMutation.mutate(buildBody(next, selSkillIds, selEducationIds, selCertIds, selLanguageIds))
                                    },
                                  })
                                }}
                              >
                                <Pencil className="h-3 w-3 transition-transform group-hover:rotate-12" />
                              </button>
                            </div>
                          </div>
                        )}
                        <SkillTagInput
                          skillIds={a.skillIds}
                          allSkills={allSkills}
                          onSave={names => setSkillsMutation.mutate({ assignmentId: a.id, skillNames: names })}
                        />
                      </ItemRow>
                    )
                  })}
                </div>
              )
            }
          </BuilderSection>

          {/* Skills */}
          <BuilderSection
            icon={SparklesIcon}
            title="Skills"
            description="Pick which skills appear on the CV. Grouped by your profile categories."
            accent="violet"
            count={allSkills.length}
            activeCount={selSkillIds.length}
          >
            {allSkills.length === 0
              ? <EmptyBlock icon={SparklesIcon} message="No skills in your profile yet." ctaHref="/profile" />
              : (
                <div>
                  {skillCategories.map(cat => {
                    const catSkills = allSkills.filter(s => (s.category || 'Other') === cat)
                    return (
                      <div key={cat}>
                        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/40 px-4 py-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
                            {cat}
                          </span>
                          <span className="rounded-full bg-white px-1.5 py-0 text-[9px] font-bold text-zinc-500 ring-1 ring-zinc-200 tabular-nums">
                            {catSkills.filter(s => selSkillIds.includes(s.id)).length}/{catSkills.length}
                          </span>
                          <div className="h-px flex-1 bg-zinc-100" />
                        </div>
                        {catSkills.map(s => {
                          const isSelected = selSkillIds.includes(s.id)
                          return (
                            <ItemRow key={s.id} isSelected={isSelected} accent="violet">
                              <div className="flex items-center gap-3 px-4 py-2.5">
                                <span className={cn(
                                  'h-1.5 w-1.5 rounded-full',
                                  isSelected ? 'bg-violet-500' : 'bg-zinc-300',
                                )} />
                                <p className="flex-1 text-sm font-medium leading-tight text-zinc-800">{s.name}</p>
                                <Switch
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSkill(s.id)}
                                  aria-label={`Select skill ${s.name}`}
                                />
                              </div>
                            </ItemRow>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )
            }
          </BuilderSection>

          {/* Education */}
          <BuilderSection
            icon={GraduationCap}
            title="Education"
            accent="amber"
            count={allEducations.length}
            activeCount={selEducationIds.length}
            defaultOpen={false}
          >
            {allEducations.length === 0
              ? <EmptyBlock icon={GraduationCap} message="No education entries yet." ctaHref="/profile" />
              : (
                <div>
                  {allEducations.map(e => {
                    const isSelected = selEducationIds.includes(e.id)
                    return (
                      <ItemRow key={e.id} isSelected={isSelected} accent="amber">
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="grid h-10 w-14 shrink-0 flex-col place-items-center rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/40 ring-1 ring-amber-200 tabular-nums">
                            <span className="text-xs font-bold leading-none text-amber-800">{e.startYear}</span>
                            <span className="text-[9px] font-medium leading-tight text-amber-700">
                              {e.endYear ? `–${e.endYear}` : '–now'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold leading-tight text-zinc-900">
                              {e.degreeSv || e.degreeEn || e.school}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-zinc-500">{e.school}</p>
                          </div>
                          <Switch
                            checked={isSelected}
                            onCheckedChange={() => toggleEducation(e.id)}
                          />
                        </div>
                      </ItemRow>
                    )
                  })}
                </div>
              )
            }
          </BuilderSection>

          {/* Certifications */}
          <BuilderSection
            icon={Award}
            title="Certifications"
            accent="emerald"
            count={allCertifications.length}
            activeCount={selCertIds.length}
            defaultOpen={false}
          >
            {allCertifications.length === 0
              ? <EmptyBlock icon={Award} message="No certifications yet." ctaHref="/profile" />
              : (
                <div>
                  {allCertifications.map(c => {
                    const isSelected = selCertIds.includes(c.id)
                    return (
                      <ItemRow key={c.id} isSelected={isSelected} accent="emerald">
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/60 ring-1 ring-emerald-200">
                            <Award className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold leading-tight text-zinc-900">
                              {c.nameSv || c.nameEn || ''}
                            </p>
                            <p className="mt-0.5 text-[11px] text-zinc-500 tabular-nums">{c.year}</p>
                          </div>
                          <Switch
                            checked={isSelected}
                            onCheckedChange={() => toggleCertification(c.id)}
                          />
                        </div>
                      </ItemRow>
                    )
                  })}
                </div>
              )
            }
          </BuilderSection>

          {/* Languages */}
          <BuilderSection
            icon={LanguagesIcon}
            title="Languages"
            accent="sky"
            count={allLanguages.length}
            activeCount={selLanguageIds.length}
            defaultOpen={false}
          >
            {allLanguages.length === 0
              ? <EmptyBlock icon={LanguagesIcon} message="No languages yet." ctaHref="/profile" />
              : (
                <div>
                  {allLanguages.map(l => {
                    const isSelected = selLanguageIds.includes(l.id)
                    return (
                      <ItemRow key={l.id} isSelected={isSelected} accent="sky">
                        <div className="flex items-center gap-3 px-4 py-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-[10px] font-bold uppercase text-sky-700 ring-1 ring-sky-100">
                            {l.name.slice(0, 2)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold leading-tight text-zinc-900">{l.name}</p>
                            <p className="mt-0.5 text-[11px] font-medium text-sky-700">{l.proficiency}</p>
                          </div>
                          <Switch
                            checked={isSelected}
                            onCheckedChange={() => toggleLanguage(l.id)}
                          />
                        </div>
                      </ItemRow>
                    )
                  })}
                </div>
              )
            }
          </BuilderSection>

          {/* Front page groups */}
          {id && (
            <BuilderSection
              icon={LayoutGrid}
              title="Front page groups"
              description="Define the Roles and Techniques sections shown in the CV sidebar."
              accent="fuchsia"
              defaultOpen={false}
            >
              <div className="p-3">
                <FrontPageGroupsEditor
                  cvId={id}
                  allSkills={allSkills}
                  allCertifications={allCertifications}
                />
              </div>
            </BuilderSection>
          )}
        </aside>

        {/* ── Right panel — live preview ── */}
        <main
          className="flex min-w-0 flex-1 justify-center overflow-y-auto bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0), linear-gradient(135deg, #f4f4f5, #fafafa 50%, #f4f4f5)',
            backgroundSize: '24px 24px, 100% 100%',
          }}
        >
          {cv
            ? (
              <div className="py-6">
                <CVPreview cv={cv} showBoundary theme={CV_THEMES[themeKey]} />
              </div>
            )
            : (
              <div className="mt-24 flex flex-col items-center gap-2 text-zinc-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm">Loading preview…</p>
              </div>
            )
          }
        </main>
      </div>

      {aiModal && cv && (
        <AIModal
          originalText={aiModal.text}
          language={cv.language}
          onAccept={aiModal.onAccept}
          onClose={() => setAiModal(null)}
        />
      )}
    </div>
  )
}

// ─── Small UI primitives ──────────────────────────────────────────────────────

function LangDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1 py-0 text-[9px] font-bold tracking-tight',
        active
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-zinc-50 text-zinc-300 ring-1 ring-zinc-200',
      )}
      title={active ? `${label} translation available` : `Missing ${label}`}
    >
      {label}
    </span>
  )
}
