import { createMDX } from "fumadocs-mdx/next";
import "@editorcn/env/web";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // typedRoutes: true, // disabled due to Next.js 16 bug with @base-ui/react Form types
  reactCompiler: true,
  redirects() {
    return [
      { destination: "/docs/templates", permanent: true, source: "/templates" },
      // Custom controls were replaced by the extensions docs.
      {
        destination: "/docs/extensions.md",
        permanent: true,
        source: "/docs/custom-controls.md",
      },
      {
        destination: "/docs/extensions/table",
        permanent: true,
        source: "/docs/custom-controls/table",
      },
      {
        destination: "/docs/extensions/image-placeholder",
        permanent: true,
        source: "/docs/custom-controls/image",
      },
      {
        destination: "/docs/extensions",
        permanent: true,
        source: "/docs/custom-controls/:path*",
      },
    ];
  },
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
