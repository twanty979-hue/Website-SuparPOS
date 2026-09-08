const productionWebOrigin = 'https://app.suparpos.com'
const localWebOrigin = 'http://localhost:7357'
const localCallbackOrigin = 'http://localhost:3000'

const allowedWebOrigins = new Set([
  productionWebOrigin,
  localWebOrigin,
])

export function authRedirectTargets(request: Request, source: unknown) {
  const host = request.headers.get('host') || '192.168.0.98:3000'
  const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') || host.includes('192.168.') || host.includes('10.') || host.includes('172.') ? 'http' : 'https')
  
  // ป้องกัน 0.0.0.0 ซึ่งมือถือจะเปิดไม่ได้เด็ดขาด ให้แปลงเป็น IP จริง
  const cleanHost = host.includes('0.0.0.0') ? host.replace('0.0.0.0', '192.168.0.98') : host
  const apiOrigin = `${proto}://${cleanHost}`

  if (source !== 'web') {
    return { callbackOrigin: apiOrigin, returnTo: null }
  }

  const requestOrigin = request.headers.get('origin')
  const returnTo =
    requestOrigin && allowedWebOrigins.has(requestOrigin)
      ? requestOrigin
      : productionWebOrigin

  return {
    callbackOrigin:
      returnTo === localWebOrigin ? localCallbackOrigin : apiOrigin,
    returnTo,
  }
}
