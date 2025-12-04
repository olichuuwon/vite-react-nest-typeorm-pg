import { useQuery } from '@tanstack/react-query'
import { getAttendanceByUser, type AttendanceRecordDto } from '../api/attendance'
import { useAuth } from '../context/AuthContext'

export const useUserAttendance = (userId: string | undefined) => {
  const { isAuthenticated } = useAuth()

  const { data, isLoading, error } = useQuery<AttendanceRecordDto[]>({
    queryKey: ['attendance', 'byUser', userId],
    enabled: isAuthenticated && !!userId,
    queryFn: () => {
      if (!userId) {
        return Promise.reject(new Error('No userId provided'))
      }
      return getAttendanceByUser(userId)
    },
  })

  return {
    records: data ?? [],
    isLoading,
    error,
  }
}
