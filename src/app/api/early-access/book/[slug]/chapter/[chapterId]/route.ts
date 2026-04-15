import { NextRequest, NextResponse } from 'next/server';
import redis, { chapterHadithsKey } from '@/lib/redis';
import { checkAuth } from '@/lib/auth';
import { getPagination } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; chapterId: string } }
) {
  const auth = await checkAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug, chapterId } = params;
  const { start, end } = getPagination(request);

  try {
    const rawHadiths = await redis.lrange(
      chapterHadithsKey(slug, parseInt(chapterId, 10)),
      start,
      end
    );
    const hadiths = rawHadiths.map((h: string) => JSON.parse(h));
    return NextResponse.json(hadiths);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
