import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./user.entity";
import { Roles } from "../auth/roles.decorator";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles("admin")
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(":id")
  @Roles("admin")
  findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post()
  @Roles("admin")
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.create(dto);
  }

  @Put(":id")
  @Roles("admin")
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateUserDto
  ): Promise<User> {
    return this.userService.update(id, dto);
  }

  @Delete(":id")
  @Roles("admin")
  remove(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ): Promise<void> {
    return this.userService.remove(id);
  }
}
