export interface FeedFilters {
  categoryId?: string;
  subcategoryId?: string;
  city?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}
