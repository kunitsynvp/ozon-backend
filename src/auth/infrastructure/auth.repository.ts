import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '../../prisma/db.js';
import { PRISMA_CLIENT } from '../../prisma/prisma.provider.js';
import { PlainUser } from '../../prisma/types/prisma.types.js';

@Injectable()
export class AuthRepository {
  constructor(@Inject(PRISMA_CLIENT) public readonly prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<PlainUser | null> {
    return await this.prisma.orm.public.User.where({
      email,
    }).first();
  }

  async createUser(email: string, passwordHash: string): Promise<void> {
    await this.prisma.orm.public.User.create({ email, passwordHash });
  }
}
