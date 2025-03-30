import type { NextConfig } from "next";

// import env just to ensure it's type-checked
import "@/env/server";
import "@/env/client";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
