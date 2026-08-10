import { Test, TestingModule } from '@nestjs/testing';
import { OzonService } from './ozon.service';

describe('OzonService', () => {
  let service: OzonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OzonService],
    }).compile();

    service = module.get<OzonService>(OzonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
