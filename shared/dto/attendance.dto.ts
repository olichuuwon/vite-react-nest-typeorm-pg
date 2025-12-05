export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceActivitySummaryDto {
  id: string;
  title: string | null;
}

export interface AttendanceRecordDto {
  id: string;

  activityId: string;
  userId: string;

  userName?: string | null;

  activity?: AttendanceActivitySummaryDto | null;

  status: AttendanceStatus;

  checkedInAt?: string | null;
  checkedOutAt?: string | null;

  remarks?: string | null;

  createdAt: string;
  updatedAt: string;
}
