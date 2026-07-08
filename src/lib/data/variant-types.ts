/* Phase 1 types: Product variant architecture */

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  values: string[];
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  combination: Record<string, string>;
  price_override: number | null;
  stock: number;
  sku: string | null;
  created_at: string;
}

/** Cart item with variant reference */
export interface CartItemV2 {
  product_id: string;
  variant_id: string | null;
  name: string;
  image: string;
  price: number;
  qty: number;
  combination: Record<string, string> | null;
  stock: number;
}
