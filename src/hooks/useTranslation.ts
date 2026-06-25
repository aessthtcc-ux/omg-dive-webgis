"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Lang = "id" | "en";
type Translations = Record<string, string>;

// Cache in-memory supaya tidak translate ulang teks yang sama
const translationCache: Partial<Record<Lang, Translations>> = {};
const autoTranslateCache: Record<string, string> = {};

// Manual translations dari id.json (prioritas utama)
let manualTranslations: Translations = {};
let manualLoaded = false;

// Auto-translate via Google Translate (gratis, tanpa API key)
const autoTranslate = async (text: string, targetLang: string): Promise<string> => {
  const cacheKey = `${targetLang}:${text}`;
  if (autoTranslateCache[cacheKey]) return autoTranslateCache[cacheKey];

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    // Google Translate response format: [[["translated","original",...],...],...]
    const translated = data[0]?.map((item: any) => item[0]).join("") || text;
    autoTranslateCache[cacheKey] = translated;
    return translated;
  } catch {
    return text; // fallback ke teks asli kalau gagal
  }
};

export const useTranslation = () => {
  const [lang, setLang] = useState<Lang>("en");
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef<Set<string>>(new Set());

  // Load dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "id") setLang(saved);
  }, []);

  // Load id.json saat switch ke ID
  useEffect(() => {
    if (lang === "en") {
      setTranslations({});
      return;
    }

    if (translationCache[lang]) {
      setTranslations(translationCache[lang]!);
      return;
    }

    setLoading(true);
    fetch(`/locales/${lang}.json`)
      .then(r => r.ok ? r.json() : {})
      .then((data: Translations) => {
        manualTranslations = data;
        manualLoaded = true;
        translationCache[lang] = data;
        setTranslations(data);
      })
      .catch(() => {
        manualLoaded = true;
        setTranslations({});
      })
      .finally(() => setLoading(false));
  }, [lang]);

  const switchLang = useCallback(() => {
    const next: Lang = lang === "en" ? "id" : "en";
    setLang(next);
    localStorage.setItem("lang", next);
  }, [lang]);

  const t = useCallback(
    (text: string): string => {
      // Bahasa Inggris → tampilkan asli
      if (lang === "en") return text;

      // Ada di manual translations (id.json) → pakai
      if (translations[text]) return translations[text];

      // Ada di auto-translate cache → pakai
      const cacheKey = `id:${text}`;
      if (autoTranslateCache[cacheKey]) return autoTranslateCache[cacheKey];

      // Belum ada → trigger auto-translate di background
      if (!pendingRef.current.has(text)) {
        pendingRef.current.add(text);
        autoTranslate(text, "id").then(translated => {
          autoTranslateCache[cacheKey] = translated;
          // Update state supaya komponen re-render dengan teks yang sudah ditranslate
          setTranslations(prev => ({ ...prev, [text]: translated }));
          pendingRef.current.delete(text);
        });
      }

      // Sementara tampilkan teks asli sambil nunggu translate
      return text;
    },
    [translations, lang]
  );

  return { lang, t, switchLang, loading };
};