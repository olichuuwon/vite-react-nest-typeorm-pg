import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from "@nestjs/common";
import { ActivityService } from "./activity.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import { Activity } from "./activity.entity";
import { Roles } from "../auth/roles.decorator";

@Controller("activities")
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  findAll(): Promise<Activity[]> {
    return this.activityService.findAll();
  }

  @Get(":id")
  findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<Activity> {
    return this.activityService.findOne(id);
  }

  @Post()
  @Roles("admin")
  create(@Body() dto: CreateActivityDto): Promise<Activity> {
    return this.activityService.create(dto);
  }

  @Put(":id")
  @Roles("admin")
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateActivityDto
  ): Promise<Activity> {
    return this.activityService.update(id, dto);
  }

  @Delete(":id")
  @Roles("admin")
  remove(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<void> {
    return this.activityService.remove(id);
  }
}
