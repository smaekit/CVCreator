import { render, screen, waitFor, within } from '@testing-library/react'
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
vi.mock('./AIModal', () => ({
  AIModal: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" aria-label="AI Assistant">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}))

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
    vi.mocked(builderApi.updateOverrides).mockResolvedValue(undefined as never)
    vi.mocked(builderApi.downloadPdf).mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
  })

  it('renders the CV name in the header', async () => {
    vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
    render(<CvBuilderPage />, { wrapper: makeWrapper() })
    await waitFor(() => {
      const banner = screen.getByRole('banner')
      expect(within(banner).getByText('Jane Doe')).toBeInTheDocument()
      expect(within(banner).getByText('SV')).toBeInTheDocument()
    })
  })

  it('shows profile skills as checkboxes in the left panel', async () => {
    vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
    vi.mocked(collectionsApi.getSkills).mockResolvedValue([
      { id: 's1', name: 'TypeScript', category: null },
    ])
    render(<CvBuilderPage />, { wrapper: makeWrapper() })
    expect(await screen.findByRole('switch', { name: 'Select skill TypeScript' })).toBeInTheDocument()
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
    const toggle = await screen.findByRole('switch', { name: 'Select skill TypeScript' })
    expect(toggle).toBeChecked()
  })

  it('calls updateSelections when a skill is toggled', async () => {
    vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
    vi.mocked(collectionsApi.getSkills).mockResolvedValue([
      { id: 's1', name: 'Go', category: null },
    ])
    vi.mocked(builderApi.updateSelections).mockResolvedValue(undefined as never)
    render(<CvBuilderPage />, { wrapper: makeWrapper() })
    await userEvent.click(await screen.findByRole('switch', { name: 'Select skill Go' }))
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
    // Highlight toggle not visible before selecting
    await screen.findByRole('switch', { name: 'Select assignment Projekt X' })
    expect(screen.queryByRole('switch', { name: 'Highlight' })).not.toBeInTheDocument()
    // Select the assignment
    await userEvent.click(screen.getByRole('switch', { name: 'Select assignment Projekt X' }))
    await waitFor(() => expect(screen.getByRole('switch', { name: 'Highlight' })).toBeInTheDocument())
  })

  describe('Slice 10 — Per-CV Overrides', () => {
    it('initializes introduction override from overridden cv', async () => {
      vi.mocked(builderApi.getCv).mockResolvedValue({
        ...emptyCv,
        isIntroductionOverridden: true,
        introduction: { text: 'Custom intro', fallbackUsed: false },
      })
      render(<CvBuilderPage />, { wrapper: makeWrapper() })
      const textarea = await screen.findByLabelText('Introduction override')
      await waitFor(() => expect(textarea).toHaveValue('Custom intro'))
    })

    it('calls updateOverrides when intro override is blurred', async () => {
      vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
      render(<CvBuilderPage />, { wrapper: makeWrapper() })
      const textarea = await screen.findByLabelText('Introduction override')
      await userEvent.type(textarea, 'My override')
      await userEvent.tab()
      await waitFor(() =>
        expect(builderApi.updateOverrides).toHaveBeenCalledWith('cv-1',
          expect.objectContaining({ introductionOverride: 'My override' })
        )
      )
    })

    it('shows description override textarea for selected assignments', async () => {
      vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
      vi.mocked(collectionsApi.getAssignments).mockResolvedValue([
        { id: 'a1', titleSv: 'Project X', titleEn: null, descriptionSv: null, descriptionEn: null, client: 'Acme', startDate: '2023-01-01', endDate: null, skillIds: [] },
      ])
      vi.mocked(builderApi.updateSelections).mockResolvedValue(undefined as never)
      render(<CvBuilderPage />, { wrapper: makeWrapper() })
      await userEvent.click(await screen.findByRole('switch', { name: 'Select assignment Project X' }))
      expect(await screen.findByLabelText('Description override for Project X')).toBeInTheDocument()
    })

    it('calls updateSelections with descriptionOverride when description override is blurred', async () => {
      vi.mocked(builderApi.getCv).mockResolvedValue({
        ...emptyCv,
        assignments: [{
          id: 'a1', title: { text: 'A1', fallbackUsed: false },
          description: { text: 'Original', fallbackUsed: false },
          client: 'X', startDate: '2023-01-01', endDate: null,
          isHighlighted: false, displayOrder: 0, isDescriptionOverridden: false,
        }],
      })
      vi.mocked(collectionsApi.getAssignments).mockResolvedValue([
        { id: 'a1', titleSv: 'A1', titleEn: null, descriptionSv: null, descriptionEn: null, client: 'X', startDate: '2023-01-01', endDate: null, skillIds: [] },
      ])
      vi.mocked(builderApi.updateSelections).mockResolvedValue(undefined as never)
      render(<CvBuilderPage />, { wrapper: makeWrapper() })
      const overrideInput = await screen.findByLabelText('Description override for A1')
      await userEvent.type(overrideInput, 'Overridden')
      await userEvent.tab()
      await waitFor(() =>
        expect(builderApi.updateSelections).toHaveBeenCalledWith('cv-1',
          expect.objectContaining({
            assignments: [expect.objectContaining({ descriptionOverride: 'Overridden' })],
          })
        )
      )
    })
  })

  describe('Slice 12 — Bilingual Fallback Warnings', () => {
    it('shows missing translations badge when cv has fallback fields', async () => {
      vi.mocked(builderApi.getCv).mockResolvedValue({
        ...emptyCv,
        introduction: { text: 'Swedish text', fallbackUsed: true },
        language: 'EN',
      })
      render(<CvBuilderPage />, { wrapper: makeWrapper() })
      expect(await screen.findByLabelText(/missing translations/)).toBeInTheDocument()
    })

    it('does not show missing translations badge when no fallbacks', async () => {
      vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
      render(<CvBuilderPage />, { wrapper: makeWrapper() })
      await screen.findByLabelText('Export PDF')
      expect(screen.queryByLabelText(/missing translations/)).not.toBeInTheDocument()
    })
  })

  describe('Slice 13 — PDF Export', () => {
    it('renders Export PDF button', async () => {
      vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
      render(<CvBuilderPage />, { wrapper: makeWrapper() })
      expect(await screen.findByLabelText('Export PDF')).toBeInTheDocument()
    })

    it('calls downloadPdf when Export PDF button is clicked', async () => {
      vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test')
      global.URL.revokeObjectURL = vi.fn()
      render(<CvBuilderPage />, { wrapper: makeWrapper() })
      await userEvent.click(await screen.findByLabelText('Export PDF'))
      await waitFor(() => expect(builderApi.downloadPdf).toHaveBeenCalledWith('cv-1', expect.any(String)))
    })
  })

  describe('Slice 14 — AI Assistance', () => {
    it('opens AI modal when AI assist introduction button is clicked', async () => {
      vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
      render(<CvBuilderPage />, { wrapper: makeWrapper() })
      await userEvent.click(await screen.findByLabelText('AI assist introduction'))
      expect(screen.getByRole('dialog', { name: 'AI Assistant' })).toBeInTheDocument()
    })

    it('closes AI modal when close is triggered', async () => {
      vi.mocked(builderApi.getCv).mockResolvedValue(emptyCv)
      render(<CvBuilderPage />, { wrapper: makeWrapper() })
      await userEvent.click(await screen.findByLabelText('AI assist introduction'))
      await userEvent.click(screen.getByText('Close'))
      expect(screen.queryByRole('dialog', { name: 'AI Assistant' })).not.toBeInTheDocument()
    })
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
    await screen.findByLabelText('Export PDF')
    // A3 should have aria-label "Highlight" (not yet highlighted) and be disabled (at limit)
    const toggles = await screen.findAllByRole('switch', { name: /Highlight/ })
    // The toggle with exactly "Highlight" label is A3 (not yet highlighted); should be disabled
    const a3Highlight = toggles.find(t => t.getAttribute('aria-label') === 'Highlight')
    expect(a3Highlight).toBeDisabled()
  })
})
