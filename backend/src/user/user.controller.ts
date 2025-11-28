import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";

@Controller("users")
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  getAll(): Promise<User[]> {
    return this.service.findAll();
  }

  @Post()
  create(@Body() body: Pick<User, "name" | "email">) {
    return this.service.create(body);
  }
}
