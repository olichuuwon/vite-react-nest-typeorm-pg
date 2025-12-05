import { api } from './client'

export type ActivityDto = {
  id: string
  title: string
  description?: string | null
  date?: string | null
  startAt?: string | null
  endAt?: string | null
  location?: string | null
  createdByUserId?: string | null
  createdAt: string
  updatedAt: string
}

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
