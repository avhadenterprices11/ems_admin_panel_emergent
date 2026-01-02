import { getDb, toJSON, ObjectId } from '../database/mongo';
import { PasswordUtils } from '../utils/password.utils';
import { TokenUtils } from '../utils/token.utils';
import { LoginDTO, TokenResponseDTO, UserResponseDTO } from '../dtos/auth.dto';

interface User {
  _id?: ObjectId;
  id?: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export class AuthService {
  async login(loginDto: LoginDTO): Promise<TokenResponseDTO> {
    const db = await getDb();
    const user = await db.collection<User>('users').findOne({
      email: loginDto.email,
      deleted_at: null
    });

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
      sub: user._id!.toString(),
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

    const db = await getDb();
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(payload.sub),
      deleted_at: null
    });

    if (!user) {
      return null;
    }

    return {
      id: user._id!.toString(),
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async createUser(email: string, password: string): Promise<User> {
    const db = await getDb();
    const hashedPassword = await PasswordUtils.hash(password);
    const now = new Date();

    const result = await db.collection<User>('users').insertOne({
      email,
      password_hash: hashedPassword,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });

    const user = await db.collection<User>('users').findOne({ _id: result.insertedId });
    return user!;
  }

  async createDefaultUser(): Promise<void> {
    const db = await getDb();
    const existingUser = await db.collection<User>('users').findOne({
      email: 'admin@example.com',
      deleted_at: null
    });

    if (existingUser) {
      console.log('Default admin user already exists');
      return;
    }

    await this.createUser('admin@example.com', 'admin123');
    console.log('Default admin user created (email: admin@example.com, password: admin123)');
  }
}
