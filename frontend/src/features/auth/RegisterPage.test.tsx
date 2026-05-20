import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'
import * as authApi from './authApi'

vi.mock('./authApi')

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows validation error when password is shorter than 8 characters', async () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>)
    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText(/Password/), 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Register' }))
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
  })

  it('shows API error message on duplicate email', async () => {
    vi.mocked(authApi.register).mockRejectedValue({
      response: { data: { errors: ['Email is already taken.'] } },
    })
    render(<MemoryRouter><RegisterPage /></MemoryRouter>)
    await userEvent.type(screen.getByPlaceholderText('Email'), 'existing@test.com')
    await userEvent.type(screen.getByPlaceholderText(/Password/), 'validpassword')
    await userEvent.click(screen.getByRole('button', { name: 'Register' }))
    expect(await screen.findByText('Email is already taken.')).toBeInTheDocument()
  })
})
