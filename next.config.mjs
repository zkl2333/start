// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.google.com",
      },
      {
        protocol: "https",
        hostname: "**.bing.com",
      },
      {
        hostname: "*",
      },
    ],
  },
};

export default nextConfig;
