import { useEffect, useState } from 'react'
import { getUserById, type UserDto } from '../api/users'

export const useUser = (id: string | undefined) => {
  const [user, setUser] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getUserById(id)
        setUser(data)
      } catch (err) {
        console.error('useUser error', err)
        setError('Failed to load user')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [id])

  return { user, isLoading, error }
}
