import { useQuery } from '@tanstack/react-query'
import type { AttendanceRecordDto } from '../../../shared/dto/attendance.dto'
import { getAttendanceByUser } from '../api/attendance'

export const useUserAttendance = (userId?: string) => {
  const { data, isLoading, error } = useQuery<AttendanceRecordDto[]>({
    queryKey: ['attendance', 'byUser', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return []
      return getAttendanceByUser(userId)
    },
  })

  return {
    records: data ?? [],
    isLoading,
    error: error ?? null,
  }
}
