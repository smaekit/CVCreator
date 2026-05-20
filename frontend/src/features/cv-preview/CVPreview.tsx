import type { ResolvedCv } from '../cv-builder/cvBuilderApi'

interface Props { cv: ResolvedCv }

export function CVPreview({ cv }: Props) {
  const highlighted = cv.assignments.filter(a => a.isHighlighted)
  const regular = cv.assignments.filter(a => !a.isHighlighted)

  return (
    <div className="bg-white shadow-lg w-[794px] min-h-[1123px] p-16 flex flex-col gap-8 text-sm">
      {/* Header */}
      <header className="flex items-start gap-6">
        {cv.pictureUrl && (
          <img src={cv.pictureUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
        )}
        <div>
          <h1 className="text-3xl font-bold">{cv.firstName} {cv.lastName}</h1>
          {cv.yearsOfExperience && (
            <p className="text-gray-500 mt-1">{cv.yearsOfExperience} years of experience</p>
          )}
        </div>
      </header>

      {/* Introduction */}
      {cv.introduction.text && (
        <section>
          <p className="text-gray-700 leading-relaxed">{cv.introduction.text}</p>
        </section>
      )}

      {/* Highlighted assignments (condensed, no skill tags) */}
      {highlighted.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">Key Assignments</h2>
          <div className="grid grid-cols-2 gap-4">
            {highlighted.map(a => (
              <div key={a.id} className="flex flex-col gap-1">
                <p className="font-medium">{a.title.text}</p>
                <p className="text-gray-500">{a.client} · {a.startDate}{a.endDate ? `–${a.endDate}` : '–present'}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Regular assignments */}
      {regular.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">Assignments</h2>
          <div className="flex flex-col gap-4">
            {regular.map(a => (
              <div key={a.id}>
                <div className="flex items-baseline justify-between">
                  <p className="font-medium">{a.title.text}</p>
                  <p className="text-gray-500 text-xs">{a.startDate}{a.endDate ? `–${a.endDate}` : '–present'}</p>
                </div>
                <p className="text-gray-500">{a.client}</p>
                {a.description.text && <p className="mt-1 text-gray-700">{a.description.text}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {cv.skills.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {cv.skills.map(s => (
              <span key={s.id} className="bg-gray-100 rounded px-2 py-0.5">
                {s.name}{s.category ? ` (${s.category})` : ''}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {cv.educations.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">Education</h2>
          <div className="flex flex-col gap-2">
            {cv.educations.map(e => (
              <div key={e.id}>
                <p className="font-medium">{e.degree.text || e.school}</p>
                <p className="text-gray-500">{e.school} · {e.startYear}{e.endYear ? `–${e.endYear}` : '–present'}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {cv.certifications.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">Certifications</h2>
          <div className="flex flex-col gap-1">
            {cv.certifications.map(c => (
              <p key={c.id}>{c.name.text} ({c.year})</p>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {cv.languages.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">Languages</h2>
          <div className="flex flex-col gap-1">
            {cv.languages.map(l => (
              <p key={l.id}>{l.name} — {l.proficiency}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
