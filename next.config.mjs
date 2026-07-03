/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optionally allow build to complete even with minor TS discrepancies (though we fixed them)
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
