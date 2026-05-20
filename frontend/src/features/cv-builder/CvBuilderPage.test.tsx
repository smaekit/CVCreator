import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CvBuilderPage from './CvBuilderPage'
import * as builderApi from './cvBuilderApi'
import * as collectionsApi from '../profile/collectionsApi'
import * as frontPageGroupsApi from './frontPageGroupsApi'

vi.mock('./cvBuilderApi')
vi.mock('../profile/collectionsApi')
vi.mock('./frontPageGroupsApi')

const emptyCv = {
  firstName: 'Jane', lastName: 'Doe', pictureUrl: null,
  introduction: { text: '', fallbackUsed: false },
  isIntroductionOverridden: false,
  assignments: [], skills: [], educations: [], certifications: [], languages: [],
  language: 'SV', yearsOfExperience: null,
}

function makeWrapper(id = 'cv-1') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[`/cv/${id}`]}>
          <Routes>
            <Route path="/cv/:id" element={<>{children}</>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('CvBuilderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(collectionsApi.getAssignments).mockResolvedValue([])
    vi.mocked(collectionsApi.getSkills).mockResolvedValue([])
    vi.mocked(collectionsApi.getEducations).mockResolvedValue([])
    vi.mocked(collectionsApi.getCertifications).mockResolvedValue([])
    vi.mocked(collectionsApi.getLanguages).mockResolvedValue([])
    vi.mocked(frontPageGroupsApi.getFrontPageGroups).mockResolvedValue([])
  })

  it('renders the CV name in the header', async () => {
    vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
    render(<CvBuilderPage />, { wrapper: makeWrapper() })
    expect(await screen.findByText('Jane Doe — SV')).toBeInTheDocument()
  })

  it('shows profile skills as checkboxes in the left panel', async () => {
    vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
    vi.mocked(collectionsApi.getSkills).mockResolvedValue([
      { id: 's1', name: 'TypeScript', category: null },
    ])
    render(<CvBuilderPage />, { wrapper: makeWrapper() })
    expect(await screen.findByLabelText('Select skill TypeScript')).toBeInTheDocument()
  })

  it('pre-checks skills that are already in the resolved CV', async () => {
    vi.mocked(builderApi.getCv).mockResolvedValue({
      ...emptyCv,
      skills: [{ id: 's1', name: 'TypeScript', category: null, displayOrder: 0 }],
    })
    vi.mocked(collectionsApi.getSkills).mockResolvedValue([
      { id: 's1', name: 'TypeScript', category: null },
    ])
    render(<CvBuilderPage />, { wrapper: makeWrapper() })
    const checkbox = await screen.findByLabelText('Select skill TypeScript')
    expect(checkbox).toBeChecked()
  })

  it('calls updateSelections when a skill is toggled', async () => {
    vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
    vi.mocked(collectionsApi.getSkills).mockResolvedValue([
      { id: 's1', name: 'Go', category: null },
    ])
    vi.mocked(builderApi.updateSelections).mockResolvedValue(undefined as never)
    render(<CvBuilderPage />, { wrapper: makeWrapper() })
    await userEvent.click(await screen.findByLabelText('Select skill Go'))
    await waitFor(() =>
      expect(builderApi.updateSelections).toHaveBeenCalledWith('cv-1', expect.objectContaining({
        skills: [expect.objectContaining({ id: 's1' })],
      }))
    )
  })

  it('shows highlight toggle only for selected assignments', async () => {
    vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
    vi.mocked(collectionsApi.getAssignments).mockResolvedValue([
      { id: 'a1', titleSv: 'Projekt X', titleEn: null, descriptionSv: null, descriptionEn: null, client: 'Acme', startDate: '2023-01-01', endDate: null, skillIds: [] },
    ])
    vi.mocked(builderApi.updateSelections).mockResolvedValue(undefined as never)
    render(<CvBuilderPage />, { wrapper: makeWrapper() })
    // Star button not visible before selecting
    await screen.findByLabelText('Select assignment Projekt X')
    expect(screen.queryByLabelText('Highlight')).not.toBeInTheDocument()
    // Select the assignment
    await userEvent.click(screen.getByLabelText('Select assignment Projekt X'))
    await waitFor(() => expect(screen.getByLabelText('Highlight')).toBeInTheDocument())
  })

  it('disables highlight toggle when 2 assignments are already highlighted', async () => {
    vi.mocked(builderApi.getCv).mockResolvedValue({
      ...emptyCv,
      assignments: [
        { id: 'a1', title: { text: 'A1', fallbackUsed: false }, description: { text: '', fallbackUsed: false }, client: 'X', startDate: '2023-01-01', endDate: null, isHighlighted: true, displayOrder: 0, isDescriptionOverridden: false },
        { id: 'a2', title: { text: 'A2', fallbackUsed: false }, description: { text: '', fallbackUsed: false }, client: 'Y', startDate: '2023-01-01', endDate: null, isHighlighted: true, displayOrder: 1, isDescriptionOverridden: false },
        { id: 'a3', title: { text: 'A3', fallbackUsed: false }, description: { text: '', fallbackUsed: false }, client: 'Z', startDate: '2023-01-01', endDate: null, isHighlighted: false, displayOrder: 2, isDescriptionOverridden: false },
      ],
    })
    vi.mocked(collectionsApi.getAssignments).mockResolvedValue([
      { id: 'a1', titleSv: 'A1', titleEn: null, descriptionSv: null, descriptionEn: null, client: 'X', startDate: '2023-01-01', endDate: null, skillIds: [] },
      { id: 'a2', titleSv: 'A2', titleEn: null, descriptionSv: null, descriptionEn: null, client: 'Y', startDate: '2023-01-01', endDate: null, skillIds: [] },
      { id: 'a3', titleSv: 'A3', titleEn: null, descriptionSv: null, descriptionEn: null, client: 'Z', startDate: '2023-01-01', endDate: null, skillIds: [] },
    ])
    render(<CvBuilderPage />, { wrapper: makeWrapper() })
    // Wait for initialization
    await screen.findByText('Jane Doe — SV')
    // The 3rd assignment's highlight button should be disabled (at limit)
    const buttons = await screen.findAllByRole('button', { name: /Highlight/ })
    // A3's highlight button (not highlighted, at limit) is disabled
    const a3Highlight = buttons.find(b => b.closest('div')?.textContent?.includes('A3'))
    expect(a3Highlight).toBeDisabled()
  })
})
