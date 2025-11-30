import { useEffect, useState } from 'react'
import { getUsers, type UserDto } from '../api/users'

export const useUsers = () => {
  const [users, setUsers] = useState<UserDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getUsers()
        setUsers(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load users')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  return { users, isLoading, error }
}
