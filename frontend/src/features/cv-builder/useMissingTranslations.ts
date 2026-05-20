interface ResolvedText { text: string; fallbackUsed: boolean }
interface ResolvedAssignment {
  title: ResolvedText; description: ResolvedText; isDescriptionOverridden: boolean
}
interface ResolvedEducation { degree: ResolvedText }
interface ResolvedCertification { name: ResolvedText }
interface ResolvedCv {
  introduction: ResolvedText
  isIntroductionOverridden: boolean
  assignments: ResolvedAssignment[]
  educations: ResolvedEducation[]
  certifications: ResolvedCertification[]
}

export function useMissingTranslations(cv: ResolvedCv): number {
  let count = 0

  if (!cv.isIntroductionOverridden && cv.introduction.fallbackUsed) count++

  for (const a of cv.assignments) {
    if (a.title.fallbackUsed) count++
    if (!a.isDescriptionOverridden && a.description.fallbackUsed) count++
  }

  for (const e of cv.educations) {
    if (e.degree.fallbackUsed) count++
  }

  for (const c of cv.certifications) {
    if (c.name.fallbackUsed) count++
  }

  return count
}
