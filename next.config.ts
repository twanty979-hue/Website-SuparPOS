import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin brings in jose through jwks-rsa. The Worker bundler resolves
  // jose's `workerd` export, so include its browser build in Next's file trace.
  outputFileTracingIncludes: {
    '/*': ['./node_modules/jose/dist/browser/**/*'],
  },
  async redirects() {
    return [
      {
        source: '/downloads/SuparPOS-Setup.exe',
        destination: 'https://img.pos-foodscan.com/downloads/SuparPOS-Setup.exe',
        permanent: false,
      },
      {
        source: '/download/windows',
        destination: 'https://img.pos-foodscan.com/downloads/SuparPOS-Setup.exe',
        permanent: false,
      },
      {
        source: '/download/android',
        destination: 'https://play.google.com/store/apps/details?id=com.pos.foodscan',
        permanent: false,
      },
    ];
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
