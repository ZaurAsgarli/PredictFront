const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  webpack: (config, { isServer, defaultLoaders }) => {
    // Add parent directory to module resolution
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, '../../'),
    ];
    // Add alias for src directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@src': path.resolve(__dirname, '../../src'),
    };
    
    // Transpile JSX/JS files from the shared src directory
    const srcPath = path.resolve(__dirname, '../../src');
    
    // Find and modify the oneOf rule
    const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
    if (oneOfRule) {
      oneOfRule.oneOf.forEach((rule) => {
        // Find rules that handle JS/JSX files
        if (
          rule.test &&
          typeof rule.test === 'object' &&
          rule.test.toString &&
          (rule.test.toString().includes('jsx') || rule.test.toString().includes('tsx'))
        ) {
          // Remove any exclude that might prevent processing
          if (rule.exclude) {
            // Don't exclude our src directory
            if (Array.isArray(rule.exclude)) {
              rule.exclude = rule.exclude.filter(
                (exclude) => !exclude.toString().includes(srcPath)
              );
            } else if (rule.exclude.toString().includes(srcPath)) {
              delete rule.exclude;
            }
          }
          
          // Ensure src directory is included
          if (rule.include) {
            if (Array.isArray(rule.include)) {
              if (!rule.include.some((inc) => inc.toString().includes(srcPath))) {
                rule.include.push(srcPath);
              }
            } else if (!rule.include.toString().includes(srcPath)) {
              rule.include = [rule.include, srcPath];
            }
          } else {
            rule.include = srcPath;
          }
        }
      });
    }
    
    return config;
  },
}

module.exports = nextConfig

