import { useQuery } from '@tanstack/react-query'
import { getUserById } from '../api/users'
import { useAuth } from '../context/AuthContext'
import type { UserDto } from './../../../shared/dto/user.dto'

export const useUser = (id: string | undefined) => {
  const { isAuthenticated } = useAuth()

  const { data, isLoading, error } = useQuery<UserDto>({
    queryKey: ['users', id],
    enabled: isAuthenticated && !!id,
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error('No user id provided'))
      }
      return getUserById(id)
    },
  })

  return {
    user: data ?? null,
    isLoading,
    error,
  }
}
