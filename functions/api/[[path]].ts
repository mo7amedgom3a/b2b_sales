/**
 * Cloudflare Pages Function: same-origin proxy for the public catalog API.
 *
 * The API's CORS only allows the production www origin, so on *.pages.dev the
 * page calls `/api/...` on its own host (see src/lib/api.ts) and this forwards
 * it, mirroring the Vite dev/preview proxy. Read-only: GET/HEAD only.
 */
const UPSTREAM = 'https://api.v3.emasteryacademy.com'

export const onRequest = async ({ request }: { request: Request }): Promise<Response> => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
  }

  const url = new URL(request.url)
  const upstream = new URL(url.pathname + url.search, UPSTREAM)

  const response = await fetch(upstream.toString(), {
    method: request.method,
    headers: { Accept: request.headers.get('Accept') ?? 'application/json' },
    cf: { cacheTtl: 300, cacheEverything: true },
  } as RequestInit)

  const headers = new Headers(response.headers)
  headers.delete('set-cookie')
  headers.set('Cache-Control', 'public, max-age=300')
  return new Response(response.body, { status: response.status, headers })
}
