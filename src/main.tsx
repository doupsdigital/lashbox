import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
import './index.css'
import App from './App'
import { AuthProvider } from './state/auth'
import { StudioProvider } from './state/studio'
import { SubscriptionProvider } from './state/subscription'
import { PurchasesProvider } from './state/purchases'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <StudioProvider>
        <SubscriptionProvider>
          <PurchasesProvider>
            <App />
          </PurchasesProvider>
        </SubscriptionProvider>
      </StudioProvider>
    </AuthProvider>
  </StrictMode>,
)
