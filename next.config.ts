import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/adapter-pg",
    "@prisma/client",
    ".prisma/client",
    "pg",
    "pg-cloudflare",
  ],
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/pg-cloudflare/dist/**/*",
      "./node_modules/pg-cloudflare/esm/**/*",
    ],
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
