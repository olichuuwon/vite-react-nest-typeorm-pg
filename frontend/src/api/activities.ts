import { api } from './client'

export type ActivityDto = {
  id: string
  title: string
  date?: string
  location?: string
}

export async function getActivities(): Promise<ActivityDto[]> {
  const res = await api.get<ActivityDto[]>('/activities')
  return res.data
}
