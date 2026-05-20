import { useLayoutEffect, useState, type RefObject } from 'react'

const A4_HEIGHT_PX = 1123

export function useA4Overflow(ref: RefObject<HTMLElement | null>) {
  const [state, setState] = useState({ isOverflowing: false, overflowPx: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    function measure() {
      const overflow = Math.max(0, el!.scrollHeight - A4_HEIGHT_PX)
      setState({ isOverflowing: overflow > 0, overflowPx: overflow })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return state
}
