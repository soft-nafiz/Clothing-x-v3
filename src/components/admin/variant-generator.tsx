"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Sparkles, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ProductOption, ProductVariant } from "@/lib/data/variant-types";
import { COLOR_PALETTE, getColorHex as getColorHexGlobal } from "@/lib/data/colors";

interface OptionRow {
  id: string;
  name: string;
  values: string[];
}

interface VariantRow {
  id: string;
  combination: Record<string, string>;
  price_override: number | null;
  stock: number;
  sku: string;
}

interface Props {
  productId?: string;
  initialOptions?: ProductOption[];
  initialVariants?: ProductVariant[];
  onChange: (options: { name: string; values: string[] }[], variants: { combination: Record<string, string>; price_override: number | null; stock: number; sku: string | null }[]) => void;
}

/** Standard attribute names */
const ATTRIBUTE_OPTIONS = [
  { value: "Size", label: "Size" },
  { value: "Color", label: "Color" },
  { value: "Material", label: "Material" },
  { value: "Fit", label: "Fit" },
  { value: "Style", label: "Style" },
  { value: "Custom", label: "Custom..." },
];

/** Predefined size values */
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "28", "30", "32", "34", "36", "38", "40", "Free Size"];

/** Predefined color values — use the shared 242-color palette */
const COLOR_OPTIONS = COLOR_PALETTE;


/** Cartesian product */
function cartesian<T>(...arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((row) => curr.map((item) => [...row, item])),
    [[]]
  );
}

export function VariantGenerator({ productId, initialOptions, initialVariants, onChange }: Props) {
  const [options, setOptions] = useState<OptionRow[]>(
    (initialOptions ?? []).map((o, i) => ({ id: `opt-${i}`, name: o.name, values: o.values }))
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    (initialVariants ?? []).map((v, i) => ({
      id: `var-${i}`,
      combination: v.combination,
      price_override: v.price_override,
      stock: v.stock,
      sku: v.sku ?? "",
    }))
  );

  const emitChange = useCallback((opts: OptionRow[], vars: VariantRow[]) => {
    const cleanOptions = opts.filter((o) => o.name.trim() && o.values.length > 0).map((o) => ({ name: o.name.trim(), values: o.values }));
    const cleanVariants = vars.map((v) => ({ combination: v.combination, price_override: v.price_override, stock: v.stock, sku: v.sku.trim() || null }));
    onChange(cleanOptions, cleanVariants);
  }, [onChange]);

  function addOption() {
    const newOpts = [...options, { id: `opt-${Date.now()}`, name: "", values: [] }];
    setOptions(newOpts);
  }

  function removeOption(id: string) {
    const newOpts = options.filter((o) => o.id !== id);
    setOptions(newOpts);
    generateVariants(newOpts);
  }

  function updateOptionName(id: string, name: string) {
    setOptions(options.map((o) => (o.id === id ? { ...o, name } : o)));
  }

  function addValueToOption(optId: string, value: string) {
    setOptions((prev) => {
      const next = prev.map((o) => {
        if (o.id === optId && !o.values.includes(value)) {
          return { ...o, values: [...o.values, value] };
        }
        return o;
      });
      return next;
    });
  }

  function removeValueFromOption(optId: string, value: string) {
    setOptions((prev) => {
      const next = prev.map((o) => (o.id === optId ? { ...o, values: o.values.filter((v) => v !== value) } : o));
      return next;
    });
  }

  function generateVariants(opts?: OptionRow[]) {
    const useOpts = opts ?? options;
    const validOpts = useOpts.filter((o) => o.name.trim() && o.values.length > 0);
    if (validOpts.length === 0) { setVariants([]); emitChange(useOpts, []); return; }

    const names = validOpts.map((o) => o.name.trim());
    const valueArrays = validOpts.map((o) => o.values);
    const combos = cartesian(...valueArrays);

    const existingMap = new Map<string, VariantRow>();
    variants.forEach((v) => existingMap.set(JSON.stringify(v.combination), v));

    const newVariants: VariantRow[] = combos.map((combo, i) => {
      const combination: Record<string, string> = {};
      names.forEach((name, idx) => { combination[name] = combo[idx]; });
      const key = JSON.stringify(combination);
      const existing = existingMap.get(key);
      return {
        id: `var-${Date.now()}-${i}`,
        combination,
        price_override: existing?.price_override ?? null,
        stock: existing?.stock ?? 0,
        sku: existing?.sku ?? `${names.map((n) => n[0]).join("")}-${combo.join("")}`.toUpperCase(),
      };
    });
    setVariants(newVariants);
    emitChange(useOpts, newVariants);
  }

  function removeVariant(id: string) {
    const newVars = variants.filter((v) => v.id !== id);
    setVariants(newVars);
    emitChange(options, newVars);
  }

  function updateVariant(id: string, patch: Partial<VariantRow>) {
    const newVars = variants.map((v) => (v.id === id ? { ...v, ...patch } : v));
    setVariants(newVars);
    emitChange(options, newVars);
  }

  const totalStock = variants.reduce((s, v) => s + v.stock, 0);

  /** Get color hex for a color name — uses the shared global palette */
  const getColorHex = getColorHexGlobal;

  return (
    <Card className="overflow-visible">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-heading text-base font-semibold">Variants &amp; Inventory</CardTitle>
          <CardDescription>Define attributes and generate variant combinations</CardDescription>
        </div>
        <Button onClick={() => generateVariants()} size="sm" className="gap-1.5" disabled={options.length === 0 || !options.some((o) => o.name && o.values.length > 0)}>
          <Sparkles className="h-3.5 w-3.5" /> Generate Variants
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Attributes section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Attributes</Label>
            <Button onClick={addOption} variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Attribute
            </Button>
          </div>

          {options.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-6 text-center">
              <p className="text-sm text-muted-foreground">No attributes added yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add attributes like &quot;Size&quot; and &quot;Color&quot; to create variant combinations.</p>
            </div>
          ) : (
            options.map((opt) => (
              <div key={opt.id} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Select
                    value={opt.name === "Size" || opt.name === "Color" || opt.name === "Material" || opt.name === "Fit" || opt.name === "Style" ? opt.name : opt.name ? "Custom" : ""}
                    onValueChange={(v) => {
                      if (v === "Custom") {
                        updateOptionName(opt.id, "");
                      } else {
                        updateOptionName(opt.id, v);
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 flex-1">
                      <SelectValue placeholder="Select attribute type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTRIBUTE_OPTIONS.map((a) => (
                        <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Custom name input when "Custom" is selected */}
                  {opt.name !== "Size" && opt.name !== "Color" && opt.name !== "Material" && opt.name !== "Fit" && opt.name !== "Style" && (
                    <Input
                      value={opt.name}
                      onChange={(e) => updateOptionName(opt.id, e.target.value)}
                      placeholder="Attribute name"
                      className="h-9 flex-1"
                    />
                  )}
                  <Button onClick={() => removeOption(opt.id)} variant="ghost" size="icon" className="h-9 w-7 shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Value selector */}
                <ValueSelector
                  attributeType={opt.name}
                  selectedValues={opt.values}
                  onAdd={(val) => addValueToOption(opt.id, val)}
                  onRemove={(val) => removeValueFromOption(opt.id, val)}
                  getColorHex={getColorHex}
                />
              </div>
            ))
          )}
        </div>

        {/* Generated variants */}
        {variants.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Generated Variants ({variants.length})</Label>
                <span className="text-xs text-muted-foreground">Total stock: <span className="font-semibold text-foreground">{totalStock}</span></span>
              </div>
              <div className="grid gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground" style={{ gridTemplateColumns: "1fr 90px 70px 110px 28px" }}>
                <span>Combination</span><span>Price</span><span>Stock</span><span>SKU</span><span />
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {variants.map((v) => (
                  <div key={v.id} className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr 90px 70px 110px 28px" }}>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(v.combination).map(([key, val]) => (
                        <span key={key} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-medium">
                          {key === "Color" && getColorHex(val) && (
                            <span className="h-2.5 w-2.5 rounded-full border border-border" style={{ backgroundColor: getColorHex(val)! }} />
                          )}
                          {val}
                        </span>
                      ))}
                    </div>
                    <Input type="number" value={v.price_override ?? ""} onChange={(e) => updateVariant(v.id, { price_override: e.target.value ? parseFloat(e.target.value) : null })} className="h-9" placeholder="—" />
                    <Input type="number" value={v.stock} onChange={(e) => updateVariant(v.id, { stock: parseInt(e.target.value) || 0 })} className="h-9" />
                    <Input value={v.sku} onChange={(e) => updateVariant(v.id, { sku: e.target.value })} className="h-9 font-mono text-xs" placeholder="SKU" />
                    <Button onClick={() => removeVariant(v.id)} variant="ghost" size="icon" className="h-9 w-7 text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ---- ValueSelector: tag-based entry with search + color previews ---- */

interface ValueSelectorProps {
  attributeType: string;
  selectedValues: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  getColorHex: (name: string) => string | null;
}

function ValueSelector({ attributeType, selectedValues, onAdd, onRemove, getColorHex }: ValueSelectorProps) {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Build suggestions based on attribute type
  const suggestions = useMemo(() => {
    if (attributeType === "Size") {
      return SIZE_OPTIONS.filter((s) => !selectedValues.includes(s));
    }
    if (attributeType === "Color") {
      return COLOR_OPTIONS.filter((c) => !selectedValues.includes(c.name)).map((c) => c.name);
    }
    return [];
  }, [attributeType, selectedValues]);

  // Filter suggestions by search
  const filteredSuggestions = useMemo(() => {
    if (!search.trim()) return suggestions;
    return suggestions.filter((s) => s.toLowerCase().includes(search.toLowerCase()));
  }, [suggestions, search]);

  function addValue(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setSearch("");
    setShowDropdown(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        addValue(filteredSuggestions[0]);
      } else if (search.trim()) {
        addValue(search);
      }
    } else if (e.key === ",") {
      e.preventDefault();
      if (search.trim()) addValue(search);
    }
  }

  return (
    <div className="space-y-2">
      {/* Selected value tags */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedValues.map((val) => (
            <span key={val} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium">
              {attributeType === "Color" && getColorHex(val) && (
                <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: getColorHex(val)! }} />
              )}
              {val}
              <button onClick={() => onRemove(val)} className="text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input with dropdown */}
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={attributeType === "Size" ? "Type to search sizes (S, M, L, XL...)" : attributeType === "Color" ? "Type to search colors (Black, White...)" : "Type values and press Enter"}
          className="h-9 !focus-visible:ring-1 !focus-visible:ring-ring/30 !focus-visible:border-ring/50"
        />
        {showDropdown && (filteredSuggestions.length > 0 || (search.trim() && !suggestions.includes(search.trim()) && !selectedValues.includes(search.trim()))) && (
          <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
            {filteredSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addValue(sug); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
              >
                {attributeType === "Color" && getColorHex(sug) && (
                  <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: getColorHex(sug)! }} />
                )}
                {sug}
                {selectedValues.includes(sug) && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
            {/* Show "Add custom" option when typing a non-standard value */}
            {search.trim() && !suggestions.some((s) => s.toLowerCase() === search.toLowerCase()) && !selectedValues.includes(search.trim()) && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addValue(search); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors border-t border-border"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                Add &quot;{search.trim()}&quot;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
