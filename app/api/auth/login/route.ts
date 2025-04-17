import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include', // Required to receive the Set-Cookie
  })

  const resBody = await response.json()

  // Create a raw HTTP response
  const res = new NextResponse(JSON.stringify(resBody), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Get the cookie from response header and rename it to access_token if needed
  const setCookie = response.headers.get('set-cookie')
  if (setCookie) {
    // If the backend returns accessToken, rename it to access_token
    const updatedCookie = setCookie.replace(/accessToken=/g, 'access_token=')
    res.headers.set('Set-Cookie', updatedCookie)
  }

  return res
} 