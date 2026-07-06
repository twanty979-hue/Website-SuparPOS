const allowedOrigins = new Set([
  'https://app.suparpos.com',
  'http://localhost:7357',
])

export function authCorsHeaders(request: Request) {
  const origin = request.headers.get('origin')
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  }
  if (origin && allowedOrigins.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}
