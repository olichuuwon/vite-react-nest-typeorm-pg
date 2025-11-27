import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import type {
  LoginRequestDto,
  LoginResponseDto,
  UserDto,
} from "./../../../shared/dto/auth.dto";
import { Public } from "./public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(dto.identifier);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: any): Promise<UserDto> {
    return this.authService.getMe(req.user.userId);
  }
}
