import { User } from "../user/user.entity";
import { Activity } from "../activity/activity.entity";
import { AttendanceRecord } from "../attendance/attendance.entity";

export const createMockUser = (override: Partial<User> = {}): User => ({
  id: override.id ?? "user-1",
  name: override.name ?? "Test User",
  identifier: override.identifier ?? "test-user-1",
  email: override.email ?? undefined,
  role: override.role ?? "member",
  attendanceRecords: override.attendanceRecords ?? [],
  createdActivities: override.createdActivities ?? [],
  createdAt: override.createdAt ?? new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: override.updatedAt ?? new Date("2025-01-01T00:00:00.000Z"),
});

export const createMockActivity = (
  override: Partial<Activity> = {}
): Activity => ({
  id: override.id ?? "activity-1",
  title: override.title ?? "Test Activity",
  description: override.description ?? undefined,
  date: override.date ?? undefined,
  startAt: override.startAt ?? undefined,
  endAt: override.endAt ?? undefined,
  location: override.location ?? undefined,
  createdBy: override.createdBy ?? undefined, // optional in entity
  createdByUserId: override.createdByUserId ?? undefined,
  attendanceRecords: override.attendanceRecords ?? [],
  createdAt: override.createdAt ?? new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: override.updatedAt ?? new Date("2025-01-01T00:00:00.000Z"),
});

export const createMockAttendance = (
  override: Partial<AttendanceRecord> = {}
): AttendanceRecord => {
  const activity = override.activity ?? createMockActivity();
  const user = override.user ?? createMockUser();

  return {
    id: override.id ?? "attendance-1",
    activity,
    activityId: override.activityId ?? activity.id,
    user,
    userId: override.userId ?? user.id,
    status: override.status ?? "present",
    checkedInAt: override.checkedInAt ?? undefined,
    checkedOutAt: override.checkedOutAt ?? undefined,
    remarks: override.remarks ?? undefined,
    createdAt: override.createdAt ?? new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: override.updatedAt ?? new Date("2025-01-01T00:00:00.000Z"),
  };
};
