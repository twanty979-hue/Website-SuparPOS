import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authCorsHeaders } from '../../_authCors'

const client = () => createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const admin = () => createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: authCorsHeaders(request),
  })
}

export async function POST(request: Request) {
  const headers = authCorsHeaders(request)
  try {
    const { idToken, fullName: clientFullName, nonce } = await request.json()
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Apple ID token is required' }, { status: 400, headers })
    }

    const { data, error } = await client().auth.signInWithIdToken({
      provider: 'apple',
      token: idToken,
      nonce: typeof nonce === 'string' && nonce ? nonce : undefined,
    })

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || 'Apple sign-in failed' }, { status: 401, headers })
    }

    const user = data.user
    const metadata = user.user_metadata || {}
    const fullName =
      (typeof clientFullName === 'string' && clientFullName.trim()) ||
      String(metadata.full_name || metadata.name || '').trim() ||
      null

    const db = admin()
    const { data: existing, error: profileReadError } = await db
      .from('profiles')
      .select('id,full_name,avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    if (profileReadError) {
      return NextResponse.json({ error: profileReadError.message }, { status: 500, headers })
    }

    if (!existing) {
      const { error: insertError } = await db.from('profiles').insert({
        id: user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500, headers })
      }
    } else if (!existing.full_name && fullName) {
      await db.from('profiles').update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)
    }

    return NextResponse.json({ success: true, session: data.session }, { headers })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers })
  }
}
