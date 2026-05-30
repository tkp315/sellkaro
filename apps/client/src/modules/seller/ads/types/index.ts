export type Condition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type AdStatus = 'ACTIVE' | 'PAUSED' | 'SOLD';

export interface CreateAdDto {
  title: string;
  description: string;
  price: number;
  condition: Condition;
  city: string;
  area?: string;
  categoryId: string;
  subcategoryId?: string;
  imageUrls?: string[];
  imageAwsUrls?: (string | null)[];
}

export interface UpdateAdDto {
  title?: string;
  description?: string;
  price?: number;
  condition?: Condition;
  city?: string;
  area?: string;
  imageUrls?: string[];
  imageAwsUrls?: (string | null)[];
}

export interface SellerAd {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: Condition;
  status: AdStatus;
  city: string;
  area: string | null;
  viewCount: number;
  createdAt: string;
  images: { id: string; url: string; isCover: boolean; order: number }[];
  product: {
    id: string;
    category: { id: string; name: string };
    subcategory: { id: string; name: string } | null;
  };
}
