import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// /lp, /termos e /privacidade carregam um bundle leve próprio (sem Supabase, sem o motor de
// artes, sem as fontes do app) — essencial porque é a página que recebe tráfego de anúncio.
// Qualquer outra rota carrega o app logado de verdade. A escolha é feita aqui, antes de importar
// qualquer um dos dois, para o código do outro nunca entrar no bundle da rota atual.
const MARKETING_PATHS = ['/lp', '/termos', '/privacidade']
const isMarketing = MARKETING_PATHS.includes(window.location.pathname)

const Root = lazy(() => (isMarketing ? import('./marketing/MarketingRoot') : import('./AppRoot')))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </StrictMode>,
)
