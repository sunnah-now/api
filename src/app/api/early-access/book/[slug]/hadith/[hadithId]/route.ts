import { NextRequest, NextResponse } from 'next/server';
import redis, { hadithIDKey } from '@/lib/redis';
import { checkAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; hadithId: string } }
) {
  const auth = await checkAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { hadithId } = params;

  try {
    const raw = await redis.get(hadithIDKey(parseInt(hadithId, 10)));
    if (!raw) {
      return NextResponse.json({ error: 'hadith not found' }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(raw));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
