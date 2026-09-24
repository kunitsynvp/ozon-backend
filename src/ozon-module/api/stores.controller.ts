import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../auth/api/decorators/current-user.decorator.js';
import { CreateStoreInputDto } from './dto/create-store-input.dto.js';
import { CreateStoreOutputDto, StoreDto } from './dto/store-output.dto.js';
import { StoresService } from '../application/stores.service.js';

@Controller('ozon/stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @HttpCode(HttpStatus.OK) // создаём, но семантика ответа — «результат проверки»
  async createStore(
    @CurrentUser() userId: string,
    @Body() dto: CreateStoreInputDto,
  ): Promise<CreateStoreOutputDto> {
    return await this.storesService.createStore(userId, dto);
  }

  @Get()
  async getStores(@CurrentUser() userId: string): Promise<StoreDto[]> {
    return await this.storesService.getStores(userId);
  }
}
