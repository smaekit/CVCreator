import { api } from '../../lib/api'

export interface CvDto {
  id: string
  name: string
  company: string
  language: string
  createdAt: string
}

export const getCvs = () => api.get<CvDto[]>('/cvs').then(r => r.data)
export const createCv = (data: { company: string; language: string }) =>
  api.post<CvDto>('/cvs', data).then(r => r.data)
export const deleteCv = (id: string) => api.delete(`/cvs/${id}`)
