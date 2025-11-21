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

  async validateOrCreateUserByIdentifier(identifier: string): Promise<User> {
    let user = await this.userRepo.findOne({ where: { identifier } });

    if (!user) {
      user = this.userRepo.create({
        identifier,
        name: identifier,
        role: "member",
      });
      user = await this.userRepo.save(user);
    }

    return user;
  }

  async loginWithIdentifier(identifier: string) {
    if (!identifier) {
      throw new UnauthorizedException("Identifier is required");
    }

    const user = await this.validateOrCreateUserByIdentifier(identifier);

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
        role: user.role,
      },
    };
  }
}
