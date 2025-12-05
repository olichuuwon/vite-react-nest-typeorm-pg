import { useQuery } from '@tanstack/react-query'
import { getActivities, type ActivityDto } from '../api/activities'
import { useAuth } from '../context/AuthContext'

export const useActivities = () => {
  const { isAuthenticated } = useAuth()

  const { data, isLoading, error } = useQuery<ActivityDto[]>({
    queryKey: ['activities'],
    queryFn: getActivities,
    enabled: isAuthenticated,
  })

  return {
    activities: data ?? [],
    isLoading,
    error,
  }
}
