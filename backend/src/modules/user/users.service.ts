import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from 'src/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async createUser(name: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const result = await this.db.query`
        INSERT INTO users (name, email, password)
        VALUES (${name}, ${email}, ${hashedPassword})
        RETURNING id, name, email, created_at
      `;
      return result[0];
    } catch (error) {
      throw new BadRequestException('Email already exists');
    }
  }

  async findByEmail(email: string) {
    const result = await this.db.query`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result[0];
  }

  async findById(id: string) {
    const result = await this.db.query`
      SELECT id, name, email, created_at
      FROM users
      WHERE id = ${id}
    `;
    return result[0];
  }
}

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '365d' },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
