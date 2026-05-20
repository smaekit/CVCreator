import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import * as authApi from './authApi'

vi.mock('./authApi')

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('shows error on invalid credentials', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Unauthorized'))
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
  })

  it('stores token in localStorage on successful login', async () => {
    vi.mocked(authApi.login).mockResolvedValue('test-jwt-token')
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    await userEvent.type(screen.getByPlaceholderText('Email'), 'user@test.com')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'validpassword')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(localStorage.getItem('token')).toBe('test-jwt-token'))
  })
})
