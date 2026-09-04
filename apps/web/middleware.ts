import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root → Landing page
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  // /teacher/* → /admin/* (backward compatibility redirect)
  if (pathname.startsWith('/teacher/')) {
    const newPath = pathname.replace('/teacher/', '/admin/');
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/teacher/:path*'],
};
