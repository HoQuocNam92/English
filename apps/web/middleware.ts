import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_KEY = 'techenglish.web.session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth page and static files
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Read session from cookie (browser storage not available in middleware — use cookie)
  const sessionCookie = request.cookies.get(SESSION_KEY);
  let role: string | null = null;

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      role = session?.user?.role ?? null;
    } catch {
      role = null;
    }
  }

  // Root redirect
  if (pathname === '/') {
    if (!role) return NextResponse.redirect(new URL('/login', request.url));
    if (role === 'teacher') return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Protect /admin/* — only admin role
  if (pathname.startsWith('/admin')) {
    if (!role) return NextResponse.redirect(new URL('/login', request.url));
    if (role === 'teacher') return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
  }

  // Protect /teacher/* — only teacher role
  if (pathname.startsWith('/teacher')) {
    if (!role) return NextResponse.redirect(new URL('/login', request.url));
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Legacy /dashboard, /users etc — redirect to role-specific route
  const legacyToAdmin = ['/dashboard', '/users', '/students', '/lessons', '/questions', '/tests', '/reports', '/certifications', '/levels', '/progress', '/student-groups', '/test-results', '/learning-content'];
  if (legacyToAdmin.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!role) return NextResponse.redirect(new URL('/login', request.url));
    const base = role === 'teacher' ? '/teacher' : '/admin';
    return NextResponse.redirect(new URL(base + pathname, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
