import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginInputDto } from './dto/login-input.dto.js';
import { LoginOutputDto } from './dto/login-output.dto.js';
import { AuthService } from '../application/auth.service.js';
import { RegisterInputDto } from './dto/register-input.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() { email, password }: LoginInputDto,
  ): Promise<LoginOutputDto> {
    return await this.authService.login(email, password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() { email, password }: RegisterInputDto): Promise<void> {
    return await this.authService.register(email, password);
  }
}
