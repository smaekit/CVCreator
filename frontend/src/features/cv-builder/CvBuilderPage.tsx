import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCv, updateSelections, type SelectionsBody } from './cvBuilderApi'
import {
  getAssignments, getSkills, getEducations, getCertifications, getLanguages,
} from '../profile/collectionsApi'
import { CVPreview } from '../cv-preview/CVPreview'

interface SelAssignment { id: string; isHighlighted: boolean }

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

  useEffect(() => {
    if (cv && !initialized) {
      setSelAssignments(cv.assignments.map(a => ({ id: a.id, isHighlighted: a.isHighlighted })))
      setSelSkillIds(cv.skills.map(s => s.id))
      setSelEducationIds(cv.educations.map(e => e.id))
      setSelCertIds(cv.certifications.map(c => c.id))
      setSelLanguageIds(cv.languages.map(l => l.id))
      setInitialized(true)
    }
  }, [cv, initialized])

  const saveMutation = useMutation({
    mutationFn: (body: SelectionsBody) => updateSelections(id!, body),
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
      assignments: assignments.map((a, i) => ({ id: a.id, displayOrder: i, isHighlighted: a.isHighlighted })),
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

  const highlightCount = selAssignments.filter(a => a.isHighlighted).length

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b px-4 py-2 flex items-center gap-4 shrink-0">
        <Link to="/" className="text-sm text-blue-600">← CVs</Link>
        <span className="font-medium">{cv?.firstName} {cv?.lastName} — {cv?.language}</span>
        {saveMutation.isPending && <span className="text-xs text-gray-400 ml-auto">Saving…</span>}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — selections */}
        <aside className="w-64 border-r overflow-y-auto p-4 flex flex-col gap-6 shrink-0">
          <section>
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-500">Assignments</h3>
            {allAssignments.length === 0 && <p className="text-xs text-gray-400">None</p>}
            {allAssignments.map(a => {
              const sel = selAssignments.find(s => s.id === a.id)
              const isSelected = !!sel
              const isHighlighted = sel?.isHighlighted ?? false
              const atLimit = highlightCount >= 2 && !isHighlighted
              return (
                <div key={a.id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    aria-label={`Select assignment ${a.titleSv || a.titleEn || 'Untitled'}`}
                    checked={isSelected}
                    onChange={() => toggleAssignment(a.id)}
                  />
                  <span className="flex-1 text-sm truncate">{a.titleSv || a.titleEn || 'Untitled'}</span>
                  {isSelected && (
                    <button
                      type="button"
                      aria-label={isHighlighted ? 'Remove highlight' : 'Highlight'}
                      disabled={atLimit}
                      onClick={() => toggleHighlight(a.id)}
                      className={`text-xs px-1 rounded transition-colors ${isHighlighted ? 'text-yellow-500' : 'text-gray-300'} disabled:opacity-30`}
                      title={atLimit ? 'Maximum 2 highlights' : 'Toggle highlight'}
                    >
                      ★
                    </button>
                  )}
                </div>
              )
            })}
          </section>

          <section>
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-500">Skills</h3>
            {allSkills.length === 0 && <p className="text-xs text-gray-400">None</p>}
            {allSkills.map(s => (
              <div key={s.id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  aria-label={`Select skill ${s.name}`}
                  checked={selSkillIds.includes(s.id)}
                  onChange={() => toggleSkill(s.id)}
                />
                <span className="text-sm">{s.name}</span>
              </div>
            ))}
          </section>

          <section>
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-500">Education</h3>
            {allEducations.length === 0 && <p className="text-xs text-gray-400">None</p>}
            {allEducations.map(e => (
              <div key={e.id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  aria-label={`Select education ${e.school}`}
                  checked={selEducationIds.includes(e.id)}
                  onChange={() => toggleEducation(e.id)}
                />
                <span className="text-sm">{e.school}</span>
              </div>
            ))}
          </section>

          <section>
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-500">Certifications</h3>
            {allCertifications.length === 0 && <p className="text-xs text-gray-400">None</p>}
            {allCertifications.map(c => (
              <div key={c.id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  aria-label={`Select certification ${c.nameSv || c.nameEn || ''}`}
                  checked={selCertIds.includes(c.id)}
                  onChange={() => toggleCertification(c.id)}
                />
                <span className="text-sm">{c.nameSv || c.nameEn || ''}</span>
              </div>
            ))}
          </section>

          <section>
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-500">Languages</h3>
            {allLanguages.length === 0 && <p className="text-xs text-gray-400">None</p>}
            {allLanguages.map(l => (
              <div key={l.id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  aria-label={`Select language ${l.name}`}
                  checked={selLanguageIds.includes(l.id)}
                  onChange={() => toggleLanguage(l.id)}
                />
                <span className="text-sm">{l.name}</span>
              </div>
            ))}
          </section>
        </aside>

        {/* Right panel — live preview */}
        <main className="flex-1 overflow-y-auto bg-gray-100 flex justify-center p-8">
          {cv ? <CVPreview cv={cv} /> : <div className="text-gray-400">Loading…</div>}
        </main>
      </div>
    </div>
  )
}
