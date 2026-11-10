// PostHog: análise de uso + gravação de sessão (mascarada). Uma única instalação, usada tanto na
// /lp quanto no app logado (mesmo domínio, mesmo projeto). Sem VITE_POSTHOG_KEY (modo local, ou
// qualquer ambiente sem a variável configurada), tudo aqui vira no-op — nunca quebra o app.
import posthog from 'posthog-js'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com'

let ready = false
// Chamadas feitas antes do init (comum: a /lp dispara lp_visualizada no mount, antes da janela
// 'load' terminar) ficam na fila e são reproduzidas na ordem, assim que o init terminar — sem
// fila, esse evento se perderia sempre que a página ainda não tivesse terminado de carregar.
let queue: Array<() => void> = []

function doInit() {
  if (ready || !KEY) return
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
  ready = true
  const pending = queue
  queue = []
  for (const fn of pending) fn()
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

/** Sem KEY, nunca enfileira (nada a disparar depois) — com KEY, enfileira até o init terminar. */
function runOrQueue(fn: () => void) {
  if (!KEY) return
  if (ready) fn()
  else queue.push(fn)
}

export function trackPageview() {
  runOrQueue(() => posthog.capture('$pageview'))
}

export function track(event: string, properties?: Record<string, unknown>) {
  runOrQueue(() => posthog.capture(event, properties))
}

export function identifyUser(id: string) {
  runOrQueue(() => posthog.identify(id))
}

export function setPersonProperties(properties: Record<string, unknown>) {
  runOrQueue(() => posthog.setPersonProperties(properties))
}

export function resetAnalytics() {
  runOrQueue(() => posthog.reset())
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
