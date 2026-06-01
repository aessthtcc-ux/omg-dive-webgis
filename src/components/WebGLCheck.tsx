"use client";

import { useEffect, useState } from "react";

interface WebGLCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function checkWebGL2(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const ctx =
      canvas.getContext("webgl2") ||
      canvas.getContext("experimental-webgl2" as "webgl2");
    return !!ctx;
  } catch {
    return false;
  }
}

function getIOSVersion(): number | null {
  if (typeof window === "undefined") return null;
  const match = navigator.userAgent.match(/OS (\d+)_/);
  return match ? parseInt(match[1], 10) : null;
}

export default function WebGLCheck({
  children,
  fallback,
}: WebGLCheckProps) {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
  const hasWebGL2: boolean = checkWebGL2();
  const iosVersion: number | null = getIOSVersion();

  if (iosVersion !== null && iosVersion < 15) {
    setSupported(false);
  } else {
    setSupported(hasWebGL2);
  }
}, []);

  // Saat SSR / loading, tampilkan placeholder
  if (supported === null) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-500">Memuat peta 3D...</p>
      </div>
    );
  }

  // Fallback untuk iOS lama
  if (!supported) {
    return (
      fallback ?? (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px] bg-blue-50 dark:bg-blue-950 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">🌊</div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Tampilan 3D tidak didukung di browser ini
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Perbarui iOS ke versi 15 atau lebih baru untuk melihat peta 3D
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Cara pakai:
// import WebGLCheck from "@/components/WebGLCheck";
//
// <WebGLCheck>
//   <CesiumViewer ... />
// </WebGLCheck>