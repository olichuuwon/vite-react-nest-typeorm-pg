import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/user.entity";
import type { LoginResponseDto, UserDto } from "../../../shared/dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private toUserDto(user: User): UserDto {
    return {
      id: user.id,
      name: user.name,
      identifier: user.identifier,
      email: user.email ?? null,
      role: user.role,
    };
  }

  async login(identifier: string): Promise<LoginResponseDto> {
    const trimmed = identifier.trim();

    if (!trimmed) {
      throw new UnauthorizedException("Identifier is required");
    }

    const user = await this.userRepo.findOne({
      where: { identifier: trimmed },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid identifier");
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.toUserDto(user),
    };
  }

  async getMe(userId: string): Promise<UserDto> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    return this.toUserDto(user);
  }
}
