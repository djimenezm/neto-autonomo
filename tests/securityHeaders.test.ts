import nextConfig, { contentSecurityPolicy, securityHeaders } from '../next.config';

describe('security headers', () => {
  it('serves a Content Security Policy in enforcement mode', async () => {
    const routeHeaders = await nextConfig.headers?.();
    const globalHeaders = routeHeaders?.find((route) => route.source === '/:path*')?.headers ?? [];
    const headerMap = new Map(globalHeaders.map((header) => [header.key, header.value]));

    expect(headerMap.get('Content-Security-Policy')).toBe(contentSecurityPolicy);
    expect(headerMap.has('Content-Security-Policy-Report-Only')).toBe(false);
  });

  it('keeps the CSP focused on same-origin assets and allowed form delivery', () => {
    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("base-uri 'self'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain("form-action 'self' https://formsubmit.co");
    expect(contentSecurityPolicy).toContain("script-src 'self'");
    expect(contentSecurityPolicy).toContain("require-trusted-types-for 'script'");
    expect(contentSecurityPolicy).toContain("style-src 'self'");
    expect(contentSecurityPolicy).not.toContain(' *');
  });

  it('adds complementary browser security headers', () => {
    const headerMap = new Map(securityHeaders.map((header) => [header.key, header.value]));

    expect(headerMap.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload',
    );
    expect(headerMap.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headerMap.get('X-Frame-Options')).toBe('DENY');
    expect(headerMap.get('Permissions-Policy')).toContain('camera=()');
  });
});
