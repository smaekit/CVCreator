import { api } from '../../lib/api'

export interface ProfileData {
  firstName: string
  lastName: string
  pictureUrl: string | null
  introductionSv: string | null
  introductionEn: string | null
}

export interface UpsertProfilePayload {
  firstName: string
  lastName: string
  introductionSv: string | null
  introductionEn: string | null
}

export const getProfile = async (): Promise<ProfileData | null> => {
  try {
    const { data } = await api.get<ProfileData>('/profile')
    return data
  } catch (err: unknown) {
    if ((err as { response?: { status?: number } })?.response?.status === 404) return null
    throw err
  }
}

export const upsertProfile = async (payload: UpsertProfilePayload): Promise<ProfileData> => {
  const { data } = await api.put<ProfileData>('/profile', payload)
  return data
}

export const uploadPicture = async (file: File): Promise<string> => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ url: string }>('/profile/picture', form)
  return data.url
}
