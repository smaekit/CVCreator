import { renderHook, act } from '@testing-library/react'
import { useAIStream } from './useAIStream'

describe('useAIStream', () => {
  it('initial state has empty streamedText and not streaming', () => {
    const { result } = renderHook(() => useAIStream())
    expect(result.current.streamedText).toBe('')
    expect(result.current.isStreaming).toBe(false)
  })

  it('accept calls onAccept with streamedText and resets state', () => {
    const onAccept = vi.fn()
    const { result } = renderHook(() => useAIStream())

    act(() => {
      result.current._appendChunk('Hello ')
      result.current._appendChunk('world')
    })

    act(() => result.current.accept(onAccept))

    expect(onAccept).toHaveBeenCalledWith('Hello world')
    expect(result.current.streamedText).toBe('')
    expect(result.current.isStreaming).toBe(false)
  })

  it('cancel aborts streaming and resets text', () => {
    const { result } = renderHook(() => useAIStream())

    act(() => {
      result.current._appendChunk('partial')
    })

    act(() => result.current.cancel())

    expect(result.current.streamedText).toBe('')
    expect(result.current.isStreaming).toBe(false)
  })
})
