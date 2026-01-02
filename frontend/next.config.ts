import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Configure webpack to resolve modules from frontend directory first
  webpack: (config) => {
    // Ensure webpack resolves modules from the frontend directory first
    const frontendNodeModules = path.resolve(__dirname, 'node_modules');
    
    // Set module resolution to prioritize frontend node_modules
    config.resolve.modules = [
      frontendNodeModules,
      ...(config.resolve.modules || []),
    ];
    
    return config;
  },
};

export default nextConfig;
