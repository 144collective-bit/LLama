import { useEffect, useState } from 'react'

/**
 * Just enough routing for a landing page and a couple of subpages: the path
 * lives in the URL, links push history, and back/forward re-render.
 */
export function navigate(path: string) {
  if (path !== window.location.pathname) {
    window.history.pushState(null, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  window.scrollTo(0, 0)
}

/** Go to the home page (if not already there), then smooth-scroll to `top`. */
export function navigateHomeAndScroll(top: () => number) {
  if (window.location.pathname === '/') {
    window.scrollTo({ top: top(), behavior: 'smooth' })
    return
  }
  navigate('/')
  // Wait for the home page to render and lay out before measuring.
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
