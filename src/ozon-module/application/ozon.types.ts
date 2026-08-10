/** Filters for the /v3/product/list request. */
export interface OzonProductListFilter {
  offer_id?: string[];
  product_id?: number[];
  visibility?: string;
}

/** Body of the /v3/product/list request. */
export interface OzonProductListRequest {
  filter: OzonProductListFilter;
  last_id: string;
  limit: number;
}

/**
 * Boolean product filters sent by the frontend.
 * A `true` value keeps only items where the corresponding field is `true`;
 * `false` means "do not filter by this field".
 */
export interface OzonProductFilters {
  hasFbo: boolean;
  hasFbs: boolean;
  archived: boolean;
  isDiscounted: boolean;
}

/** A single product entry returned by the API. */
export interface OzonProductItem {
  product_id: number;
  offer_id: string;
  has_fbo_stocks: boolean;
  has_fbs_stocks: boolean;
  archived: boolean;
  is_discounted: boolean;
  sku: number;
}

/** The `result` object returned by the API. */
export interface OzonProductListResult {
  items: OzonProductItem[];
  last_id: string;
  limit: number;
}

/** Full response envelope of the /v3/product/list endpoint. */
export interface OzonProductListResponse {
  result: OzonProductListResult;
}
