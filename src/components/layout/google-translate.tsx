"use client";

import { useEffect, useState, useRef } from "react";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

const LANGUAGES = [
  { code: "bn", label: "বাংলা", english: "Bangla" },
  { code: "en", label: "English", english: "English" },
  { code: "hi", label: "हिन्दी", english: "Hindi" },
  { code: "ur", label: "اردو", english: "Urdu" },
  { code: "ar", label: "العربية", english: "Arabic" },
  { code: "es", label: "Español", english: "Spanish" },
  { code: "fr", label: "Français", english: "French" },
  { code: "de", label: "Deutsch", english: "German" },
  { code: "zh-CN", label: "中文", english: "Chinese" },
  { code: "ja", label: "日本語", english: "Japanese" },
  { code: "ko", label: "한국어", english: "Korean" },
  { code: "pt", label: "Português", english: "Portuguese" },
  { code: "ru", label: "Русский", english: "Russian" },
  { code: "id", label: "Indonesia", english: "Indonesian" },
  { code: "tr", label: "Türkçe", english: "Turkish" },
  { code: "it", label: "Italiano", english: "Italian" },
];

export function GoogleTranslate() {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Load the GTranslate script
    if (!document.getElementById("gtranslate-init-script")) {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement({
            pageLanguage: "en",
            includedLanguages: LANGUAGES.map((l) => l.code).join(","),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          }, "gtranslate-hidden-element");
        }
      };

      const script = document.createElement("script");
      script.id = "gtranslate-init-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.head.appendChild(script);
    }

    // Read current language from cookie
    const cookie = document.cookie.split("; ").find((c) => c.startsWith("googtrans="));
    if (cookie) {
      const lang = cookie.split("=")[1].split("/")[2];
      if (lang) setCurrentLang(lang);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function selectLanguage(code: string) {
    // Set the googtrans cookie and reload
    const value = `/en/${code}`;
    document.cookie = `googtrans=${value}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    setCurrentLang(code);
    setOpen(false);
    // Reload to apply translation
    window.location.reload();
  }

  const current = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[1];

  // Don't render during SSR to avoid hydration mismatch
  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <div ref={ref} className="relative">
      {/* Hidden GTranslate element (required for the script to initialize) */}
      <div id="gtranslate-hidden-element" className="hidden" style={{ position: "absolute", left: "-9999px" }} />

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
        aria-label="Select language"
        title="Translate"
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-medium">{current.english}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-1 max-h-72 w-56 overflow-y-auto rounded-lg border border-border bg-popover p-1.5 shadow-xl">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Select Language
          </p>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLanguage(lang.code)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition hover:bg-accent",
                currentLang === lang.code ? "font-semibold text-primary" : "text-foreground",
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{lang.label}</span>
                <span className="text-xs text-muted-foreground">{lang.english}</span>
              </span>
              {currentLang === lang.code && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
