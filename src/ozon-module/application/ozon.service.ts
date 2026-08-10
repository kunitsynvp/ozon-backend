import dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  OzonProductFilters,
  OzonProductItem,
  OzonProductListRequest,
  OzonProductListResponse,
  OzonProductListResult,
} from './ozon.types';
dotenv.config();

/** All boolean filters off — no filtering by any field. */
const NO_FILTERS: OzonProductFilters = {
  hasFbo: false,
  hasFbs: false,
  archived: false,
  isDiscounted: false,
};

@Injectable()
export class OzonService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api-seller.ozon.ru',
      headers: {
        'Client-Id': process.env.OZON_CLIENT_ID,
        'Api-Key': process.env.OZON_API_KEY,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch a single page of products from Ozon.
   *
   * The API is always called with an empty filter — all filtering
   * (search + booleans) is applied in-memory by {@link getProducts}.
   */
  private async fetchPage(
    limit: number,
    lastId: string,
  ): Promise<OzonProductListResult> {
    const response = await this.client.post<
      OzonProductListResponse,
      AxiosResponse<OzonProductListResponse>
    >('/v3/product/list', {
      filter: {},
      last_id: lastId,
      limit,
    } satisfies OzonProductListRequest);

    return response.data.result;
  }

  /**
   * Fetch every product by walking the API's `last_id` cursor until the
   * returned page is shorter than the page size.
   */
  private async fetchAll(): Promise<OzonProductItem[]> {
    const pageSize = 1000;
    let lastId = '';
    const items: OzonProductItem[] = [];

    while (true) {
      const page = await this.fetchPage(pageSize, lastId);
      items.push(...page.items);
      if (page.items.length < pageSize) {
        break;
      }
      lastId = page.last_id;
    }

    return items;
  }

  /**
   * True when `search` matches any of a product's identifiers.
   * Case-insensitive substring match across `offer_id`, `product_id`, `sku`.
   * Empty `search` matches everything.
   */
  private matchesSearch(item: OzonProductItem, search: string): boolean {
    if (!search) {
      return true;
    }
    const needle = search.toLowerCase();
    return (
      item.offer_id.toLowerCase().includes(needle) ||
      String(item.product_id).includes(needle) ||
      String(item.sku).includes(needle)
    );
  }

  /**
   * True when `item` passes every active boolean filter. A filter is "active"
   * when set to `true`; `false` means "do not filter by this field".
   */
  private matchesFilters(
    item: OzonProductItem,
    filters: OzonProductFilters,
  ): boolean {
    return (
      (!filters.hasFbo || item.has_fbo_stocks) &&
      (!filters.hasFbs || item.has_fbs_stocks) &&
      (!filters.archived || item.archived) &&
      (!filters.isDiscounted || item.is_discounted)
    );
  }

  /**
   * Return products filtered by a search term and boolean filters.
   *
   * The Ozon API is queried without filters, the full product list is fetched
   * via cursor pagination, then both the search term and the boolean filters
   * are applied in memory.
   */
  async getProducts(
    search = '',
    filters: OzonProductFilters = NO_FILTERS,
  ): Promise<OzonProductListResult> {
    const items = (await this.fetchAll()).filter(
      (item) =>
        this.matchesSearch(item, search) && this.matchesFilters(item, filters),
    );

    return {
      items,
      last_id: '',
      limit: items.length,
    };
  }
}
