import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { nextUrl, nextauth } = req;
    const isLoggedIn = !!nextauth?.token;
    const userRole = nextauth?.token?.role as string;

    const isAuthPage = nextUrl.pathname.startsWith('/login');
    const isAdminRoute = nextUrl.pathname.startsWith('/admin');
    const isEmployeeRoute = nextUrl.pathname.startsWith('/employee');

    // Redirect logged-in users away from auth pages
    if (isAuthPage && isLoggedIn) {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
      }
      return NextResponse.redirect(new URL('/employee/dashboard', nextUrl));
    }

    // Role-based access control
    if (isLoggedIn) {
      if (isAdminRoute && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/employee/dashboard', nextUrl));
      }
      if (isEmployeeRoute && userRole !== 'employee') {
        return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to login page
        if (pathname.startsWith('/login')) {
          return true;
        }
        
        // Require authentication for admin and employee routes
        if (pathname.startsWith('/admin') || pathname.startsWith('/employee')) {
          return !!token;
        }
        
        return true;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
