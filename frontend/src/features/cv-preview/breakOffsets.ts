// Pure math for the page-break offset logic in CVPreview.
// Extracted so it can be unit-tested without a real DOM layout engine
// (jsdom returns zero rects, so we can't exercise the real layout from a test).

export interface BreakAvoidSection {
  key: string
  top: number
  height: number
}

export interface BreakOffsetConfig {
  A4_H: number
  PAGE_TOP_MARGIN: number
  FOOTER_H: number
}

export function computeBreakOffsets(
  sections: BreakAvoidSection[],
  existing: Record<string, number>,
  config: BreakOffsetConfig,
): Record<string, number> {
  const next: Record<string, number> = {}
  for (const { key, top, height } of sections) {
    const ex = existing[key] ?? 0
    if (height <= 0) continue
    if (height >= config.A4_H - config.PAGE_TOP_MARGIN - config.FOOTER_H) continue
    const startPage = Math.floor(top / config.A4_H)
    const safeTopOfPage = startPage * config.A4_H + config.PAGE_TOP_MARGIN
    const pageContentBottom = (startPage + 1) * config.A4_H - config.FOOTER_H
    if (top + height > pageContentBottom) {
      const desiredTop = (startPage + 1) * config.A4_H + config.PAGE_TOP_MARGIN
      next[key] = ex + (desiredTop - top)
    } else if (startPage > 0 && top < safeTopOfPage) {
      next[key] = ex + (safeTopOfPage - top)
    } else if (ex) {
      next[key] = ex
    }
  }
  return next
}
