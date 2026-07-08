"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, Variant } from "@/lib/data/types";

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discountPercent: number;
  agentCode: string | null;
  isOpen: boolean;

  // actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, qty?: number, size?: string, color?: string) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQty: (productId: string, qty: number, size?: string, color?: string) => void;
  clear: () => void;
  applyCoupon: (code: string, discount: number, agentCode?: string | null) => void;
  removeCoupon: () => void;

  // selectors
  itemCount: () => number;
  subtotal: () => number;
  discountAmount: () => number;
}

const lineKey = (productId: string, size?: string, color?: string) =>
  `${productId}__${size ?? ""}__${color ?? ""}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discountPercent: 0,
      agentCode: null,
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, qty = 1, size, color) => {
        const key = lineKey(product.id, size, color);
        const existing = get().items.find((i) => lineKey(i.product_id, i.size, i.color) === key);

        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              lineKey(i.product_id, i.size, i.color) === key
                ? { ...i, qty: Math.min(i.qty + qty, i.stock) }
                : i
            ),
          }));
        } else {
          const newItem: CartItem = {
            product_id: product.id,
            name: product.name,
            image: product.images[0] ?? "",
            price: product.base_price,
            qty,
            size,
            color,
            stock: product.stock,
          };
          set((s) => ({ items: [...s.items, newItem] }));
        }
      },

      removeItem: (productId, size, color) => {
        const key = lineKey(productId, size, color);
        set((s) => ({ items: s.items.filter((i) => lineKey(i.product_id, i.size, i.color) !== key) }));
      },

      updateQty: (productId, qty, size, color) => {
        if (qty <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        const key = lineKey(productId, size, color);
        set((s) => ({
          items: s.items.map((i) =>
            lineKey(i.product_id, i.size, i.color) === key
              ? { ...i, qty: Math.min(qty, i.stock) }
              : i
          ),
        }));
      },

      clear: () => set({ items: [], couponCode: null, discountPercent: 0, agentCode: null }),

      applyCoupon: (code, discount, agentCode = null) =>
        set({ couponCode: code, discountPercent: discount, agentCode }),

      removeCoupon: () => set({ couponCode: null, discountPercent: 0, agentCode: null }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      discountAmount: () => {
        const sub = get().subtotal();
        return Math.round((sub * get().discountPercent) / 100);
      },
    }),
    { name: "clothing-x-cart" }
  )
);
