import { NextResponse } from 'next/server';

export async function GET() {
  return new Response('OK - sunnah.now v0.1.0 - ' + new Date().toISOString(), {
    status: 200,
  });
}
