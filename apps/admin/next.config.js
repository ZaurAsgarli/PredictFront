const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
  // Transpile shared src directory
  transpilePackages: [],
  webpack: (config, { isServer, defaultLoaders }) => {
    const srcPath = path.resolve(__dirname, '../../src');

    // Add parent directory to module resolution
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, '../../'),
    ];

    // Add alias for src directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@src': srcPath,
    };

    // Add a rule to process JSX files from the shared src directory
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      include: [srcPath],
      use: defaultLoaders.babel,
    });

    return config;
  },
}

module.exports = nextConfig
