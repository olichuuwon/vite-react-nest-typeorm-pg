import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import type { AttendanceStatus } from "../attendance.entity";

export class CreateAttendanceDto {
  @IsUUID()
  @IsNotEmpty()
  activityId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsIn(["present", "absent", "late", "excused"])
  @IsOptional()
  status?: AttendanceStatus;

  @IsDateString()
  @IsOptional()
  checkedInAt?: string;

  @IsDateString()
  @IsOptional()
  checkedOutAt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;
}
