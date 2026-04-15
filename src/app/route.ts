import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Welcome to Sunnah.Now API",
    endpoints: {
      docs: {
        url: "https://docs.sunnah.now",
        description: "Find in-depth information about the API features and endpoints."
      },
      database: {
        url: "https://github.com/sunnah-now/database",
        description: "Download offline dumps of all available hadith from sunnah.now in the structure you like."
      }
    }
  });
}
