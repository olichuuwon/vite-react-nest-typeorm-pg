import { api } from './client'
import type { UserDto, LoginResponseDto } from './../../../shared/dto/auth.dto'

export const loginWithIdentifier = async (identifier: string) => {
  const trimmed = identifier.trim()
  if (!trimmed) {
    throw new Error('Identifier is required')
  }

  const res = await api.post<LoginResponseDto>('/auth/login', {
    identifier: trimmed,
  })
  return res.data
}

export const fetchMe = async () => {
  const res = await api.get<UserDto>('/auth/me')
  return res.data
}
