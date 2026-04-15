import { NextRequest, NextResponse } from 'next/server';
import redis, { hadithIDKey } from '@/lib/redis';
import { checkAuth } from '@/lib/auth';
import { isValidSlug } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; hadithId: string } }
) {
  const auth = await checkAuth(request, { allowQueryParam: true });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug, hadithId } = params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'invalid slug format' }, { status: 400 });
  }

  const id = parseInt(hadithId, 10);
  if (isNaN(id) || id < 1) {
    return NextResponse.json({ error: 'invalid hadith id' }, { status: 400 });
  }

  try {
    const raw = await redis.get(hadithIDKey(id));
    if (!raw) {
      return NextResponse.json({ error: 'hadith not found' }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(raw));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
