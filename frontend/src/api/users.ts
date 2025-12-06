import { api } from './client'
import type { UserDto } from './../../../shared/dto/user.dto'

export async function getUsers(): Promise<UserDto[]> {
  const res = await api.get<UserDto[]>('/users')
  return res.data
}

export async function getUserById(id: string): Promise<UserDto> {
  const res = await api.get<UserDto>(`/users/${id}`)
  return res.data
}
