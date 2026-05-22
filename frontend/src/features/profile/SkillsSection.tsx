import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sparkles, Pencil, Trash2, Check, X, FolderOpen } from 'lucide-react'
import { getSkills, createSkill, updateSkill, deleteSkill, type SkillDto } from './collectionsApi'
import { SectionCard, EmptyState, IconButton, FieldLabel } from './AssignmentsSection'

// Stable color rotation per category — same category always gets same color
const CATEGORY_PALETTE = [
  { ring: 'ring-violet-200',  bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-500'  },
  { ring: 'ring-sky-200',     bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-500'     },
  { ring: 'ring-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  { ring: 'ring-amber-200',   bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  { ring: 'ring-rose-200',    bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500'    },
  { ring: 'ring-cyan-200',    bg: 'bg-cyan-50',    text: 'text-cyan-700',    dot: 'bg-cyan-500'    },
  { ring: 'ring-orange-200',  bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-500'  },
  { ring: 'ring-fuchsia-200', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', dot: 'bg-fuchsia-500' },
]
const UNCATEGORIZED = { ring: 'ring-zinc-200', bg: 'bg-zinc-50', text: 'text-zinc-600', dot: 'bg-zinc-400' }

function paletteFor(category: string | null) {
  if (!category) return UNCATEGORIZED
  let hash = 0
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) | 0
  return CATEGORY_PALETTE[Math.abs(hash) % CATEGORY_PALETTE.length]
}

export function SkillsSection() {
  const qc = useQueryClient()
  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: getSkills })
  const [formId, setFormId] = useState<string | 'new' | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['skills'] })

  const saveMutation = useMutation({
    mutationFn: () =>
      formId === 'new'
        ? createSkill({ name, category: category || null })
        : updateSkill(formId!, { name, category: category || null }),
    onSuccess: () => { invalidate(); setFormId(null) },
  })

  const deleteMutation = useMutation({ mutationFn: deleteSkill, onSuccess: invalidate })

  function openNew() { setName(''); setCategory(''); setFormId('new') }
  function openEdit(s: SkillDto) { setName(s.name); setCategory(s.category ?? ''); setFormId(s.id) }

  // Group by category, preserving server order within each group
  const grouped = new Map<string, SkillDto[]>()
  for (const s of skills) {
    const k = s.category ?? '__uncategorized'
    if (!grouped.has(k)) grouped.set(k, [])
    grouped.get(k)!.push(s)
  }
  // Surface real categories first, uncategorized last
  const groupKeys = [...grouped.keys()].sort((a, b) => {
    if (a === '__uncategorized') return 1
    if (b === '__uncategorized') return -1
    return a.localeCompare(b)
  })

  // Distinct categories (for editor datalist)
  const existingCategories = [...new Set(skills.map(s => s.category).filter(Boolean) as string[])].sort()

  return (
    <SectionCard
      icon={<Sparkles className="h-5 w-5" />}
      accentClass="bg-violet-50 text-violet-600 ring-violet-100"
      title="Skills"
      count={skills.length}
      onAdd={formId === null ? openNew : undefined}
      addLabel="+ Add skill"
    >
      {skills.length === 0 && formId === null && (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="No skills yet"
          hint="Add technologies, frameworks, and methodologies. Group them with a category (Frontend, Cloud, Methodology…) for visual grouping."
        />
      )}

      <div className="flex flex-col gap-4">
        {groupKeys.map(key => {
          const items = grouped.get(key)!
          const isUncat = key === '__uncategorized'
          const palette = isUncat ? UNCATEGORIZED : paletteFor(key)
          return (
            <div key={key}>
              <div className="mb-2 flex items-center gap-2">
                <FolderOpen className={`h-3.5 w-3.5 ${palette.text}`} />
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isUncat ? 'text-zinc-400' : palette.text}`}>
                  {isUncat ? 'Uncategorized' : key}
                </span>
                <span className="rounded-full bg-zinc-100 px-1.5 py-0 text-[10px] font-semibold text-zinc-500 tabular-nums">
                  {items.length}
                </span>
                <div className="h-px flex-1 bg-zinc-100" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map(s => {
                  if (formId === s.id) {
                    return (
                      <SkillForm
                        key={s.id}
                        name={name} setName={setName}
                        category={category} setCategory={setCategory}
                        categories={existingCategories}
                        onCancel={() => setFormId(null)}
                        onSubmit={() => saveMutation.mutate()}
                        isPending={saveMutation.isPending}
                      />
                    )
                  }
                  const p = paletteFor(s.category)
                  return (
                    <div
                      key={s.id}
                      className={`group inline-flex items-center gap-1.5 rounded-lg ${p.bg} px-2.5 py-1 ring-1 ${p.ring} transition hover:shadow-sm`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                      <span className={`text-xs font-semibold ${p.text}`}>
                        {/* keep "Name — Category" as single text node for findByText */}
                        {s.name}{s.category ? ` — ${s.category}` : ''}
                      </span>
                      <span className="ml-1 flex items-center gap-0 opacity-0 transition group-hover:opacity-100">
                        <IconButton onClick={() => openEdit(s)} label="Edit">
                          <Pencil className="h-3 w-3" />
                        </IconButton>
                        <IconButton onClick={() => deleteMutation.mutate(s.id)} label="Delete" tone="danger">
                          <Trash2 className="h-3 w-3" />
                        </IconButton>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {formId === 'new' && (
          <SkillForm
            name={name} setName={setName}
            category={category} setCategory={setCategory}
            categories={existingCategories}
            onCancel={() => setFormId(null)}
            onSubmit={() => saveMutation.mutate()}
            isPending={saveMutation.isPending}
          />
        )}
      </div>
    </SectionCard>
  )
}

function SkillForm({
  name, setName, category, setCategory, categories, onCancel, onSubmit, isPending,
}: {
  name: string; setName: (s: string) => void
  category: string; setCategory: (s: string) => void
  categories: string[]
  onCancel: () => void; onSubmit: () => void; isPending: boolean
}) {
  return (
    <form
      onSubmit={e => { e.preventDefault(); onSubmit() }}
      className="grid w-full grid-cols-1 gap-3 rounded-xl border-2 border-violet-200 bg-violet-50/30 p-3 sm:grid-cols-[1fr_1fr_auto]"
    >
      <div>
        <FieldLabel>Skill name</FieldLabel>
        <input
          id="skill-name"
          placeholder="Skill name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          required
          autoFocus
        />
      </div>
      <div>
        <FieldLabel>Category (optional)</FieldLabel>
        <input
          list="skill-categories"
          placeholder="Category (optional)"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
        <datalist id="skill-categories">
          {categories.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>
      <div className="flex items-end gap-1">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}
