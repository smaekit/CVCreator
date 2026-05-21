import { useRef, useLayoutEffect, useState } from 'react'
import type { ResolvedCv } from '../cv-builder/cvBuilderApi'

const A4_W = 794
const A4_H = 1123
const SIDEBAR_W = 220
const HEADER_H = 96
const CV_FONT = "'Calibri', 'Gill Sans MT', 'Trebuchet MS', sans-serif"
const ACCENT = '#B5213F'
const WINE = '#701131'
const CREAM = '#EFE6DD'

interface Props { cv: ResolvedCv; showBoundary?: boolean }

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseBullets(text: string): { bullets: string[]; isBulleted: boolean } {
  const lines = text.split('\n').filter(l => l.trim())
  const hasBullets = lines.some(l => /^[•\-]\s/.test(l.trim()))
  if (!hasBullets) return { bullets: [], isBulleted: false }
  return { bullets: lines.map(l => l.replace(/^[•\-]\s*/, '').trim()).filter(Boolean), isBulleted: true }
}

function Description({
  text, fallbackUsed, isOverridden,
}: { text: string; fallbackUsed: boolean; isOverridden: boolean }) {
  const isYellow = fallbackUsed && !isOverridden
  const { bullets, isBulleted } = parseBullets(text)
  if (isBulleted) {
    return (
      <ul
        className={`list-disc list-inside space-y-0.5 ${isYellow ? 'bg-yellow-100' : ''}`}
        style={{ fontSize: 10, color: '#2A2A2A', lineHeight: 1.65 }}
      >
        {bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    )
  }
  return (
    <p
      className={`whitespace-pre-wrap ${isYellow ? 'bg-yellow-100' : ''}`}
      style={{ fontSize: 10, color: '#2A2A2A', lineHeight: 1.65 }}
    >
      {text}
    </p>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 8.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: ACCENT, whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: ACCENT, opacity: 0.25 }} />
    </div>
  )
}

function AvatarPlaceholder() {
  return (
    <div style={{ width: 160, height: 160, borderRadius: '50%', background: '#5C1028', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="72" height="72" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="44" cy="32" r="20" fill="#C4A8B2" fillOpacity="0.45" />
        <ellipse cx="44" cy="78" rx="32" ry="22" fill="#C4A8B2" fillOpacity="0.35" />
      </svg>
    </div>
  )
}

// ── Full-width cream header ────────────────────────────────────────────────────

function CvHeader() {
  return (
    <div style={{ width: A4_W, height: HEADER_H, background: CREAM, flexShrink: 0 }} />
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function CvSidebar({ cv }: { cv: ResolvedCv }) {
  const hasGroups = (cv.frontPageGroups?.length ?? 0) > 0
  return (
    <div style={{ width: SIDEBAR_W, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      {/* White picture container */}
      <div style={{ background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '22px 0 18px', flexShrink: 0 }}>
        {cv.pictureUrl
          ? (
            <img
              src={cv.pictureUrl}
              alt=""
              style={{ width: 156, height: 156, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', flexShrink: 0 }}
            />
          )
          : <AvatarPlaceholder />
        }
      </div>
      {/* Wine skills/groups container — with subtle dark overlay for depth */}
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: WINE }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,0,5,0.22)' }} />
        <div style={{ position: 'relative', padding: '18px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {hasGroups
            ? (cv.frontPageGroups ?? []).map(group => (
              <div key={group.id}>
                <p style={{ fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#E8A98A', marginBottom: 7 }}>
                  {group.header}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {group.items.map(item => (
                    <li key={item.id} style={{ fontSize: 9.5, color: '#DDD5CF', lineHeight: 1.55 }}>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))
            : cv.skills.length > 0 && (
              <div>
                <p style={{ fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#E8A98A', marginBottom: 7 }}>
                  Skills
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {cv.skills.map(s => (
                    <li key={s.id} style={{ fontSize: 9.5, color: '#DDD5CF', lineHeight: 1.55 }}>
                      {s.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

// ── Front page body ────────────────────────────────────────────────────────────

function FrontPageBody({ cv }: { cv: ResolvedCv }) {
  const highlighted = cv.assignments.filter(a => a.isHighlighted)
  const jobTitle = cv.assignments.find(a => a.isHighlighted)?.title.text ?? ''

  return (
    <div style={{ flex: 1, background: 'white', padding: '26px 32px 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Name + title */}
      <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.01em', color: '#1A1A1A', lineHeight: 1.1, margin: '0 0 4px' }}>
        {cv.firstName} {cv.lastName}
      </h1>
      {jobTitle && (
        <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT, margin: '0 0 13px', letterSpacing: '0.01em' }}>
          {jobTitle}
        </p>
      )}

      {/* Introduction */}
      {cv.introduction.text && (
        <p
          className={cv.introduction.fallbackUsed && !cv.isIntroductionOverridden ? 'bg-yellow-100' : ''}
          style={{ fontSize: 9.5, lineHeight: 1.65, color: '#3A3A3A', margin: '0 0 16px' }}
        >
          {cv.introduction.text}
        </p>
      )}

      {/* Separator */}
      <div style={{ height: 1, background: '#C8C0BB', marginBottom: 14 }} />

      {/* Highlighted Projects */}
      {highlighted.length > 0 && (
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: '0 0 14px', letterSpacing: '-0.01em' }}>
            Highlighted Projects
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {highlighted.map(a => (
              <div key={a.id}>
                <h3
                  className={a.title.fallbackUsed ? 'bg-yellow-100' : ''}
                  style={{ fontSize: 11, fontWeight: 700, color: '#1A1A1A', margin: '0 0 1px' }}
                >
                  {a.title.text}
                </h3>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#7A7370', marginTop: 0, marginBottom: 5 }}>
                  {a.client}{a.startDate && ` ${a.startDate}${a.endDate ? ` – ${a.endDate}` : ' – present'}`}
                </p>
                {a.description.text && (
                  <Description text={a.description.text} fallbackUsed={a.description.fallbackUsed} isOverridden={a.isDescriptionOverridden} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Content pages body (white) ─────────────────────────────────────────────────

function ContentPagesBody({ cv }: { cv: ResolvedCv }) {
  const regular = cv.assignments.filter(a => !a.isHighlighted)
  const highlighted = cv.assignments.filter(a => a.isHighlighted)
  const hasGroups = (cv.frontPageGroups?.length ?? 0) > 0

  return (
    <div style={{ width: A4_W, background: 'white', padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Regular assignments */}
      {regular.length > 0 && (
        <section>
          <SectionDivider label={highlighted.length > 0 ? 'Other Assignments' : 'Projects and Assignments'} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {regular.map(a => (
              <div key={a.id}>
                <h3
                  className={a.title.fallbackUsed ? 'bg-yellow-100' : ''}
                  style={{ fontSize: 10.5, fontWeight: 700, color: ACCENT, margin: 0 }}
                >
                  {a.title.text}
                </h3>
                <p style={{ fontSize: 9, color: '#666', marginTop: 2, marginBottom: 1 }}>
                  {a.client}
                </p>
                {a.startDate && (
                  <p style={{ fontSize: 8.5, color: '#9A9A9A', margin: '0 0 5px' }}>
                    {a.startDate}{a.endDate ? ` – ${a.endDate}` : ' – present'}
                  </p>
                )}
                {a.description.text && (
                  <Description text={a.description.text} fallbackUsed={a.description.fallbackUsed} isOverridden={a.isDescriptionOverridden} />
                )}
                {(a.skills?.length ?? 0) > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {(a.skills ?? []).map(skill => (
                      <span
                        key={skill}
                        style={{
                          fontSize: 7.5,
                          border: `0.75px solid ${ACCENT}`,
                          color: ACCENT,
                          borderRadius: 9999,
                          padding: '1px 7px',
                          lineHeight: 1.7,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills — shown in content body only when sidebar has front page groups */}
      {hasGroups && cv.skills.length > 0 && (
        <section>
          <SectionDivider label="Skills" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {cv.skills.map(s => (
              <span
                key={s.id}
                style={{ fontSize: 9, border: `0.75px solid ${ACCENT}`, color: ACCENT, borderRadius: 9999, padding: '2px 9px' }}
              >
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Education — zebra table */}
      {cv.educations.length > 0 && (
        <section>
          <SectionDivider label="Education" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {cv.educations.map((e, i) => (
                <tr key={e.id} style={{ background: i % 2 === 0 ? 'white' : '#F5F0EB' }}>
                  <td style={{ padding: '5px 10px', fontSize: 10, color: '#1C1C1C', fontWeight: 500 }}>
                    <span className={e.degree.fallbackUsed ? 'bg-yellow-100' : ''}>
                      {e.degree.text || e.school}
                    </span>
                  </td>
                  <td style={{ padding: '5px 10px', fontSize: 9.5, color: '#666', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {e.school} · {e.startYear}{e.endYear ? `–${e.endYear}` : '–present'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Certifications — zebra table */}
      {cv.certifications.length > 0 && (
        <section>
          <SectionDivider label="Certifications" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {cv.certifications.map((c, i) => (
                <tr key={c.id} style={{ background: i % 2 === 0 ? 'white' : '#F5F0EB' }}>
                  <td style={{ padding: '5px 10px', fontSize: 10, color: '#1C1C1C', fontWeight: 500 }}>
                    <span className={c.name.fallbackUsed ? 'bg-yellow-100' : ''}>{c.name.text}</span>
                  </td>
                  <td style={{ padding: '5px 10px', fontSize: 9.5, color: '#666', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {c.year}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Languages */}
      {cv.languages.length > 0 && (
        <section>
          <SectionDivider label="Languages" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cv.languages.map(l => (
              <p key={l.id} style={{ fontSize: 10, color: '#1C1C1C', margin: 0 }}>
                {l.name} — {l.proficiency}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Full content (measurement + render) ───────────────────────────────────────

function CvContent({ cv }: { cv: ResolvedCv }) {
  return (
    <>
      {/* Front page — fixed A4 height */}
      <div style={{ width: A4_W, height: A4_H, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
        <CvHeader />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <CvSidebar cv={cv} />
          <FrontPageBody cv={cv} />
        </div>
      </div>
      {/* Content pages — natural height, white background */}
      <ContentPagesBody cv={cv} />
    </>
  )
}

// ── CVPreview ──────────────────────────────────────────────────────────────────

export function CVPreview({ cv, showBoundary = false }: Props) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [totalHeight, setTotalHeight] = useState(A4_H)

  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return
    const measure = () => setTotalHeight(Math.max(el.scrollHeight, A4_H))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cv])

  // ── PDF / Puppeteer mode — single continuous render ──
  if (!showBoundary) {
    return (
      <div ref={measureRef} style={{ width: A4_W, minHeight: A4_H, fontFamily: CV_FONT }}>
        <CvContent cv={cv} />
      </div>
    )
  }

  // ── Builder / preview mode — clip windows ──
  const pageCount = Math.max(1, Math.ceil(totalHeight / A4_H))

  return (
    <div className="flex flex-col items-center gap-8 py-2">
      {/* Hidden off-screen measurement render */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: A4_W,
          opacity: 0,
          pointerEvents: 'none',
          fontFamily: CV_FONT,
        }}
      >
        <CvContent cv={cv} />
      </div>

      {/* One clipping window per A4 page */}
      {Array.from({ length: pageCount }, (_, pageIdx) => (
        <div key={pageIdx} className="flex flex-col items-end gap-1 w-[794px]">
          {pageCount > 1 && (
            <span className="text-[10px] text-gray-400 font-medium tracking-wide">
              Page {pageIdx + 1} of {pageCount}
            </span>
          )}

          <div
            className="relative shadow-[0_4px_24px_rgba(0,0,0,0.12)] overflow-hidden"
            style={{ width: A4_W, height: A4_H }}
          >
            {/* Full content shifted so this page's slice is visible */}
            <div
              style={{
                position: 'absolute',
                top: -pageIdx * A4_H,
                left: 0,
                width: A4_W,
                fontFamily: CV_FONT,
              }}
            >
              <CvContent cv={cv} />
            </div>

            {/* Per-page footer pinned to bottom of clip window */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: pageIdx === 0 ? SIDEBAR_W : 0,
                right: 0,
                padding: '10px 28px',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 8, color: '#AAA' }}>{pageIdx + 1} / {pageCount}</span>
              <span style={{ fontSize: 8, color: '#AAA' }}>{cv.firstName} {cv.lastName}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
