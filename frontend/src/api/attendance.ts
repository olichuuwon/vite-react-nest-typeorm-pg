import { api } from './client'
import type { ActivityDto } from './activities'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export type AttendanceRecordDto = {
  id: string
  activityId: string
  userId: string
  status: AttendanceStatus
  checkedInAt?: string | null
  checkedOutAt?: string | null
  remarks?: string | null
  createdAt: string
  updatedAt: string
  activity?: ActivityDto
}

export async function getAttendanceByUser(userId: string): Promise<AttendanceRecordDto[]> {
  const res = await api.get<AttendanceRecordDto[]>(`/attendance/user/${userId}`)
  return res.data
}
