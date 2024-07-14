/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["www.google.com", "www.bing.com"],
  },
};

export default nextConfig;
