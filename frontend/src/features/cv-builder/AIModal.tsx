import { useAIStream } from './useAIStream'

interface Props {
  originalText: string
  language: string
  onAccept: (text: string) => void
  onClose: () => void
}

export function AIModal({ originalText, language, onAccept, onClose }: Props) {
  const { streamedText, isStreaming, stream, accept, cancel } = useAIStream()

  function handleAccept() {
    accept(onAccept)
    onClose()
  }

  function handleCancel() {
    cancel()
    onClose()
  }

  return (
    <div role="dialog" aria-label="AI Assistant" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[700px] max-h-[80vh] flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Original</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{originalText}</p>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Suggestion</h3>
            {streamedText ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{streamedText}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Click Improve or Translate to start</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Improve"
              onClick={() => stream('improve', originalText, language)}
              disabled={isStreaming}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
            >
              Improve
            </button>
            <button
              type="button"
              aria-label="Translate"
              onClick={() => stream('translate', originalText, language)}
              disabled={isStreaming}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50"
            >
              Translate
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Accept"
              onClick={handleAccept}
              disabled={!streamedText || isStreaming}
              className="px-3 py-1 bg-gray-800 text-white rounded text-sm disabled:opacity-50"
            >
              Accept
            </button>
            <button
              type="button"
              aria-label="Cancel"
              onClick={handleCancel}
              className="px-3 py-1 border rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
