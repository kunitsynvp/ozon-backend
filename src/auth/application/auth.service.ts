import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../infrastructure/auth.repository.js';
import { EncryptionService } from '../../core/application/encryption.service.js';
import { LoginOutputDto } from '../api/dto/login-output.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  async register(email: string, password: string) {
    const existedUser = await this.authRepository.findUserByEmail(email);
    if (existedUser) {
      throw new Error('User already exists');
    }

    const newPasswordHash = await this.encryptionService.generateHash(password);
    await this.authRepository.createUser(email, newPasswordHash);
  }

  async login(email: string, password: string): Promise<LoginOutputDto> {
    const existedUser = await this.authRepository.findUserByEmail(email);
    if (!existedUser) {
      throw new Error('Invalid credentials');
    }

    const isPasswordCorrect = await this.encryptionService.compare(
      password,
      existedUser.passwordHash,
    );
    if (!isPasswordCorrect) {
      throw new Error('Invalid credentials');
    }

    const token = this.jwtService.sign({ userId: existedUser.id });
    return { token };
  }
}
