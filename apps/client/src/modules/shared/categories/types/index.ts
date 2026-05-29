export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  subcategories: SubCategory[];
}
