import { Injectable, NotFoundException } from "@nestjs/common";
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

  async findAll(filter?: { createdByUserId?: string }): Promise<Activity[]> {
    const where: Record<string, any> = {};

    if (filter?.createdByUserId) {
      where.createdByUserId = filter.createdByUserId;
    }

    return this.activityRepo.find({
      where,
      relations: ["createdBy"],
      order: { date: "ASC", createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: ["createdBy"],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with id ${id} not found`);
    }

    return activity;
  }

  async create(dto: CreateActivityDto, creator: User): Promise<Activity> {
    const activity = this.activityRepo.create({
      title: dto.title,
      description: dto.description,
      date: dto.date,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      location: dto.location,
      createdByUserId: creator.id,
    });

    const saved = await this.activityRepo.save(activity);

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateActivityDto): Promise<Activity> {
    const existing = await this.activityRepo.findOne({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Activity with id ${id} not found`);
    }

    const merged = this.activityRepo.merge(existing, {
      ...dto,
      startAt: dto.startAt ? new Date(dto.startAt) : existing.startAt,
      endAt: dto.endAt ? new Date(dto.endAt) : existing.endAt,
    });

    const saved = await this.activityRepo.save(merged);

    return this.findOne(saved.id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.activityRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Activity with id ${id} not found`);
    }
  }
}
