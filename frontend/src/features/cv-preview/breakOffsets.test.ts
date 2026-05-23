import { describe, it, expect } from 'vitest'
import { computeBreakOffsets } from './breakOffsets'

const CFG = { A4_H: 1123, PAGE_TOP_MARGIN: 36, FOOTER_H: 32 }

// Helper that runs computeBreakOffsets repeatedly until offsets stabilise,
// mirroring the useLayoutEffect/setState loop in CVPreview.
// `positionFor` lets each iteration compute a section's top based on the
// current offsets — i.e. a marginTop on section A shifts every later section
// down by that amount in normal flow.
function settle(
  sectionOrder: string[],
  naturalTop: Record<string, number>,
  height: Record<string, number>,
  predecessors: Record<string, string[]>,
): { offsets: Record<string, number>; positions: Record<string, number>; iterations: number } {
  let offsets: Record<string, number> = {}
  let positions: Record<string, number> = {}
  for (let i = 0; i < 20; i++) {
    positions = {}
    for (const key of sectionOrder) {
      const accumulatedFromPredecessors = (predecessors[key] ?? []).reduce(
        (acc, p) => acc + (offsets[p] ?? 0),
        0,
      )
      positions[key] = naturalTop[key] + accumulatedFromPredecessors + (offsets[key] ?? 0)
    }
    const sections = sectionOrder.map(key => ({ key, top: positions[key], height: height[key] }))
    const next = computeBreakOffsets(sections, offsets, CFG)
    const prevKeys = Object.keys(offsets)
    const nextKeys = Object.keys(next)
    const same =
      prevKeys.length === nextKeys.length &&
      nextKeys.every(k => Math.abs((offsets[k] ?? 0) - next[k]) < 0.5)
    offsets = next
    if (same) return { offsets, positions, iterations: i + 1 }
  }
  throw new Error('did not converge in 20 iterations')
}

describe('computeBreakOffsets', () => {
  describe('single section', () => {
    it('does not push when section sits well inside page 1', () => {
      const result = computeBreakOffsets(
        [{ key: 'edu', top: 500, height: 200 }],
        {},
        CFG,
      )
      expect(result.edu).toBeUndefined()
    })

    it('pushes a section that would extend into the bottom FOOTER_H strip', () => {
      // Section at top=2173, height=110 → ends at 2283.
      // pageContentBottom for page 1 (startPage=1): 2*1123 - 32 = 2214. 2283 > 2214 → push.
      // desiredTop = 2*1123 + 36 = 2282. offset = 2282 - 2173 = 109.
      const result = computeBreakOffsets(
        [{ key: 'languages', top: 2173, height: 110 }],
        {},
        CFG,
      )
      expect(result.languages).toBe(109)
    })

    it('pushes a section that lands flush at top of page 2 (no breathing room)', () => {
      // Section naturally at y=2246 (exact page 3 start), height=110.
      // Doesn't extend into footer. But top (2246) < safeTopOfPage (2282) → push 36.
      const result = computeBreakOffsets(
        [{ key: 'languages', top: 2246, height: 110 }],
        {},
        CFG,
      )
      expect(result.languages).toBe(36)
    })

    it('preserves existing offset when section is already correctly positioned', () => {
      // After push, section is at y=2282 (its top), height=110, on page 3 with 36px margin.
      const result = computeBreakOffsets(
        [{ key: 'languages', top: 2282, height: 110 }],
        { languages: 109 },
        CFG,
      )
      expect(result.languages).toBe(109)
    })

    it('does not push sections on page 1 even if their top is < PAGE_TOP_MARGIN', () => {
      // First content on page 1 can be at y=0..36 (cream header etc.) — must not push.
      const result = computeBreakOffsets(
        [{ key: 'edu', top: 10, height: 200 }],
        {},
        CFG,
      )
      expect(result.edu).toBeUndefined()
    })

    it('skips sections taller than a full usable page', () => {
      // height > A4_H - PAGE_TOP_MARGIN - FOOTER_H = 1055 — can't fit anywhere, leave it
      const result = computeBreakOffsets(
        [{ key: 'huge', top: 1100, height: 1200 }],
        {},
        CFG,
      )
      expect(result.huge).toBeUndefined()
    })
  })

  describe('the user-reported scenario (Languages on page 3 with no margin)', () => {
    // Reproduces the user's CV layout:
    //   page 1: fixed cream/sidebar/highlighted (DOM y=0..1123)
    //   page 2 content body padded 44px top, then OTHER ASSIGNMENTS / EDU / CERT
    //   page 3: LANGUAGES
    //
    // With Cert ending near the bottom of page 2's usable area, Languages naturally
    // spans into page 3. The push must land Languages at y = 2*A4_H + PAGE_TOP_MARGIN = 2282.

    it('Languages lands 36px below the page 3 top after a single iteration', () => {
      const sections = [
        { key: 'assignment-1', top: 1167, height: 290 },
        { key: 'assignment-2', top: 1481, height: 280 },
        { key: 'edu', top: 1793, height: 140 },
        { key: 'cert', top: 1965, height: 180 },
        { key: 'languages', top: 2177, height: 110 },
      ]
      const offsets = computeBreakOffsets(sections, {}, CFG)
      // The Languages section overflows the footer strip on page 2 (top=2177, h=110, ends at 2287 > 2214).
      // It should be pushed to y=2282.
      expect(offsets.languages).toBe(2282 - 2177)
    })

    it('converges to a stable layout where Languages sits at y=2282 (36px into page 3)', () => {
      const naturalTop = {
        'assignment-1': 1167,
        'assignment-2': 1481,
        edu: 1793,
        cert: 1965,
        languages: 2177,
      }
      const height = {
        'assignment-1': 290,
        'assignment-2': 280,
        edu: 140,
        cert: 180,
        languages: 110,
      }
      const order = ['assignment-1', 'assignment-2', 'edu', 'cert', 'languages']
      // Each section is shifted by the offsets of all earlier (predecessor) sections,
      // because adding marginTop to section N pushes everything after N down too.
      const predecessors: Record<string, string[]> = {
        'assignment-1': [],
        'assignment-2': ['assignment-1'],
        edu: ['assignment-1', 'assignment-2'],
        cert: ['assignment-1', 'assignment-2', 'edu'],
        languages: ['assignment-1', 'assignment-2', 'edu', 'cert'],
      }
      const { offsets, positions } = settle(order, naturalTop, height, predecessors)
      expect(positions.languages).toBe(2282)
      expect(offsets.languages).toBeGreaterThan(0)
    })

    it('converges when Languages already starts cleanly at the top of page 3 (Chrome push case)', () => {
      // Same scenario but with Cert+gap leaving Languages naturally at exactly y=2246 —
      // simulates Chrome's break-inside:avoid having already pushed Languages to page 3.
      const naturalTop = {
        cert: 2050,
        languages: 2246,
      }
      const height = { cert: 100, languages: 110 }
      const order = ['cert', 'languages']
      const predecessors: Record<string, string[]> = { cert: [], languages: ['cert'] }
      const { positions, offsets } = settle(order, naturalTop, height, predecessors)
      expect(positions.languages).toBe(2282)
      expect(offsets.languages).toBe(36)
    })
  })
})
