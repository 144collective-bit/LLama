import { useEffect, useState } from 'react'

/**
 * Just enough routing for a handful of pages: the path lives in the URL,
 * links push history, and back/forward re-render.
 */

/** The swap is the opening page; the token's landing page has its own URL. */
export const ROUTES = {
  swap: '/',
  token: '/token',
  buy: '/buy',
} as const
export function navigate(path: string) {
  if (path !== window.location.pathname) {
    window.history.pushState(null, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  window.scrollTo(0, 0)
}

/** Go to `path` (if not already there), then smooth-scroll to `top`. */
export function navigateAndScroll(path: string, top: () => number) {
  if (window.location.pathname === path) {
    window.scrollTo({ top: top(), behavior: 'smooth' })
    return
  }
  navigate(path)
  // Wait for the page to render and lay out before measuring.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => window.scrollTo({ top: top(), behavior: 'smooth' })),
  )
}

export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname)
  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return pathname
}
