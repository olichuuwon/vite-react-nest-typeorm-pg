// server/src/activity/activity.service.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Activity } from './activity.entity'

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
  ) {}

  findAll(): Promise<Activity[]> {
    return this.activityRepo.find({
      order: { startAt: 'ASC' },
    })
  }
}
