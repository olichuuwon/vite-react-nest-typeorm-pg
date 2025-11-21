import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { AttendanceRecord } from "../attendance/attendance.entity";
import { Activity } from "../activity/activity.entity";

export type UserRole = "admin" | "member";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  identifier: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ type: "varchar", default: "member" })
  role: UserRole;

  @OneToMany(() => AttendanceRecord, (att) => att.user)
  attendanceRecords: AttendanceRecord[];

  @OneToMany(() => Activity, (activity) => activity.createdBy)
  createdActivities: Activity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
