"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Tag, Truck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatBDT } from "@/lib/format";
import { useCart } from "@/lib/stores/cart-store";
import { DIVISIONS, getDistricts, defaultDeliveryFee } from "@/lib/data/bangladesh";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import { CheckoutSteps } from "@/components/shared/checkout-steps";
import { StorefrontShellClient } from "@/components/layout/storefront-shell-client";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground"><p>Loading…</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    items, subtotal, itemCount, clear,
    couponCode, discountPercent, agentCode,
    applyCoupon, removeCoupon, discountAmount,
  } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [placed, setPlaced] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Array<{
    id: string; label: string; division: string; district: string;
    detailed_address: string; phone: string; is_primary: boolean;
  }>>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Pre-fill from query (?agent=ARIF10)
  useEffect(() => {
    const agent = searchParams.get("agent");
    if (agent && !couponCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCouponInput(agent.toUpperCase());
    }
  }, [searchParams, couponCode]);

  // Auto-fill name + address for signed-in users
  useEffect(() => {
    // Fetch user profile (name, email, avatar) from Supabase Auth
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
           
          setName(data.user.full_name || data.user.email?.split("@")[0] || "");
        }
      })
      .catch(() => { /* not logged in */ });

    // Fetch saved addresses
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data) => {
        if (data.addresses && data.addresses.length > 0) {
           
          setSavedAddresses(data.addresses);
          const primary = data.addresses.find((a: any) => a.is_primary) || data.addresses[0];
           
          setSelectedAddressId(primary.id);
           
          setPhone(primary.phone || "");
           
          setDivision(primary.division || "");
           
          setDistrict(primary.district || "");
           
          setAddress(primary.detailed_address || "");
        }
      })
      .catch(() => { /* not logged in, skip */ });
  }, []);

  function selectAddress(id: string) {
    setSelectedAddressId(id);
    const addr = savedAddresses.find((a) => a.id === id);
    if (addr) {
      setPhone(addr.phone);
      setDivision(addr.division);
      setDistrict(addr.district);
      setAddress(addr.detailed_address);
    }
  }

  const districts = division ? getDistricts(division) : [];
  const deliveryFee = useMemo(
    () => (division && district ? defaultDeliveryFee(division, district) : 0),
    [division, district],
  );
  const total = Math.max(0, subtotal() - discountAmount() + deliveryFee);

  if (placed) {
    return (
      <StorefrontShellClient>
        <MaxWidthWrapper className="py-8 md:py-12">
          <CheckoutSteps current={3} />
          <OrderConfirmation
            orderId={placed}
            name={name}
            phone={phone}
            total={total}
            deliveryFee={deliveryFee}
            onContinue={() => router.push("/shop")}
          />
        </MaxWidthWrapper>
      </StorefrontShellClient>
    );
  }

  if (items.length === 0) {
    return (
      <StorefrontShellClient>
        <MaxWidthWrapper className="py-8 md:py-12">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="font-serif text-2xl">Your cart is empty</p>
          <Button asChild className="mt-4">
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
        </MaxWidthWrapper>
      </StorefrontShellClient>
    );
  }

  async function applyCouponCode() {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      toast.error("Enter a coupon or agent code");
      return;
    }
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        toast.error("Invalid code", { description: "Double-check the code and try again." });
        return;
      }
      applyCoupon(data.code, data.discount, data.is_agent ? data.code : null);
      toast.success(
        data.is_agent ? `Agent code applied — ${data.discount}% off` : `Coupon applied — ${data.discount}% off`,
        { description: data.is_agent ? `${data.code} will receive commission credit.` : undefined },
      );
    } catch {
      toast.error("Failed to validate code");
    }
  }

  async function placeOrder() {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone");
      return;
    }
    if (!division || !district) {
      toast.error("Please select your division and district");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter your detailed address");
      return;
    }
    if (!/^\+?8?8?0?\d{10,11}$/.test(phone.replace(/[\s-]/g, ""))) {
      toast.error("Please enter a valid Bangladeshi phone number");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          total_amount: total,
          delivery_charge: deliveryFee,
          coupon_code: couponCode,
          agent_code: agentCode,
          customer_name: name,
          customer_phone: phone,
          division,
          district,
          address,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Failed to place order", { description: data.error });
        setPlacing(false);
        return;
      }
      setPlaced(data.order_id);
      clear();
      setPlacing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Failed to place order. Please try again.");
      setPlacing(false);
    }
  }

  return (
    <StorefrontShellClient>
      <MaxWidthWrapper className="py-8 md:py-12">
        <CheckoutSteps current={2} />
        <header className="mb-8 border-b border-border pb-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Checkout
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            Complete Your Order
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cash on Delivery · Bangladesh shipping only · {itemCount()} item{itemCount() !== 1 && "s"} in cart
          </p>
        </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ck-name" className="mb-1.5 block text-xs uppercase tracking-wider">
                  Full Name
                </Label>
                <Input
                  id="ck-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahim Uddin"
                />
              </div>
              <div>
                <Label htmlFor="ck-phone" className="mb-1.5 block text-xs uppercase tracking-wider">
                  Phone Number
                </Label>
                <Input
                  id="ck-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  inputMode="tel"
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg font-semibold">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Saved address selector for signed-in users */}
              {savedAddresses.length > 0 && (
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Saved Addresses</Label>
                  <Select value={selectedAddressId} onValueChange={selectAddress}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a saved address" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedAddresses.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.label || "Address"} — {a.district}, {a.division}
                          {a.is_primary ? " (Primary)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Division</Label>
                  <Select value={division} onValueChange={(v) => { setDivision(v); setDistrict(""); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIVISIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">District</Label>
                  <Select
                    value={district}
                    onValueChange={setDistrict}
                    disabled={!division}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={division ? "Select district" : "Pick a division first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="ck-addr" className="mb-1.5 block text-xs uppercase tracking-wider">
                  Detailed Address
                </Label>
                <Textarea
                  id="ck-addr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, road #, area, landmark..."
                  rows={3}
                />
              </div>
              {division && district && (
                <div className="flex items-center gap-2 rounded border border-border bg-accent/40 px-3 py-2 text-xs">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Delivery to <strong>{district}, {division}</strong> — {formatBDT(deliveryFee)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coupon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <Tag className="h-4 w-4 text-primary" /> Promo / Agent Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              {couponCode ? (
                <div className="flex items-center justify-between rounded border border-primary/40 bg-primary/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {couponCode} — {discountPercent}% off
                    </p>
                    {agentCode && (
                      <p className="text-xs text-muted-foreground">
                        Agent commission will be credited on delivery.
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => { removeCoupon(); setCouponInput(""); }}
                    variant="ghost"
                    size="sm"
                    className="text-xs uppercase tracking-wider text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="WELCOME10, ARIF10, FIFA2026..."
                    className="flex-1 uppercase"
                  />
                  <Button onClick={applyCouponCode} variant="outline">Apply</Button>
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Try <code className="rounded bg-muted px-1 py-0.5">WELCOME10</code> for 10% off,
                or an agent code like <code className="rounded bg-muted px-1 py-0.5">ARIF10</code>.
              </p>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <Wallet className="h-4 w-4 text-primary" /> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded border border-primary/40 bg-primary/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Cash on Delivery (COD)</p>
                    <p className="text-xs text-muted-foreground">Pay with cash when your order arrives.</p>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                No online payment required. Inspect your order before paying.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-1">
          <div className="sticky top-36">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 border-b border-border pb-4">
                  {items.map((item) => (
                    <li key={`${item.product_id}-${item.size ?? ""}-${item.color ?? ""}`} className="flex gap-3">
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded bg-muted">
                        { }
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                          {item.qty}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{item.name}</p>
                        {(item.size || item.color) && (
                          <p className="text-[10px] text-muted-foreground">
                            {[item.size, item.color].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs font-semibold">{formatBDT(item.price * item.qty)}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd>{formatBDT(subtotal())}</dd>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-primary">
                      <dt>Discount ({discountPercent}%)</dt>
                      <dd>−{formatBDT(discountAmount())}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd>{deliveryFee > 0 ? formatBDT(deliveryFee) : "—"}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="font-serif text-base font-semibold">Total</dt>
                    <dd className="font-serif text-base font-semibold">{formatBDT(total)}</dd>
                  </div>
                </dl>

                <Button
                  onClick={placeOrder}
                  disabled={placing}
                  size="lg"
                  className="mt-6 w-full gap-2 uppercase tracking-wider"
                >
                  {placing ? "Placing Order..." : "Place Order (COD)"}
                  {!placing && <ArrowRight className="h-4 w-4" />}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  By placing this order you agree to our terms & refund policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
      </MaxWidthWrapper>
    </StorefrontShellClient>
  );
}

function OrderConfirmation({
  orderId, name, phone, total, deliveryFee, onContinue,
}: {
  orderId: string;
  name: string;
  phone: string;
  total: number;
  deliveryFee: number;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
        <CheckCircle2 className="h-10 w-10 text-primary" />
      </div>
      <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
        Order Placed!
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Thank you{name ? `, ${name.split(" ")[0]}` : ""}. We&apos;ve received your order
        and will call <strong>{phone}</strong> shortly to confirm.
      </p>

      <Card className="mt-8 text-left">
        <CardContent className="p-6">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Order ID</dt>
              <dd className="font-mono font-semibold">{orderId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Payment</dt>
              <dd>Cash on Delivery</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{formatBDT(deliveryFee)}</dd>
            </div>
            <Separator />
            <div className="flex justify-between">
              <dt className="font-serif text-base font-semibold">Total Due</dt>
              <dd className="font-serif text-base font-semibold">{formatBDT(total)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild variant="outline">
          <a href="/account">View My Orders</a>
        </Button>
        <Button onClick={onContinue}>Continue Shopping</Button>
      </div>
    </div>
  );
}
