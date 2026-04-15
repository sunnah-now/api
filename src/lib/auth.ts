import { NextRequest, NextResponse } from 'next/server';
import redis, { authTokenKey, userDailyStatsKey } from './redis';

export async function checkAuth(request: NextRequest, options: { allowQueryParam?: boolean } = {}) {
  let token = request.headers.get('X-API-Key');
  if (!token && options.allowQueryParam) {
    token = request.nextUrl.searchParams.get('api_key');
  }

  if (!token) {
    return { error: 'missing api token', status: 401 };
  }

  const masterToken = process.env.MASTER_TOKEN;
  if (masterToken && token === masterToken) {
    return {
      token,
      status: 200,
      user: { name: 'Admin', email: 'admin@admin.admin', is_admin: true }
    };
  }

  const userData = await redis.hgetall(authTokenKey(token));
  if (!userData || Object.keys(userData).length === 0) {
    // Check if it's an old string token
    const exists = await redis.exists(authTokenKey(token));
    if (!exists) {
      return { error: 'invalid api token', status: 401 };
    }
    // Handle old token without metadata
    return {
      token,
      status: 200,
      user: { name: 'Unknown', email: 'Unknown' }
    };
  }

  // Record stats
  const now = new Date();
  const day = now.toISOString().split('T')[0];
  const minute = now.toISOString().split('T')[1].substring(0, 5);
  await redis.hincrby(userDailyStatsKey(token, day), minute, 1);
  // Set expiry for daily stats (30 days) to avoid long-term unbounded growth
  await redis.expire(userDailyStatsKey(token, day), 60 * 60 * 24 * 30);

  return {
    token,
    status: 200,
    user: {
      name: userData.name,
      email: userData.email,
      created_at: userData.created_at
    }
  };
}

export async function checkAdminAuth(request: NextRequest) {
  const auth = await checkAuth(request);
  if (auth.error) {
    return auth;
  }

  if (!(auth.user as any).is_admin) {
    return { error: 'forbidden: admin access required', status: 403 };
  }

  return auth;
}
