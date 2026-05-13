"use client";

import dynamic from "next/dynamic";

const Mapping2D = dynamic(() => import("@/components/Map/map2d"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950">
      <p className="text-white text-sm animate-pulse">Loading Map...</p>
    </div>
  ),
});

export default function MapWrapper() {
  return <Mapping2D />;
}