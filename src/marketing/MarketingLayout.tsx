import { useEffect, type ReactNode } from 'react'
import { initAnalyticsDeferred, useTrackPageview } from '../lib/analytics'
import { initPixel } from './pixel'
import { CookieNotice } from './CookieNotice'

/**
 * Envolve /lp, /termos e /privacidade: inicializa o Pixel da Meta (PageView), o PostHog (adiado
 * para depois do carregamento, pra nunca atrasar a /lp) e mostra o aviso de cookies.
 */
export function MarketingLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    initPixel()
    initAnalyticsDeferred()
  }, [])
  useTrackPageview()

  return (
    <>
      {children}
      <CookieNotice />
    </>
  )
}
