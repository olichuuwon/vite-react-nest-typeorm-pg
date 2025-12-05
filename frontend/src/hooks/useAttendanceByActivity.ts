import { useQuery } from '@tanstack/react-query'
import { getAttendanceByActivity } from '../api/attendance'
import type { AttendanceRecordDto } from '../../../shared/dto/attendance.dto'

export const useAttendanceByActivity = (activityId: string | undefined) => {
  const { data, isLoading, error } = useQuery<AttendanceRecordDto[]>({
    queryKey: ['attendance', 'activity', activityId],
    enabled: !!activityId,
    queryFn: () => {
      if (!activityId) {
        throw new Error('No activityId provided')
      }
      return getAttendanceByActivity(activityId)
    },
  })

  return {
    records: data ?? [],
    isLoading,
    error,
  }
}
