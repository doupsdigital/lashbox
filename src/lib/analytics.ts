// PostHog: análise de uso + gravação de sessão (mascarada). Uma única instalação, usada tanto na
// /lp quanto no app logado (mesmo domínio, mesmo projeto). Sem VITE_POSTHOG_KEY (modo local, ou
// qualquer ambiente sem a variável configurada), tudo aqui vira no-op — nunca quebra o app.
import posthog from 'posthog-js'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com'

let ready = false

function doInit() {
  if (ready || !KEY) return
  ready = true
  posthog.init(KEY, {
    api_host: HOST,
    autocapture: false,
    capture_pageview: false, // pageview manual (ver trackPageview/useTrackPageview) — cobre as trocas de tela da SPA
    session_recording: {
      maskAllInputs: true,
    },
    // Só pra testes automatizados locais (Playwright etc.) — nunca configurado em produção.
    // Sem essa env var, o PostHog continua descartando eventos de navegador automatizado normalmente.
    ...(import.meta.env.VITE_POSTHOG_TEST_MODE ? { opt_out_useragent_filter: true } : {}),
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.debug()
    },
  })
}

/**
 * Inicializa depois do carregamento da página (window 'load'), pra nunca atrasar a abertura da
 * /lp — ela é o que recebe tráfego de anúncio. Se a página já carregou (ex.: navegação dentro da
 * SPA), inicializa na hora.
 */
export function initAnalyticsDeferred() {
  if (typeof window === 'undefined') return
  if (document.readyState === 'complete') doInit()
  else window.addEventListener('load', doInit, { once: true })
}

export function trackPageview() {
  if (!ready) return
  posthog.capture('$pageview')
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (!ready) return
  posthog.capture(event, properties)
}

export function identifyUser(id: string) {
  if (!ready) return
  posthog.identify(id)
}

export function setPersonProperties(properties: Record<string, unknown>) {
  if (!ready) return
  posthog.setPersonProperties(properties)
}

export function resetAnalytics() {
  if (!ready) return
  posthog.reset()
}

/** $pageview em todo carregamento inicial e em toda troca de rota da SPA (/lp e o app). */
export function useTrackPageview() {
  const location = useLocation()
  useEffect(() => {
    trackPageview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])
}

/** Dispara `fn` ~delay ms depois da última mudança em `deps`, pulando a primeira (a do carregamento). */
export function useDebouncedTrack(deps: unknown[], fn: () => void, delay = 1000) {
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const t = window.setTimeout(fn, delay)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Dispara `event` uma única vez, na primeira vez que `el` aparece na tela (ex.: lp_planos_vistos). */
export function trackEventOnceVisible(el: Element | null, event: string, properties?: Record<string, unknown>) {
  if (!el || typeof IntersectionObserver === 'undefined') return () => {}
  let fired = false
  const observer = new IntersectionObserver(
    (entries) => {
      if (fired) return
      for (const entry of entries) {
        if (entry.isIntersecting) {
          fired = true
          track(event, properties)
          observer.disconnect()
          break
        }
      }
    },
    { threshold: 0.3 },
  )
  observer.observe(el)
  return () => observer.disconnect()
}
