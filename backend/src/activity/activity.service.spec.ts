import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { ActivityService } from "./activity.service";
import { Activity } from "./activity.entity";

const createMockRepo = () =>
  ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  }) as any;

describe("ActivityService", () => {
  let service: ActivityService;
  let repo: ReturnType<typeof createMockRepo>;

  beforeEach(() => {
    repo = createMockRepo();
    service = new ActivityService(repo as unknown as Repository<Activity>);
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

    repo.find.mockResolvedValue(activities);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledTimes(1);
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

    repo.findOne.mockResolvedValue(activity);

    const result = await service.findOne("abc");

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: "abc" },
      relations: ["createdBy", "attendanceRecords"],
    });
    expect(result).toBe(activity);
  });

  it("findOne should throw NotFoundException when not found", async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne("missing-id")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
  it("create should persist a new activity", async () => {
    const dto = { title: "New Activity" } as any;
    const user = { id: "user-1" } as any;

    const created = {
      id: "activity-1",
      ...dto,
      createdByUserId: user.id,
    } as any;

    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    const result = await service.create(dto as any, user as any);

    expect(repo.create).toHaveBeenCalledWith({
      ...dto,
      createdByUserId: user.id,
    });
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });

  it("update should merge and save existing activity", async () => {
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

    const updated: Activity = {
      ...existing,
      ...dto,
    };

    repo.findOne.mockResolvedValue(existing);
    repo.save.mockResolvedValue(updated);

    const result = await service.update("abc", dto);

    expect(repo.findOne).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(updated);
    expect(result.title).toBe("New Title");
    expect(result.location).toBe("New HQ");
  });

  it("update should throw NotFoundException if activity does not exist", async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(
      service.update("missing-id", { title: "X" } as any)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("remove should delete an activity", async () => {
    const existing: Activity = {
      id: "abc",
      title: "To delete",
      description: "x",
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

    repo.findOne.mockResolvedValue(existing);
    repo.remove.mockResolvedValue(existing);

    await expect(service.remove("abc")).resolves.not.toThrow();
    expect(repo.remove).toHaveBeenCalledWith(existing);
  });

  it("remove should throw NotFoundException if activity not found", async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.remove("missing-id")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});
