import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* Next 16 narrowed the default to [75]. Textile detail — sozni stitch,
       kachni linework — falls apart at 75, so 90 is allowed explicitly. */
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
