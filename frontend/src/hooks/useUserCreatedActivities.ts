import { useQuery } from '@tanstack/react-query'
import { getActivitiesCreatedBy } from '../api/activities'
import type { ActivityDto } from '../../../shared/dto/activity.dto'
import { useAuth } from '../context/AuthContext'

export const useUserCreatedActivities = (userId: string | undefined) => {
  const { isAuthenticated } = useAuth()

  const { data, isLoading, error } = useQuery<ActivityDto[]>({
    queryKey: ['activities', 'createdBy', userId],
    queryFn: () => {
      if (!userId) {
        return Promise.resolve([])
      }
      return getActivitiesCreatedBy(userId)
    },
    enabled: isAuthenticated && !!userId,
  })

  return {
    activities: data ?? [],
    isLoading,
    error,
  }
}
