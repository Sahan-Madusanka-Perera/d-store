import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Pre-launch gate. Flip COMING_SOON in the Netlify environment; no code change needed,
// though Netlify needs a redeploy for the new value to reach the build.
const COMING_SOON = process.env.COMING_SOON === 'true'

// Routes that must keep working while the gate is up: the splash itself, everything
// needed to sign in as an admin, the admin panel, and the one API the splash calls.
// Everything else — including /api/products — is sealed, so nothing about the
// catalogue leaks to someone poking at endpoints directly.
const GATE_EXEMPT = [
  '/coming-soon',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/unauthorized',
  '/auth',
  '/admin',
  '/api/auth',
  '/api/newsletter/subscribe',
]

function isExempt(pathname: string): boolean {
  return GATE_EXEMPT.some(route => pathname === route || pathname.startsWith(`${route}/`))
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Resolved lazily and cached for this request — the role lookup is a database round
  // trip, so guests (the common case behind the gate) never pay for it.
  let roleChecked = false
  let isAdmin = false
  const checkIsAdmin = async () => {
    if (roleChecked) return isAdmin
    roleChecked = true
    if (!user) return false
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
    return isAdmin
  }

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      // Redirect to login page if trying to access admin without authentication
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!(await checkIsAdmin())) {
      // Redirect to unauthorized page if user is not admin
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Pre-launch gate: everyone but a signed-in admin lands on the splash.
  if (COMING_SOON && !isExempt(pathname)) {
    if (!(await checkIsAdmin())) {
      return NextResponse.redirect(new URL('/coming-soon', request.url))
    }
  }

  // Once the gate is off, the splash stops being a reachable page.
  if (!COMING_SOON && pathname === '/coming-soon') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object
  //    before finally returning it:
  //    return myNewResponse
  // Failing to do this will likely cause you and your users to get stuck in
  // redirect loops.

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhook (webhook endpoints that shouldn't be protected)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}