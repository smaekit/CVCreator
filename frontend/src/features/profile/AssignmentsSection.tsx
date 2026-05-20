import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BilingualFieldPair } from './BilingualFieldPair'
import {
  getAssignments, createAssignment, updateAssignment, deleteAssignment,
  attachAssignmentSkill, detachAssignmentSkill, getSkills,
  type AssignmentDto,
} from './collectionsApi'

export function AssignmentsSection() {
  const qc = useQueryClient()
  const { data: assignments = [] } = useQuery({ queryKey: ['assignments'], queryFn: getAssignments })
  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: getSkills })

  const [formId, setFormId] = useState<string | 'new' | null>(null)
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

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Assignments</h2>
      <ul className="flex flex-col gap-1">
        {assignments.map(a => (
          <li key={a.id} className="flex items-center gap-2">
            <span className="flex-1">
              {a.titleSv || a.titleEn || 'Untitled'} — {a.client} ({a.startDate}–{a.endDate ?? 'present'})
            </span>
            <button type="button" onClick={() => openEdit(a)} className="text-sm text-blue-600">Edit</button>
            <button type="button" onClick={() => handleDelete(a.id)} className="text-sm text-red-600">Delete</button>
          </li>
        ))}
      </ul>
      {formId !== null ? (
        <form
          onSubmit={e => { e.preventDefault(); saveMutation.mutate() }}
          className="flex flex-col gap-2 border rounded p-3"
        >
          <BilingualFieldPair
            label="Title"
            sv={titleSv}
            en={titleEn}
            onChange={(sv, en) => { setTitleSv(sv); setTitleEn(en) }}
          />
          <BilingualFieldPair
            label="Description"
            sv={descriptionSv}
            en={descriptionEn}
            onChange={(sv, en) => { setDescriptionSv(sv); setDescriptionEn(en) }}
          />
          <input
            placeholder="Client"
            value={client}
            onChange={e => setClient(e.target.value)}
            className="border rounded p-2"
            required
          />
          <div className="flex gap-2">
            <input
              type="date"
              aria-label="Start date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border rounded p-2"
              required
            />
            <input
              type="date"
              aria-label="End date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border rounded p-2"
            />
          </div>
          {skills.length > 0 && (
            <fieldset className="flex flex-col gap-1">
              <legend className="text-sm font-medium">Skills</legend>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <label key={s.id} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSkillIds.includes(s.id)}
                      onChange={() => toggleSkill(s.id)}
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-blue-600 text-white rounded px-3 py-1 text-sm disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setFormId(null)} className="text-sm text-gray-600">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={openNew} className="self-start text-sm text-blue-600">
          + Add assignment
        </button>
      )}
    </section>
  )
}
