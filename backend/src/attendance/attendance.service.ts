import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AttendanceRecord } from "./attendance.entity";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>
  ) {}

  findAll(): Promise<AttendanceRecord[]> {
    return this.attendanceRepo.find({
      relations: ["activity", "user"],
      order: { createdAt: "ASC" },
    });
  }

  async findOne(id: string): Promise<AttendanceRecord> {
    const record = await this.attendanceRepo.findOne({
      where: { id },
      relations: ["activity", "user"],
    });

    if (!record) {
      throw new NotFoundException(`Attendance record ${id} not found`);
    }

    return record;
  }

  async remove(id: string): Promise<void> {
    const result = await this.attendanceRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Attendance record ${id} not found`);
    }
  }

  findByActivity(activityId: string): Promise<AttendanceRecord[]> {
    return this.attendanceRepo.find({
      where: { activityId },
      relations: ["activity", "user"],
      order: { createdAt: "ASC" },
    });
  }

  findByUser(userId: string): Promise<AttendanceRecord[]> {
    return this.attendanceRepo.find({
      where: { userId },
      relations: ["activity", "user"],
      order: { createdAt: "ASC" },
    });
  }

  async create(dto: CreateAttendanceDto): Promise<AttendanceRecord> {
    const now = new Date();

    const record = this.attendanceRepo.create({
      ...dto,
      status: dto.status ?? "present",
      checkedInAt: dto.checkedInAt ? new Date(dto.checkedInAt) : now,
    });

    try {
      return await this.attendanceRepo.save(record);
    } catch (error: any) {
      // Handle foreign key violations (23503)
      if (error.code === "23503") {
        const detail = error.detail || "";
        if (
          detail.includes("userId") &&
          detail.includes('not present in table "users"')
        ) {
          throw new NotFoundException(`User with id ${dto.userId} not found`);
        }
        if (
          detail.includes("activityId") &&
          detail.includes('not present in table "activities"')
        ) {
          throw new NotFoundException(
            `Activity with id ${dto.activityId} not found`
          );
        }
      }
      // Handle duplicate attendance (23505)
      if (error.code === "23505") {
        const detail = error.detail || "";
        if (
          detail.includes("activityId") &&
          detail.includes("userId") &&
          detail.includes("already exists")
        ) {
          throw new ConflictException(
            `Attendance already recorded for this user and activity`
          );
        }
      }
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateAttendanceDto
  ): Promise<AttendanceRecord> {
    const existing = await this.attendanceRepo.findOne({
      where: { id },
      relations: ["activity", "user"],
    });

    if (!existing) {
      throw new NotFoundException(`Attendance record ${id} not found`);
    }

    const updated = this.attendanceRepo.merge(existing, {
      ...dto,
      checkedInAt: dto.checkedInAt
        ? new Date(dto.checkedInAt)
        : existing.checkedInAt,
    });

    return this.attendanceRepo.save(updated);
  }
}
