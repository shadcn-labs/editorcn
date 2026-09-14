import { createMDX } from "fumadocs-mdx/next";
import "@editorcn/env/web";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // typedRoutes: true, // disabled due to Next.js 16 bug with @base-ui/react Form types
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
        protocol: "https",
      },
    ],
  },
  reactCompiler: true,
  rewrites() {
    return [
      {
        destination: "/llms.mdx/docs/:path*",
        source: "/docs/:path*.md",
      },
    ];
  },
  transpilePackages: ["@editorcn/extensions", "@editorcn/editor"],
};

const withMDX = createMDX();
export default withMDX(nextConfig);
