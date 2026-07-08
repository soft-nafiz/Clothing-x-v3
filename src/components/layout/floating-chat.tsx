"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCMS } from "@/lib/hooks/use-cms";

/** Brand SVG icons */
function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.5 2 2 6.14 2 11.25c0 2.88 1.42 5.45 3.65 7.15V22l3.33-1.83c.89.25 1.83.38 2.8.38 5.5 0 10-4.14 10-9.25S17.5 2 12 2zm1 12.5l-2.55-2.72L5.5 14.5l5.45-5.78 2.62 2.72L18.5 9l-5.5 5.5z" />
    </svg>
  );
}
function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

interface SocialOption {
  key: "messenger" | "whatsapp" | "instagram";
  label: string;
  icon: React.FC<{ className?: string }>;
  bg: string;
  hoverBg: string;
}

const OPTIONS: SocialOption[] = [
  { key: "messenger", label: "Messenger", icon: MessengerIcon, bg: "bg-[#0084FF]", hoverBg: "hover:bg-[#0066CC]" },
  { key: "whatsapp", label: "WhatsApp", icon: WhatsappIcon, bg: "bg-[#25D366]", hoverBg: "hover:bg-[#1DB954]" },
  { key: "instagram", label: "Instagram", icon: InstagramIcon, bg: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045]", hoverBg: "hover:opacity-90" },
];

export function FloatingChat() {
  const cms = useCMS();
  const [open, setOpen] = useState(false);

  // Only show chat options that have a link configured
  const activeOptions = OPTIONS.filter((o) => (cms.chatLinks[o.key] ?? "").trim());

  // Don't render the floating chat at all if no social links are configured
  if (activeOptions.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-3 md:bottom-8 md:right-8">
      {/* Expanded social icons */}
      <AnimatePresence>
        {open && (
          <div className="flex flex-col items-end gap-2.5">
            {activeOptions.map((opt, idx) => {
              const Icon = opt.icon;
              return (
                <motion.a
                  key={opt.key}
                  href={cms.chatLinks[opt.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 10 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className={cn(
                    "group flex items-center gap-2.5",
                  )}
                >
                  <span className="rounded-md bg-background/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-md backdrop-blur opacity-0 transition-opacity group-hover:opacity-100">
                    {opt.label}
                  </span>
                  <span className={cn("flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110", opt.bg, opt.hoverBg)}>
                    <Icon className="h-6 w-6" />
                  </span>
                </motion.a>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Main toggle button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-xl transition-colors",
          open ? "bg-foreground" : "bg-primary",
        )}
        aria-label={open ? "Close chat options" : "Open chat options"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
