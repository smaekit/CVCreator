import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User, Star, Rocket, GraduationCap, Award, Globe, ChevronDown,
  Pencil, Plus, ArrowLeft, Download, Loader2, Sparkles, LayoutGrid,
} from 'lucide-react'
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
    <div className="flex flex-wrap gap-1 items-center px-5 pb-3 pt-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mr-1">Skills</span>
      {tags.map(tag => (
        <span
          key={tag}
          className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full leading-tight"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove skill ${tag}`}
            onClick={() => removeTag(tag)}
            className="text-teal-400 hover:text-teal-700 leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        className="text-[10px] border-none outline-none bg-transparent placeholder:text-gray-300 min-w-[80px] py-0.5"
        placeholder="Add skill…"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input) }
          if (e.key === 'Backspace' && !input && tags.length > 0) removeTag(tags[tags.length - 1])
        }}
        onBlur={() => { if (input.trim()) addTag(input) }}
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
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  defaultOpen?: boolean
  children: React.ReactNode
  badge?: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50/70 transition-colors text-left group"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800 tracking-[-0.01em]">{title}</span>
            {badge}
          </div>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-1">{description}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-300 shrink-0 transition-transform duration-200 group-hover:text-gray-400',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && <div className="border-t border-gray-100/80">{children}</div>}
    </div>
  )
}

// ─── EmptyBlock ───────────────────────────────────────────────────────────────

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="px-4 py-8 flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-28 h-16 bg-gray-100 rounded-lg flex items-center justify-between px-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-2 bg-gray-300 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="w-6 h-6 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center ml-2 shrink-0">
            <Plus className="w-3 h-3 text-gray-400" />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center max-w-[220px] leading-relaxed">{message}</p>
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
      const blob = await downloadPdf(id)
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <Link
          to="/"
          aria-label="Back to CVs"
          className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-semibold text-gray-900 truncate">
            {cv?.firstName} {cv?.lastName}
          </span>
          {cv?.language && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium shrink-0">
              {cv.language}
            </span>
          )}
          <span className="text-xs px-1.5 py-0.5 bg-teal-600 text-white rounded font-medium flex items-center gap-1 shrink-0">
            <Sparkles className="w-2.5 h-2.5" />
            AI
          </span>
          {missingCount > 0 && (
            <span
              aria-label={`${missingCount} missing translations`}
              className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full shrink-0"
            >
              {missingCount} missing
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/profile"
            className="text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100"
          >
            Go to profile
          </Link>
          {saveMutation.isPending && (
            <span className="text-xs text-gray-400 flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
              <Loader2 className="w-3 h-3 animate-spin text-teal-500" />
              Saving…
            </span>
          )}
          <button
            type="button"
            aria-label="Export PDF"
            onClick={handleExportPdf}
            disabled={isExporting || !cv}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isExporting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Download className="w-3.5 h-3.5" />}
            {isExporting ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel ── */}
        <aside className="w-1/2 min-w-[400px] border-r border-gray-100 overflow-y-auto bg-[#f7f8fa] p-4 space-y-3 shrink-0">

          {/* Presentation */}
          <BuilderSection
            icon={User}
            title="Presentation"
            description="A description of the person in question is provided below."
          >
            <div className="p-5 flex flex-col gap-4">
              {cv?.pictureUrl && (
                <div className="flex items-center gap-3">
                  <img
                    src={cv.pictureUrl}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-100 ring-offset-1"
                  />
                  <span className="text-sm text-gray-700 font-semibold tracking-[-0.01em]">
                    {cv.firstName} {cv.lastName}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="intro-override" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Introduction
                  </label>
                  {introductionOverride && (
                    <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                      overridden
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <textarea
                    id="intro-override"
                    aria-label="Introduction override"
                    className="flex-1 text-sm border border-gray-200 rounded-lg p-3 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all text-gray-700 placeholder:text-gray-300 leading-relaxed"
                    rows={3}
                    value={introductionOverride}
                    placeholder="Override introduction…"
                    onChange={e => setIntroductionOverride(e.target.value)}
                    onBlur={() => saveOverrides(introductionOverride, yearsOfExperience)}
                  />
                  <button
                    type="button"
                    aria-label="AI assist introduction"
                    className="p-2.5 border border-teal-200 rounded-lg text-teal-600 hover:bg-teal-50 hover:border-teal-300 transition-all self-start"
                    onClick={() => setAiModal({
                      text: introductionOverride || cv?.introduction.text || '',
                      onAccept: (text) => {
                        setIntroductionOverride(text)
                        saveOverrides(text, yearsOfExperience)
                      },
                    })}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="years-exp" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Years of experience
                </label>
                <input
                  id="years-exp"
                  aria-label="Years of experience"
                  className="w-full text-sm border border-gray-200 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all text-gray-700 placeholder:text-gray-300"
                  value={yearsOfExperience}
                  placeholder="e.g. 10"
                  onChange={e => setYearsOfExperience(e.target.value)}
                  onBlur={() => saveOverrides(introductionOverride, yearsOfExperience)}
                />
              </div>
            </div>
          </BuilderSection>

          {/* Skills by category */}
          <BuilderSection
            icon={Star}
            title="Skills by category"
            description="Skills are grouped and sorted into categories to highlight specific areas of expertise."
          >
            {allSkills.length === 0 ? (
              <EmptyBlock message="There's no content in this block yet. Don't be shy, go ahead and add something 😊" />
            ) : (
              <div>
                {(() => {
                  const categories = Array.from(new Set(allSkills.map(s => s.category || 'Other')))
                  return categories.map(cat => {
                    const catSkills = allSkills.filter(s => (s.category || 'Other') === cat)
                    return (
                      <div key={cat}>
                        <div className="px-5 pt-3 pb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500">{cat}</span>
                        </div>
                        {catSkills.map((s, idx) => (
                          <div
                            key={s.id}
                            className={cn(
                              'flex items-center gap-4 px-5 py-3',
                              idx < catSkills.length - 1 ? 'border-b border-gray-50' : 'border-b border-gray-100',
                            )}
                          >
                            <p className="flex-1 text-sm font-medium text-gray-800 leading-tight">{s.name}</p>
                            <Switch
                              checked={selSkillIds.includes(s.id)}
                              onCheckedChange={() => toggleSkill(s.id)}
                              aria-label={`Select skill ${s.name}`}
                            />
                          </div>
                        ))}
                      </div>
                    )
                  })
                })()}
              </div>
            )}
          </BuilderSection>

          {/* Selected projects */}
          <BuilderSection
            icon={Rocket}
            title="Selected projects"
            description="Up to 2 assignments are highlighted in this section. Each assignment is displayed with its respective title and description."
          >
            {selectedAssignments.length === 0 ? (
              <EmptyBlock message="Select assignments in 'Projects and assignments' to feature them here." />
            ) : (
              <div>
                {selectedAssignments.map(a => {
                  const selEntry = selAssignments.find(s => s.id === a.id)
                  const isHighlighted = selEntry?.isHighlighted ?? false
                  const atLimit = highlightCount >= 2 && !isHighlighted
                  const title = a.titleSv || a.titleEn || 'Untitled'
                  const subtitle = `${a.startDate}${a.endDate ? ` – ${a.endDate}` : ' – Ongoing'} · ${a.client}`
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 leading-tight">{title}</p>
                        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400 font-medium">Highlight</span>
                        <Switch
                          checked={isHighlighted}
                          onCheckedChange={() => toggleHighlight(a.id)}
                          disabled={atLimit}
                          aria-label={isHighlighted ? 'Remove highlight' : 'Highlight'}
                          title={atLimit ? 'Maximum 2 highlights' : undefined}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </BuilderSection>

          {/* Projects and assignments */}
          <BuilderSection
            icon={Rocket}
            title="Projects and assignments"
            description="Here you find the projects and assignments the person has worked on. This section showcases their involvement and contributions in each task."
          >
            {allAssignments.length === 0 ? (
              <EmptyBlock message="There's no content in this block yet. Don't be shy, go ahead and add something 😊" />
            ) : (
              <div>
                {allAssignments.map(a => {
                  const isSelected = selAssignments.some(s => s.id === a.id)
                  const selEntry = selAssignments.find(s => s.id === a.id)
                  const title = a.titleSv || a.titleEn || 'Untitled'
                  const subtitle = `${a.startDate}${a.endDate ? ` – ${a.endDate}` : ' – Ongoing'} · ${a.client}`
                  const descOverride = selEntry?.descriptionOverride ?? ''
                  return (
                    <div key={a.id} className={cn('border-b border-gray-50 last:border-0', isSelected && 'bg-teal-50/30')}>
                      <div className="flex items-start gap-4 px-5 py-3.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 leading-tight">{title}</p>
                          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                          {isSelected && (a.descriptionSv || a.descriptionEn) && !descOverride && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                              {a.descriptionSv || a.descriptionEn}
                            </p>
                          )}
                          {isSelected && descOverride && (
                            <p className="text-xs text-amber-700 mt-2 line-clamp-2 leading-relaxed italic">
                              {descOverride}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                          <Switch
                            checked={isSelected}
                            onCheckedChange={() => toggleAssignment(a.id)}
                            aria-label={`Select assignment ${title}`}
                          />
                          {isSelected && (
                            <button
                              type="button"
                              aria-label={`AI assist description for ${title}`}
                              className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors rounded-lg hover:bg-teal-50"
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
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="px-5 pb-3">
                          <textarea
                            aria-label={`Description override for ${title}`}
                            className="w-full text-xs border border-gray-200 rounded-lg p-2.5 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
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
                        </div>
                      )}
                      <SkillTagInput
                        skillIds={a.skillIds}
                        allSkills={allSkills}
                        onSave={names => setSkillsMutation.mutate({ assignmentId: a.id, skillNames: names })}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </BuilderSection>

          {/* Education */}
          <BuilderSection
            icon={GraduationCap}
            title="Education"
            defaultOpen={false}
          >
            {allEducations.length === 0 ? (
              <EmptyBlock message="No education entries yet. Add them in your profile." />
            ) : (
              <div>
                {allEducations.map(e => (
                  <div
                    key={e.id}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-tight">
                        {e.degreeSv || e.degreeEn || e.school}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {e.school} · {e.startYear}{e.endYear ? `–${e.endYear}` : '–present'}
                      </p>
                    </div>
                    <Switch
                      checked={selEducationIds.includes(e.id)}
                      onCheckedChange={() => toggleEducation(e.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </BuilderSection>

          {/* Certifications */}
          <BuilderSection
            icon={Award}
            title="Certifications"
            defaultOpen={false}
          >
            {allCertifications.length === 0 ? (
              <EmptyBlock message="No certifications yet. Add them in your profile." />
            ) : (
              <div>
                {allCertifications.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-tight">
                        {c.nameSv || c.nameEn || ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{c.year}</p>
                    </div>
                    <Switch
                      checked={selCertIds.includes(c.id)}
                      onCheckedChange={() => toggleCertification(c.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </BuilderSection>

          {/* Languages */}
          <BuilderSection
            icon={Globe}
            title="Languages"
            defaultOpen={false}
          >
            {allLanguages.length === 0 ? (
              <EmptyBlock message="No languages yet. Add them in your profile." />
            ) : (
              <div>
                {allLanguages.map(l => (
                  <div
                    key={l.id}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-tight">{l.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{l.proficiency}</p>
                    </div>
                    <Switch
                      checked={selLanguageIds.includes(l.id)}
                      onCheckedChange={() => toggleLanguage(l.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </BuilderSection>

          {/* Front page groups */}
          {id && (
            <BuilderSection
              icon={LayoutGrid}
              title="Front page groups"
              description="Define the Roles and Techniques sections shown in the left sidebar of the CV."
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
        <main className="flex-1 overflow-y-auto bg-gray-100 min-w-0 flex justify-center">
          {cv
            ? <CVPreview cv={cv} showBoundary />
            : <div className="text-gray-400 mt-20">Loading…</div>}
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
