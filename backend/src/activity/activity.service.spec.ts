import { ConflictException, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { ActivityService } from "./activity.service";
import { Activity } from "./activity.entity";
import { AttendanceRecord } from "../attendance/attendance.entity";

const createMockRepo = () =>
  ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    merge: jest.fn(),
  }) as any;

describe("ActivityService", () => {
  let service: ActivityService;
  let activityRepo: ReturnType<typeof createMockRepo>;
  let attendanceRepo: ReturnType<typeof createMockRepo>;

  beforeEach(() => {
    activityRepo = createMockRepo();
    attendanceRepo = createMockRepo();
    service = new ActivityService(
      activityRepo as unknown as Repository<Activity>,
      attendanceRepo as unknown as Repository<AttendanceRecord>
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("findAll should return activities", async () => {
    const activities: Activity[] = [
      {
        id: "a1",
        title: "Act 1",
        description: "Desc",
        date: undefined,
        startAt: undefined,
        endAt: undefined,
        location: "HQ",
        createdByUserId: "u1",
        attendanceRecords: [],
        createdAt: undefined as any,
        updatedAt: undefined as any,
        createdBy: undefined as any,
      },
    ];

    activityRepo.find.mockResolvedValue(activities);

    const result = await service.findAll();

    expect(activityRepo.find).toHaveBeenCalledTimes(1);
    expect(result).toBe(activities);
  });

  it("findOne should return an activity when found", async () => {
    const activity: Activity = {
      id: "abc",
      title: "My Activity",
      description: "Test",
      date: undefined,
      startAt: undefined,
      endAt: undefined,
      location: "HQ",
      createdByUserId: "u1",
      attendanceRecords: [],
      createdAt: undefined as any,
      updatedAt: undefined as any,
      createdBy: undefined as any,
    };

    activityRepo.findOne.mockResolvedValue(activity);

    const result = await service.findOne("abc");

    expect(activityRepo.findOne).toHaveBeenCalledWith({
      where: { id: "abc" },
      relations: ["createdBy"],
    });
    expect(result).toBe(activity);
  });

  it("findOne should throw NotFoundException when not found", async () => {
    activityRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne("missing-id")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("create should persist a new activity", async () => {
    const dto = { title: "New Activity" } as any;
    const user = { id: "user-1" } as any;

    const created: Activity = {
      id: "activity-1",
      title: dto.title,
      description: dto.description,
      date: dto.date,
      startAt: undefined,
      endAt: undefined,
      location: dto.location,
      createdByUserId: user.id,
      attendanceRecords: [],
      createdAt: undefined as any,
      updatedAt: undefined as any,
      createdBy: undefined as any,
    };

    // service.create -> repo.create -> repo.save -> service.findOne(saved.id)
    activityRepo.create.mockReturnValue(created);
    activityRepo.save.mockResolvedValue(created);
    activityRepo.findOne.mockResolvedValue(created);

    const result = await service.create(dto, user);

    expect(activityRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Activity",
        createdByUserId: "user-1",
      })
    );
    expect(activityRepo.save).toHaveBeenCalledWith(created);
    expect(activityRepo.findOne).toHaveBeenCalledWith({
      where: { id: "activity-1" },
      relations: ["createdBy"],
    });
    expect(result).toBe(created);
  });

  it("update should update an existing activity", async () => {
    const existing: Activity = {
      id: "abc",
      title: "Old Title",
      description: "Old desc",
      date: undefined,
      startAt: undefined,
      endAt: undefined,
      location: "Old HQ",
      createdByUserId: "u1",
      attendanceRecords: [],
      createdAt: undefined as any,
      updatedAt: undefined as any,
      createdBy: undefined as any,
    };

    const dto = {
      title: "New Title",
      location: "New HQ",
    } as any;

    const saved: Activity = {
      ...existing,
      ...dto,
    };

    // first findOne inside update
    activityRepo.findOne.mockResolvedValueOnce(existing);
    // second findOne called by service.findOne(saved.id) at end of update
    activityRepo.findOne.mockResolvedValueOnce(saved);
    // use TypeORM-like merge behaviour
    activityRepo.merge.mockImplementation(
      (a: Activity, b: Partial<Activity>) => ({
        ...a,
        ...b,
      })
    );
    activityRepo.save.mockResolvedValue(saved);

    const result = await service.update("abc", dto);

    expect(activityRepo.findOne).toHaveBeenCalledWith({ where: { id: "abc" } });
    expect(activityRepo.merge).toHaveBeenCalled();
    expect(activityRepo.save).toHaveBeenCalledWith(saved);
    expect(result.title).toBe("New Title");
    expect(result.location).toBe("New HQ");
  });

  it("update should throw NotFoundException if activity does not exist", async () => {
    activityRepo.findOne.mockResolvedValue(null);

    await expect(
      service.update("missing-id", { title: "X" } as any)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("remove should delete activity when found and has no attendance", async () => {
    activityRepo.findOne.mockResolvedValue({ id: "abc" } as any);
    attendanceRepo.count.mockResolvedValue(0);
    activityRepo.delete.mockResolvedValue({ affected: 1 } as any);

    await expect(service.remove("abc")).resolves.not.toThrow();
    expect(activityRepo.findOne).toHaveBeenCalledWith({ where: { id: "abc" } });
    expect(attendanceRepo.count).toHaveBeenCalledWith({
      where: { activityId: "abc" },
    });
    expect(activityRepo.delete).toHaveBeenCalledWith("abc");
  });

  it("remove should throw ConflictException if activity has attendance", async () => {
    activityRepo.findOne.mockResolvedValue({ id: "abc" } as any);
    attendanceRepo.count.mockResolvedValue(5);

    await expect(service.remove("abc")).rejects.toThrow(ConflictException);
    await expect(service.remove("abc")).rejects.toThrow(
      "Cannot delete activity with 5 attendance record(s)"
    );
  });

  it("remove should throw NotFoundException if activity not found", async () => {
    activityRepo.findOne.mockResolvedValue(null);

    await expect(service.remove("missing-id")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});
