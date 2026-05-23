import { render, screen } from '@testing-library/react'
import { CVPreview } from './CVPreview'
import type { ResolvedCv } from '../cv-builder/cvBuilderApi'

const baseCv: ResolvedCv = {
  firstName: 'Jane', lastName: 'Doe', pictureUrl: null,
  introduction: { text: 'Experienced developer', fallbackUsed: false },
  isIntroductionOverridden: false,
  assignments: [], skills: [], educations: [], certifications: [], languages: [],
  language: 'EN', yearsOfExperience: null,
}

// PDF mode now renders content multiple times (one hidden measurement copy + N visible
// clip-window copies), so single-element queries like getByText would fail. Helpers
// below tolerate any number of matches ≥ 1.
function expectPresent(text: string | RegExp) {
  expect(screen.getAllByText(text).length).toBeGreaterThan(0)
}
function expectHeading(name: string, level?: number) {
  expect(screen.getAllByRole('heading', level === undefined ? { name } : { name, level }).length).toBeGreaterThan(0)
}
function firstWithText(text: string | RegExp) {
  return screen.getAllByText(text)[0]
}

describe('CVPreview', () => {
  it('renders name', () => {
    render(<CVPreview cv={baseCv} />)
    expectHeading('Jane Doe')
  })

  it('renders introduction', () => {
    render(<CVPreview cv={baseCv} />)
    expectPresent('Experienced developer')
  })

  it('renders skills', () => {
    const cv: ResolvedCv = {
      ...baseCv,
      skills: [{ id: '1', name: 'TypeScript', category: 'Frontend', displayOrder: 0 }],
    }
    render(<CVPreview cv={cv} />)
    expectPresent('TypeScript')
  })

  it('renders regular assignment', () => {
    const cv: ResolvedCv = {
      ...baseCv,
      assignments: [{
        id: '1', title: { text: 'Backend Dev', fallbackUsed: false },
        description: { text: 'Built APIs', fallbackUsed: false },
        client: 'Acme', startDate: '2023-01-01', endDate: null,
        isHighlighted: false, displayOrder: 0, isDescriptionOverridden: false, skills: [],
      }],
    }
    render(<CVPreview cv={cv} />)
    expectHeading('Backend Dev')
    expectPresent('Acme')
  })

  it('renders highlighted assignments in highlighted projects section', () => {
    const cv: ResolvedCv = {
      ...baseCv,
      assignments: [{
        id: '1', title: { text: 'Key Project', fallbackUsed: false },
        description: { text: '', fallbackUsed: false },
        client: 'BigCo', startDate: '2022-01-01', endDate: '2023-01-01',
        isHighlighted: true, displayOrder: 0, isDescriptionOverridden: false, skills: [],
      }],
    }
    render(<CVPreview cv={cv} />)
    expectPresent('Highlighted Projects')
    expectHeading('Key Project', 3)
  })

  it('renders education', () => {
    const cv: ResolvedCv = {
      ...baseCv,
      educations: [{
        id: '1', degree: { text: 'M.Sc.', fallbackUsed: false },
        school: 'KTH', startYear: 2018, endYear: 2021, displayOrder: 0,
      }],
    }
    render(<CVPreview cv={cv} />)
    expectPresent(/KTH/)
  })

  it('renders language', () => {
    const cv: ResolvedCv = {
      ...baseCv,
      languages: [{ id: '1', name: 'Swedish', proficiency: 'Native', displayOrder: 0 }],
    }
    render(<CVPreview cv={cv} />)
    expectPresent('Swedish')
    expectPresent('Native')
  })

  it('renders front page groups below highlighted assignments', () => {
    const cv: ResolvedCv = {
      ...baseCv,
      frontPageGroups: [
        {
          id: 'g1', header: 'Cloud Skills', headerFallbackUsed: false, displayOrder: 0,
          items: [
            { id: 'i1', label: 'Azure', displayOrder: 0 },
            { id: 'i2', label: 'Kubernetes', displayOrder: 1 },
          ],
        },
      ],
    }
    render(<CVPreview cv={cv} />)
    expectPresent('Cloud Skills')
    expectPresent('Azure')
    expectPresent('Kubernetes')
  })

  it('renders no front page groups section when none present', () => {
    render(<CVPreview cv={baseCv} />)
    expect(screen.queryAllByRole('list').length).toBe(0)
  })

  describe('Multi-page mode (Slice 11)', () => {
    it('renders content in builder mode (showBoundary)', () => {
      render(<CVPreview cv={baseCv} showBoundary />)
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0)
    })

    it('renders content in pdf mode (no showBoundary)', () => {
      render(<CVPreview cv={baseCv} />)
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0)
    })
  })

  describe('Fallback highlights (Slice 12)', () => {
    it('highlights fallback introduction with yellow class', () => {
      const cv: ResolvedCv = {
        ...baseCv,
        introduction: { text: 'Swedish text', fallbackUsed: true },
        isIntroductionOverridden: false,
      }
      render(<CVPreview cv={cv} />)
      expect(firstWithText('Swedish text').className).toContain('bg-yellow-100')
    })

    it('does not highlight introduction when overridden', () => {
      const cv: ResolvedCv = {
        ...baseCv,
        introduction: { text: 'Override', fallbackUsed: true },
        isIntroductionOverridden: true,
      }
      render(<CVPreview cv={cv} />)
      expect(firstWithText('Override').className).not.toContain('bg-yellow-100')
    })

    it('highlights fallback assignment title', () => {
      const cv: ResolvedCv = {
        ...baseCv,
        assignments: [{
          id: '1', title: { text: 'Swedish Title', fallbackUsed: true },
          description: { text: '', fallbackUsed: false },
          client: 'X', startDate: '2023-01-01', endDate: null,
          isHighlighted: false, displayOrder: 0, isDescriptionOverridden: false, skills: [],
        }],
      }
      render(<CVPreview cv={cv} />)
      expect(screen.getAllByRole('heading', { name: 'Swedish Title' })[0].className).toContain('bg-yellow-100')
    })

    it('does not highlight non-fallback introduction', () => {
      render(<CVPreview cv={baseCv} />)
      expect(firstWithText('Experienced developer').className).not.toContain('bg-yellow-100')
    })
  })
})
