import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/inter/latin-800.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './LandingPage'
import { Terms } from './Terms'
import { Privacy } from './Privacy'
import { MarketingLayout } from './MarketingLayout'

/**
 * Raiz leve de /lp, /termos e /privacidade — carregada sozinha, sem o app logado (sem Supabase,
 * sem o motor de artes). Ver src/main.tsx: a escolha entre este bundle e o do app acontece antes
 * de qualquer um dos dois ser importado. /lp2 foi a versão escura testada em A/B; venceu e virou
 * a própria /lp, então só redireciona (algum link antigo pode apontar para ela).
 */
export default function MarketingRoot() {
  return (
    <BrowserRouter>
      <MarketingLayout>
        <Routes>
          <Route path="/lp" element={<LandingPage />} />
          <Route path="/lp2" element={<Navigate to="/lp" replace />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/lp" replace />} />
        </Routes>
      </MarketingLayout>
    </BrowserRouter>
  )
}
