import { Controller, Get } from '@nestjs/common'
import { ActivityService } from './activity.service'
import { Activity } from './activity.entity'

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  findAll(): Promise<Activity[]> {
    return this.activityService.findAll()
  }
}
