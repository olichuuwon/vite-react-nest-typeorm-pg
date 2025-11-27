import { Test, TestingModule } from "@nestjs/testing";
import { ActivityService } from "./activity.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Activity } from "./activity.entity";
import { Repository } from "typeorm";
import { createMockActivity } from "../test-utils/entities";

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe("ActivityService", () => {
  let service: ActivityService;
  let repo: jest.Mocked<Repository<Activity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: getRepositoryToken(Activity),
          useFactory: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    repo = module.get(getRepositoryToken(Activity));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("findAll should return an array of activities", async () => {
    const activities = [
      createMockActivity({ id: "1", title: "A" }),
      createMockActivity({ id: "2", title: "B" }),
    ];

    repo.find.mockResolvedValue(activities);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(result).toEqual(activities);
  });

  it("findOne should return an activity when found", async () => {
    const activity = createMockActivity({ id: "abc" });
    repo.findOne.mockResolvedValue(activity);

    const result = await service.findOne("abc");

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: "abc" },
      relations: ["createdBy", "attendanceRecords"],
    });
    expect(result).toEqual(activity);
  });

  it("findOne should throw when not found", async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne("missing")).rejects.toThrow(
      "Activity with id missing not found"
    );
  });

  it("create should persist a new activity", async () => {
    const dto = {
      title: "New Activity",
      description: "desc",
      date: "2025-01-01",
      startAt: "2025-01-01T08:00:00.000Z",
      endAt: "2025-01-01T10:00:00.000Z",
      location: "HQ",
      createdByUserId: "user-1",
    };

    const mock = createMockActivity({
      title: dto.title,
      description: dto.description,
      date: dto.date,
      location: dto.location,
      createdByUserId: dto.createdByUserId,
    });

    repo.create.mockReturnValue(mock);
    repo.save.mockResolvedValue(mock);

    const result = await service.create(dto as any);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(mock);
    expect(result).toMatchObject({
      title: "New Activity",
      location: "HQ",
    });
  });

  it("update should merge & save an activity", async () => {
    const existing = createMockActivity({ id: "abc", title: "Old" });
    const updated = createMockActivity({ id: "abc", title: "New" });

    repo.findOne.mockResolvedValue(existing);
    repo.save.mockResolvedValue(updated);

    const result = await service.update("abc", { title: "New" });

    expect(repo.findOne).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.title).toBe("New");
  });

  it("remove should delete an activity", async () => {
    repo.delete.mockResolvedValue({ affected: 1 } as any);

    await expect(service.remove("abc")).resolves.not.toThrow();
    expect(repo.delete).toHaveBeenCalledWith("abc");
  });

  it("remove should throw if not found", async () => {
    repo.delete.mockResolvedValue({ affected: 0 } as any);

    await expect(service.remove("missing")).rejects.toThrow(
      "Activity with id missing not found"
    );
  });
});
