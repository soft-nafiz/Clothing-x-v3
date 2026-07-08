"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { User, Package, MapPin, Plus, Pencil, X, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatBDT } from "@/lib/format";
import { DIVISIONS, getDistricts } from "@/lib/data/bangladesh";
import { generateReceiptPDF } from "@/lib/receipt";
import { createClient } from "@/lib/supabase/client";

export interface AccountInitialData {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

interface Address {
  id: string;
  label: string;
  division: string;
  district: string;
  detailed_address: string;
  phone: string;
  is_primary: boolean;
}

export function AccountView({ initialData }: { initialData: AccountInitialData }) {
  const router = useRouter();
  const [name, setName] = useState(initialData.fullName);
  const [pfp, setPfp] = useState<string | null>(initialData.avatarUrl);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ordersRes, addrRes] = await Promise.all([
          fetch(`/api/orders?user_id=${initialData.userId}`).then((r) => r.json()),
          fetch("/api/addresses").then((r) => r.json()),
        ]);
        if (cancelled) return;
        if (Array.isArray(ordersRes.orders)) setOrders(ordersRes.orders);
        if (Array.isArray(addrRes.addresses)) setAddresses(addrRes.addresses);
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [initialData.userId]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  async function saveProfile() {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ data: { full_name: name, avatar_url: pfp } });
      if (error) { toast.error("Failed to update profile"); return; }
      toast.success("Profile updated");
      router.refresh();
    } catch { toast.error("Failed to update profile"); }
  }

  function uploadPfp(file: File) {
    const reader = new FileReader();
    reader.onload = () => { setPfp(reader.result as string); toast.success("Photo updated — click Save Changes"); };
    reader.readAsDataURL(file);
  }

  function downloadReceipt(o: any) {
    generateReceiptPDF({
      orderId: o.id,
      customerName: o.customer_name || name || "Customer",
      customerPhone: o.customer_phone || "",
      items: o.items,
      subtotal: o.total_amount - (o.delivery_charge || 0),
      deliveryCharge: o.delivery_charge || 0,
      discount: 0,
      total: o.total_amount,
      couponCode: o.coupon_code,
      status: o.status,
      paymentMethod: o.payment_method,
      date: o.created_at,
    });
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground"><p className="text-sm">Loading…</p></div>;
  }

  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-border">
            {pfp ? <AvatarImage src={pfp} alt={name} /> : null}
            <AvatarFallback className="bg-primary/15 text-2xl font-bold text-primary">{name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Account</p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">{name}</h1>
            <p className="text-sm text-muted-foreground">{initialData.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
      </header>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="orders" className="gap-2 font-semibold data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground dark:data-active:border-primary data-active:shadow-md">
            <Package className="h-4 w-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2 font-semibold data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground dark:data-active:border-primary data-active:shadow-md">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-2 font-semibold data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground dark:data-active:border-primary data-active:shadow-md">
            <MapPin className="h-4 w-4" /> Addresses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          {orders.length === 0 ? (
            <Card className="border-dashed py-16 text-center">
              <CardContent className="pt-0">
                <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-heading text-lg font-semibold">No orders yet</p>
                <Button asChild className="mt-4"><Link href="/shop">Start Shopping</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o.id}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm font-semibold">{o.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                        </div>
                        <Badge variant="outline">{o.status}</Badge>
                      </div>
                      <ul className="mt-3 space-y-1.5 text-sm">
                        {o.items.map((it: any, i: number) => (
                          <li key={i} className="flex items-center gap-3">
                            <div className="h-10 w-9 shrink-0 overflow-hidden rounded bg-muted"><img src={it.image} alt={it.name} className="h-full w-full object-cover" /></div>
                            <span className="flex-1 truncate">{it.name}</span>
                            <span className="text-muted-foreground">×{it.qty}</span>
                            <span className="font-medium">{formatBDT(it.price * it.qty)}</span>
                          </li>
                        ))}
                      </ul>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{o.items.length} items · COD</span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => downloadReceipt(o)}>
                            <Download className="h-3.5 w-3.5" />Receipt
                          </Button>
                          <span className="font-heading text-base font-semibold">{formatBDT(o.total_amount)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card className="max-w-lg">
            <CardHeader><CardTitle className="font-heading text-lg font-semibold">Profile Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border border-border">
                  {pfp ? <AvatarImage src={pfp} alt={name} /> : null}
                  <AvatarFallback className="bg-primary/15 text-2xl font-bold text-primary">{name.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadPfp(e.target.files[0])} />
                  <span className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-xs uppercase tracking-wider hover:border-foreground">
                    <Upload className="h-3.5 w-3.5" />Change Photo
                  </span>
                </label>
              </div>
              <div><Label className="mb-1.5 block text-xs uppercase">Display Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label className="mb-1.5 block text-xs uppercase">Email</Label><Input type="email" value={initialData.email} disabled className="opacity-60" /></div>
              <Button onClick={saveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <AddressManager addresses={addresses} onChange={setAddresses} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function AddressManager({ addresses, onChange }: { addresses: Address[]; onChange: (a: Address[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState({ label: "", division: "", district: "", detailed_address: "", phone: "", is_primary: false });

  function startAdd() { setForm({ label: "", division: "", district: "", detailed_address: "", phone: "", is_primary: false }); setEditing(null); setAdding(true); }
  function startEdit(a: Address) { setForm({ label: a.label || "", division: a.division, district: a.district, detailed_address: a.detailed_address, phone: a.phone, is_primary: a.is_primary || false }); setEditing(a); setAdding(true); }

  async function save() {
    if (!form.division || !form.district || !form.detailed_address || !form.phone) { toast.error("Fill all fields"); return; }
    try {
      if (editing) {
        const res = await fetch(`/api/addresses/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (!res.ok) { toast.error("Failed"); return; }
        if (form.is_primary) { onChange(addresses.map((a) => (a.id === editing.id ? { ...a, ...form } : { ...a, is_primary: false }))); }
        else { onChange(addresses.map((a) => (a.id === editing.id ? { ...a, ...form } : a))); }
        toast.success("Updated");
      } else {
        const res = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const d = await res.json();
        if (!res.ok) { toast.error("Failed"); return; }
        if (form.is_primary) { onChange([d.address, ...addresses.map((a) => ({ ...a, is_primary: false }))]); }
        else { onChange([...addresses, d.address]); }
        toast.success("Added");
      }
      setAdding(false); setEditing(null);
    } catch { toast.error("Failed"); }
  }

  async function remove(id: string) { try { await fetch(`/api/addresses/${id}`, { method: "DELETE" }); onChange(addresses.filter((a) => a.id !== id)); toast.success("Removed"); } catch { toast.error("Failed"); } }
  async function setPrimary(id: string) { try { await fetch(`/api/addresses/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_primary: true }) }); onChange(addresses.map((a) => ({ ...a, is_primary: a.id === id }))); toast.success("Primary set"); } catch { toast.error("Failed"); } }

  const districts = form.division ? getDistricts(form.division) : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">Saved Addresses</h2>
        {!adding && <Button onClick={startAdd} size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" />Add</Button>}
      </div>
      {adding && (
        <Card className="mb-4 border-primary/40">
          <CardContent className="p-5 space-y-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-base font-semibold">{editing ? "Edit" : "New"} Address</h3>
              <Button onClick={() => setAdding(false)} variant="ghost" size="icon" className="h-7 w-7"><X className="h-4 w-4" /></Button>
            </div>
            <div><Label className="mb-1 block text-xs uppercase">Label</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home, Office..." /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label className="mb-1 block text-xs uppercase">Division *</Label><Select value={form.division} onValueChange={(v) => setForm({ ...form, division: v, district: "" })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{DIVISIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="mb-1 block text-xs uppercase">District *</Label><Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })} disabled={!form.division}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label className="mb-1 block text-xs uppercase">Address *</Label><Textarea value={form.detailed_address} onChange={(e) => setForm({ ...form, detailed_address: e.target.value })} rows={2} /></div>
            <div><Label className="mb-1 block text-xs uppercase">Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_primary} onChange={(e) => setForm({ ...form, is_primary: e.target.checked })} className="h-4 w-4 rounded border-border" />Set as primary</label>
            <Button onClick={save}>{editing ? "Save" : "Add"}</Button>
          </CardContent>
        </Card>
      )}
      {addresses.length === 0 && !adding ? (
        <Card className="border-dashed py-16 text-center"><CardContent className="pt-0"><MapPin className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-heading text-lg font-semibold">No addresses</p></CardContent></Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id}>
              <Card className={a.is_primary ? "border-primary/40" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold">{a.label || "Address"}</p>
                      {a.is_primary && <Badge className="bg-primary text-primary-foreground text-[10px]">Primary</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button onClick={() => startEdit(a)} variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button onClick={() => remove(a.id)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{a.detailed_address}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.district}, {a.division}</p>
                  <p className="mt-1 text-xs font-medium">{a.phone}</p>
                  {!a.is_primary && <Button onClick={() => setPrimary(a.id)} variant="outline" size="sm" className="mt-2 h-7 text-xs">Set Primary</Button>}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
