import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 배포 최적화 설정
  output: 'standalone',
  
  // 이미지 최적화 설정
  images: {
    domains: ['localhost','example.com'],
    unoptimized: false,
  },
  
  
  // 웹팩 설정
  webpack: (config, { isServer }) => {
    // MediaPipe 관련 설정
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    return config;
  },
  
  // 환경 변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
