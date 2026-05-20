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

describe('CVPreview', () => {
  it('renders name', () => {
    render(<CVPreview cv={baseCv} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders introduction', () => {
    render(<CVPreview cv={baseCv} />)
    expect(screen.getByText('Experienced developer')).toBeInTheDocument()
  })

  it('renders years of experience when present', () => {
    render(<CVPreview cv={{ ...baseCv, yearsOfExperience: '10' }} />)
    expect(screen.getByText(/10 years of experience/)).toBeInTheDocument()
  })

  it('renders skills', () => {
    const cv: ResolvedCv = {
      ...baseCv,
      skills: [{ id: '1', name: 'TypeScript', category: 'Frontend', displayOrder: 0 }],
    }
    render(<CVPreview cv={cv} />)
    expect(screen.getByText('TypeScript (Frontend)')).toBeInTheDocument()
  })

  it('renders regular assignment', () => {
    const cv: ResolvedCv = {
      ...baseCv,
      assignments: [{
        id: '1', title: { text: 'Backend Dev', fallbackUsed: false },
        description: { text: 'Built APIs', fallbackUsed: false },
        client: 'Acme', startDate: '2023-01-01', endDate: null,
        isHighlighted: false, displayOrder: 0, isDescriptionOverridden: false,
      }],
    }
    render(<CVPreview cv={cv} />)
    expect(screen.getByText('Backend Dev')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
  })

  it('renders highlighted assignments in key assignments section', () => {
    const cv: ResolvedCv = {
      ...baseCv,
      assignments: [{
        id: '1', title: { text: 'Key Project', fallbackUsed: false },
        description: { text: '', fallbackUsed: false },
        client: 'BigCo', startDate: '2022-01-01', endDate: '2023-01-01',
        isHighlighted: true, displayOrder: 0, isDescriptionOverridden: false,
      }],
    }
    render(<CVPreview cv={cv} />)
    expect(screen.getByText('Key Assignments')).toBeInTheDocument()
    expect(screen.getByText('Key Project')).toBeInTheDocument()
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
    expect(screen.getByText(/KTH/)).toBeInTheDocument()
  })

  it('renders language', () => {
    const cv: ResolvedCv = {
      ...baseCv,
      languages: [{ id: '1', name: 'Swedish', proficiency: 'Native', displayOrder: 0 }],
    }
    render(<CVPreview cv={cv} />)
    expect(screen.getByText('Swedish — Native')).toBeInTheDocument()
  })
})
