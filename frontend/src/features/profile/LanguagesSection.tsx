import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Languages, Pencil, Trash2, Check, X } from 'lucide-react'
import { getLanguages, createLanguage, updateLanguage, deleteLanguage, type LanguageDto } from './collectionsApi'
import { SectionCard, EmptyState, IconButton, FieldLabel } from './AssignmentsSection'

const PROFICIENCIES = ['Native', 'Fluent', 'Professional', 'Basic']

// Visual level: 4=Native, 3=Fluent, 2=Professional, 1=Basic
const LEVEL: Record<string, number> = { Native: 4, Fluent: 3, Professional: 2, Basic: 1 }

const PROFICIENCY_TONE: Record<string, { bar: string; chip: string }> = {
  Native:       { bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  Fluent:       { bar: 'bg-sky-500',     chip: 'bg-sky-50 text-sky-700 ring-sky-200' },
  Professional: { bar: 'bg-violet-500',  chip: 'bg-violet-50 text-violet-700 ring-violet-200' },
  Basic:        { bar: 'bg-zinc-400',    chip: 'bg-zinc-100 text-zinc-600 ring-zinc-200' },
}

export function LanguagesSection() {
  const qc = useQueryClient()
  const { data: languages = [] } = useQuery({ queryKey: ['languages'], queryFn: getLanguages })
  const [formId, setFormId] = useState<string | 'new' | null>(null)
  const [name, setName] = useState('')
  const [proficiency, setProficiency] = useState('Fluent')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['languages'] })

  const saveMutation = useMutation({
    mutationFn: () =>
      formId === 'new'
        ? createLanguage({ name, proficiency })
        : updateLanguage(formId!, { name, proficiency }),
    onSuccess: () => { invalidate(); setFormId(null) },
  })

  const deleteMutation = useMutation({ mutationFn: deleteLanguage, onSuccess: invalidate })

  function openNew() { setName(''); setProficiency('Fluent'); setFormId('new') }
  function openEdit(l: LanguageDto) { setName(l.name); setProficiency(l.proficiency); setFormId(l.id) }

  return (
    <SectionCard
      icon={<Languages className="h-5 w-5" />}
      accentClass="bg-sky-50 text-sky-600 ring-sky-100"
      title="Languages"
      count={languages.length}
      onAdd={formId === null ? openNew : undefined}
      addLabel="+ Add language"
    >
      {languages.length === 0 && formId === null && (
        <EmptyState
          icon={<Languages className="h-6 w-6" />}
          title="No languages yet"
          hint="Spoken languages and proficiency. International clients always check this section."
        />
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {languages.map(l => {
          if (formId === l.id) {
            return (
              <div key={l.id} className="sm:col-span-2">
                <LanguageForm
                  name={name} setName={setName}
                  proficiency={proficiency} setProficiency={setProficiency}
                  onCancel={() => setFormId(null)}
                  onSubmit={() => saveMutation.mutate()}
                  isPending={saveMutation.isPending}
                />
              </div>
            )
          }
          const level = LEVEL[l.proficiency] ?? 0
          const tone = PROFICIENCY_TONE[l.proficiency] ?? PROFICIENCY_TONE.Basic
          return (
            <article
              key={l.id}
              className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition hover:border-sky-200 hover:shadow-[0_2px_8px_rgba(14,165,233,0.08)]"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700 ring-1 ring-sky-100 text-sm font-bold uppercase tabular-nums">
                {l.name.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                {/* Test asserts `Swedish — Native` — keep single text node */}
                <p className="text-sm font-semibold text-zinc-900 leading-tight">
                  {l.name} — {l.proficiency}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  {/* Proficiency bar — 4 segments */}
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3].map(i => (
                      <span
                        key={i}
                        className={
                          i < level
                            ? `h-1.5 w-5 rounded-full ${tone.bar}`
                            : 'h-1.5 w-5 rounded-full bg-zinc-200'
                        }
                      />
                    ))}
                  </div>
                  <span className={`rounded-md px-1.5 py-0 text-[10px] font-bold ring-1 ${tone.chip}`}>
                    {l.proficiency}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                <IconButton onClick={() => openEdit(l)} label="Edit">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </IconButton>
                <IconButton onClick={() => deleteMutation.mutate(l.id)} label="Delete" tone="danger">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </IconButton>
              </div>
            </article>
          )
        })}
      </div>

      {formId === 'new' && (
        <div className="mt-3">
          <LanguageForm
            name={name} setName={setName}
            proficiency={proficiency} setProficiency={setProficiency}
            onCancel={() => setFormId(null)}
            onSubmit={() => saveMutation.mutate()}
            isPending={saveMutation.isPending}
          />
        </div>
      )}
    </SectionCard>
  )
}

function LanguageForm(p: {
  name: string; setName: (s: string) => void
  proficiency: string; setProficiency: (s: string) => void
  onCancel: () => void; onSubmit: () => void; isPending: boolean
}) {
  return (
    <form
      onSubmit={e => { e.preventDefault(); p.onSubmit() }}
      className="grid grid-cols-1 gap-3 rounded-xl border-2 border-sky-200 bg-sky-50/30 p-4 sm:grid-cols-[1fr_180px_auto]"
    >
      <div>
        <FieldLabel>Language</FieldLabel>
        <input
          id="lang-name"
          placeholder="Language"
          value={p.name}
          onChange={e => p.setName(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          required
          autoFocus
        />
      </div>
      <div>
        <FieldLabel>Proficiency</FieldLabel>
        <select
          value={p.proficiency}
          onChange={e => p.setProficiency(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
        >
          {PROFICIENCIES.map(pr => <option key={pr} value={pr}>{pr}</option>)}
        </select>
      </div>
      <div className="flex items-end gap-1">
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
          aria-label="Cancel"
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}
