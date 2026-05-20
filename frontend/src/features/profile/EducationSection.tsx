import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BilingualFieldPair } from './BilingualFieldPair'
import { getEducations, createEducation, updateEducation, deleteEducation, type EducationDto } from './collectionsApi'

export function EducationSection() {
  const qc = useQueryClient()
  const { data: educations = [] } = useQuery({ queryKey: ['educations'], queryFn: getEducations })
  const [formId, setFormId] = useState<string | 'new' | null>(null)
  const [degreeSv, setDegreeSv] = useState('')
  const [degreeEn, setDegreeEn] = useState('')
  const [school, setSchool] = useState('')
  const [startYear, setStartYear] = useState('')
  const [endYear, setEndYear] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['educations'] })

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = {
        degreeSv: degreeSv || null, degreeEn: degreeEn || null,
        school, startYear: parseInt(startYear), endYear: endYear ? parseInt(endYear) : null,
      }
      return formId === 'new' ? createEducation(data) : updateEducation(formId!, data)
    },
    onSuccess: () => { invalidate(); setFormId(null) },
  })

  const deleteMutation = useMutation({ mutationFn: deleteEducation, onSuccess: invalidate })

  function openNew() {
    setDegreeSv(''); setDegreeEn(''); setSchool(''); setStartYear(''); setEndYear('')
    setFormId('new')
  }
  function openEdit(e: EducationDto) {
    setDegreeSv(e.degreeSv ?? ''); setDegreeEn(e.degreeEn ?? '')
    setSchool(e.school); setStartYear(String(e.startYear)); setEndYear(e.endYear ? String(e.endYear) : '')
    setFormId(e.id)
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Education</h2>
      <ul className="flex flex-col gap-1">
        {educations.map(e => (
          <li key={e.id} className="flex items-center gap-2">
            <span className="flex-1">{e.school} ({e.startYear}{e.endYear ? `–${e.endYear}` : '–present'})</span>
            <button type="button" onClick={() => openEdit(e)} className="text-sm text-blue-600">Edit</button>
            <button type="button" onClick={() => deleteMutation.mutate(e.id)} className="text-sm text-red-600">Delete</button>
          </li>
        ))}
      </ul>
      {formId !== null ? (
        <form onSubmit={e => { e.preventDefault(); saveMutation.mutate() }} className="flex flex-col gap-2 border rounded p-3">
          <BilingualFieldPair
            label="Degree"
            sv={degreeSv}
            en={degreeEn}
            onChange={(sv, en) => { setDegreeSv(sv); setDegreeEn(en) }}
          />
          <input
            id="edu-school"
            placeholder="School"
            value={school}
            onChange={e => setSchool(e.target.value)}
            className="border rounded p-2"
            required
          />
          <div className="flex gap-2">
            <input
              placeholder="Start year"
              type="number"
              value={startYear}
              onChange={e => setStartYear(e.target.value)}
              className="border rounded p-2 w-28"
              required
            />
            <input
              placeholder="End year"
              type="number"
              value={endYear}
              onChange={e => setEndYear(e.target.value)}
              className="border rounded p-2 w-28"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 text-white rounded px-3 py-1 text-sm disabled:opacity-50">
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setFormId(null)} className="text-sm text-gray-600">Cancel</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={openNew} className="self-start text-sm text-blue-600">+ Add education</button>
      )}
    </section>
  )
}
