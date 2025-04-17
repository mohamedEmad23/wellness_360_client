// app/api/auth/logout/route.ts

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.delete('access_token')
  // delete the user from local storage
  localStorage.removeItem('user')
  return response
}
