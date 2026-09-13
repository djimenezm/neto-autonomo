import { getAdsTxtRecord } from '@/lib/ads';

export const dynamic = 'force-dynamic';

export function GET() {
  const record = getAdsTxtRecord();

  if (!record) {
    return new Response(null, { status: 404 });
  }

  return new Response(record, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
