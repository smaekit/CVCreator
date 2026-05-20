import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSkills, createSkill, updateSkill, deleteSkill, type SkillDto } from './collectionsApi'

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

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Skills</h2>
      <ul className="flex flex-col gap-1">
        {skills.map(s => (
          <li key={s.id} className="flex items-center gap-2">
            <span className="flex-1">{s.name}{s.category ? ` — ${s.category}` : ''}</span>
            <button type="button" onClick={() => openEdit(s)} className="text-sm text-blue-600">Edit</button>
            <button type="button" onClick={() => deleteMutation.mutate(s.id)} className="text-sm text-red-600">Delete</button>
          </li>
        ))}
      </ul>
      {formId !== null ? (
        <form onSubmit={e => { e.preventDefault(); saveMutation.mutate() }} className="flex flex-col gap-2 border rounded p-3">
          <input
            id="skill-name"
            placeholder="Skill name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border rounded p-2"
            required
          />
          <input
            placeholder="Category (optional)"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border rounded p-2"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 text-white rounded px-3 py-1 text-sm disabled:opacity-50">
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setFormId(null)} className="text-sm text-gray-600">Cancel</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={openNew} className="self-start text-sm text-blue-600">+ Add skill</button>
      )}
    </section>
  )
}
