import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import type { UserDto } from './../../../shared/dto/auth.dto'

export const useMe = () => {
  const { isAuthenticated } = useAuth()

  return useQuery<UserDto>({
    queryKey: ['me'],
    enabled: isAuthenticated,
    queryFn: fetchMe,
  })
}
