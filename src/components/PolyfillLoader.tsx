"use client";

import { useEffect } from "react";

export default function PolyfillLoader() {
  useEffect(() => {
    // Polyfill ResizeObserver — dibutuhkan framer-motion v12
    if (typeof window !== "undefined" && !window.ResizeObserver) {
      import("resize-observer-polyfill").then((module) => {
        window.ResizeObserver = module.default;
      });
    }

    // Polyfill IntersectionObserver — dibutuhkan AOS dan beberapa animasi
    if (typeof window !== "undefined" && !window.IntersectionObserver) {
      import("intersection-observer" as any);
    }

    // Polyfill globalThis untuk iOS 12
    if (typeof globalThis === "undefined") {
      (window as any).globalThis = window;
    }
  }, []);

  return null; // komponen ini tidak render apapun
}