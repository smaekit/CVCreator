import { api } from '../../lib/api'

export interface FrontPageGroupItemDto {
  id: string; skillId: string | null; certificationId: string | null; displayOrder: number
}

export interface FrontPageGroupDto {
  id: string; headerSv: string | null; headerEn: string | null; displayOrder: number
  items: FrontPageGroupItemDto[]
}

export interface GroupItemBody { skillId?: string | null; certificationId?: string | null; displayOrder: number }

export interface UpdateGroupBody {
  headerSv?: string | null; headerEn?: string | null; displayOrder: number
  items: GroupItemBody[]
}

export const getFrontPageGroups = (cvId: string) =>
  api.get<FrontPageGroupDto[]>(`/cvs/${cvId}/front-page-groups`).then(r => r.data)

export const createFrontPageGroup = (cvId: string, data: { headerSv?: string | null; headerEn?: string | null; displayOrder: number }) =>
  api.post<FrontPageGroupDto>(`/cvs/${cvId}/front-page-groups`, data).then(r => r.data)

export const updateFrontPageGroup = (cvId: string, groupId: string, data: UpdateGroupBody) =>
  api.put<FrontPageGroupDto>(`/cvs/${cvId}/front-page-groups/${groupId}`, data).then(r => r.data)

export const deleteFrontPageGroup = (cvId: string, groupId: string) =>
  api.delete(`/cvs/${cvId}/front-page-groups/${groupId}`)
