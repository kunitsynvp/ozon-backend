import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

@Injectable()
export class EncryptionService {
  async generateHash(string: string) {
    return bcrypt.hash(string, 10);
  }

  async compare(string: string, hash: string) {
    return bcrypt.compare(string, hash);
  }
}
