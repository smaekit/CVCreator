import { useState, useRef, useCallback } from 'react'

export function useAIStream() {
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const stream = useCallback(async (endpoint: string, text: string, language: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setStreamedText('')
    setIsStreaming(true)

    try {
      const response = await fetch(`/api/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text, language }),
        signal: controller.signal,
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setStreamedText((prev) => prev + decoder.decode(value))
      }
    } catch {
    } finally {
      setIsStreaming(false)
    }
  }, [])

  const accept = useCallback((onAccept: (text: string) => void) => {
    setStreamedText((current) => {
      onAccept(current)
      return ''
    })
    setIsStreaming(false)
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setStreamedText('')
    setIsStreaming(false)
  }, [])

  const _appendChunk = useCallback((chunk: string) => {
    setStreamedText((prev) => prev + chunk)
  }, [])

  return { streamedText, isStreaming, stream, accept, cancel, _appendChunk }
}
