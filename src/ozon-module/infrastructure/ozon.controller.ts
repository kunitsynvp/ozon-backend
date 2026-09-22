import { Controller, Get, Query } from '@nestjs/common';
import { OzonService } from '../application/ozon.service.js';
import {
  OzonProductFilters,
  OzonProductListResult,
} from '../application/ozon.types.js';

/** Treat `"true"` / `"1"` (case-insensitive) from the query string as `true`. */
function parseBool(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true' || value === '1';
}

@Controller('ozon')
export class OzonController {
  constructor(private readonly ozonService: OzonService) {}

  @Get('/products')
  async getProducts(
    @Query('search') search?: string,
    @Query('hasFbo') hasFbo?: string,
    @Query('hasFbs') hasFbs?: string,
    @Query('archived') archived?: string,
    @Query('isDiscounted') isDiscounted?: string,
  ): Promise<OzonProductListResult> {
    const filters: OzonProductFilters = {
      hasFbo: parseBool(hasFbo),
      hasFbs: parseBool(hasFbs),
      archived: parseBool(archived),
      isDiscounted: parseBool(isDiscounted),
    };

    return this.ozonService.getProducts(search ?? '', filters);
  }
}
