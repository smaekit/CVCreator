import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AIModal } from './AIModal'
import * as useAIStreamModule from './useAIStream'

vi.mock('./useAIStream')

describe('AIModal', () => {
  const mockStream = vi.fn()
  const mockCancel = vi.fn()

  function setupHook(overrides: Partial<ReturnType<typeof useAIStreamModule.useAIStream>> = {}) {
    vi.mocked(useAIStreamModule.useAIStream).mockReturnValue({
      streamedText: '',
      isStreaming: false,
      stream: mockStream,
      accept: vi.fn(),
      cancel: mockCancel,
      _appendChunk: vi.fn(),
      ...overrides,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setupHook()
  })

  it('renders original text', () => {
    render(<AIModal originalText="Hello world" language="EN" onAccept={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders Improve and Translate buttons', () => {
    render(<AIModal originalText="text" language="EN" onAccept={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Improve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Translate' })).toBeInTheDocument()
  })

  it('calls stream with improve endpoint when Improve clicked', async () => {
    render(<AIModal originalText="Original text" language="SV" onAccept={vi.fn()} onClose={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Improve' }))
    expect(mockStream).toHaveBeenCalledWith('improve', 'Original text', 'SV')
  })

  it('calls stream with translate endpoint when Translate clicked', async () => {
    render(<AIModal originalText="Original text" language="EN" onAccept={vi.fn()} onClose={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Translate' }))
    expect(mockStream).toHaveBeenCalledWith('translate', 'Original text', 'EN')
  })

  it('Accept button is disabled when streamedText is empty', () => {
    render(<AIModal originalText="text" language="EN" onAccept={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Accept' })).toBeDisabled()
  })

  it('Accept button is enabled when streamedText is present', () => {
    setupHook({ streamedText: 'Improved suggestion' })
    render(<AIModal originalText="text" language="EN" onAccept={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Accept' })).not.toBeDisabled()
  })

  it('calls onAccept with streamed text and onClose when Accept is clicked', async () => {
    const onAccept = vi.fn()
    const onClose = vi.fn()
    setupHook({
      streamedText: 'Improved text',
      accept: (cb: (text: string) => void) => cb('Improved text'),
    })
    render(<AIModal originalText="text" language="EN" onAccept={onAccept} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Accept' }))
    expect(onAccept).toHaveBeenCalledWith('Improved text')
    expect(onClose).toHaveBeenCalled()
  })

  it('calls cancel and onClose when Cancel is clicked', async () => {
    const onClose = vi.fn()
    render(<AIModal originalText="text" language="EN" onAccept={vi.fn()} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockCancel).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('renders suggestion text when streamedText is not empty', () => {
    setupHook({ streamedText: 'My suggestion' })
    render(<AIModal originalText="text" language="EN" onAccept={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('My suggestion')).toBeInTheDocument()
  })
})
