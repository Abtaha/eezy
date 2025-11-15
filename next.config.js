/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,  /*needed this line to be able to view images that are not in webp or avif format
                        placehold.co does support webp and avif but the img quality went down significantly
                        when I tried so I chose to use png anyway*/
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co', //to make my dummy data for the product page work. 
      },
    ],
  },
};

export default config;