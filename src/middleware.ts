import { NextRequest, NextResponse } from 'next/server';

const ES_PATHS = ['/plants', '/articles', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Already on /es/ — forward x-pathname and do nothing else
  if (pathname.startsWith('/es')) {
    return NextResponse.next({
      request: {
        headers: new Headers({ ...Object.fromEntries(request.headers), 'x-pathname': pathname }),
      },
    });
  }

  // Only redirect navigable content paths, not assets or API
  const isContent = ES_PATHS.some(p => pathname === p || pathname.startsWith('/plants/') || pathname.startsWith('/articles/'));

  if (!isContent) {
    return NextResponse.next({
      request: {
        headers: new Headers({ ...Object.fromEntries(request.headers), 'x-pathname': pathname }),
      },
    });
  }

  // Check if user already has a language cookie preference
  const langCookie = request.cookies.get('lang')?.value;
  if (langCookie === 'en') {
    return NextResponse.next({
      request: {
        headers: new Headers({ ...Object.fromEntries(request.headers), 'x-pathname': pathname }),
      },
    });
  }
  if (langCookie === 'es') {
    return NextResponse.redirect(new URL(`/es${pathname}`, request.url));
  }

  // No cookie — check Accept-Language header
  const acceptLang = request.headers.get('accept-language') ?? '';
  const prefersSpanish = /^es\b/i.test(acceptLang.split(',')[0].trim());

  if (prefersSpanish) {
    const response = NextResponse.redirect(new URL(`/es${pathname}`, request.url));
    response.cookies.set('lang', 'es', { maxAge: 60 * 60 * 24 * 30, path: '/' });
    return response;
  }

  return NextResponse.next({
    request: {
      headers: new Headers({ ...Object.fromEntries(request.headers), 'x-pathname': pathname }),
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
