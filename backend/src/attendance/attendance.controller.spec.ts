import { Test, TestingModule } from "@nestjs/testing";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";
import { AttendanceRecord } from "./attendance.entity";
import { createMockAttendance } from "../test-utils/entities";

describe("AttendanceController", () => {
  let controller: AttendanceController;
  let service: AttendanceService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByActivity: jest.fn(),
    findByUser: jest.fn(),
  };

  const adminUser = {
    id: "admin-id",
    role: "admin",
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
    service = module.get<AttendanceService>(AttendanceService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("findAll should delegate to service.findAll", async () => {
    const records: AttendanceRecord[] = [createMockAttendance({ id: "1" })];
    mockService.findAll.mockResolvedValue(records);

    const result = await controller.findAll();

    expect(mockService.findAll).toHaveBeenCalledTimes(1);
    expect(result).toBe(records);
  });

  it("findOne should delegate to service.findOne", async () => {
    const record = createMockAttendance({ id: "abc" });
    mockService.findOne.mockResolvedValue(record);

    const result = await controller.findOne("abc");

    expect(mockService.findOne).toHaveBeenCalledWith("abc");
    expect(result).toBe(record);
  });

  it("create should delegate to service.create", async () => {
    const dto = { activityId: "act1", userId: "user1" };
    const record = createMockAttendance({
      id: "1",
      activityId: "act1",
      userId: "user1",
    });

    mockService.create.mockResolvedValue(record);

    const result = await controller.create(dto as any, adminUser);

    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(record);
  });

  it("update should delegate to service.update", async () => {
    const dto = { status: "late" };
    const record = createMockAttendance({ id: "1", status: "late" });

    mockService.update.mockResolvedValue(record);

    const result = await controller.update("1", dto as any, adminUser);

    expect(mockService.update).toHaveBeenCalledWith("1", dto);
    expect(result).toBe(record);
  });

  it("remove should delegate to service.remove", async () => {
    mockService.remove.mockResolvedValue(undefined);

    await expect(controller.remove("1")).resolves.toBeUndefined();
    expect(mockService.remove).toHaveBeenCalledWith("1");
  });

  it("findByActivity should delegate to service.findByActivity", async () => {
    const records: AttendanceRecord[] = [createMockAttendance({ id: "1" })];
    mockService.findByActivity.mockResolvedValue(records);

    const result = await controller.findByActivity("act1");

    expect(mockService.findByActivity).toHaveBeenCalledWith("act1");
    expect(result).toBe(records);
  });

  it("findByUser should delegate to service.findByUser", async () => {
    const records: AttendanceRecord[] = [createMockAttendance({ id: "1" })];
    mockService.findByUser.mockResolvedValue(records);

    const result = await controller.findByUser("user1");

    expect(mockService.findByUser).toHaveBeenCalledWith("user1");
    expect(result).toBe(records);
  });
});
