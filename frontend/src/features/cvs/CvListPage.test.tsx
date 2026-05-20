import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CvListPage from './CvListPage'
import * as api from './cvsApi'

vi.mock('./cvsApi')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('CvListPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders existing CVs as cards', async () => {
    vi.mocked(api.getCvs).mockResolvedValue([
      { id: '1', name: 'Jane Doe, Volvo, SV', company: 'Volvo', language: 'SV', createdAt: '2024-01-15T00:00:00Z' },
    ])
    render(<CvListPage />, { wrapper: makeWrapper() })
    expect(await screen.findByText('Jane Doe, Volvo, SV')).toBeInTheDocument()
    expect(screen.getByText('Volvo · SV')).toBeInTheDocument()
  })

  it('shows empty state when no CVs', async () => {
    vi.mocked(api.getCvs).mockResolvedValue([])
    render(<CvListPage />, { wrapper: makeWrapper() })
    expect(await screen.findByText(/No CVs yet/)).toBeInTheDocument()
  })

  it('opens dialog and calls createCv on submit', async () => {
    vi.mocked(api.getCvs).mockResolvedValue([])
    vi.mocked(api.createCv).mockResolvedValue({
      id: '2', name: 'Jane Doe, IKEA, SV', company: 'IKEA', language: 'SV', createdAt: '2024-02-01T00:00:00Z',
    })
    render(<CvListPage />, { wrapper: makeWrapper() })
    await screen.findByText(/No CVs yet/)
    await userEvent.click(screen.getByRole('button', { name: '+ New CV' }))
    expect(screen.getByRole('heading', { name: 'New CV' })).toBeInTheDocument()
    await userEvent.type(screen.getByPlaceholderText('Company'), 'IKEA')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(api.createCv).toHaveBeenCalledWith({ company: 'IKEA', language: 'SV' }))
  })

  it('toggles language to EN in dialog', async () => {
    vi.mocked(api.getCvs).mockResolvedValue([])
    vi.mocked(api.createCv).mockResolvedValue({
      id: '3', name: 'Jane Doe, IKEA, EN', company: 'IKEA', language: 'EN', createdAt: '2024-02-01T00:00:00Z',
    })
    render(<CvListPage />, { wrapper: makeWrapper() })
    await screen.findByText(/No CVs yet/)
    await userEvent.click(screen.getByRole('button', { name: '+ New CV' }))
    await userEvent.click(screen.getByRole('button', { name: 'EN' }))
    await userEvent.type(screen.getByPlaceholderText('Company'), 'IKEA')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(api.createCv).toHaveBeenCalledWith({ company: 'IKEA', language: 'EN' }))
  })

  it('closes dialog on Cancel', async () => {
    vi.mocked(api.getCvs).mockResolvedValue([])
    render(<CvListPage />, { wrapper: makeWrapper() })
    await screen.findByText(/No CVs yet/)
    await userEvent.click(screen.getByRole('button', { name: '+ New CV' }))
    expect(screen.getByRole('heading', { name: 'New CV' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('heading', { name: 'New CV' })).not.toBeInTheDocument()
  })

  it('calls deleteCv when Delete is clicked and confirmed', async () => {
    vi.mocked(api.getCvs).mockResolvedValue([
      { id: '1', name: 'Jane Doe, Volvo, SV', company: 'Volvo', language: 'SV', createdAt: '2024-01-15T00:00:00Z' },
    ])
    vi.mocked(api.deleteCv).mockResolvedValue(undefined as never)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<CvListPage />, { wrapper: makeWrapper() })
    await screen.findByText('Jane Doe, Volvo, SV')
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(vi.mocked(api.deleteCv).mock.calls[0][0]).toBe('1'))
  })

  it('does not delete when confirmation is cancelled', async () => {
    vi.mocked(api.getCvs).mockResolvedValue([
      { id: '1', name: 'Jane Doe, Volvo, SV', company: 'Volvo', language: 'SV', createdAt: '2024-01-15T00:00:00Z' },
    ])
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<CvListPage />, { wrapper: makeWrapper() })
    await screen.findByText('Jane Doe, Volvo, SV')
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(api.deleteCv).not.toHaveBeenCalled()
  })
})
