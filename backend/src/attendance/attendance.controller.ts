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

@Controller("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  findAll(): Promise<AttendanceRecord[]> {
    return this.attendanceService.findAll();
  }

  @Get(":id")
  findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<AttendanceRecord> {
    return this.attendanceService.findOne(id);
  }

  @Delete(":id")
  @Roles("admin")
  remove(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<void> {
    return this.attendanceService.remove(id);
  }

  @Get("activity/:activityId")
  @Roles("admin")
  findByActivity(
    @Param("activityId", new ParseUUIDPipe({ version: "4" })) activityId: string
  ): Promise<AttendanceRecord[]> {
    return this.attendanceService.findByActivity(activityId);
  }

  @Get("user/:userId")
  @Roles("admin")
  findByUser(
    @Param("userId", new ParseUUIDPipe({ version: "4" })) userId: string
  ): Promise<AttendanceRecord[]> {
    return this.attendanceService.findByUser(userId);
  }

  @Post()
  async create(
    @Body() dto: CreateAttendanceDto,
    @CurrentUser() user: User
  ): Promise<AttendanceRecord> {
    if (user.role === "member" && dto.userId !== user.id) {
      throw new ForbiddenException(
        "Members can only mark their own attendance"
      );
    }

    return this.attendanceService.create(dto);
  }

  @Put(":id")
  async update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateAttendanceDto,
    @CurrentUser() user: User
  ): Promise<AttendanceRecord> {
    if (user.role === "member" && dto.userId && dto.userId !== user.id) {
      throw new ForbiddenException(
        "Members can only update their own attendance"
      );
    }

    return this.attendanceService.update(id, dto);
  }
}
