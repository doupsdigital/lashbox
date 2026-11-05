// Situação da assinatura (Kiwify → tabela subscriptions), usada no Meu Estúdio e em /assinatura-vencida.
// Quem decide se o app abre ou não é has_access() (ver state/auth.tsx); este contexto só mostra os dados.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './auth'

export type SubscriptionPlan = 'mensal' | 'anual'
export type SubscriptionStatus = 'active' | 'late' | 'canceled' | 'refunded'

export interface SubscriptionInfo {
  plan: SubscriptionPlan | null
  status: SubscriptionStatus | null
  currentPeriodEnd: string | null
}

const EMPTY: SubscriptionInfo = { plan: null, status: null, currentPeriodEnd: null }

/** No modo local (sem Supabase), simula uma assinatura anual ativa, para testar as telas. */
function fakeLocalSubscription(): SubscriptionInfo {
  const end = new Date()
  end.setFullYear(end.getFullYear() + 1)
  return { plan: 'anual', status: 'active', currentPeriodEnd: end.toISOString() }
}

interface SubscriptionStore {
  subscription: SubscriptionInfo
  loading: boolean
  refresh: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionStore | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionInfo>(authStatus === 'local' ? fakeLocalSubscription() : EMPTY)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!supabase || authStatus !== 'ready' || !user?.email) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('email', user.email.toLowerCase())
        .order('current_period_end', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      setSubscription(
        data
          ? { plan: data.plan as SubscriptionPlan, status: data.status as SubscriptionStatus, currentPeriodEnd: data.current_period_end }
          : EMPTY,
      )
    } catch (e) {
      console.warn('assinatura: sincronização', e)
    } finally {
      setLoading(false)
    }
  }, [authStatus, user])

  useEffect(() => {
    if (authStatus === 'local') setSubscription(fakeLocalSubscription())
    else if (authStatus === 'ready') refresh()
    else setSubscription(EMPTY)
  }, [authStatus, refresh])

  const store = useMemo<SubscriptionStore>(() => ({ subscription, loading, refresh }), [subscription, loading, refresh])

  return <SubscriptionContext.Provider value={store}>{children}</SubscriptionContext.Provider>
}

export function useSubscription() {
  const s = useContext(SubscriptionContext)
  if (!s) throw new Error('useSubscription precisa estar dentro de SubscriptionProvider')
  return s
}
