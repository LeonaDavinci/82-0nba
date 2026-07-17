import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the file-tracing root to this project so unrelated parent-level
  // lockfiles don't confuse Next's workspace-root inference.
  outputFileTracingRoot: __dirname,
  // Radix UI + lucide-react ship many small modules; optimize barrel imports.
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons"],
  },
};

export default nextConfig;
