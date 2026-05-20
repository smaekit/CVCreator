import { api } from '../../lib/api'

export interface SkillDto { id: string; name: string; category: string | null }
export const getSkills = () => api.get<SkillDto[]>('/profile/skills').then(r => r.data)
export const createSkill = (data: { name: string; category: string | null }) =>
  api.post<SkillDto>('/profile/skills', data).then(r => r.data)
export const updateSkill = (id: string, data: { name: string; category: string | null }) =>
  api.put<SkillDto>(`/profile/skills/${id}`, data).then(r => r.data)
export const deleteSkill = (id: string) => api.delete(`/profile/skills/${id}`)

export interface EducationDto {
  id: string; degreeSv: string | null; degreeEn: string | null
  school: string; startYear: number; endYear: number | null
}
export const getEducations = () => api.get<EducationDto[]>('/profile/education').then(r => r.data)
export const createEducation = (data: Omit<EducationDto, 'id'>) =>
  api.post<EducationDto>('/profile/education', data).then(r => r.data)
export const updateEducation = (id: string, data: Omit<EducationDto, 'id'>) =>
  api.put<EducationDto>(`/profile/education/${id}`, data).then(r => r.data)
export const deleteEducation = (id: string) => api.delete(`/profile/education/${id}`)

export interface CertificationDto {
  id: string; nameSv: string | null; nameEn: string | null; year: number; link: string | null
}
export const getCertifications = () =>
  api.get<CertificationDto[]>('/profile/certifications').then(r => r.data)
export const createCertification = (data: Omit<CertificationDto, 'id'>) =>
  api.post<CertificationDto>('/profile/certifications', data).then(r => r.data)
export const updateCertification = (id: string, data: Omit<CertificationDto, 'id'>) =>
  api.put<CertificationDto>(`/profile/certifications/${id}`, data).then(r => r.data)
export const deleteCertification = (id: string) => api.delete(`/profile/certifications/${id}`)

export interface LanguageDto { id: string; name: string; proficiency: string }
export const getLanguages = () => api.get<LanguageDto[]>('/profile/languages').then(r => r.data)
export const createLanguage = (data: { name: string; proficiency: string }) =>
  api.post<LanguageDto>('/profile/languages', data).then(r => r.data)
export const updateLanguage = (id: string, data: { name: string; proficiency: string }) =>
  api.put<LanguageDto>(`/profile/languages/${id}`, data).then(r => r.data)
export const deleteLanguage = (id: string) => api.delete(`/profile/languages/${id}`)
