import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { useAuth } from './AuthContext'
import type { UserDto } from './../../../../shared/dto/auth.dto'

export const useMe = () => {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['me'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await api.get<UserDto>('/auth/me')
      return res.data
    },
  })
}
