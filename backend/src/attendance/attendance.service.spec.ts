import { Test, TestingModule } from "@nestjs/testing";
import { AttendanceService } from "./attendance.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AttendanceRecord } from "./attendance.entity";
import { Repository } from "typeorm";
import { createMockAttendance } from "../test-utils/entities";

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe("AttendanceService", () => {
  let service: AttendanceService;
  let repo: jest.Mocked<Repository<AttendanceRecord>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(AttendanceRecord),
          useFactory: mockRepo,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    repo = module.get(getRepositoryToken(AttendanceRecord));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("findAll should return records", async () => {
    const records = [
      createMockAttendance({ id: "1" }),
      createMockAttendance({ id: "2" }),
    ];

    repo.find.mockResolvedValue(records);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(result).toEqual(records);
  });

  it("findOne should return a record when found", async () => {
    const record = createMockAttendance({ id: "abc" });
    repo.findOne.mockResolvedValue(record);

    const result = await service.findOne("abc");

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: "abc" },
      relations: ["activity", "user"],
    });
    expect(result).toEqual(record);
  });

  it("findOne should throw when not found", async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne("missing")).rejects.toThrow(
      "Attendance record with id missing not found"
    );
  });

  it("create should persist a record", async () => {
    const dto = {
      activityId: "activity-1",
      userId: "user-1",
      status: "present" as const,
      remarks: "on time",
    };

    const mock = createMockAttendance({
      activityId: dto.activityId,
      userId: dto.userId,
      status: dto.status,
      remarks: dto.remarks,
    });

    repo.create.mockReturnValue(mock);
    repo.save.mockResolvedValue(mock);

    const result = await service.create(dto as any);

    expect(repo.create).toHaveBeenCalledWith({
      ...dto,
      status: "present",
    });
    expect(repo.save).toHaveBeenCalledWith(mock);
    expect(result).toMatchObject({
      activityId: "activity-1",
      userId: "user-1",
      status: "present",
    });
  });

  it("update should merge & save a record", async () => {
    const existing = createMockAttendance({ id: "abc", status: "present" });
    const updated = createMockAttendance({ id: "abc", status: "late" });

    repo.findOne.mockResolvedValue(existing);
    repo.save.mockResolvedValue(updated);

    const result = await service.update("abc", { status: "late" } as any);

    expect(repo.findOne).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.status).toBe("late");
  });

  it("remove should delete a record", async () => {
    repo.delete.mockResolvedValue({ affected: 1 } as any);

    await expect(service.remove("abc")).resolves.not.toThrow();
    expect(repo.delete).toHaveBeenCalledWith("abc");
  });

  it("remove should throw if not found", async () => {
    repo.delete.mockResolvedValue({ affected: 0 } as any);

    await expect(service.remove("missing")).rejects.toThrow(
      "Attendance record with id missing not found"
    );
  });
});
