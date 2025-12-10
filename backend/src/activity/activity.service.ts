import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Activity } from "./activity.entity";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import type { User } from "../user/user.entity";

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>
  ) {}

  findAll(): Promise<Activity[]> {
    return this.activityRepo.find({
      relations: ["createdBy", "attendanceRecords"],
    });
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: ["createdBy", "attendanceRecords"],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with id ${id} not found`);
    }

    return activity;
  }

  async findCreatedByUser(userId: string): Promise<Activity[]> {
    return this.activityRepo.find({
      where: { createdByUserId: userId },
      relations: ["createdBy", "attendanceRecords"],
      order: {
        date: "DESC",
        createdAt: "DESC",
      },
    });
  }

  async create(dto: CreateActivityDto, user: User): Promise<Activity> {
    const activity = this.activityRepo.create({
      ...dto,
      createdByUserId: user.id,
    });

    return this.activityRepo.save(activity);
  }

  async update(id: string, dto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id);
    Object.assign(activity, dto);
    return this.activityRepo.save(activity);
  }

  async remove(id: string): Promise<void> {
    // Load activity + attendance records
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: ["attendanceRecords"],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with id ${id} not found`);
    }

    // If there are attendance records, block deletion
    if (activity.attendanceRecords && activity.attendanceRecords.length > 0) {
      throw new ConflictException(
        "Cannot delete activity with existing attendance records"
      );
    }

    await this.activityRepo.remove(activity);
  }
}
