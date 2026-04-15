import { NextRequest, NextResponse } from 'next/server';
import redis, { userStatsKey } from '@/lib/redis';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const auth = await checkAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { token } = params;
  const day = request.nextUrl.searchParams.get('day');

  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }
  if (!day) {
    return NextResponse.json({ error: 'day is required (YYYY-MM-DD)' }, { status: 400 });
  }

  try {
    const calls = await redis.lrange(userStatsKey(token), 0, -1);
    const minuteCounts: Record<string, number> = {};

    for (const call of calls) {
      const date = new Date(call);
      const isoDate = date.toISOString().split('T')[0];
      if (isoDate === day) {
        const minute = date.toISOString().split('T')[1].substring(0, 5);
        minuteCounts[minute] = (minuteCounts[minute] || 0) + 1;
      }
    }

    const stats = Object.entries(minuteCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([minute, count]) => ({ minute, count }));

    return NextResponse.json({
      token,
      day,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
