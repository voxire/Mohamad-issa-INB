import type { NextConfig } from "next";

// Fully static site: `next build` writes plain HTML/CSS/JS to /out.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Two root layouts (EN and AR) → a branded 404 needs app/global-not-found.tsx
  experimental: { globalNotFound: true },
};

export default nextConfig;
