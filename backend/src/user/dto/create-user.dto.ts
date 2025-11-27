import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import type { UserRole } from "../user.entity";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsIn(["admin", "member"])
  @IsOptional()
  role?: UserRole;
}
