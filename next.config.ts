import type { NextConfig } from "next";

// import env just to ensure it's type-checked
import "@/app/(env)/server";
import "@/app/(env)/client";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
