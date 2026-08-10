import { Test, TestingModule } from '@nestjs/testing';
import { OzonController } from './ozon.controller';

describe('OzonController', () => {
  let controller: OzonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OzonController],
    }).compile();

    controller = module.get<OzonController>(OzonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
