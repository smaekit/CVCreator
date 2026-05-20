import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BilingualFieldPair } from './BilingualFieldPair'

describe('BilingualFieldPair', () => {
  it('shows SV textarea by default', () => {
    render(<BilingualFieldPair sv="Hej" en="Hello" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('Hej')
  })

  it('switches to EN textarea when EN toggle is clicked', async () => {
    render(<BilingualFieldPair sv="Hej" en="Hello" onChange={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
  })

  it('shows Translate button when viewing SV and EN is empty', () => {
    render(<BilingualFieldPair sv="Hej" en="" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument()
  })

  it('hides Translate button when viewing SV and EN already has content', () => {
    render(<BilingualFieldPair sv="Hej" en="Hello" onChange={() => {}} />)
    expect(screen.queryByRole('button', { name: /translate/i })).not.toBeInTheDocument()
  })

  it('shows Translate button when viewing EN and SV is empty', async () => {
    render(<BilingualFieldPair sv="" en="Hello" onChange={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument()
  })

  it('calls onChange with updated sv value when editing SV textarea', async () => {
    const onChange = vi.fn()
    render(<BilingualFieldPair sv="" en="" onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'H')
    expect(onChange).toHaveBeenCalledWith('H', '')
  })
})
