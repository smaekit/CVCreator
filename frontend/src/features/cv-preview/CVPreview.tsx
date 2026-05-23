import { createContext, useContext, useEffect, useRef, useLayoutEffect, useState } from 'react'
import type { ResolvedCv } from '../cv-builder/cvBuilderApi'
import { DEFAULT_THEME, type CvTheme } from './cvThemes'

const A4_W = 794
const A4_H = 1123
const SIDEBAR_W = 232
const HEADER_H = 110
const PAGE_TOP_MARGIN = 36
const FOOTER_H = 32

interface Props { cv: ResolvedCv; showBoundary?: boolean; theme?: CvTheme }

const ThemeCtx = createContext<CvTheme>(DEFAULT_THEME)
const useTheme = () => useContext(ThemeCtx)

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
  const t = useTheme()
  const isYellow = fallbackUsed && !isOverridden
  const { bullets, isBulleted } = parseBullets(text)
  const textStyle: React.CSSProperties = { fontSize: 12, color: t.bodyColor, lineHeight: 1.7 }
  if (isBulleted) {
    return (
      <ul
        className={`list-disc list-inside space-y-1 ${isYellow ? 'bg-yellow-100' : ''}`}
        style={textStyle}
      >
        {bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    )
  }
  return (
    <p
      className={`whitespace-pre-wrap ${isYellow ? 'bg-yellow-100' : ''}`}
      style={textStyle}
    >
      {text}
    </p>
  )
}

function SectionDivider({ label }: { label: string }) {
  const t = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{
        fontSize: 10.5,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.24em',
        color: t.sectionLabelColor,
        whiteSpace: 'nowrap',
        fontFamily: t.displayFont,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: t.sectionLabelColor, opacity: t.sectionLineOpacity }} />
    </div>
  )
}

function AvatarPlaceholder() {
  const t = useTheme()
  return (
    <div style={{ width: 196, height: 196, borderRadius: '50%', background: t.sidebarAvatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="80" height="80" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="44" cy="32" r="20" fill="#C4A8B2" fillOpacity="0.45" />
        <ellipse cx="44" cy="78" rx="32" ry="22" fill="#C4A8B2" fillOpacity="0.35" />
      </svg>
    </div>
  )
}

// ── Full-width cream header ────────────────────────────────────────────────────

function CvHeader() {
  const t = useTheme()
  return (
    <div style={{ width: A4_W, height: HEADER_H, background: t.headerBg, flexShrink: 0 }} />
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function CvSidebar({ cv }: { cv: ResolvedCv }) {
  const t = useTheme()
  const hasGroups = (cv.frontPageGroups?.length ?? 0) > 0
  return (
    <div style={{ width: SIDEBAR_W, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Picture container */}
      <div style={{ background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0px 5px', flexShrink: 0 }}>
        {cv.pictureUrl
          ? (
            <img
              src={cv.pictureUrl}
              alt=""
              style={{ width: 250, height: 250, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
            />
          )
          : <AvatarPlaceholder />
        }
      </div>
      {/* Sidebar body */}
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: t.sidebarBg }} />
        <div style={{ position: 'absolute', inset: 0, background: t.sidebarOverlay }} />
        <div style={{ position: 'relative', padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {hasGroups
            ? (cv.frontPageGroups ?? []).map(group => (
              <div key={group.id}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: t.sidebarGroupLabel, marginBottom: 8, fontFamily: t.displayFont }}>
                  {group.header}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {group.items.map(item => (
                    <li key={item.id} style={{ fontSize: 12, fontWeight: 500, color: t.sidebarItemColor, lineHeight: 1.4, fontFamily: t.bodyFont }}>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))
            : cv.skills.length > 0 && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: t.sidebarGroupLabel, marginBottom: 9, fontFamily: t.displayFont }}>
                  Skills
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {cv.skills.map(s => (
                    <li key={s.id} style={{ fontSize: 12.5, fontWeight: 600, color: t.sidebarItemColor, lineHeight: 1.35, fontFamily: t.bodyFont }}>
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
  const t = useTheme()
  const highlighted = cv.assignments.filter(a => a.isHighlighted)
  const jobTitle = cv.assignments.find(a => a.isHighlighted)?.title.text ?? ''

  return (
    <div style={{ flex: 1, background: 'white', padding: '34px 44px 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Name */}
      <h1 style={{ fontSize: 46, fontWeight: 700, letterSpacing: '-0.03em', color: t.nameColor, lineHeight: 1.02, margin: '0 0 8px', fontFamily: t.displayFont }}>
        {cv.firstName} {cv.lastName}
      </h1>

      {/* Job title */}
      {jobTitle && (
        <p style={{ fontSize: 14, fontWeight: 700, color: t.jobTitleColor, margin: '0 0 20px', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: t.bodyFont }}>
          {jobTitle}
        </p>
      )}

      {/* Introduction */}
      {cv.introduction.text && (
        <p
          className={cv.introduction.fallbackUsed && !cv.isIntroductionOverridden ? 'bg-yellow-100' : ''}
          style={{ fontSize: 13, lineHeight: 1.75, color: t.bodyColor, margin: '0 0 20px', fontFamily: t.bodyFont }}
        >
          {cv.introduction.text}
        </p>
      )}

      {/* Separator */}
      <div style={{ height: 1, background: t.dividerColor, marginBottom: 20 }} />

      {/* Highlighted Projects */}
      {highlighted.length > 0 && (
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: t.nameColor, margin: '0 0 18px', letterSpacing: '-0.015em', fontFamily: t.displayFont }}>
            Highlighted Projects
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {highlighted.map(a => (
              <div key={a.id}>
                <h3
                  className={a.title.fallbackUsed ? 'bg-yellow-100' : ''}
                  style={{ fontSize: 14, fontWeight: 700, color: t.nameColor, margin: '0 0 3px', fontFamily: t.displayFont }}
                >
                  {a.title.text}
                </h3>
                <p style={{ fontSize: 11, fontWeight: 700, color: t.subtitleColor, marginTop: 0, marginBottom: 8, fontFamily: t.bodyFont }}>
                  {a.client}{a.startDate && ` · ${a.startDate}${a.endDate ? ` – ${a.endDate}` : ' – present'}`}
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

function ContentPagesBody({ cv, breakOffsets }: { cv: ResolvedCv; breakOffsets?: Record<string, number> }) {
  const t = useTheme()
  const regular = cv.assignments.filter(a => !a.isHighlighted)
  const highlighted = cv.assignments.filter(a => a.isHighlighted)
  const hasGroups = (cv.frontPageGroups?.length ?? 0) > 0
  const offset = (k: string) => (breakOffsets?.[k] ? { marginTop: breakOffsets[k] } : null)

  return (
    <div style={{ width: A4_W, background: 'white', padding: '44px 52px', display: 'flex', flexDirection: 'column', gap: 32, fontFamily: t.bodyFont }}>

      {/* Regular assignments */}
      {regular.length > 0 && (
        <section>
          <SectionDivider label={highlighted.length > 0 ? 'Other Assignments' : 'Projects and Assignments'} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {regular.map(a => (
              <div
                key={a.id}
                data-cv-break-avoid={`assignment-${a.id}`}
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid', ...offset(`assignment-${a.id}`) }}
              >
                <h3
                  className={a.title.fallbackUsed ? 'bg-yellow-100' : ''}
                  style={{ fontSize: 13, fontWeight: 700, color: t.accent, margin: 0, fontFamily: t.displayFont }}
                >
                  {a.title.text}
                </h3>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: t.subtitleColor, marginTop: 3, marginBottom: 1 }}>
                  {a.client}
                </p>
                {a.startDate && (
                  <p style={{ fontSize: 10, color: t.mutedColor, margin: '0 0 8px' }}>
                    {a.startDate}{a.endDate ? ` – ${a.endDate}` : ' – present'}
                  </p>
                )}
                {a.description.text && (
                  <Description text={a.description.text} fallbackUsed={a.description.fallbackUsed} isOverridden={a.isDescriptionOverridden} />
                )}
                {(a.skills?.length ?? 0) > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                    {(a.skills ?? []).map(skill => (
                      <span
                        key={skill}
                        style={{
                          fontSize: 9,
                          border: `0.75px solid ${t.skillBorderColor}`,
                          color: t.skillTextColor,
                          borderRadius: 9999,
                          padding: '2px 9px',
                          lineHeight: 1.7,
                          fontFamily: t.monoFont ?? t.bodyFont,
                          letterSpacing: t.monoFont ? '0.02em' : undefined,
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
        <section
          data-cv-break-avoid="skills"
          style={{ breakInside: 'avoid', pageBreakInside: 'avoid', ...offset('skills') }}
        >
          <SectionDivider label="Skills" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cv.skills.map(s => (
              <span
                key={s.id}
                style={{
                  fontSize: 11,
                  border: `0.75px solid ${t.skillBorderColor}`,
                  color: t.skillTextColor,
                  borderRadius: 9999,
                  padding: '3px 12px',
                  fontFamily: t.monoFont ?? t.bodyFont,
                  letterSpacing: t.monoFont ? '0.02em' : undefined,
                }}
              >
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {cv.educations.length > 0 && (
        <section
          data-cv-break-avoid="education"
          style={{ breakInside: 'avoid', pageBreakInside: 'avoid', ...offset('education') }}
        >
          <SectionDivider label="Education" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {cv.educations.map((e, i) => (
                <tr key={e.id} style={{ background: i % 2 === 0 ? t.zebraEven : t.zebraOdd }}>
                  <td style={{ padding: '10px 14px 10px 10px', width: 84, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 11, color: t.subtitleColor, fontWeight: 700 }}>
                      {e.startYear}{e.endYear ? `–${e.endYear}` : '–now'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 10px', verticalAlign: 'top' }}>
                    <span
                      className={e.degree.fallbackUsed ? 'bg-yellow-100' : ''}
                      style={{ display: 'block', fontSize: 12, color: t.nameColor, fontWeight: 700, lineHeight: 1.35, fontFamily: t.displayFont }}
                    >
                      {e.degree.text || e.school}
                    </span>
                    <span style={{ display: 'block', fontSize: 11, color: t.subtitleColor, fontWeight: 500, marginTop: 2 }}>
                      {e.school}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Certifications */}
      {cv.certifications.length > 0 && (
        <section
          data-cv-break-avoid="certifications"
          style={{ breakInside: 'avoid', pageBreakInside: 'avoid', ...offset('certifications') }}
        >
          <SectionDivider label="Certifications" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {cv.certifications.map((c, i) => (
                <tr key={c.id} style={{ background: i % 2 === 0 ? t.zebraEven : t.zebraOdd }}>
                  <td style={{ padding: '10px 14px 10px 10px', width: 56, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 11, color: t.subtitleColor, fontWeight: 700 }}>
                      {c.year}
                    </span>
                  </td>
                  <td style={{ padding: '10px 10px', verticalAlign: 'top' }}>
                    <span
                      className={c.name.fallbackUsed ? 'bg-yellow-100' : ''}
                      style={{ display: 'block', fontSize: 12, color: t.nameColor, fontWeight: 700, lineHeight: 1.35, fontFamily: t.displayFont }}
                    >
                      {c.name.text}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Languages */}
      {cv.languages.length > 0 && (
        <section
          data-cv-break-avoid="languages"
          style={{ breakInside: 'avoid', pageBreakInside: 'avoid', ...offset('languages') }}
        >
          <SectionDivider label="Languages" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {cv.languages.map((l, i) => (
                <tr key={l.id} style={{ background: i % 2 === 0 ? t.zebraEven : t.zebraOdd }}>
                  <td style={{ padding: '10px 10px', width: 140, verticalAlign: 'middle' }}>
                    <span style={{ fontSize: 12, color: t.nameColor, fontWeight: 700 }}>{l.name}</span>
                  </td>
                  <td style={{ padding: '10px 10px', verticalAlign: 'middle' }}>
                    <span style={{ fontSize: 11.5, color: t.bodyColor, fontWeight: 500 }}>{l.proficiency}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}

// ── Full content ───────────────────────────────────────────────────────────────

function CvContent({ cv, breakOffsets }: { cv: ResolvedCv; breakOffsets?: Record<string, number> }) {
  return (
    <>
      <div style={{ width: A4_W, height: A4_H, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
        <CvHeader />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <CvSidebar cv={cv} />
          <FrontPageBody cv={cv} />
        </div>
      </div>
      <ContentPagesBody cv={cv} breakOffsets={breakOffsets} />
    </>
  )
}

// ── CVPreview ──────────────────────────────────────────────────────────────────

export function CVPreview({ cv, showBoundary = false, theme }: Props) {
  const resolvedTheme = theme ?? DEFAULT_THEME
  const measureRef = useRef<HTMLDivElement>(null)
  const [totalHeight, setTotalHeight] = useState(A4_H)
  const [breakOffsets, setBreakOffsets] = useState<Record<string, number>>({})
  // Tracks whether web fonts have finished loading. Until they have, any layout
  // measurement is based on fallback-font metrics, so the page-break offsets it
  // produces will be wrong as soon as the real fonts apply. We must not signal
  // `data-cv-ready` (which gates Puppeteer's PDF capture) until fonts are in.
  const fontsLoadedRef = useRef(false)

  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) {
      fontsLoadedRef.current = true
      return
    }
    let cancelled = false
    document.fonts.ready.then(() => {
      if (cancelled) return
      fontsLoadedRef.current = true
      // Force a re-render to re-run the layout effect with post-font metrics.
      // ResizeObserver may have missed the reflow in PDF mode because the outer
      // container has minHeight = pdfPageCount * A4_H, which masks content-only
      // size changes.
      setBreakOffsets(b => ({ ...b }))
    })
    return () => { cancelled = true }
  }, [])

  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return
    const measure = () => {
      // Page-break offsets are needed in both modes: the builder preview uses them to draw the
      // top margin on page 2+, and the PDF render relies on them to put the same gap into Chrome's
      // print output (CSS `break-inside: avoid` only avoids splitting — it does not add a top margin).
      const wrapperTop = el.getBoundingClientRect().top
      const next: Record<string, number> = {}
      // Track the bottom of the last meaningful content section so pageCount reflects
      // real content, not trailing padding. Using el.scrollHeight here would include
      // ContentPagesBody's padding-bottom and push pageCount up by one whenever the
      // padding pokes past a page boundary — producing a phantom empty trailing page.
      let lastBottom = A4_H
      el.querySelectorAll<HTMLElement>('[data-cv-break-avoid]').forEach(s => {
        const key = s.dataset.cvBreakAvoid
        if (!key) return
        const rect = s.getBoundingClientRect()
        const top = rect.top - wrapperTop // includes any offset already applied
        const height = rect.height
        if (height > 0 && top + height > lastBottom) lastBottom = top + height
        const existing = breakOffsets[key] ?? 0
        if (height <= 0) return // jsdom and pre-layout renders report zero rects — skip
        if (height >= A4_H - PAGE_TOP_MARGIN - FOOTER_H) return // wouldn't fit even on a fresh page; leave it
        const startPage = Math.floor(top / A4_H)
        // The usable content zone for a given page is
        //   [pageTop + PAGE_TOP_MARGIN, pageBottom - FOOTER_H]
        // The top strip enforces breathing room below the previous page's footer (only on
        // pages 2+ — page 1 starts at the cream header). The bottom strip keeps content
        // out from under this page's footer overlay.
        const safeTopOfPage = startPage * A4_H + PAGE_TOP_MARGIN
        const pageContentBottom = (startPage + 1) * A4_H - FOOTER_H
        if (top + height > pageContentBottom) {
          // extends into footer zone — push to top of next page (with margin)
          const desiredTop = (startPage + 1) * A4_H + PAGE_TOP_MARGIN
          next[key] = existing + (desiredTop - top)
        } else if (startPage > 0 && top < safeTopOfPage) {
          // lands too close to the top of page 2+ (often because Chrome's own
          // break-inside:avoid pushed it to y=0 of the new page) — add breathing room
          next[key] = existing + (safeTopOfPage - top)
        } else if (existing) {
          next[key] = existing
        }
      })
      const prevKeys = Object.keys(breakOffsets)
      const nextKeys = Object.keys(next)
      const same =
        prevKeys.length === nextKeys.length &&
        nextKeys.every(k => Math.abs((breakOffsets[k] ?? 0) - next[k]) < 0.5)
      if (!same) {
        setBreakOffsets(next)
      } else if (fontsLoadedRef.current && typeof document !== 'undefined') {
        // Signal to Puppeteer that layout has settled AND fonts are applied —
        // only then is it safe to capture the PDF.
        document.body.dataset.cvReady = '1'
      }
      setTotalHeight(Math.max(lastBottom, A4_H))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cv, breakOffsets, showBoundary])

  // ── PDF / Puppeteer mode — explicit per-page clip windows ──
  //
  // We use the same approach as the builder preview (which the user has confirmed renders
  // correctly): the FULL continuous CvContent is rendered into a hidden measurement div,
  // and N visible A4-sized `overflow: hidden` clip windows show its slices, with
  // `pageBreakAfter: 'always'` separating them. Chrome's print engine therefore has zero
  // pagination decisions left to make — each clip window is exactly one printed page.
  //
  // This is the only architecture that has worked. Previous attempts that let Chrome
  // paginate a continuous flow consistently disagreed with the JS-measured boundaries no
  // matter how we adjusted MarginOptions, viewport, media emulation, or @page CSS.
  if (!showBoundary) {
    const pdfPageCount = Math.max(1, Math.ceil(totalHeight / A4_H))
    return (
      <ThemeCtx.Provider value={resolvedTheme}>
        {/* Hidden measurement render — drives breakOffsets / totalHeight via the
            useLayoutEffect above. Sits off-screen so it never paints into the PDF. */}
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
            fontFamily: resolvedTheme.bodyFont,
          }}
        >
          <CvContent cv={cv} breakOffsets={breakOffsets} />
        </div>

        {/* Visible per-page renders. Each one is an A4-sized clipped window onto the
            same continuous CvContent, translated by -pageIdx * A4_H. We use a CSS
            transform (translateY) instead of position:absolute + top:negative, because
            Chrome's print engine reliably honours transforms but has been observed to
            drop absolute-positioned content with large negative tops from print output. */}
        {Array.from({ length: pdfPageCount }, (_, pageIdx) => (
          <div
            key={pageIdx}
            style={{
              width: A4_W,
              height: A4_H,
              position: 'relative',
              overflow: 'hidden',
              breakAfter: pageIdx < pdfPageCount - 1 ? 'page' : undefined,
              pageBreakAfter: pageIdx < pdfPageCount - 1 ? 'always' : undefined,
              fontFamily: resolvedTheme.bodyFont,
              background: 'white',
            }}
          >
            <div
              style={{
                width: A4_W,
                transform: `translateY(${-pageIdx * A4_H}px)`,
              }}
            >
              <CvContent cv={cv} breakOffsets={breakOffsets} />
            </div>

            {/* Per-page footer */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: pageIdx === 0 ? SIDEBAR_W : 0,
                right: 0,
                height: FOOTER_H,
                padding: '10px 28px',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ fontSize: 9, color: resolvedTheme.footerColor }}>{pageIdx + 1} / {pdfPageCount}</span>
              <span style={{ fontSize: 9, color: resolvedTheme.footerNameColor, fontFamily: resolvedTheme.displayFont }}>{cv.firstName} {cv.lastName}</span>
            </div>
          </div>
        ))}
      </ThemeCtx.Provider>
    )
  }

  // ── Builder / preview mode — clip windows ──
  const pageCount = Math.max(1, Math.ceil(totalHeight / A4_H))

  return (
    <ThemeCtx.Provider value={resolvedTheme}>
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
            fontFamily: resolvedTheme.bodyFont,
          }}
        >
          <CvContent cv={cv} breakOffsets={breakOffsets} />
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
                  fontFamily: resolvedTheme.bodyFont,
                }}
              >
                <CvContent cv={cv} breakOffsets={breakOffsets} />
              </div>

              {/* Per-page footer */}
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
                <span style={{ fontSize: 9, color: resolvedTheme.footerColor }}>{pageIdx + 1} / {pageCount}</span>
                <span style={{ fontSize: 9, color: resolvedTheme.footerNameColor, fontFamily: resolvedTheme.displayFont }}>{cv.firstName} {cv.lastName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ThemeCtx.Provider>
  )
}
