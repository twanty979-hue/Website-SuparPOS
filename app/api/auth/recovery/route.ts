import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authCorsHeaders } from '../../_authCors'
import { authRedirectTargets } from '../../_authRedirect'

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: authCorsHeaders(request),
  })
}

export async function POST(request: Request) {
  const headers = authCorsHeaders(request)
  try {
    const { email, source } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400, headers })
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
    const { callbackOrigin, returnTo } = authRedirectTargets(request, source)
    const callbackUrl = new URL('/auth/callback', callbackOrigin)
    callbackUrl.searchParams.set('type', 'recovery')
    callbackUrl.searchParams.set('source', source === 'app' ? 'app' : 'web')
    if (returnTo) callbackUrl.searchParams.set('return_to', returnTo)

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: callbackUrl.toString(),
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400, headers })

    // Do not reveal whether an email exists in the system.
    return NextResponse.json({ success: true }, { headers })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers })
  }
}
