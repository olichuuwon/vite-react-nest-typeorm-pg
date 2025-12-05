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
      relations: ["createdBy"],
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
    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);
    repo.findOne.mockResolvedValue(created);

    const result = await service.create(dto, user);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Activity",
        createdByUserId: "user-1",
      })
    );
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(repo.findOne).toHaveBeenCalledWith({
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
    repo.findOne.mockResolvedValueOnce(existing);
    // second findOne called by service.findOne(saved.id) at end of update
    repo.findOne.mockResolvedValueOnce(saved);
    // use TypeORM-like merge behaviour
    (repo as any).merge = jest.fn((a: Activity, b: Partial<Activity>) => ({
      ...a,
      ...b,
    }));
    repo.save.mockResolvedValue(saved);

    const result = await (service as any).update("abc", dto);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: "abc" } });
    expect((repo as any).merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(saved);
    expect(result.title).toBe("New Title");
    expect(result.location).toBe("New HQ");
  });

  it("update should throw NotFoundException if activity does not exist", async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(
      (service as any).update("missing-id", { title: "X" } as any)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("remove should delete activity when found", async () => {
    repo.delete.mockResolvedValue({ affected: 1 } as any);

    await expect(service.remove("abc")).resolves.not.toThrow();
    expect(repo.delete).toHaveBeenCalledWith("abc");
  });

  it("remove should throw NotFoundException if nothing deleted", async () => {
    repo.delete.mockResolvedValue({ affected: 0 } as any);

    await expect(service.remove("missing-id")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});
