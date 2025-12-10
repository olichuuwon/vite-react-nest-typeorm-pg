import { api } from './client'
import type { ActivityDto } from '../../../shared/dto/activity.dto'

export async function getActivities(): Promise<ActivityDto[]> {
  const res = await api.get<ActivityDto[]>('/activities')
  return res.data
}

export async function getActivityById(id: string): Promise<ActivityDto> {
  const res = await api.get<ActivityDto>(`/activities/${id}`)
  return res.data
}

export async function getActivitiesCreatedBy(userId: string): Promise<ActivityDto[]> {
  const res = await api.get<ActivityDto[]>(`/activities/created-by/${userId}`)
  return res.data
}
