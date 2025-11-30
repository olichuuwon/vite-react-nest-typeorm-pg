export type UserRole = "admin" | "member";

// Shape of a user as seen by the frontend
export interface UserDto {
  id: string;
  name: string;
  identifier: string;
  email: string | null;
  role: UserRole;
}

// Request body for login
export interface LoginRequestDto {
  identifier: string;
}

// Response for /auth/login
export interface LoginResponseDto {
  accessToken: string;
  user: UserDto;
}
