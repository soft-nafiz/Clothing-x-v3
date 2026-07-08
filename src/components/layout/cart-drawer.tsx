"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatBDT } from "@/lib/format";
import { getColorHex } from "@/lib/data/colors";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, subtotal, itemCount } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 z-[80] flex h-[100dvh] w-full max-w-md flex-col border-l border-border bg-background"
            aria-label="Shopping cart"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-lg tracking-wide">
                  Cart ({itemCount()})
                </h2>
              </div>
              <Button
                onClick={closeCart}
                variant="ghost"
                size="icon"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* items */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="font-serif text-xl">Your cart is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Explore our latest drops and find something you love.
                  </p>
                </div>
                <Button asChild onClick={closeCart} className="mt-2">
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={`${item.product_id}-${item.size ?? ""}-${item.color ?? ""}`}
                      className="flex gap-4"
                    >
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded bg-muted">
                        { }
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">{item.name}</p>
                          <button
                            onClick={() =>
                              removeItem(item.product_id, item.size, item.color)
                            }
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {(item.size || item.color) && (
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {item.color && (
                              <span className="inline-flex items-center gap-1.5">
                                {(() => { const hex = getColorHex(item.color); return hex ? <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: hex }} /> : null; })()}
                                {item.color}
                              </span>
                            )}
                            {item.size && <span>Size: {item.size}</span>}
                          </div>
                        )}
                        <p className="mt-1 text-sm font-medium text-primary">
                          {formatBDT(item.price)}
                        </p>
                        <div className="mt-auto flex items-center gap-3">
                          <div className="flex items-center rounded border border-border">
                            <button
                              onClick={() =>
                                updateQty(item.product_id, item.qty - 1, item.size, item.color)
                              }
                              className="px-2 py-1 hover:bg-accent"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-8 px-2 text-center text-sm">
                              {item.qty}
                            </span>
                            <button
                              onClick={() =>
                                updateQty(item.product_id, item.qty + 1, item.size, item.color)
                              }
                              className="px-2 py-1 hover:bg-accent"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="ml-auto text-sm text-muted-foreground">
                            {formatBDT(item.price * item.qty)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-serif text-lg">{formatBDT(subtotal())}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Delivery calculated at checkout. COD nationwide.
                </p>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" asChild onClick={closeCart}>
                    <Link href="/cart">View Cart</Link>
                  </Button>
                  <Button asChild onClick={closeCart}>
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
