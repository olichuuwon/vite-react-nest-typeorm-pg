import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AttendanceRecord } from "./attendance.entity";
import { AttendanceService } from "./attendance.service";
import { AttendanceController } from "./attendance.controller";
import { User } from "../user/user.entity";
import { Activity } from "../activity/activity.entity";

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecord, User, Activity])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
