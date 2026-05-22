import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GraduationCap, Calendar, Pencil, Trash2, Check, X, Building2, AlertCircle } from 'lucide-react'
import { BilingualFieldPair } from './BilingualFieldPair'
import { getEducations, createEducation, updateEducation, deleteEducation, type EducationDto } from './collectionsApi'
import { SectionCard, EmptyState, IconButton, FieldLabel } from './AssignmentsSection'

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
    <SectionCard
      icon={<GraduationCap className="h-5 w-5" />}
      accentClass="bg-amber-50 text-amber-600 ring-amber-100"
      title="Education"
      count={educations.length}
      onAdd={formId === null ? openNew : undefined}
      addLabel="+ Add education"
    >
      {educations.length === 0 && formId === null && (
        <EmptyState
          icon={<GraduationCap className="h-6 w-6" />}
          title="No education entries yet"
          hint="Degrees, bootcamps, courses. School name + years are all you need to get started."
        />
      )}

      <div className="flex flex-col gap-2">
        {educations.map(e => {
          if (formId === e.id) {
            return (
              <EducationForm
                key={e.id}
                degreeSv={degreeSv} degreeEn={degreeEn}
                setDegreeSv={setDegreeSv} setDegreeEn={setDegreeEn}
                school={school} setSchool={setSchool}
                startYear={startYear} setStartYear={setStartYear}
                endYear={endYear} setEndYear={setEndYear}
                onCancel={() => setFormId(null)}
                onSubmit={() => saveMutation.mutate()}
                isPending={saveMutation.isPending}
              />
            )
          }
          const hasSv = !!e.degreeSv
          const hasEn = !!e.degreeEn
          const ongoing = !e.endYear
          return (
            <article
              key={e.id}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-zinc-200 bg-white p-3 transition hover:border-amber-200 hover:shadow-[0_2px_8px_rgba(245,158,11,0.08)]"
            >
              {/* Year badge */}
              <div className="flex h-14 w-20 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/50 ring-1 ring-amber-200 tabular-nums">
                <span className="text-sm font-bold text-amber-900">{e.startYear}</span>
                <span className="text-[10px] font-medium text-amber-700">
                  {ongoing ? '— now' : `— ${e.endYear}`}
                </span>
              </div>

              {/* Body */}
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="truncate text-sm font-semibold text-zinc-900">
                    {/* Preserve "School (YYYY–YYYY|present)" text for tests */}
                    {e.school} ({e.startYear}{e.endYear ? `–${e.endYear}` : '–present'})
                  </h3>
                  {ongoing && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0 text-[10px] font-bold text-emerald-700">
                      ONGOING
                    </span>
                  )}
                </div>
                {/* Bilingual degree, both visible */}
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                  {e.degreeEn && (
                    <span className="text-zinc-700">
                      <span className="mr-1 text-[10px] font-bold text-zinc-400">EN</span>
                      {e.degreeEn}
                    </span>
                  )}
                  {e.degreeSv && (
                    <span className="text-zinc-700">
                      <span className="mr-1 text-[10px] font-bold text-zinc-400">SV</span>
                      <span className="italic">{e.degreeSv}</span>
                    </span>
                  )}
                  {(!hasSv || !hasEn) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700">
                      <AlertCircle className="h-2.5 w-2.5" />
                      Missing {!hasSv ? 'SV' : 'EN'} degree
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                <IconButton onClick={() => openEdit(e)} label="Edit">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </IconButton>
                <IconButton onClick={() => deleteMutation.mutate(e.id)} label="Delete" tone="danger">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </IconButton>
              </div>
            </article>
          )
        })}

        {formId === 'new' && (
          <EducationForm
            degreeSv={degreeSv} degreeEn={degreeEn}
            setDegreeSv={setDegreeSv} setDegreeEn={setDegreeEn}
            school={school} setSchool={setSchool}
            startYear={startYear} setStartYear={setStartYear}
            endYear={endYear} setEndYear={setEndYear}
            onCancel={() => setFormId(null)}
            onSubmit={() => saveMutation.mutate()}
            isPending={saveMutation.isPending}
          />
        )}
      </div>
    </SectionCard>
  )
}

function EducationForm(p: {
  degreeSv: string; degreeEn: string
  setDegreeSv: (s: string) => void; setDegreeEn: (s: string) => void
  school: string; setSchool: (s: string) => void
  startYear: string; setStartYear: (s: string) => void
  endYear: string; setEndYear: (s: string) => void
  onCancel: () => void; onSubmit: () => void; isPending: boolean
}) {
  return (
    <form
      onSubmit={e => { e.preventDefault(); p.onSubmit() }}
      className="flex flex-col gap-3 rounded-xl border-2 border-amber-200 bg-amber-50/30 p-4"
    >
      <BilingualFieldPair
        label="Degree"
        sv={p.degreeSv}
        en={p.degreeEn}
        onChange={(sv, en) => { p.setDegreeSv(sv); p.setDegreeEn(en) }}
      />
      <div>
        <FieldLabel icon={<Building2 className="h-3.5 w-3.5" />}>School</FieldLabel>
        <input
          id="edu-school"
          placeholder="School"
          value={p.school}
          onChange={e => p.setSchool(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel icon={<Calendar className="h-3.5 w-3.5" />}>Start year</FieldLabel>
          <input
            placeholder="Start year"
            type="number"
            value={p.startYear}
            onChange={e => p.setStartYear(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm tabular-nums focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            required
          />
        </div>
        <div>
          <FieldLabel icon={<Calendar className="h-3.5 w-3.5" />}>End year</FieldLabel>
          <input
            placeholder="End year"
            type="number"
            value={p.endYear}
            onChange={e => p.setEndYear(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm tabular-nums focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
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
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
    </form>
  )
}
