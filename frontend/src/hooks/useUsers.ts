import { useQuery } from '@tanstack/react-query'
import { getUsers, type UserDto } from '../api/users'
import { useAuth } from '../context/AuthContext'

export const useUsers = () => {
  const { isAuthenticated } = useAuth()

  const { data, isLoading, error } = useQuery<UserDto[]>({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: isAuthenticated,
  })

  return {
    users: data ?? [],
    isLoading,
    error,
  }
}
