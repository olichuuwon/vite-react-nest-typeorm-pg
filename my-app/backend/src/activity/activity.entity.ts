import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '../user/user.entity'
import { AttendanceRecord } from '../attendance/attendance.entity'

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'date', nullable: true })
  date?: string

  @Column({ type: 'timestamptz', nullable: true })
  startAt?: Date

  @Column({ type: 'timestamptz', nullable: true })
  endAt?: Date

  @Column({ nullable: true })
  location?: string

  @ManyToOne(() => User, (user) => user.createdActivities, { nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy?: User

  @Column({ type: 'uuid', nullable: true })
  createdByUserId?: string

  @OneToMany(() => AttendanceRecord, (att) => att.activity)
  attendanceRecords: AttendanceRecord[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
