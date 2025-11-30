import { useEffect, useState } from 'react'
import { getAttendanceByUser, type AttendanceRecordDto } from '../api/attendance'

export const useUserAttendance = (userId: string | undefined) => {
  const [records, setRecords] = useState<AttendanceRecordDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getAttendanceByUser(userId)
        setRecords(data)
      } catch (err: any) {
        console.error('useUserAttendance error', err)
        setError('Failed to load attendance records')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [userId])

  return { records, isLoading, error }
}
