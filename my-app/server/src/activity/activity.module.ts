import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Activity } from './activity.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Activity])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class ActivityModule {}
