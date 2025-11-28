import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { Activity } from "../activity/activity.entity";
import { User } from "../user/user.entity";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

@Entity("attendance_records")
@Unique(["activityId", "userId"])
export class AttendanceRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Activity, (activity) => activity.attendanceRecords, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "activityId" })
  activity: Activity;

  @Column({ type: "uuid" })
  activityId: string;

  @ManyToOne(() => User, (user) => user.attendanceRecords, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "varchar", default: "present" })
  status: AttendanceStatus;

  @Column({ type: "timestamptz", nullable: true })
  checkedInAt?: Date;

  @Column({ type: "timestamptz", nullable: true })
  checkedOutAt?: Date;

  @Column({ type: "text", nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
