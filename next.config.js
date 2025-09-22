/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // HMR 완전 비활성화
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: false,
        ignored: /node_modules/
      };
    }
    return config;
  },
  // 실험적 기능 설정
  experimental: {
    // Fast Refresh 안정화
    esmExternals: false
  },
  // 한글 URL을 영문 폴더로 매핑 (SEO 유지)
  async rewrites() {
    return [
      {
        source: '/관상',
        destination: '/gwansang'
      },
      {
        source: '/관상/:path*',
        destination: '/gwansang/:path*'
      }
    ]
  }
};

module.exports = nextConfig;