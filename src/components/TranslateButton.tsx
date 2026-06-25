"use client";

import { Languages, Loader2 } from "lucide-react";
import { useTranslationContext } from "@/context/TranslationContext";

const TranslateButton = () => {
  const { lang, switchLang, loading } = useTranslationContext();

  return (
    <button
      onClick={switchLang}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all
        bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10
        border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300
        disabled:opacity-50 disabled:cursor-wait"
      title={lang === "en" ? "Ganti ke Indonesia" : "Switch to English"}
    >
      {loading
        ? <Loader2 size={12} className="animate-spin" />
        : <Languages size={13} />
      }
      {lang === "en" ? "ID" : "EN"}
    </button>
  );
};

export default TranslateButton;