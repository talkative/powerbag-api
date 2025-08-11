export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  age?: number; // Optional field
}
