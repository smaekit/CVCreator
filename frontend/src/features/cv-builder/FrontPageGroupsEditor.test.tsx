import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FrontPageGroupsEditor } from './FrontPageGroupsEditor'
import * as groupsApi from './frontPageGroupsApi'

vi.mock('./frontPageGroupsApi')

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

const emptyGroup = {
  id: 'g1', headerSv: null, headerEn: null, displayOrder: 0, items: [],
}

describe('FrontPageGroupsEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders existing group headers', async () => {
    vi.mocked(groupsApi.getFrontPageGroups).mockResolvedValue([
      { ...emptyGroup, headerSv: 'Molnkunskaper', headerEn: 'Cloud Skills' },
    ])
    render(
      <FrontPageGroupsEditor cvId="cv-1" allSkills={[]} allCertifications={[]} />,
      { wrapper: makeWrapper() }
    )
    expect(await screen.findByDisplayValue('Cloud Skills')).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Molnkunskaper')).toBeInTheDocument()
  })

  it('shows "No groups" when list is empty', async () => {
    vi.mocked(groupsApi.getFrontPageGroups).mockResolvedValue([])
    render(
      <FrontPageGroupsEditor cvId="cv-1" allSkills={[]} allCertifications={[]} />,
      { wrapper: makeWrapper() }
    )
    expect(await screen.findByText('No groups')).toBeInTheDocument()
  })

  it('calls createFrontPageGroup when Add is clicked', async () => {
    vi.mocked(groupsApi.getFrontPageGroups).mockResolvedValue([])
    vi.mocked(groupsApi.createFrontPageGroup).mockResolvedValue(emptyGroup)
    render(
      <FrontPageGroupsEditor cvId="cv-1" allSkills={[]} allCertifications={[]} />,
      { wrapper: makeWrapper() }
    )
    await userEvent.click(await screen.findByLabelText('Add group'))
    await waitFor(() =>
      expect(groupsApi.createFrontPageGroup).toHaveBeenCalledWith('cv-1', expect.objectContaining({ displayOrder: 0 }))
    )
  })

  it('calls deleteFrontPageGroup when delete button is clicked', async () => {
    vi.mocked(groupsApi.getFrontPageGroups).mockResolvedValue([
      { ...emptyGroup, headerEn: 'Skills' },
    ])
    vi.mocked(groupsApi.deleteFrontPageGroup).mockResolvedValue(undefined as never)
    render(
      <FrontPageGroupsEditor cvId="cv-1" allSkills={[]} allCertifications={[]} />,
      { wrapper: makeWrapper() }
    )
    await userEvent.click(await screen.findByLabelText('Delete group'))
    await waitFor(() =>
      expect(groupsApi.deleteFrontPageGroup).toHaveBeenCalledWith('cv-1', 'g1')
    )
  })

  it('renders group items with skill labels', async () => {
    vi.mocked(groupsApi.getFrontPageGroups).mockResolvedValue([
      {
        ...emptyGroup,
        items: [{ id: 'i1', skillId: 's1', certificationId: null, displayOrder: 0 }],
      },
    ])
    render(
      <FrontPageGroupsEditor
        cvId="cv-1"
        allSkills={[{ id: 's1', name: 'TypeScript', category: null }]}
        allCertifications={[]}
      />,
      { wrapper: makeWrapper() }
    )
    expect(await screen.findByText('TypeScript')).toBeInTheDocument()
  })

  it('adds a skill item to a group via the select', async () => {
    vi.mocked(groupsApi.getFrontPageGroups).mockResolvedValue([emptyGroup])
    vi.mocked(groupsApi.updateFrontPageGroup).mockResolvedValue(emptyGroup)
    render(
      <FrontPageGroupsEditor
        cvId="cv-1"
        allSkills={[{ id: 's1', name: 'Go', category: null }]}
        allCertifications={[]}
      />,
      { wrapper: makeWrapper() }
    )
    await userEvent.click(await screen.findByLabelText('Add item to group'))
    await userEvent.selectOptions(screen.getByLabelText('Select item to add'), 'skill:s1')
    await waitFor(() =>
      expect(groupsApi.updateFrontPageGroup).toHaveBeenCalledWith(
        'cv-1', 'g1',
        expect.objectContaining({
          items: [expect.objectContaining({ skillId: 's1', certificationId: null })],
        })
      )
    )
  })

  it('removes an item from a group', async () => {
    vi.mocked(groupsApi.getFrontPageGroups).mockResolvedValue([
      {
        ...emptyGroup,
        items: [{ id: 'i1', skillId: 's1', certificationId: null, displayOrder: 0 }],
      },
    ])
    vi.mocked(groupsApi.updateFrontPageGroup).mockResolvedValue(emptyGroup)
    render(
      <FrontPageGroupsEditor
        cvId="cv-1"
        allSkills={[{ id: 's1', name: 'Rust', category: null }]}
        allCertifications={[]}
      />,
      { wrapper: makeWrapper() }
    )
    await userEvent.click(await screen.findByLabelText('Remove item Rust'))
    await waitFor(() =>
      expect(groupsApi.updateFrontPageGroup).toHaveBeenCalledWith(
        'cv-1', 'g1',
        expect.objectContaining({ items: [] })
      )
    )
  })

  it('saves headers on blur', async () => {
    vi.mocked(groupsApi.getFrontPageGroups).mockResolvedValue([emptyGroup])
    vi.mocked(groupsApi.updateFrontPageGroup).mockResolvedValue(emptyGroup)
    render(
      <FrontPageGroupsEditor cvId="cv-1" allSkills={[]} allCertifications={[]} />,
      { wrapper: makeWrapper() }
    )
    const input = await screen.findByLabelText('Group header (EN)')
    await userEvent.type(input, 'Cloud')
    await userEvent.tab()
    await waitFor(() =>
      expect(groupsApi.updateFrontPageGroup).toHaveBeenCalledWith(
        'cv-1', 'g1',
        expect.objectContaining({ headerEn: 'Cloud' })
      )
    )
  })
})
