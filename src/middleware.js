import { NextResponse } from 'next/server';

const allowedRoutes = ['/', '/login', '/register', '/coming-soon', '/admin/dashboard'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/product') ||
    pathname.startsWith('/shop') ||
    pathname.startsWith('/checkout') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|json|txt)$/)
  ) {
    return NextResponse.next();
  }

  if (!allowedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
