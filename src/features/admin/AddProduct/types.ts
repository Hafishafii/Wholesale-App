// Category type
export interface Category {
  id: number;
  name: string;
  image?: string;
}

// Size for each variant
export interface VariantSize {
  id?: number;
  size: string;
  current_stock: number;
}

// Image for each variant
export interface VariantImage {
  id?: number;
  image: string | File; 
  view_type: "front" | "back" | "side" | "top" | "bottom" | string; 
}

// Variant definition
export interface ProductVariant {
  id?: number;
  color: string;
  product_code: string;
  stock_keeping_unit: string;
  cost_price?: number;
  wholesale_price?: number;
  min_order_quantity?: number;
  allow_customization: boolean;
  images: VariantImage[];
  sizes: VariantSize[];
}

// Main product form data
export interface ProductFormData {
  category_id: number;
  name: string;
  product_type: string;
  fabric: string;
  description: string;
  is_draft: boolean;
  variants: ProductVariant[];
}
