import { useEffect, useState } from 'react'
import { getActivitiesCreatedBy, type ActivityDto } from '../api/activities'

export const useUserCreatedActivities = (userId: string | undefined) => {
  const [activities, setActivities] = useState<ActivityDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getActivitiesCreatedBy(userId)
        setActivities(data)
      } catch (err: any) {
        console.error('useUserCreatedActivities error', err?.response || err)
        setError('Failed to load created activities')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [userId])

  return { activities, isLoading, error }
}
