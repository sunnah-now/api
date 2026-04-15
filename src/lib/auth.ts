import { NextRequest, NextResponse } from 'next/server';
import redis, { authTokenKey, userStatsKey } from './redis';

export async function checkAuth(request: NextRequest) {
  let token = request.headers.get('X-API-Key');
  if (!token) {
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
  const now = new Date().toISOString();
  await redis.rpush(userStatsKey(token), now);

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
