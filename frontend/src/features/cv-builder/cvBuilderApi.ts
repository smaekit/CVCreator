import { api } from '../../lib/api'

export interface ResolvedText { text: string; fallbackUsed: boolean }

export interface ResolvedAssignment {
  id: string
  title: ResolvedText; description: ResolvedText
  client: string; startDate: string; endDate: string | null
  isHighlighted: boolean; displayOrder: number; isDescriptionOverridden: boolean
  skills: string[]
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

export interface ResolvedFrontPageGroupItem { id: string; label: string; displayOrder: number }

export interface ResolvedFrontPageGroup {
  id: string; header: string; headerFallbackUsed: boolean; displayOrder: number
  items: ResolvedFrontPageGroupItem[]
}

export interface ResolvedCv {
  firstName: string; lastName: string; pictureUrl: string | null
  introduction: ResolvedText; isIntroductionOverridden: boolean
  assignments: ResolvedAssignment[]
  skills: ResolvedSkill[]
  educations: ResolvedEducation[]
  certifications: ResolvedCertification[]
  languages: ResolvedLanguage[]
  language: string; yearsOfExperience: string | null
  frontPageGroups?: ResolvedFrontPageGroup[]
}

export interface SelectionItem { id: string; displayOrder: number; isHighlighted?: boolean; descriptionOverride?: string | null }

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
export const updateOverrides = (id: string, body: { introductionOverride: string | null; yearsOfExperience: string | null }) =>
  api.put(`/cvs/${id}/overrides`, body)
export const downloadPdf = (id: string): Promise<Blob> =>
  api.post(`/cvs/${id}/pdf`, {}, { responseType: 'blob' }).then(r => r.data)
