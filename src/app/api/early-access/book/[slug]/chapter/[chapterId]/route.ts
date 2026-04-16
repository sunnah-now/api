import { NextRequest, NextResponse } from 'next/server';
import redis, { chapterHadithsKey } from '@/lib/redis';
import { checkAuth } from '@/lib/auth';
import { getPagination, isValidSlug } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; chapterId: string }> }
) {
  const auth = await checkAuth(request, { allowQueryParam: true });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug, chapterId } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'invalid slug format' }, { status: 400 });
  }

  const id = parseInt(chapterId, 10);
  if (isNaN(id) || id < 1) {
    return NextResponse.json({ error: 'invalid chapter id' }, { status: 400 });
  }

  const { start, end } = getPagination(request);

  try {
    const rawHadiths = await redis.lrange(
      chapterHadithsKey(slug, id),
      start,
      end
    );
    const hadiths = rawHadiths.map((h: string) => JSON.parse(h));
    return NextResponse.json(hadiths);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
