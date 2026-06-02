/** @type {import('next').NextConfig} */
const basePath = "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,

  images: {
    unoptimized: true,
  },

  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },

  // Turbopack config (Next.js 16+)
  turbopack: {},

  // iOS compatibility
  transpilePackages: [
    "framer-motion",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "georaster-layer-for-leaflet",
  ],
  // Compress output
  compress: true,
  
  // Kurangi beban Three.js dan loaders
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    
    // Tree-shake Three.js agar tidak load semua
    config.module.unknownContextCritical = false;
    return config;
  },
};

export default nextConfig;