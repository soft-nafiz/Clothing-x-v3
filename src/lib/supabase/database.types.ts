/**
 * Auto-generated-style database types for CLOTHING X Supabase schema.
 * Mirrors the SQL migration in supabase/migrations/.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<categories_Insert>;
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<brands_Insert>;
      };
      collections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<collections_Insert>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: Json | null;
          base_price: number;
          compare_price: number | null;
          variants: Json | null;
          stock: number;
          images: string[];
          category_id: string | null;
          brand_id: string | null;
          collection_id: string | null;
          is_featured: boolean;
          is_hot_deal: boolean;
          sales_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: Json | null;
          base_price: number;
          compare_price?: number | null;
          variants?: Json | null;
          stock?: number;
          images: string[];
          category_id?: string | null;
          brand_id?: string | null;
          collection_id?: string | null;
          is_featured?: boolean;
          is_hot_deal?: boolean;
          sales_count?: number;
          created_at?: string;
        };
        Update: Partial<products_Insert>;
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          division: string;
          district: string;
          detailed_address: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          division: string;
          district: string;
          detailed_address: string;
          phone: string;
          created_at?: string;
        };
        Update: Partial<addresses_Insert>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          items: Json;
          total_amount: number;
          delivery_charge: number;
          payment_method: string;
          status: string;
          coupon_code: string | null;
          agent_id: string | null;
          address_id: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          items: Json;
          total_amount: number;
          delivery_charge: number;
          payment_method?: string;
          status?: string;
          coupon_code?: string | null;
          agent_id?: string | null;
          address_id?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          created_at?: string;
        };
        Update: Partial<orders_Insert>;
      };
      promotions: {
        Row: {
          id: string;
          code: string;
          discount_percentage: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_percentage: number;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<promotions_Insert>;
      };
      agents: {
        Row: {
          id: string;
          name: string;
          agent_code: string;
          commission_percentage: number;
          balance: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          agent_code: string;
          commission_percentage: number;
          balance?: number;
          created_at?: string;
        };
        Update: Partial<agents_Insert>;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          user_name: string;
          user_pfp: string | null;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          user_name: string;
          user_pfp?: string | null;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: Partial<reviews_Insert>;
      };
      site_content: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: Partial<site_content_Insert>;
      };
      refund_requests: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          reason: string;
          proof_images: string[];
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          reason: string;
          proof_images?: string[];
          status?: string;
          created_at?: string;
        };
        Update: Partial<refund_requests_Insert>;
      };
      delivery_fees: {
        Row: {
          id: string;
          division: string;
          district: string;
          fee: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          division: string;
          district: string;
          fee: number;
          created_at?: string;
        };
        Update: Partial<delivery_fees_Insert>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: Partial<profiles_Insert>;
      };
    };
    Views: { [key: string]: never };
    Functions: { [key: string]: never };
    Enums: {
      order_status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
      refund_status: "Pending" | "Approved" | "Rejected";
    };
  };
}

// Re-export Insert type aliases used above (TS hoists these)
type categories_Insert = Database["public"]["Tables"]["categories"]["Insert"];
type brands_Insert = Database["public"]["Tables"]["brands"]["Insert"];
type collections_Insert = Database["public"]["Tables"]["collections"]["Insert"];
type products_Insert = Database["public"]["Tables"]["products"]["Insert"];
type addresses_Insert = Database["public"]["Tables"]["addresses"]["Insert"];
type orders_Insert = Database["public"]["Tables"]["orders"]["Insert"];
type promotions_Insert = Database["public"]["Tables"]["promotions"]["Insert"];
type agents_Insert = Database["public"]["Tables"]["agents"]["Insert"];
type reviews_Insert = Database["public"]["Tables"]["reviews"]["Insert"];
type site_content_Insert = Database["public"]["Tables"]["site_content"]["Insert"];
type refund_requests_Insert = Database["public"]["Tables"]["refund_requests"]["Insert"];
type delivery_fees_Insert = Database["public"]["Tables"]["delivery_fees"]["Insert"];
type profiles_Insert = Database["public"]["Tables"]["profiles"]["Insert"];
