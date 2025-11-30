import { Test, TestingModule } from "@nestjs/testing";
import { ActivityController } from "./activity.controller";
import { ActivityService } from "./activity.service";
import { Activity } from "./activity.entity";
import { createMockActivity } from "../test-utils/entities";

describe("ActivityController", () => {
  let controller: ActivityController;
  let service: ActivityService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivityService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
    service = module.get<ActivityService>(ActivityService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("findAll should delegate to service.findAll", async () => {
    const activities: Activity[] = [createMockActivity({ id: "1" })];
    mockService.findAll.mockResolvedValue(activities);

    const result = await controller.findAll();

    expect(mockService.findAll).toHaveBeenCalledTimes(1);
    expect(result).toBe(activities);
  });

  it("findOne should delegate to service.findOne", async () => {
    const activity = createMockActivity({ id: "abc" });
    mockService.findOne.mockResolvedValue(activity);

    const result = await controller.findOne("abc");

    expect(mockService.findOne).toHaveBeenCalledWith("abc");
    expect(result).toBe(activity);
  });

  it("create should delegate to service.create", async () => {
    const dto = { title: "New Activity" };
    const activity = createMockActivity({ id: "1", title: "New Activity" });

    mockService.create.mockResolvedValue(activity);

    const result = await controller.create(dto as any);

    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(activity);
  });

  it("update should delegate to service.update", async () => {
    const dto = { title: "Updated" };
    const activity = createMockActivity({ id: "1", title: "Updated" });

    mockService.update.mockResolvedValue(activity);

    const result = await controller.update("1", dto as any);

    expect(mockService.update).toHaveBeenCalledWith("1", dto);
    expect(result).toBe(activity);
  });

  it("remove should delegate to service.remove", async () => {
    mockService.remove.mockResolvedValue(undefined);

    await expect(controller.remove("1")).resolves.toBeUndefined();
    expect(mockService.remove).toHaveBeenCalledWith("1");
  });
});
