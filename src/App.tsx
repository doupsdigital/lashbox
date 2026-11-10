import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { TabBar } from './components/TabBar'
import { Logo } from './components/ui'
import { initAnalyticsDeferred, useTrackPageview } from './lib/analytics'
import { missingConfigInProd } from './lib/supabase'
import { useAuth } from './state/auth'
import { useStudio } from './state/studio'
import { Login } from './screens/Login'
import { Onboarding, hasSeenOnboarding } from './screens/Onboarding'
import { ExpiredSubscription } from './screens/ExpiredSubscription'
import { Home } from './screens/Home'
import { StudioScreen } from './screens/Studio'
import { Gallery } from './screens/create/Gallery'
import { ArtEditor } from './screens/create/ArtEditor'
import { GiftScreen } from './screens/create/Gift'
import { SellHub } from './screens/sell/Hub'
import { CombosTool } from './screens/sell/Combos'
import { FairPrice } from './screens/sell/FairPrice'
import { Goal } from './screens/sell/Goal'
import { MessagesLibrary } from './screens/messages/Library'
import { PlanScreen } from './screens/plan/Plan'
import { Kits } from './screens/kits/Kits'
import { KitDetail } from './screens/kits/KitDetail'

const TAB_ROUTES = ['/inicio', '/criar', '/mensagens', '/kits', '/estudio']
const TABBED_PREFIXES = ['/vender', '/planejar']

function Splash({ text }: { text?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <Logo />
      {text ? (
        <p className="text-[15px] leading-normal text-muted">{text}</p>
      ) : (
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-blush">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-rose" />
        </div>
      )}
    </div>
  )
}

function Start() {
  const { status } = useAuth()
  // Esta rota só é alcançada com status local/ready (Gate() já tratou os outros casos antes de
  // chegar em AppRoutes), mas a troca pela /lp seria uma navegação de verdade de qualquer forma.
  if (status === 'local' || status === 'ready') return <Navigate to="/inicio" replace />
  return <RedirectToSalesPage />
}

function RequireStudioOnboarding({ children }: { children: ReactNode }) {
  const { isComplete } = useStudio()
  if (!isComplete && !hasSeenOnboarding()) return <Navigate to="/boas-vindas" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/boas-vindas" element={<Onboarding />} />
      <Route path="/inicio" element={<RequireStudioOnboarding><Home /></RequireStudioOnboarding>} />
      <Route path="/criar" element={<RequireStudioOnboarding><Gallery /></RequireStudioOnboarding>} />
      <Route path="/criar/:modeloId" element={<RequireStudioOnboarding><ArtEditor /></RequireStudioOnboarding>} />
      <Route path="/vale-presente" element={<RequireStudioOnboarding><GiftScreen /></RequireStudioOnboarding>} />
      <Route path="/vender" element={<RequireStudioOnboarding><SellHub /></RequireStudioOnboarding>} />
      <Route path="/vender/ofertas" element={<RequireStudioOnboarding><CombosTool /></RequireStudioOnboarding>} />
      <Route path="/vender/preco-justo" element={<RequireStudioOnboarding><FairPrice /></RequireStudioOnboarding>} />
      <Route path="/vender/meta" element={<RequireStudioOnboarding><Goal /></RequireStudioOnboarding>} />
      <Route path="/mensagens" element={<RequireStudioOnboarding><MessagesLibrary /></RequireStudioOnboarding>} />
      <Route path="/planejar" element={<RequireStudioOnboarding><PlanScreen /></RequireStudioOnboarding>} />
      <Route path="/kits" element={<RequireStudioOnboarding><Kits /></RequireStudioOnboarding>} />
      <Route path="/kits/:key" element={<RequireStudioOnboarding><KitDetail /></RequireStudioOnboarding>} />
      <Route path="/estudio" element={<StudioScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

/** Só em desenvolvimento: ?preview=entrar|expired força uma tela sem depender do Supabase (prints). */
function devPreview() {
  if (!import.meta.env.DEV) return null
  const v = new URLSearchParams(window.location.search).get('preview')
  if (v === 'entrar') return <Login />
  if (v === 'expired') return <ExpiredSubscription />
  return null
}

/** A /lp é outro bundle (ver main.tsx): navegação de verdade, não Router, para carregá-la sozinha. */
function RedirectToSalesPage() {
  useEffect(() => {
    window.location.replace('/lp')
  }, [])
  return <Splash />
}

/** Decide entre a página de vendas, o login, o carregamento, a assinatura vencida e o app. */
function Gate() {
  const { status } = useAuth()
  const preview = devPreview()
  if (preview) return preview
  if (missingConfigInProd) return <Splash text="App não configurado: faltam as variáveis do Supabase." />
  if (status === 'loading') return <Splash />
  if (status === 'signedOut') {
    return (
      <Routes>
        <Route path="/entrar" element={<Login />} />
        <Route path="*" element={<RedirectToSalesPage />} />
      </Routes>
    )
  }
  if (status === 'expired') return <ExpiredSubscription />
  return <AppRoutes />
}

function Shell() {
  const { pathname } = useLocation()
  const { status } = useAuth()
  const inApp = status === 'local' || status === 'ready'
  const showTabs = inApp && (TAB_ROUTES.includes(pathname) || TABBED_PREFIXES.some((p) => pathname.startsWith(p)))

  useEffect(() => {
    initAnalyticsDeferred()
  }, [])
  useTrackPageview()

  return (
    <div className="flex h-dvh justify-center sm:py-6">
      <div className="pt-safe relative flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-white sm:rounded-[40px] sm:shadow-[0_0_0_1px_#EFE6EA,0_30px_60px_rgba(90,20,50,.12)]">
        <main key={pathname} className="flex min-h-0 flex-1 flex-col bg-white">
          <Gate />
        </main>
        {showTabs && <TabBar />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
