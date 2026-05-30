export type Condition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type AdStatus = 'ACTIVE' | 'PAUSED' | 'SOLD';

export interface CreateAdDto {
  title: string;
  description: string;
  price: number;
  condition: Condition;
  city: string;
  area?: string;
  lat?: number;
  lng?: number;
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
  lat?: number;
  lng?: number;
  imageUrls?: string[];
  imageAwsUrls?: (string | null)[];
}
