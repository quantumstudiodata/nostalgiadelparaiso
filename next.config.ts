import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Prisma client is generated outside node_modules (src/generated/prisma),
  // so Next's serverless output tracing doesn't automatically pick up the
  // native query-engine binary there. Force it into every function bundle.
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
