import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const createMockUser = (override: Partial<User> = {}): User => ({
  id: override.id ?? "user-1",
  name: override.name ?? "Test User",
  identifier: override.identifier ?? "test-user-1",
  email: override.email ?? undefined,
  role: override.role ?? "member",
  attendanceRecords: override.attendanceRecords ?? [],
  createdActivities: override.createdActivities ?? [],
  createdAt: override.createdAt ?? new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: override.updatedAt ?? new Date("2025-01-01T00:00:00.000Z"),
});

describe("UserService", () => {
  let service: UserService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(getRepositoryToken(User));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("findAll should return an array of users", async () => {
    const users = [
      createMockUser({ id: "1", name: "User A" }),
      createMockUser({ id: "2", name: "User B" }),
    ];

    repo.find.mockResolvedValue(users);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(result).toEqual(users);
  });

  it("findOne should return a user when found", async () => {
    const user = createMockUser({ id: "abc123" });
    repo.findOne.mockResolvedValue(user);

    const result = await service.findOne("abc123");

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: "abc123" } });
    expect(result).toEqual(user);
  });

  it("findOne should throw NotFoundException when missing", async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne("missing-id")).rejects.toThrow(
      "User with id missing-id not found"
    );
  });

  it("create should persist a new user", async () => {
    const dto = {
      name: "New User",
      identifier: "new123",
      email: "new@example.com",
      role: "member" as const,
    };

    const mockUser = createMockUser({
      name: dto.name,
      identifier: dto.identifier,
      email: dto.email,
      role: dto.role,
    });

    repo.create.mockReturnValue(mockUser);
    repo.save.mockResolvedValue(mockUser);

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalledWith({
      ...dto,
      role: "member",
    });
    expect(repo.save).toHaveBeenCalledWith(mockUser);

    expect(result).toMatchObject({
      name: "New User",
      identifier: "new123",
      email: "new@example.com",
      role: "member",
    });
  });

  it("update should merge & save a user", async () => {
    const existing = createMockUser({ id: "abc", name: "Original" });
    const updated = createMockUser({ id: "abc", name: "Updated" });

    repo.findOne.mockResolvedValue(existing);
    repo.save.mockResolvedValue(updated);

    const result = await service.update("abc", { name: "Updated" });

    expect(repo.findOne).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe("Updated");
  });

  it("remove should delete a user", async () => {
    repo.delete.mockResolvedValue({ affected: 1 } as any);

    await expect(service.remove("abc")).resolves.not.toThrow();
    expect(repo.delete).toHaveBeenCalledWith("abc");
  });

  it("remove should throw if user does not exist", async () => {
    repo.delete.mockResolvedValue({ affected: 0 } as any);

    await expect(service.remove("missing")).rejects.toThrow(
      "User with id missing not found"
    );
  });
});
