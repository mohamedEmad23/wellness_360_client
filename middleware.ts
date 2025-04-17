import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define paths that don't require authentication
const publicPaths = [
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
]

// Define paths that are always accessible even when authenticated
const alwaysAccessible = ['/', '/about', '/features']

// Define protected paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/settings',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public, always accessible, or protected
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  const isAlwaysAccessible = alwaysAccessible.some(path => pathname === path)
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path)) || 
                          (!isPublicPath && !isAlwaysAccessible)

  // Get the token from cookies
  const token = request.cookies.get('access_token')?.value

  // If the path is public and user is authenticated, redirect to dashboard
  if (isPublicPath && token && !isAlwaysAccessible) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If the path is protected and user is not authenticated, redirect to login
  if (isProtectedPath && !token) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    
    // Store the original path to redirect back after login
    response.cookies.set('redirectTo', pathname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    
    return response
  } 

  return NextResponse.next()
}

// Configure paths that trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
} 