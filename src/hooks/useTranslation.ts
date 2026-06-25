"use client";

/**
 * useTranslation.ts
 * Hook sederhana untuk switch bahasa ID ↔ EN
 * Pakai file messages/id.json dan messages/en.json yang di-generate script
 *
 * Taruh file ini di: src/hooks/useTranslation.ts
 */

import { useState, useEffect, useCallback } from "react";

type Lang = "id" | "en";
type Translations = Record<string, string>;

// Cache supaya tidak fetch ulang setiap render
const cache: Partial<Record<Lang, Translations>> = {};

export const useTranslation = () => {
  const [lang, setLang] = useState<Lang>("id");
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(false);

  // Load bahasa dari localStorage saat pertama kali
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "id") {
      setLang(saved);
    }
  }, []);

  // Load file JSON saat bahasa berubah
  useEffect(() => {
    if (lang === "id") {
      setTranslations({});
      return;
    }

    if (cache[lang]) {
      setTranslations(cache[lang]!);
      return;
    }

    setLoading(true);
    fetch(`/messages/${lang}.json`)
      .then(r => r.json())
      .then((data: Translations) => {
        cache[lang] = data;
        setTranslations(data);
      })
      .catch(() => setTranslations({}))
      .finally(() => setLoading(false));
  }, [lang]);

  const switchLang = useCallback(() => {
    const next: Lang = lang === "id" ? "en" : "id";
    setLang(next);
    localStorage.setItem("lang", next);
  }, [lang]);

  // t() = translate function
  // Kalau teks tidak ada di dictionary → tampilkan teks asli
  const t = useCallback(
    (text: string) => translations[text] ?? text,
    [translations]
  );

  return { lang, t, switchLang, loading };
};