import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CvPreviewPage from './CvPreviewPage'

const baseCvResponse = {
  firstName: 'Test', lastName: 'User', pictureUrl: null,
  introduction: { text: '', fallbackUsed: false },
  isIntroductionOverridden: false,
  assignments: [], skills: [], educations: [], certifications: [], languages: [],
  language: 'EN', yearsOfExperience: null,
}

function renderPage(id = 'cv-1', token = 'preview-token') {
  return render(
    <MemoryRouter initialEntries={[`/cv/preview/${id}?token=${token}`]}>
      <Routes>
        <Route path="/cv/preview/:id" element={<CvPreviewPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('CvPreviewPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('shows loading state initially', () => {
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders CVPreview after fetching cv data', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(baseCvResponse),
    } as Response)
    renderPage()
    expect(await screen.findByRole('heading', { name: 'Test User' })).toBeInTheDocument()
  })

  it('fetches cv using token from query param in the URL', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(baseCvResponse),
    } as Response)
    renderPage('cv-99', 'my-preview-token')
    await screen.findByRole('heading', { name: 'Test User' })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/cvs/cv-99/preview?token=my-preview-token'
    )
  })
})
