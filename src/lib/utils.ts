import { NextRequest } from 'next/server';

export function getPagination(request: NextRequest, defaultSize: number = 50) {
  const searchParams = request.nextUrl.searchParams;
  let page = parseInt(searchParams.get('page') || '1', 10);
  let size = parseInt(searchParams.get('pageSize') || defaultSize.toString(), 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(size) || size < 1) size = defaultSize;

  const start = (page - 1) * size;
  const end = start + size - 1;

  return { start, end };
}
