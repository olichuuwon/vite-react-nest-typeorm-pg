import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  ForbiddenException,
} from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";
import { AttendanceRecord } from "./attendance.entity";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import type { User } from "../user/user.entity";
import type { AttendanceRecordDto } from "../../../shared/dto/attendance.dto";

const toAttendanceRecordDto = (
  record: AttendanceRecord
): AttendanceRecordDto => {
  return {
    id: record.id,

    activityId: record.activityId,
    userId: record.userId,
    userName: record.user?.name ?? null,

    activity: record.activity
      ? {
          id: record.activity.id,
          title: record.activity.title ?? null,
        }
      : null,

    status: record.status,

    checkedInAt: record.checkedInAt ? record.checkedInAt.toISOString() : null,
    checkedOutAt: record.checkedOutAt
      ? record.checkedOutAt.toISOString()
      : null,

    remarks: record.remarks ?? null,

    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
};

@Roles("admin", "member")
@Controller("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ADMIN
  @Get()
  async findAll(@CurrentUser() user: User): Promise<AttendanceRecordDto[]> {
    if (user.role !== "admin") {
      throw new ForbiddenException("Admins only");
    }
    const records = await this.attendanceService.findAll();
    return records.map(toAttendanceRecordDto);
  }

  @Get(":id")
  async findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @CurrentUser() user: User
  ): Promise<AttendanceRecordDto> {
    if (user.role !== "admin") {
      throw new ForbiddenException("Admins only");
    }
    const record = await this.attendanceService.findOne(id);
    return toAttendanceRecordDto(record);
  }

  @Delete(":id")
  async remove(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @CurrentUser() user: User
  ): Promise<void> {
    if (user.role !== "admin") {
      throw new ForbiddenException("Admins only");
    }
    return this.attendanceService.remove(id);
  }

  @Get("activity/:activityId")
  async findByActivity(
    @Param("activityId", new ParseUUIDPipe({ version: "4" }))
    activityId: string,
    @CurrentUser() user: User
  ): Promise<AttendanceRecordDto[]> {
    if (user.role !== "admin") {
      throw new ForbiddenException("Admins only");
    }
    const records = await this.attendanceService.findByActivity(activityId);
    return records.map(toAttendanceRecordDto);
  }

  // MEMBER + ADMIN
  @Get("user/:userId")
  async findByUser(
    @Param("userId", new ParseUUIDPipe({ version: "4" })) userId: string,
    @CurrentUser() user: User
  ): Promise<AttendanceRecordDto[]> {
    const effectiveUserId = user.role === "member" ? user.id : userId;
    const records = await this.attendanceService.findByUser(effectiveUserId);
    return records.map(toAttendanceRecordDto);
  }

  @Post()
  async create(
    @Body() dto: CreateAttendanceDto,
    @CurrentUser() user: User
  ): Promise<AttendanceRecordDto> {
    const effectiveUserId = user.role === "member" ? user.id : dto.userId;
    const record = await this.attendanceService.create({
      ...dto,
      userId: effectiveUserId,
    });
    return toAttendanceRecordDto(record);
  }

  @Put(":id")
  async update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateAttendanceDto,
    @CurrentUser() user: User
  ): Promise<AttendanceRecordDto> {
    const effectiveUserId =
      user.role === "member" ? user.id : (dto.userId ?? user.id); // admin can pass explicit userId if needed

    const record = await this.attendanceService.update(id, {
      ...dto,
      userId: effectiveUserId,
    });

    return toAttendanceRecordDto(record);
  }
}
