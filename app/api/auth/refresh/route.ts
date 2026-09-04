import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function isPermanentAuthError(error: any): boolean {
  if (!error) return false
  const msg = (error.message || '').toLowerCase()
  const code = (error.code || '').toLowerCase()
  const status = error.status

  // Known Supabase permanent token invalidation indicators
  if (code === 'invalid_grant' || code === 'refresh_token_not_found') return true
  if (msg.includes('invalid refresh token') || msg.includes('not valid') || msg.includes('already used') || msg.includes('token expired') || msg.includes('revoked')) {
    return true
  }
  if (status === 400 || status === 401 || status === 422) {
    if (msg.includes('grant') || msg.includes('token') || msg.includes('invalid') || msg.includes('not found')) {
      return true
    }
  }
  return false
}

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json()
    if (!refreshToken || typeof refreshToken !== 'string') {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    let lastError: any = null
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
        if (!error && data?.session) {
          return NextResponse.json(
            { success: true, session: data.session },
            {
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        }

        lastError = error
        if (isPermanentAuthError(error)) {
          // If token is definitely invalid, no need to retry
          break
        }
      } catch (err: any) {
        lastError = err
      }

      if (attempt < maxRetries) {
        await sleep(attempt * 400) // 400ms, 800ms backoff
      }
    }

    // Determine final status
    if (isPermanentAuthError(lastError)) {
      return NextResponse.json(
        { error: lastError?.message || 'Session expired', code: 'invalid_grant' },
        {
          status: 401,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      )
    }

    // Temporary/Network failure: Return 503 so clients DO NOT wipe their local session
    return NextResponse.json(
      {
        error: lastError?.message || 'Authentication service temporarily unavailable',
        code: 'service_unavailable',
        retryable: true,
      },
      {
        status: 503,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Invalid request' },
      { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}
