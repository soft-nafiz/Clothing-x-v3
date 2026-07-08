import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "clegbvjjfaaljqvduogo.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  allowedDevOrigins: ["*.space-z.ai", "*.fcapp.run"],
  // Allow server actions to work behind the gateway proxy
  experimental: {
    serverActions: {
      allowedOrigins: ["*.space-z.ai", "*.fcapp.run", "preview-chat-a90da2c3-e9b3-44cf-8fa4-d02651d58411.space-z.ai"],
    },
  },
};

export default nextConfig;
