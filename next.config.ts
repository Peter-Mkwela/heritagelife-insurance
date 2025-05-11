import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: {
    buildActivity: false, // Disable the loading spinner
    buildActivityPosition: "bottom-right", // Optional: position it elsewhere
  },
  onDemandEntries: {
    // Ensures the overlay doesn't show
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
