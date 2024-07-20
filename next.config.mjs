// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      {
        hostname: "*",
      },
    ],
  },
};

export default nextConfig;
