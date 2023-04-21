import { NextRequest, NextResponse } from 'next/server'
import { env } from './env.mjs'

export const config = {
  matcher: '/dashboard',
}

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization')
  const url = req.nextUrl

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue as string).split(':')

    if (user === env.BASIC_AUTH_USERNAME && pwd === env.BASIC_AUTH_PASSWORD) {
      return NextResponse.next()
    }
  }

  url.pathname = '/api/basic-auth'

  return NextResponse.rewrite(url)
}
