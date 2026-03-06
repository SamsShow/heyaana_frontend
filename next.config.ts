import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "t.me",
      },
      {
        protocol: "https",
        hostname: "*.telegram.org",
      },
    ],
  },
  // @coinbase/cdp-sdk and @base-org/account are server-side SDKs pulled in
  // transitively by @reown/appkit-adapter-wagmi → @wagmi/connectors.
  // Exclude them from the SSR bundle so Node.js resolves them natively,
  // avoiding the "Can't resolve 'axios'" Turbopack error.
  serverExternalPackages: ["@coinbase/cdp-sdk", "@base-org/account"],
};

export default nextConfig;
