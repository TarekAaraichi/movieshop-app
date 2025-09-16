import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", port: "" },
      { protocol: "https", hostname: "via.placeholder.com", port: "" },
      { protocol: "https", hostname: "image.tmdb.org", port: "" },
      { protocol: "https", hostname: "media.themoviedb.org", port: "" },
    ],
  },
};

export default nextConfig;
