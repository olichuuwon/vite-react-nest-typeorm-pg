export interface UserDto {
  id: string;
  name: string;
  identifier: string;
  email?: string | null;
  role: "admin" | "member";
  createdAt: string;
  updatedAt: string;
}
