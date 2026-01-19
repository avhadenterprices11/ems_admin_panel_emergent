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
      loginDto.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = TokenUtils.createAccessToken({
      sub: user.id.toString(),
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
      .where({ id: parseInt(payload.sub), deleted_at: null })
      .first();

    if (!user) {
      return null;
    }

    return {
      id: user.id.toString(),
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
    try {
      const existingUser = await db<User>('users')
        .where({ email: 'admin@example.com', deleted_at: null })
        .first();

      if (existingUser) {
        console.log('Default admin user already exists');
        return;
      }

      await this.createUser({
        email: 'admin@example.com',
        password_hash: 'admin123',
      });

      console.log('Default admin user created (email: admin@example.com, password: admin123)');
    } catch (error: any) {
      // Table might not exist yet, that's okay
      if (error.code === '42P01') {
        console.log('Users table does not exist yet. Run migrations first.');
      } else {
        console.error('Error creating default user:', error.message);
      }
    }
  }
}
