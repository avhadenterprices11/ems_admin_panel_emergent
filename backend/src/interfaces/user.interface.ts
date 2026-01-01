export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface UserCreateInput {
  email: string;
  password_hash: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
}
