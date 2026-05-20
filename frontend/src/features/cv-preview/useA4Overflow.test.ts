import { renderHook } from '@testing-library/react'
import { useA4Overflow } from './useA4Overflow'

const A4_HEIGHT = 1123

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('useA4Overflow', () => {
  it('returns isOverflowing false when scrollHeight equals A4 height', () => {
    const ref = { current: { scrollHeight: A4_HEIGHT } as HTMLElement }
    const { result } = renderHook(() => useA4Overflow(ref))
    expect(result.current.isOverflowing).toBe(false)
    expect(result.current.overflowPx).toBe(0)
  })

  it('returns isOverflowing true when scrollHeight exceeds A4 height', () => {
    const ref = { current: { scrollHeight: A4_HEIGHT + 50 } as HTMLElement }
    const { result } = renderHook(() => useA4Overflow(ref))
    expect(result.current.isOverflowing).toBe(true)
    expect(result.current.overflowPx).toBe(50)
  })
})
