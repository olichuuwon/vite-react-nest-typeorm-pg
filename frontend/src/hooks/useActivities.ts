import { useQuery } from '@tanstack/react-query'
import { getActivities } from '../api/activities'
import { useAuth } from '../context/AuthContext'
import type { ActivityDto } from '../../../shared/dto/activity.dto'

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
