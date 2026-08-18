/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.beehiiv.com",
      },
      {
        protocol: "https",
        hostname: "beehiiv-images-production.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "media.beehiiv.com",
      },
      {
        protocol: "https",
        hostname: "framerusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default nextConfig;
