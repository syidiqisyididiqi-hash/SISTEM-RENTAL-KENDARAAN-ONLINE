import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */

const frontendRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactCompiler: true,

  turbopack: {
    root: frontendRoot,
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;