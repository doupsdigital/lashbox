// Pixel da Meta — só é importado pelas páginas de marketing (/lp, /termos, /privacidade),
// nunca pelo app logado. Eventos: PageView (ao carregar), ViewContent (1x, quando o elemento
// observado aparece na tela) e AddToCart (ao clicar em assinar). InitiateCheckout e Purchase
// não são disparados aqui: a Kiwify cuida dos dois no checkout.
import { META_PIXEL_ID } from '../lib/config'

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; callMethod?: unknown }
    _fbq?: unknown
  }
}

let initialized = false

export function initPixel() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  /* eslint-disable */
  ;(function (f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = true
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */

  window.fbq?.('init', META_PIXEL_ID)
  window.fbq?.('track', 'PageView')
}

/** Observa um elemento e dispara ViewContent uma única vez, na primeira vez que ele aparece na tela. */
export function trackViewContentOnceVisible(el: Element | null) {
  if (!el || typeof IntersectionObserver === 'undefined') return () => {}
  let fired = false
  const observer = new IntersectionObserver(
    (entries) => {
      if (fired) return
      for (const entry of entries) {
        if (entry.isIntersecting) {
          fired = true
          window.fbq?.('track', 'ViewContent', { content_name: 'LashBox', content_type: 'product', currency: 'BRL' })
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

/** AddToCart ao clicar em assinar — espera só o tempo de despachar o evento, no máximo 300ms. */
export function trackAddToCart(value: number, redirect: () => void) {
  if (!window.fbq) {
    redirect()
    return
  }
  let done = false
  const go = () => {
    if (done) return
    done = true
    redirect()
  }
  window.fbq('track', 'AddToCart', { value, currency: 'BRL', content_name: 'LashBox' })
  setTimeout(go, 250)
}
