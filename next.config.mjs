/** @type {import('next').NextConfig} */
const basePath = "";

const nextConfig = {
  // ✅ Hapus output: "export" — tidak dibutuhkan di Vercel
  // ✅ Hapus trailingSlash — tidak relevan tanpa static export
  
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,

  images: {
    // ✅ Bisa set unoptimized: false sekarang, tapi biarkan true dulu agar aman
    unoptimized: true,
  },

  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },

  turbopack: {},

  transpilePackages: [
    "framer-motion",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "georaster-layer-for-leaflet",
  ],

  compress: true,

  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.module.unknownContextCritical = false;
    return config;
  },
};

export default nextConfig;