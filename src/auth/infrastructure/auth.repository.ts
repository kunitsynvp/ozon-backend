import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '../../prisma/db.js';
import { PRISMA_CLIENT } from '../../prisma/prisma.provider.js';

import { Contract } from '../../prisma/contract.js';
import { User } from '../../prisma/types/prisma.types.js';

@Injectable()
export class AuthRepository {
  //Todo протипизировать и сделать деструктуризацию призмы
  //todo this.prisma.orm.public.User -> users
  private users: Contract;
  constructor(@Inject(PRISMA_CLIENT) public readonly prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.orm.public.User.where({
      email,
    }).first();
  }

  async createUser(email: string, passwordHash: string): Promise<void> {
    await this.prisma.orm.public.User.create({ email, passwordHash });
  }
}
