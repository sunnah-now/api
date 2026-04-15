import { NextRequest, NextResponse } from 'next/server';
import redis, { volumeHadithsKey } from '@/lib/redis';
import { checkAuth } from '@/lib/auth';
import { getPagination } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; volumeId: string } }
) {
  const auth = await checkAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug, volumeId } = params;
  const { start, end } = getPagination(request);

  try {
    const rawHadiths = await redis.lrange(volumeHadithsKey(slug, parseInt(volumeId, 10)), start, end);
    const hadiths = rawHadiths.map((h: string) => JSON.parse(h));
    return NextResponse.json(hadiths);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
