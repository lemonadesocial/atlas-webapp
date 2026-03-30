/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.lemonade.social" },
      { protocol: "https", hostname: "img.evbuc.com" },
      { protocol: "https", hostname: "images.lumacdn.com" },
      { protocol: "https", hostname: "cdn.lu.ma" },
    ],
  },
};

export default nextConfig;
