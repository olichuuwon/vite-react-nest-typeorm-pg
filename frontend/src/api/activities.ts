import { api } from './client'
import type { ActivityDto } from '../../../shared/dto/activity.dto'

export type CreateActivityPayload = {
  title: string
  description?: string | null
  date?: string | null
  startAt?: string | null
  endAt?: string | null
  location?: string | null
}

export async function createActivity(payload: CreateActivityPayload): Promise<ActivityDto> {
  const { data } = await api.post<ActivityDto>('/activities', payload)
  return data
}

export async function getActivities(): Promise<ActivityDto[]> {
  const { data } = await api.get<ActivityDto[]>('/activities')
  return data
}

export async function getActivitiesCreatedBy(userId: string): Promise<ActivityDto[]> {
  const { data } = await api.get<ActivityDto[]>('/activities', {
    params: { createdByUserId: userId },
  })
  return data
}

export async function deleteActivity(id: string): Promise<void> {
  await api.delete(`/activities/${id}`)
}
