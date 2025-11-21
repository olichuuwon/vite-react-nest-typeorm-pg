import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AttendanceRecord } from './attendance.entity'

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecord])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class AttendanceModule {}
