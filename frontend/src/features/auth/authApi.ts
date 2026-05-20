import { api } from '../../lib/api'

export const register = (email: string, password: string) =>
  api.post('/auth/register', { email, password })

export const login = async (email: string, password: string): Promise<string> => {
  const { data } = await api.post<{ token: string }>('/auth/login', { email, password })
  return data.token
}
