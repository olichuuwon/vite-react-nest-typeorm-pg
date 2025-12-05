import { api } from './client'
import type { AttendanceRecordDto, AttendanceStatus } from '../../../shared/dto/attendance.dto'

export async function getAttendanceByUser(userId: string): Promise<AttendanceRecordDto[]> {
  const { data } = await api.get<AttendanceRecordDto[]>(`/attendance/user/${userId}`)
  return data
}

export async function getAttendanceByActivity(activityId: string): Promise<AttendanceRecordDto[]> {
  const { data } = await api.get<AttendanceRecordDto[]>(`/attendance/activity/${activityId}`)
  return data
}

export async function markAttendanceForActivity(
  activityId: string,
  userId: string,
  status: AttendanceStatus,
): Promise<AttendanceRecordDto> {
  const { data } = await api.post<AttendanceRecordDto>('/attendance', {
    activityId,
    userId,
    status,
  })
  return data
}

export type UpdateAttendancePayload = {
  status?: AttendanceStatus
  checkedInAt?: string | null
  checkedOutAt?: string | null
  remarks?: string | null
}

export async function updateAttendance(
  id: string,
  payload: UpdateAttendancePayload,
): Promise<AttendanceRecordDto> {
  const { data } = await api.put<AttendanceRecordDto>(`/attendance/${id}`, payload)
  return data
}

export async function removeAttendance(id: string): Promise<void> {
  await api.delete(`/attendance/${id}`)
}
