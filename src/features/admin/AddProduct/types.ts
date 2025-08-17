export interface Category {
  id: number;
  name: string;
  image?: string;
}

export interface VariantSize {
  size: string;
  current_stock: number;
}

export interface ProductVariant {
  color: string;
  product_code: string;
  stock_keeping_unit: string;
  cost_price: number;
  wholesale_price: number;
  min_order_quantity: number;
  allow_customization: boolean;
  images: File[];
  sizes: VariantSize[];   
}

export interface ProductFormData {
  category_id: number;
  name: string;
  product_type: string;
  fabric: string;
  description: string;
  is_draft: boolean;
  images: File[];
  variants?: ProductVariant[];
}
