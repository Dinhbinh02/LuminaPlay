import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      global: {
        fetch: (url, options) => {
          const controller = new AbortController()
          const id = setTimeout(() => controller.abort(), 2000)
          return fetch(url, {
            ...options,
            signal: controller.signal,
          }).finally(() => clearTimeout(id))
        },
      },
    }
  )

  // refreshing the auth token safely
  try {
    await supabase.auth.getUser()
  } catch (error) {
    console.error('Supabase auth check timed out or failed:', error)
  }

  return supabaseResponse
}
