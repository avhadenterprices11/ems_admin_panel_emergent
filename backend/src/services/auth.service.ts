import db from '../database/db';
import { User, UserCreateInput } from '../interfaces/user.interface';
import { PasswordUtils } from '../utils/password.utils';
import { TokenUtils } from '../utils/token.utils';
import { LoginDTO, TokenResponseDTO, UserResponseDTO } from '../dtos/auth.dto';

export class AuthService {
  async login(loginDto: LoginDTO): Promise<TokenResponseDTO> {
    const user = await db<User>('users')
      .where({ email: loginDto.email, deleted_at: null })
      .first();

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await PasswordUtils.verify(
      loginDto.password_hash,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = TokenUtils.createAccessToken({
      sub: user.id,
      email: user.email,
    });

    return {
      token,
      token_type: 'Bearer',
    };
  }

  async validateToken(token: string): Promise<UserResponseDTO | null> {
    const payload = TokenUtils.verifyAccessToken(token);

    if (!payload) {
      return null;
    }

    const user = await db<User>('users')
      .where({ id: payload.sub, deleted_at: null })
      .first();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async createUser(input: UserCreateInput): Promise<User> {
    const hashedPassword = await PasswordUtils.hash(input.password_hash);

    const [user] = await db<User>('users')
      .insert({
        email: input.email,
        password_hash: hashedPassword,
      })
      .returning('*');

    return user;
  }

  async createDefaultUser(): Promise<void> {
    const existingUser = await db<User>('users')
      .where({ email: 'admin@example.com', deleted_at: null })
      .first();

    if (existingUser) {
      return;
    }

    await this.createUser({
      email: 'admin@example.com',
      password_hash: 'admin123',
    });

    console.log('Default admin user created (email: admin@example.com, password: admin123)');
  }
}
