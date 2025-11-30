import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AttendanceRecord } from "./attendance.entity";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";
import { User } from "../user/user.entity";
import { Activity } from "../activity/activity.entity";

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>
  ) {}

  findAll(): Promise<AttendanceRecord[]> {
    return this.attendanceRepo.find({
      relations: ["activity", "user"],
    });
  }

  async findOne(id: string): Promise<AttendanceRecord> {
    const record = await this.attendanceRepo.findOne({
      where: { id },
      relations: ["activity", "user"],
    });

    if (!record) {
      throw new NotFoundException(`Attendance record with id ${id} not found`);
    }

    return record;
  }

  async create(dto: CreateAttendanceDto): Promise<AttendanceRecord> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${dto.userId} not found`);
    }

    const activity = await this.activityRepo.findOne({
      where: { id: dto.activityId },
    });
    if (!activity) {
      throw new NotFoundException(
        `Activity with id ${dto.activityId} not found`
      );
    }

    const existing = await this.attendanceRepo.findOne({
      where: {
        userId: dto.userId,
        activityId: dto.activityId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Attendance already exists for user ${dto.userId} and activity ${dto.activityId}`
      );
    }

    const record = this.attendanceRepo.create({
      ...dto,
      status: dto.status ?? "present",
    });

    return this.attendanceRepo.save(record);
  }

  async update(
    id: string,
    dto: UpdateAttendanceDto
  ): Promise<AttendanceRecord> {
    const record = await this.findOne(id);
    Object.assign(record, dto);
    return this.attendanceRepo.save(record);
  }

  async remove(id: string): Promise<void> {
    const result = await this.attendanceRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Attendance record with id ${id} not found`);
    }
  }

  findByActivity(activityId: string): Promise<AttendanceRecord[]> {
    return this.attendanceRepo.find({
      where: { activityId },
      relations: ["activity", "user"],
    });
  }

  findByUser(userId: string): Promise<AttendanceRecord[]> {
    return this.attendanceRepo.find({
      where: { userId },
      relations: ["activity", "user"],
    });
  }
}
