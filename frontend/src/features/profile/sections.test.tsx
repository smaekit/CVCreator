import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SkillsSection } from './SkillsSection'
import { EducationSection } from './EducationSection'
import { CertificationsSection } from './CertificationsSection'
import { LanguagesSection } from './LanguagesSection'
import * as api from './collectionsApi'

vi.mock('./collectionsApi')

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

describe('SkillsSection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders existing skills', async () => {
    vi.mocked(api.getSkills).mockResolvedValue([
      { id: '1', name: 'TypeScript', category: 'Frontend' },
    ])
    render(<SkillsSection />, { wrapper: makeWrapper() })
    expect(await screen.findByText('TypeScript — Frontend')).toBeInTheDocument()
  })

  it('opens add form and calls createSkill on submit', async () => {
    vi.mocked(api.getSkills).mockResolvedValue([])
    vi.mocked(api.createSkill).mockResolvedValue({ id: '2', name: 'Go', category: null })
    render(<SkillsSection />, { wrapper: makeWrapper() })
    await userEvent.click(screen.getByRole('button', { name: '+ Add skill' }))
    await userEvent.type(screen.getByPlaceholderText('Skill name'), 'Go')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(api.createSkill).toHaveBeenCalledWith({ name: 'Go', category: null }))
  })

  it('calls deleteSkill when Delete is clicked', async () => {
    vi.mocked(api.getSkills).mockResolvedValue([{ id: '1', name: 'React', category: null }])
    vi.mocked(api.deleteSkill).mockResolvedValue(undefined as never)
    render(<SkillsSection />, { wrapper: makeWrapper() })
    await screen.findByText('React')
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(vi.mocked(api.deleteSkill).mock.calls[0][0]).toBe('1'))
  })
})

describe('EducationSection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders existing education entries', async () => {
    vi.mocked(api.getEducations).mockResolvedValue([
      { id: '1', degreeSv: 'Kandidat', degreeEn: 'Bachelor', school: 'KTH', startYear: 2018, endYear: 2021 },
    ])
    render(<EducationSection />, { wrapper: makeWrapper() })
    expect(await screen.findByText('KTH (2018–2021)')).toBeInTheDocument()
  })

  it('opens add form and calls createEducation on submit', async () => {
    vi.mocked(api.getEducations).mockResolvedValue([])
    vi.mocked(api.createEducation).mockResolvedValue({
      id: '2', degreeSv: null, degreeEn: null, school: 'MIT', startYear: 2020, endYear: null,
    })
    render(<EducationSection />, { wrapper: makeWrapper() })
    await userEvent.click(screen.getByRole('button', { name: '+ Add education' }))
    await userEvent.type(screen.getByPlaceholderText('School'), 'MIT')
    await userEvent.type(screen.getByPlaceholderText('Start year'), '2020')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(api.createEducation).toHaveBeenCalledWith(
      expect.objectContaining({ school: 'MIT', startYear: 2020 })
    ))
  })
})

describe('CertificationsSection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders existing certifications', async () => {
    vi.mocked(api.getCertifications).mockResolvedValue([
      { id: '1', nameSv: 'AWS Cloud', nameEn: null, year: 2022, link: null },
    ])
    render(<CertificationsSection />, { wrapper: makeWrapper() })
    expect(await screen.findByText('AWS Cloud (2022)')).toBeInTheDocument()
  })

  it('opens add form and calls createCertification on submit', async () => {
    vi.mocked(api.getCertifications).mockResolvedValue([])
    vi.mocked(api.createCertification).mockResolvedValue({
      id: '2', nameSv: null, nameEn: null, year: 2023, link: null,
    })
    render(<CertificationsSection />, { wrapper: makeWrapper() })
    await userEvent.click(screen.getByRole('button', { name: '+ Add certification' }))
    await userEvent.type(screen.getByPlaceholderText('Year'), '2023')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(api.createCertification).toHaveBeenCalledWith(
      expect.objectContaining({ year: 2023 })
    ))
  })
})

describe('LanguagesSection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders existing languages with proficiency', async () => {
    vi.mocked(api.getLanguages).mockResolvedValue([
      { id: '1', name: 'Swedish', proficiency: 'Native' },
    ])
    render(<LanguagesSection />, { wrapper: makeWrapper() })
    expect(await screen.findByText('Swedish — Native')).toBeInTheDocument()
  })

  it('opens add form and calls createLanguage on submit', async () => {
    vi.mocked(api.getLanguages).mockResolvedValue([])
    vi.mocked(api.createLanguage).mockResolvedValue({ id: '2', name: 'English', proficiency: 'Fluent' })
    render(<LanguagesSection />, { wrapper: makeWrapper() })
    await userEvent.click(screen.getByRole('button', { name: '+ Add language' }))
    await userEvent.type(screen.getByPlaceholderText('Language'), 'English')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(api.createLanguage).toHaveBeenCalledWith({ name: 'English', proficiency: 'Fluent' }))
  })
})
