// O app logado de verdade: Supabase, o motor de artes e todas as telas. Carregado sozinho
// (import() dinâmico, ver main.tsx) para nunca pesar a /lp nem as páginas legais.
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/bodoni-moda/latin-400.css'
import '@fontsource/bodoni-moda/latin-500.css'
import '@fontsource/bodoni-moda/latin-600.css'
import '@fontsource/bodoni-moda/latin-400-italic.css'
import '@fontsource/bodoni-moda/latin-500-italic.css'
import '@fontsource/bodoni-moda/latin-600-italic.css'
import '@fontsource/jost/latin-300.css'
import '@fontsource/jost/latin-400.css'
import '@fontsource/jost/latin-500.css'
import '@fontsource/jost/latin-600.css'
import '@fontsource/playfair-display/latin-500.css'
import '@fontsource/playfair-display/latin-400-italic.css'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { AnalyticsBridge } from './components/AnalyticsBridge'
import { AuthProvider } from './state/auth'
import { StudioProvider } from './state/studio'
import { SubscriptionProvider } from './state/subscription'
import { PurchasesProvider } from './state/purchases'

registerSW({ immediate: true })

export default function AppRoot() {
  return (
    <AuthProvider>
      <StudioProvider>
        <SubscriptionProvider>
          <PurchasesProvider>
            <AnalyticsBridge />
            <App />
          </PurchasesProvider>
        </SubscriptionProvider>
      </StudioProvider>
    </AuthProvider>
  )
}
