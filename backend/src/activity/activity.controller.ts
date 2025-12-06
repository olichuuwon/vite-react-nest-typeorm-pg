import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Query,
} from "@nestjs/common";
import type { Request } from "express";

import { ActivityService } from "./activity.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import type { ActivityDto } from "../../../shared/dto/activity.dto";
import { Activity } from "./activity.entity";
import type { User } from "../user/user.entity";

const toDto = (activity: Activity): ActivityDto => {
  return {
    id: activity.id,
    title: activity.title,
    description: activity.description ?? null,
    date: activity.date ?? null,
    startAt: activity.startAt ? activity.startAt.toISOString() : null,
    endAt: activity.endAt ? activity.endAt.toISOString() : null,
    location: activity.location ?? null,

    createdByUserId: activity.createdByUserId ?? null,
    createdByName:
      (activity.createdBy as any)?.name ??
      (activity.createdBy as any)?.identifier ??
      null,

    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
  };
};

@Controller("activities")
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async findAll(
    @Query("createdByUserId") createdByUserId?: string
  ): Promise<ActivityDto[]> {
    const activities = await this.activityService.findAll({ createdByUserId });
    return activities.map(toDto);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ActivityDto> {
    const activity = await this.activityService.findOne(id);
    return toDto(activity);
  }

  @Post()
  async create(
    @Body() dto: CreateActivityDto,
    @Req() req: Request
  ): Promise<ActivityDto> {
    const user = req.user as User;
    const created = await this.activityService.create(dto, user);
    return toDto(created);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateActivityDto
  ): Promise<ActivityDto> {
    const updated = await this.activityService.update(id, dto);
    return toDto(updated);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.activityService.remove(id);
  }
}
