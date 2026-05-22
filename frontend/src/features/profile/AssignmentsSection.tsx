import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Briefcase, Calendar, Pencil, Trash2, Plus, X, Check,
  AlertCircle, Building2, Tag, ChevronDown, ChevronUp,
} from 'lucide-react'
import { BilingualFieldPair } from './BilingualFieldPair'
import {
  getAssignments, createAssignment, updateAssignment, deleteAssignment,
  attachAssignmentSkill, detachAssignmentSkill, getSkills,
  type AssignmentDto, type SkillDto,
} from './collectionsApi'

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

function formatDate(d: string): string {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function AssignmentsSection() {
  const qc = useQueryClient()
  const { data: assignments = [] } = useQuery({ queryKey: ['assignments'], queryFn: getAssignments })
  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: getSkills })

  const [formId, setFormId] = useState<string | 'new' | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [titleSv, setTitleSv] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [descriptionSv, setDescriptionSv] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [client, setClient] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])

  const invalidate = () => qc.invalidateQueries({ queryKey: ['assignments'] })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        titleSv: titleSv || null, titleEn: titleEn || null,
        descriptionSv: descriptionSv || null, descriptionEn: descriptionEn || null,
        client, startDate, endDate: endDate || null,
      }
      const saved = formId === 'new'
        ? await createAssignment(data)
        : await updateAssignment(formId!, data)
      const current = new Set(saved.skillIds)
      const desired = new Set(selectedSkillIds)
      await Promise.all([
        ...selectedSkillIds.filter(id => !current.has(id)).map(sid => attachAssignmentSkill(saved.id, sid)),
        ...saved.skillIds.filter(id => !desired.has(id)).map(sid => detachAssignmentSkill(saved.id, sid)),
      ])
    },
    onSuccess: () => { invalidate(); setFormId(null) },
  })

  const deleteMutation = useMutation({ mutationFn: deleteAssignment, onSuccess: invalidate })

  function openNew() {
    setTitleSv(''); setTitleEn('')
    setDescriptionSv(''); setDescriptionEn('')
    setClient(''); setStartDate(''); setEndDate('')
    setSelectedSkillIds([])
    setFormId('new')
  }

  function openEdit(a: AssignmentDto) {
    setTitleSv(a.titleSv ?? ''); setTitleEn(a.titleEn ?? '')
    setDescriptionSv(a.descriptionSv ?? ''); setDescriptionEn(a.descriptionEn ?? '')
    setClient(a.client); setStartDate(a.startDate); setEndDate(a.endDate ?? '')
    setSelectedSkillIds(a.skillIds)
    setFormId(a.id)
  }

  function handleDelete(id: string) {
    if (window.confirm('Delete this assignment?')) deleteMutation.mutate(id)
  }

  function toggleSkill(id: string) {
    setSelectedSkillIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const skillById = new Map(skills.map(s => [s.id, s] as const))

  return (
    <SectionCard
      icon={<Briefcase className="h-5 w-5" />}
      accentClass="bg-rose-50 text-rose-600 ring-rose-100"
      title="Assignments"
      count={assignments.length}
      onAdd={formId === null ? openNew : undefined}
      addLabel="+ Add assignment"
    >
      {assignments.length === 0 && formId === null && (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title="No assignments yet"
          hint="Add the projects you've delivered. Recruiters skim these first — be specific about scope and stack."
        />
      )}

      <div className="flex flex-col gap-3">
        {assignments.map(a => {
          const isExpanded = expandedId === a.id
          const isEditing = formId === a.id
          const attachedSkills = a.skillIds.map(id => skillById.get(id)).filter(Boolean) as SkillDto[]
          const hasSv = !!(a.titleSv || a.descriptionSv)
          const hasEn = !!(a.titleEn || a.descriptionEn)
          const displayTitle = a.titleSv || a.titleEn || 'Untitled'

          if (isEditing) {
            return (
              <AssignmentForm
                key={a.id}
                titleSv={titleSv} titleEn={titleEn}
                setTitleSv={setTitleSv} setTitleEn={setTitleEn}
                descriptionSv={descriptionSv} descriptionEn={descriptionEn}
                setDescriptionSv={setDescriptionSv} setDescriptionEn={setDescriptionEn}
                client={client} setClient={setClient}
                startDate={startDate} setStartDate={setStartDate}
                endDate={endDate} setEndDate={setEndDate}
                skills={skills}
                selectedSkillIds={selectedSkillIds}
                toggleSkill={toggleSkill}
                onCancel={() => setFormId(null)}
                onSubmit={() => saveMutation.mutate()}
                isPending={saveMutation.isPending}
              />
            )
          }

          return (
            <article
              key={a.id}
              className="group relative rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-rose-200 hover:shadow-[0_2px_8px_rgba(244,63,94,0.08)]"
            >
              {/* Top row: title + lang badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-zinc-900 leading-tight">
                    {displayTitle}
                  </h3>
                  {/* Both languages visible side-by-side if both exist */}
                  {hasSv && hasEn && a.titleSv && a.titleEn && a.titleSv !== a.titleEn && (
                    <p className="mt-0.5 text-xs text-zinc-500 italic">
                      {a.titleSv === displayTitle ? a.titleEn : a.titleSv}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <LangBadge active={hasSv} label="SV" />
                  <LangBadge active={hasEn} label="EN" />
                </div>
              </div>

              {/* Meta row */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="font-medium text-zinc-700">{a.client}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="tabular-nums">
                    {formatDate(a.startDate)} → {a.endDate ? formatDate(a.endDate) : 'now'}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 tabular-nums">
                    {monthsBetween(a.startDate, a.endDate)}
                  </span>
                </span>
              </div>

              {/* Description block — toggle full / preview */}
              {(a.descriptionSv || a.descriptionEn) && (
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {a.descriptionSv && (
                    <DescriptionBlock lang="SV" text={a.descriptionSv} expanded={isExpanded} />
                  )}
                  {a.descriptionEn && (
                    <DescriptionBlock lang="EN" text={a.descriptionEn} expanded={isExpanded} />
                  )}
                </div>
              )}

              {/* Warnings */}
              {(!hasSv || !hasEn) && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
                  <AlertCircle className="h-3 w-3" />
                  Missing {!hasSv ? 'Swedish' : 'English'} translation
                </div>
              )}

              {/* Skills */}
              {attachedSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-zinc-400" />
                  {attachedSkills.map(s => (
                    <span
                      key={s.id}
                      className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-100"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer actions */}
              <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
                {(a.descriptionSv || a.descriptionEn) ? (
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900"
                  >
                    {isExpanded
                      ? <>Collapse <ChevronUp className="h-3 w-3" /></>
                      : <>Show full <ChevronDown className="h-3 w-3" /></>
                    }
                  </button>
                ) : <span />}
                <div className="flex items-center gap-1">
                  <IconButton onClick={() => openEdit(a)} label="Edit">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </IconButton>
                  <IconButton onClick={() => handleDelete(a.id)} label="Delete" tone="danger">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </IconButton>
                </div>
              </div>
            </article>
          )
        })}

        {formId === 'new' && (
          <AssignmentForm
            titleSv={titleSv} titleEn={titleEn}
            setTitleSv={setTitleSv} setTitleEn={setTitleEn}
            descriptionSv={descriptionSv} descriptionEn={descriptionEn}
            setDescriptionSv={setDescriptionSv} setDescriptionEn={setDescriptionEn}
            client={client} setClient={setClient}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
            skills={skills}
            selectedSkillIds={selectedSkillIds}
            toggleSkill={toggleSkill}
            onCancel={() => setFormId(null)}
            onSubmit={() => saveMutation.mutate()}
            isPending={saveMutation.isPending}
          />
        )}
      </div>
    </SectionCard>
  )
}

// ── Subcomponents ────────────────────────────────────────────────────────────

interface SectionCardProps {
  icon: React.ReactNode
  accentClass: string
  title: string
  count: number
  onAdd?: () => void
  addLabel: string
  children: React.ReactNode
}
export function SectionCard({ icon, accentClass, title, count, onAdd, addLabel, children }: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`grid h-9 w-9 place-items-center rounded-xl ring-1 ${accentClass}`}>
            {icon}
          </span>
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 tabular-nums">
            {count}
          </span>
        </div>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            {addLabel}
          </button>
        )}
      </header>
      {children}
    </section>
  )
}

export function EmptyState({ icon, title, hint }: { icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 py-8 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-zinc-400 ring-1 ring-zinc-200">
        {icon}
      </span>
      <p className="text-sm font-medium text-zinc-700">{title}</p>
      <p className="max-w-sm px-4 text-xs text-zinc-500">{hint}</p>
    </div>
  )
}

function LangBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={
        active
          ? 'inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200'
          : 'inline-flex items-center gap-0.5 rounded-md bg-zinc-50 px-1.5 py-0.5 text-[10px] font-bold text-zinc-400 ring-1 ring-zinc-200'
      }
    >
      {active && <Check className="h-2.5 w-2.5" />}
      {!active && <X className="h-2.5 w-2.5" />}
      {label}
    </span>
  )
}

function DescriptionBlock({ lang, text, expanded }: { lang: string; text: string; expanded: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-zinc-50/60 p-2.5">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{lang}</p>
      <p
        className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-700"
        style={expanded ? undefined : {
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {text}
      </p>
    </div>
  )
}

export function IconButton({
  onClick, children, label, tone = 'default',
}: { onClick: () => void; children: React.ReactNode; label: string; tone?: 'default' | 'danger' }) {
  const toneClass = tone === 'danger'
    ? 'text-red-600 hover:bg-red-50'
    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition ${toneClass}`}
    >
      {children}
    </button>
  )
}

interface AssignmentFormProps {
  titleSv: string; titleEn: string
  setTitleSv: (s: string) => void; setTitleEn: (s: string) => void
  descriptionSv: string; descriptionEn: string
  setDescriptionSv: (s: string) => void; setDescriptionEn: (s: string) => void
  client: string; setClient: (s: string) => void
  startDate: string; setStartDate: (s: string) => void
  endDate: string; setEndDate: (s: string) => void
  skills: SkillDto[]
  selectedSkillIds: string[]
  toggleSkill: (id: string) => void
  onCancel: () => void
  onSubmit: () => void
  isPending: boolean
}
function AssignmentForm(p: AssignmentFormProps) {
  return (
    <form
      onSubmit={e => { e.preventDefault(); p.onSubmit() }}
      className="rounded-xl border-2 border-rose-200 bg-rose-50/30 p-4 flex flex-col gap-3"
    >
      <BilingualFieldPair
        label="Title"
        sv={p.titleSv}
        en={p.titleEn}
        onChange={(sv, en) => { p.setTitleSv(sv); p.setTitleEn(en) }}
      />
      <BilingualFieldPair
        label="Description"
        sv={p.descriptionSv}
        en={p.descriptionEn}
        onChange={(sv, en) => { p.setDescriptionSv(sv); p.setDescriptionEn(en) }}
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-3">
          <FieldLabel icon={<Building2 className="h-3.5 w-3.5" />}>Client</FieldLabel>
          <input
            placeholder="Client"
            value={p.client}
            onChange={e => p.setClient(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            required
          />
        </div>
        <div>
          <FieldLabel icon={<Calendar className="h-3.5 w-3.5" />}>Start date</FieldLabel>
          <input
            type="date"
            aria-label="Start date"
            value={p.startDate}
            onChange={e => p.setStartDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            required
          />
        </div>
        <div>
          <FieldLabel icon={<Calendar className="h-3.5 w-3.5" />}>End date</FieldLabel>
          <input
            type="date"
            aria-label="End date"
            value={p.endDate}
            onChange={e => p.setEndDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>
      </div>
      {p.skills.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <FieldLabel icon={<Tag className="h-3.5 w-3.5" />}>Skills</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {p.skills.map(s => {
              const selected = p.selectedSkillIds.includes(s.id)
              return (
                <label
                  key={s.id}
                  className={
                    selected
                      ? 'cursor-pointer rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-indigo-600'
                      : 'cursor-pointer rounded-md bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200 hover:ring-indigo-300'
                  }
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected}
                    onChange={() => p.toggleSkill(s.id)}
                  />
                  {s.name}
                </label>
              )
            })}
          </div>
        </fieldset>
      )}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={p.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {p.isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={p.onCancel}
          className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function FieldLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
      {icon && <span className="text-zinc-400">{icon}</span>}
      {children}
    </label>
  )
}
