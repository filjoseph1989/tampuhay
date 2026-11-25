import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["tampuhay.test"],
  async redirects() {
    // The old /report page was replaced by /breakdown.
    return [{ source: "/report", destination: "/breakdown", permanent: true }];
  },
};

export default nextConfig;
