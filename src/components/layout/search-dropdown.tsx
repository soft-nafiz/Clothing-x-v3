"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { formatBDT, discountPercent } from "@/lib/format";
import type { Product } from "@/lib/data/types";

interface Props {
  products: Product[];
  className?: string;
  placeholder?: string;
}

/** Search input with instant-feedback floating dropdown. */
export function SearchDropdown({ products, className, placeholder }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 180);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results: Product[] =
    debounced.trim().length < 1
      ? []
      : products
          .filter((p) =>
            p.name.toLowerCase().includes(debounced.toLowerCase())
          )
          .slice(0, 6);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? "Search products, brands, collections…"}
          className="h-10 w-full rounded-md border border-input bg-card/50 pl-10 pr-9 text-sm outline-none transition focus:border-primary focus:bg-card focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Search"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-md border border-border bg-popover shadow-2xl"
          >
            <ul className="max-h-[60vh] overflow-y-auto">
              {results.map((p) => {
                const off = discountPercent(p.base_price, p.compare_price);
                return (
                  <li key={p.id} className="border-b border-border/60 last:border-0">
                    <Link
                      href={`/products/${p.id}`}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/60 transition-colors"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
                        { }
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBDT(p.base_price)}
                          {off && (
                            <span className="ml-2 text-primary">-{off}%</span>
                          )}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              href={`/shop?q=${encodeURIComponent(debounced)}`}
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
              className="block border-t border-border bg-accent/40 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-primary hover:bg-accent"
            >
              View all results
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
