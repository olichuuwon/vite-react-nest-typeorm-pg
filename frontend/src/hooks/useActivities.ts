import { useEffect, useState } from 'react'
import { getActivities, type ActivityDto } from '../api/activities'

export const useActivities = () => {
  const [activities, setActivities] = useState<ActivityDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getActivities()
        setActivities(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load activities')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  return { activities, isLoading, error }
}
