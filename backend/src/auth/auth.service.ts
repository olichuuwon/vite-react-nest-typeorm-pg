import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async loginWithIdentifier(identifier: string) {
    const trimmed = identifier?.trim();

    if (!trimmed) {
      throw new UnauthorizedException("Identifier is required");
    }

    const user = await this.userRepo.findOne({
      where: { identifier: trimmed },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid identifier");
    }

    const payload = {
      sub: user.id,
      identifier: user.identifier,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        identifier: user.identifier,
        email: user.email ?? null,
        role: user.role,
      },
    };
  }
}
