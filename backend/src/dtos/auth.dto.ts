import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password_hash!: string;
}

export class TokenResponseDTO {
  token!: string;
  token_type: string = 'Bearer';
}

export class UserResponseDTO {
  id!: string;
  email!: string;
  created_at!: Date;
  updated_at!: Date;
}

export class TokenValidationDTO {
  valid!: boolean;
  user?: UserResponseDTO;
}
