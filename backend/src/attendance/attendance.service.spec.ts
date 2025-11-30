import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { AttendanceService } from "./attendance.service";
import { AttendanceRecord } from "./attendance.entity";
import { User } from "../user/user.entity";
import { Activity } from "../activity/activity.entity";

const createAttendanceRepo = () =>
  ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }) as any;

const createUserRepo = () =>
  ({
    findOne: jest.fn(),
  }) as any;

const createActivityRepo = () =>
  ({
    findOne: jest.fn(),
  }) as any;

describe("AttendanceService", () => {
  let service: AttendanceService;
  let attendanceRepo: any;
  let userRepo: any;
  let activityRepo: any;

  beforeEach(() => {
    attendanceRepo = createAttendanceRepo();
    userRepo = createUserRepo();
    activityRepo = createActivityRepo();

    service = new AttendanceService(
      attendanceRepo as Repository<AttendanceRecord>,
      userRepo as Repository<User>,
      activityRepo as Repository<Activity>
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("findAll should return records", async () => {
    const records: AttendanceRecord[] = [
      {
        id: "r1",
        userId: "u1",
        activityId: "a1",
        status: "present" as any,
        remarks: "OK",
        checkedInAt: undefined,
        user: undefined as any,
        activity: undefined as any,
        createdAt: undefined as any,
        updatedAt: undefined as any,
      },
    ];

    attendanceRepo.find.mockResolvedValue(records);

    const result = await service.findAll();

    expect(attendanceRepo.find).toHaveBeenCalledTimes(1);
    expect(result).toBe(records);
  });

  it("findOne should return a record when found", async () => {
    const record: AttendanceRecord = {
      id: "abc",
      userId: "u1",
      activityId: "a1",
      status: "present" as any,
      remarks: "Seeded",
      checkedInAt: undefined,
      user: undefined as any,
      activity: undefined as any,
      createdAt: undefined as any,
      updatedAt: undefined as any,
    };

    attendanceRepo.findOne.mockResolvedValue(record);

    const result = await service.findOne("abc");

    expect(attendanceRepo.findOne).toHaveBeenCalledWith({
      where: { id: "abc" },
      // Match actual implementation ordering: ["activity", "user"]
      relations: ["activity", "user"],
    });
    expect(result).toBe(record);
  });

  it("findOne should throw when not found", async () => {
    attendanceRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne("missing-id")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("create should persist a record (happy path)", async () => {
    const dto = {
      userId: "u1",
      activityId: "a1",
      status: "present",
      remarks: "Hello",
    } as any;

    userRepo.findOne.mockResolvedValue({ id: "u1" } as User);
    activityRepo.findOne.mockResolvedValue({ id: "a1" } as Activity);

    const created: AttendanceRecord = {
      id: "new-id",
      userId: dto.userId,
      activityId: dto.activityId,
      status: dto.status,
      remarks: dto.remarks,
      checkedInAt: undefined,
      user: undefined as any,
      activity: undefined as any,
      createdAt: undefined as any,
      updatedAt: undefined as any,
    };

    attendanceRepo.create.mockReturnValue(created);
    attendanceRepo.save.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(attendanceRepo.create).toHaveBeenCalledWith(dto);
    expect(attendanceRepo.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });

  it("update should merge & save a record", async () => {
    const existing: AttendanceRecord = {
      id: "abc",
      userId: "u1",
      activityId: "a1",
      status: "present" as any,
      remarks: "Old",
      checkedInAt: undefined,
      user: undefined as any,
      activity: undefined as any,
      createdAt: undefined as any,
      updatedAt: undefined as any,
    };

    const dto = {
      status: "late",
      remarks: "Arrived late",
    } as any;

    const updated: AttendanceRecord = {
      ...existing,
      ...dto,
    };

    attendanceRepo.findOne.mockResolvedValue(existing);
    attendanceRepo.save.mockResolvedValue(updated);

    const result = await service.update("abc", dto);

    expect(attendanceRepo.findOne).toHaveBeenCalled();
    expect(attendanceRepo.save).toHaveBeenCalledWith(updated);
    expect(result.status).toBe("late");
    expect(result.remarks).toBe("Arrived late");
  });

  it("update should throw NotFoundException when record missing", async () => {
    attendanceRepo.findOne.mockResolvedValue(null);

    await expect(
      service.update("missing-id", { status: "late" } as any)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("remove should delete a record", async () => {
    attendanceRepo.delete.mockResolvedValue({ affected: 1 } as any);

    await expect(service.remove("abc")).resolves.not.toThrow();
    expect(attendanceRepo.delete).toHaveBeenCalledWith("abc");
  });

  it("remove should throw NotFoundException if nothing deleted", async () => {
    attendanceRepo.delete.mockResolvedValue({ affected: 0 } as any);

    await expect(service.remove("missing-id")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});
