"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatBDT } from "@/lib/format";
import { useCart } from "@/lib/stores/cart-store";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import { CheckoutSteps } from "@/components/shared/checkout-steps";
import { StorefrontShellClient } from "@/components/layout/storefront-shell-client";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, itemCount, clear } = useCart();

  return (
    <StorefrontShellClient>
      <MaxWidthWrapper className="py-8 md:py-12">
        <CheckoutSteps current={1} />
        {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight">
            Your cart is empty
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Looks like you haven&apos;t added anything yet. Explore our latest drops
            and find something you love.
          </p>
          <Button asChild size="lg" className="mt-6 gap-2">
            <Link href="/shop">
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <header className="mb-8 flex items-end justify-between border-b border-border pb-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Shopping Cart
              </p>
              <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
                Cart ({itemCount()})
              </h1>
            </div>
            <Button
              onClick={clear}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              Clear cart
            </Button>
          </header>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Items */}
            <ul className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <li
                  key={`${item.product_id}-${item.size ?? ""}-${item.color ?? ""}`}
                  className="flex gap-4"
                >
                  <Card className="flex-1 p-4">
                    <div className="flex gap-4">
                      <div className="h-28 w-24 shrink-0 overflow-hidden rounded bg-muted">
                        { }
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-3">
                          <Link
                            href={`/products/${item.product_id}`}
                            className="text-sm font-medium leading-tight hover:text-primary md:text-base"
                          >
                            {item.name}
                          </Link>
                          <Button
                            onClick={() => removeItem(item.product_id, item.size, item.color)}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {(item.size || item.color) && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {[item.size, item.color].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <p className="mt-1 text-sm font-semibold text-primary">
                          {formatBDT(item.price)}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center rounded-md border border-border">
                            <button
                              onClick={() => updateQty(item.product_id, item.qty - 1, item.size, item.color)}
                              className="px-2.5 py-1.5 hover:bg-accent"
                              aria-label="Decrease"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-9 text-center text-sm">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.product_id, item.qty + 1, item.size, item.color)}
                              className="px-2.5 py-1.5 hover:bg-accent"
                              aria-label="Increase"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="font-serif text-base font-semibold">
                            {formatBDT(item.price * item.qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <aside className="lg:col-span-1">
              <div className="sticky top-36">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Subtotal ({itemCount()} items)</dt>
                        <dd className="font-medium">{formatBDT(subtotal())}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Delivery</dt>
                        <dd className="text-muted-foreground">Calculated at checkout</dd>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <dt className="font-serif text-base font-semibold">Estimated Total</dt>
                        <dd className="font-serif text-base font-semibold">{formatBDT(subtotal())}</dd>
                      </div>
                    </dl>
                    <Button asChild size="lg" className="mt-6 w-full gap-2 uppercase tracking-wider">
                      <Link href="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                      <Link href="/shop">Continue Shopping</Link>
                    </Button>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Cash on Delivery · Bangladesh only
                    </p>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </>
      )}
      </MaxWidthWrapper>
    </StorefrontShellClient>
  );
}
