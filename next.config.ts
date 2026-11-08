import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Shopify CDN product imagery (cdn.shopify.com and siblings)
        protocol: "https",
        hostname: "*.shopify.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
