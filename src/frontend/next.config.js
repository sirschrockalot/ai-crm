/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    scrollRestoration: true,
    optimizeCss: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Webpack configuration for optimization
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle size for production
    if (!isServer && !dev) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
    }

    // Add support for SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Exclude micro-apps from the build
    config.module.rules.push({
      test: /micro-apps/,
      use: 'ignore-loader',
    });

    // Bundle analyzer for development
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      );
    }

    return config;
  },
  
  // Image optimization
  images: {
    domains: ['localhost', 'your-domain.com', 'api.dealcycle.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
  
  // API rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/:path*`,
      },
    ];
  },
  
  // Environment-specific redirects
  async redirects() {
    return [
      {
        source: '/health',
        destination: '/api/health',
        permanent: false,
      },
    ];
  },
  
  // Enable SWC minification
  swcMinify: true,
  
  // Enable compression
  compress: true,
  
  // Disable powered by header
  poweredByHeader: false,
  
  // Enable strict mode
  reactStrictMode: true,
  
  // Performance optimizations
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Build optimizations
  generateEtags: false,
  
  // Source maps for debugging (only in development)
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
};

module.exports = nextConfig; 