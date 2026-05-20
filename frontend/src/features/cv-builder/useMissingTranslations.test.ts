import { useMissingTranslations } from './useMissingTranslations'

describe('useMissingTranslations', () => {
  const makeResolvedCv = (overrides = {}) => ({
    firstName: 'Alice', lastName: 'Smith', pictureUrl: null,
    introduction: { text: '', fallbackUsed: false },
    isIntroductionOverridden: false,
    assignments: [],
    skills: [],
    educations: [],
    certifications: [],
    languages: [],
    language: 'EN',
    yearsOfExperience: null,
    ...overrides,
  })

  it('returns 0 when no fallbacks used', () => {
    const cv = makeResolvedCv()
    expect(useMissingTranslations(cv)).toBe(0)
  })

  it('counts introduction fallback', () => {
    const cv = makeResolvedCv({ introduction: { text: 'Hej', fallbackUsed: true } })
    expect(useMissingTranslations(cv)).toBe(1)
  })

  it('counts assignment title and description fallbacks separately', () => {
    const cv = makeResolvedCv({
      assignments: [{
        id: '1', title: { text: 'Swedish', fallbackUsed: true },
        description: { text: 'Also Swedish', fallbackUsed: true },
        client: 'X', startDate: '2022-01-01', endDate: null,
        isHighlighted: false, displayOrder: 0, isDescriptionOverridden: false
      }]
    })
    expect(useMissingTranslations(cv)).toBe(2)
  })

  it('does not count description override as fallback', () => {
    const cv = makeResolvedCv({
      assignments: [{
        id: '1', title: { text: 'Title', fallbackUsed: false },
        description: { text: 'Override', fallbackUsed: true },
        client: 'X', startDate: '2022-01-01', endDate: null,
        isHighlighted: false, displayOrder: 0, isDescriptionOverridden: true
      }]
    })
    expect(useMissingTranslations(cv)).toBe(0)
  })
})
