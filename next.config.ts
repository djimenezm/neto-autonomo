import type { NextConfig } from 'next';

const trustedTypesDirective = "require-trusted-types-for 'script'";

const baseContentSecurityPolicy: string[] = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://2caafd8d.sibforms.com",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://www.googletagmanager.com https://www.googleadservices.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google.com https://www.google.es https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net",
  "font-src 'self'",
  "connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-insights.com https://www.google.com https://www.google.es https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://stats.g.doubleclick.net",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  'upgrade-insecure-requests',
];

export function getContentSecurityPolicy(environment = process.env.NODE_ENV) {
  const directives = [...baseContentSecurityPolicy];

  if (environment !== 'development') {
    directives.splice(6, 0, trustedTypesDirective);
  }

  return directives.join('; ');
}

export const contentSecurityPolicy = getContentSecurityPolicy('production');

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
    const activeContentSecurityPolicy = getContentSecurityPolicy();
    const activeSecurityHeaders = securityHeaders.map((header) =>
      header.key === 'Content-Security-Policy'
        ? { ...header, value: activeContentSecurityPolicy }
        : header,
    );

    return [
      {
        source: '/:path*',
        headers: activeSecurityHeaders,
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
