const productionWebOrigin = 'https://app.suparpos.com'
const localWebOrigin = 'http://localhost:7357'
const localCallbackOrigin = 'http://localhost:3000'

const allowedWebOrigins = new Set([
  productionWebOrigin,
  localWebOrigin,
])

export function authRedirectTargets(request: Request, source: unknown) {
  const apiOrigin = new URL(request.url).origin
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
