import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProfilePage from './ProfilePage'
import * as profileApi from './profileApi'

vi.mock('./profileApi')

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

describe('ProfilePage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading then renders form populated with profile data', async () => {
    vi.mocked(profileApi.getProfile).mockResolvedValue({
      firstName: 'Alice',
      lastName: 'Smith',
      pictureUrl: null,
      introductionSv: null,
      introductionEn: null,
    })
    render(<ProfilePage />, { wrapper: makeWrapper() })
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Alice')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Smith')).toBeInTheDocument()
  })

  it('shows error message when save fails', async () => {
    vi.mocked(profileApi.getProfile).mockResolvedValue(null)
    vi.mocked(profileApi.upsertProfile).mockRejectedValue(new Error('Network error'))
    render(<ProfilePage />, { wrapper: makeWrapper() })
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())
    await userEvent.type(screen.getByLabelText('First name'), 'Test')
    await userEvent.type(screen.getByLabelText('Last name'), 'User')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Failed to save profile. Please try again.')).toBeInTheDocument()
  })

  it('shows picture preview after file is selected', async () => {
    vi.mocked(profileApi.getProfile).mockResolvedValue(null)
    global.URL.createObjectURL = vi.fn(() => 'blob:preview-url')
    render(<ProfilePage />, { wrapper: makeWrapper() })
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())
    const file = new File(['img'], 'avatar.png', { type: 'image/png' })
    const input = screen.getByLabelText('Profile picture')
    await userEvent.upload(input, file)
    expect(screen.getByRole('img', { name: 'Profile' })).toHaveAttribute('src', 'blob:preview-url')
  })
})
