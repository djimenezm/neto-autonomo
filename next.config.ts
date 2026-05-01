import type { NextConfig } from 'next';

export const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://formsubmit.co",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "require-trusted-types-for 'script'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-insights.com",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

export const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      '../build/polyfills/polyfill-module': './lib/no-browser-polyfills.ts',
      '../build/polyfills/polyfill-module.js': './lib/no-browser-polyfills.ts',
      'next/dist/build/polyfills/polyfill-module': './lib/no-browser-polyfills.ts',
      'next/dist/build/polyfills/polyfill-module.js': './lib/no-browser-polyfills.ts',
    },
  },
  experimental: {
    inlineCss: true,
  },
};

export default nextConfig;
