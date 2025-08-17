export interface ProductImage {
  id: number;
  image: string;
  view_type: string;
}

export interface ProductSize {
  id: number;
  size: string;
  current_stock: number;
}

export interface ProductVariant {
  id: number;
  color: string;
  product_code: string;
  stock_keeping_unit: string;
  cost_price?: string;
  wholesale_price: string;
  min_order_quantity?: number;
  allow_customization?: boolean;
  images?: ProductImage[];  
  sizes: ProductSize[];     
}

export interface ProductFormData {
  id: number;
  name: string;
  product_type?: string;
  description?: string;
  category?: {
    id: number;
    name: string;
    image: string;
  };
  color?: string;
  variants: ProductVariant[];
  images: File[];
}



export interface ProductFilterParams {
  category?: number;
  size?: string;
  fabric?: string;
  price_range?: string;  
  availability?: "in_stock" | "out_of_stock";
  allow_customization?: boolean;
  bestSellers?: boolean;
}
