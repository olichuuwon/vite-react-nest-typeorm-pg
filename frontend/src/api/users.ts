import { api } from './client'

export type UserDto = {
  id: string
  name: string
  identifier: string
  email?: string | null
  role: 'admin' | 'member'
  createdAt: string
  updatedAt: string
}

export async function getUsers(): Promise<UserDto[]> {
  const res = await api.get<UserDto[]>('/users')
  return res.data
}

export async function getUserById(id: string): Promise<UserDto> {
  const res = await api.get<UserDto>(`/users/${id}`)
  return res.data
}
