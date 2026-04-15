import { NextRequest, NextResponse } from 'next/server';
import redis, { userDailyStatsKey } from '@/lib/redis';
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
    const minuteCounts = await redis.hgetall(userDailyStatsKey(token, day));
    const stats = Object.entries(minuteCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([minute, count]) => ({ minute, count: parseInt(count, 10) }));

    return NextResponse.json({
      token,
      day,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
