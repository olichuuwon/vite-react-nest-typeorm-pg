export interface ActivityDto {
  id: string;
  title: string;
  description?: string | null;

  date?: string | null;
  startAt?: string | null;
  endAt?: string | null;

  location?: string | null;

  createdByUserId?: string | null;
  createdByName?: string | null;

  createdAt: string;
  updatedAt: string;
}
