import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin brings in jose through jwks-rsa. The Worker bundler resolves
  // jose's `workerd` export, so include its browser build in Next's file trace.
  outputFileTracingIncludes: {
    '/*': ['./node_modules/jose/dist/browser/**/*'],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
