import { NextRequest, NextResponse } from 'next/server';
import redis, { bookMetaKey } from '@/lib/redis';
import { checkAuth } from '@/lib/auth';
import { Book } from '@/lib/models';

export async function GET(request: NextRequest) {
  const auth = await checkAuth(request, { allowQueryParam: true });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const slugs = await redis.smembers('books');
    if (!slugs || slugs.length === 0) {
      return NextResponse.json([]);
    }

    slugs.sort();
    const keys = slugs.map(bookMetaKey);
    const metas = await redis.mget(...keys);

    const books: Book[] = metas
      .filter((meta): meta is string => meta !== null)
      .map((meta) => JSON.parse(meta));

    return NextResponse.json(books);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
