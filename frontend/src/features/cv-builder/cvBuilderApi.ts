import { api } from '../../lib/api'

export interface ResolvedText { text: string; fallbackUsed: boolean }

export interface ResolvedAssignment {
  id: string
  title: ResolvedText; description: ResolvedText
  client: string; startDate: string; endDate: string | null
  isHighlighted: boolean; displayOrder: number; isDescriptionOverridden: boolean
}

export interface ResolvedSkill { id: string; name: string; category: string | null; displayOrder: number }

export interface ResolvedEducation {
  id: string; degree: ResolvedText; school: string
  startYear: number; endYear: number | null; displayOrder: number
}

export interface ResolvedCertification {
  id: string; name: ResolvedText; year: number; link: string | null; displayOrder: number
}

export interface ResolvedLanguage { id: string; name: string; proficiency: string; displayOrder: number }

export interface ResolvedCv {
  firstName: string; lastName: string; pictureUrl: string | null
  introduction: ResolvedText; isIntroductionOverridden: boolean
  assignments: ResolvedAssignment[]
  skills: ResolvedSkill[]
  educations: ResolvedEducation[]
  certifications: ResolvedCertification[]
  languages: ResolvedLanguage[]
  language: string; yearsOfExperience: string | null
}

export interface SelectionItem { id: string; displayOrder: number; isHighlighted?: boolean }

export interface SelectionsBody {
  assignments: SelectionItem[]
  skills: SelectionItem[]
  educations: SelectionItem[]
  certifications: SelectionItem[]
  languages: SelectionItem[]
}

export const getCv = (id: string) => api.get<ResolvedCv>(`/cvs/${id}`).then(r => r.data)
export const updateSelections = (id: string, body: SelectionsBody) =>
  api.put(`/cvs/${id}/selections`, body)
