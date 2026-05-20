import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLanguages, createLanguage, updateLanguage, deleteLanguage, type LanguageDto } from './collectionsApi'

const PROFICIENCIES = ['Native', 'Fluent', 'Professional', 'Basic']

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
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Languages</h2>
      <ul className="flex flex-col gap-1">
        {languages.map(l => (
          <li key={l.id} className="flex items-center gap-2">
            <span className="flex-1">{l.name} — {l.proficiency}</span>
            <button type="button" onClick={() => openEdit(l)} className="text-sm text-blue-600">Edit</button>
            <button type="button" onClick={() => deleteMutation.mutate(l.id)} className="text-sm text-red-600">Delete</button>
          </li>
        ))}
      </ul>
      {formId !== null ? (
        <form onSubmit={e => { e.preventDefault(); saveMutation.mutate() }} className="flex flex-col gap-2 border rounded p-3">
          <input
            id="lang-name"
            placeholder="Language"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border rounded p-2"
            required
          />
          <select
            value={proficiency}
            onChange={e => setProficiency(e.target.value)}
            className="border rounded p-2"
          >
            {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 text-white rounded px-3 py-1 text-sm disabled:opacity-50">
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setFormId(null)} className="text-sm text-gray-600">Cancel</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={openNew} className="self-start text-sm text-blue-600">+ Add language</button>
      )}
    </section>
  )
}
