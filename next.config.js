/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    forceSwcTransforms: false,
  },

  webpack: (config, { dev, isServer }) => {
    // face-api.js를 위한 폴리필 설정
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        encoding: false,
      };
    }

    // 개발 모드 최적화
    if (dev) {
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**'],
      };
    }

    return config;
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