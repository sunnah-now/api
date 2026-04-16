import { NextRequest, NextResponse } from 'next/server';
import redis, { bookMetaKey } from '@/lib/redis';
import { checkAuth } from '@/lib/auth';
import { isValidSlug } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await checkAuth(request, { allowQueryParam: true });
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'invalid slug format' }, { status: 400 });
  }

  try {
    const raw = await redis.get(bookMetaKey(slug));
    if (!raw) {
      return NextResponse.json({ error: 'book not found' }, { status: 404 });
    }

    const metadata = JSON.parse(raw);

    return NextResponse.json({
      message: `Welcome to the ${metadata.collection} API!`,
      instructions: "To interact with this book's data, use the endpoints listed below.",
      endpoints: {
        all_hadiths: `/api/early-access/book/${slug}/hadith`,
        single_hadith: `/api/early-access/book/${slug}/hadith/<HADITH ID>`,
        volume_hadiths: `/api/early-access/book/${slug}/volume/<VOLUME ID>`,
        chapter_hadiths: `/api/early-access/book/${slug}/chapter/<CHAPTER ID>`,
      },
      docs: "https://docs.sunnah.now",
      metadata: metadata
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
