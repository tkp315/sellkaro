export type Condition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type AdStatus = 'ACTIVE' | 'PAUSED' | 'SOLD';

export interface AdImage {
  id: string;
  url: string;
  isCover: boolean;
  order: number;
}

export interface AdSeller {
  id: string;
  profile: {
    name: string;
    avatar: string | null;
    city: string | null;
  } | null;
}

export interface AdCategory {
  id: string;
  name: string;
  slug: string;
}

export interface AdListItem {
  id: string;
  title: string;
  price: number;
  condition: Condition;
  city: string;
  area: string | null;
  createdAt: string;
  images: AdImage[];
  product: {
    category: AdCategory;
    subcategory: AdCategory | null;
  };
}

export interface AdDetail extends AdListItem {
  description: string;
  lat: number | null;
  lng: number | null;
  viewCount: number;
  user: AdSeller & { createdAt: string };
}

export interface FeedPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface FeedResponse {
  ads: AdListItem[];
  pagination: FeedPagination;
}

export interface FeedFilters {
  categoryId?: string;
  subcategoryId?: string;
  city?: string;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}
