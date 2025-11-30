import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { createMockUser } from "../test-utils/entities";

describe("UserController", () => {
  let controller: UserController;
  let service: UserService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("findAll should delegate to service.findAll", async () => {
    const users: User[] = [createMockUser({ id: "1" })];
    mockService.findAll.mockResolvedValue(users);

    const result = await controller.findAll();

    expect(mockService.findAll).toHaveBeenCalledTimes(1);
    expect(result).toBe(users);
  });

  it("findOne should delegate to service.findOne", async () => {
    const user = createMockUser({ id: "abc" });
    mockService.findOne.mockResolvedValue(user);

    const result = await controller.findOne("abc");

    expect(mockService.findOne).toHaveBeenCalledWith("abc");
    expect(result).toBe(user);
  });

  it("create should delegate to service.create", async () => {
    const dto = { name: "New", identifier: "new" };
    const user = createMockUser({ id: "1", name: "New", identifier: "new" });

    mockService.create.mockResolvedValue(user);

    const result = await controller.create(dto as any);

    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(user);
  });

  it("update should delegate to service.update", async () => {
    const dto = { name: "Updated" };
    const user = createMockUser({ id: "1", name: "Updated" });

    mockService.update.mockResolvedValue(user);

    const result = await controller.update("1", dto as any);

    expect(mockService.update).toHaveBeenCalledWith("1", dto);
    expect(result).toBe(user);
  });

  it("remove should delegate to service.remove", async () => {
    mockService.remove.mockResolvedValue(undefined);

    await expect(controller.remove("1")).resolves.toBeUndefined();
    expect(mockService.remove).toHaveBeenCalledWith("1");
  });
});
