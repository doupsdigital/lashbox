// Compras avulsas de kits sazonais (ex.: Kit Fim de Ano). Nenhum kit é bônus da assinatura:
// todos são liberados por compra, via rpc('my_products'). No modo local, tudo fica liberado
// para testar as telas.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { kitsCatalog } from '../content/lash'
import { supabase } from '../lib/supabase'
import { useAuth } from './auth'

const ALL_KEYS = kitsCatalog.map((k) => k.key)

/** Só em desenvolvimento: ?lockKits=1 força todos os kits bloqueados, mesmo no modo local (prints). */
function devForceLocked() {
  return import.meta.env.DEV && new URLSearchParams(window.location.search).get('lockKits') === '1'
}

interface PurchasesStore {
  isUnlocked: (key: string) => boolean
  /** Confere de novo no banco (botão "Já comprei, atualizar"). */
  refresh: () => Promise<void>
  loading: boolean
}

const PurchasesContext = createContext<PurchasesStore | null>(null)

export function PurchasesProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set(status === 'local' && !devForceLocked() ? ALL_KEYS : []))
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!supabase || status !== 'ready') return
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('my_products')
      if (error) throw error
      setUnlocked(new Set((data ?? []) as string[]))
    } catch (e) {
      console.warn('my_products', e)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    if (status === 'local') setUnlocked(new Set(devForceLocked() ? [] : ALL_KEYS))
    else if (status === 'ready') refresh()
    else setUnlocked(new Set())
  }, [status, refresh])

  return (
    <PurchasesContext.Provider value={{ isUnlocked: (key) => unlocked.has(key), refresh, loading }}>
      {children}
    </PurchasesContext.Provider>
  )
}

export function usePurchases() {
  const s = useContext(PurchasesContext)
  if (!s) throw new Error('usePurchases precisa estar dentro de PurchasesProvider')
  return s
}
