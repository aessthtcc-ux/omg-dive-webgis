"use client";

/**
 * TranslationContext.tsx
 * Global context supaya semua komponen bisa akses t() dan switchLang
 *
 * Taruh file ini di: src/context/TranslationContext.tsx
 *
 * CARA PAKAI DI KOMPONEN:
 *
 *   import { useTranslationContext } from "@/context/TranslationContext";
 *
 *   const { t, lang, switchLang } = useTranslationContext();
 *
 *   return <h1>{t("Selamat Datang di OMG Dive")}</h1>
 *   // → Bahasa ID: "Selamat Datang di OMG Dive"
 *   // → Bahasa EN: "Welcome to OMG Dive"
 */

import { createContext, useContext, ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type TranslationContextType = {
  t: (text: string) => string;
  lang: "id" | "en";
  switchLang: () => void;
  loading: boolean;
};

const TranslationContext = createContext<TranslationContextType>({
  t: (text) => text,
  lang: "en",   // ← ganti ke "en"
  switchLang: () => {},
  loading: false,
});

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const translation = useTranslation();
  return (
    <TranslationContext.Provider value={translation}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => useContext(TranslationContext);