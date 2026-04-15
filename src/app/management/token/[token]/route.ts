import { NextRequest, NextResponse } from 'next/server';
import redis, { authTokenKey } from '@/lib/redis';
import { checkAdminAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const auth = await checkAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { token } = params;
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
    }

    await redis.hset(authTokenKey(token), {
      name,
      email,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'token added', token, name, email });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const auth = await checkAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { token } = params;
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  try {
    await redis.del(authTokenKey(token));
    return NextResponse.json({ message: 'token removed', token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
