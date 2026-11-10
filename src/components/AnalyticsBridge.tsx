// Identifica a assinante no PostHog pelo id do Supabase (nunca o e-mail) e mantém as propriedades
// de pessoa atualizadas. Fica dentro de todos os providers (auth/studio/subscription/purchases)
// para ter acesso aos quatro, sem acoplar os módulos de estado entre si.
import { useEffect, useRef } from 'react'
import { identifyUser, resetAnalytics, setPersonProperties } from '../lib/analytics'
import { useAuth } from '../state/auth'
import { usePurchases } from '../state/purchases'
import { useStudio } from '../state/studio'
import { useSubscription } from '../state/subscription'

export function AnalyticsBridge() {
  const { status, user } = useAuth()
  const { subscription } = useSubscription()
  const { isComplete } = useStudio()
  const { isUnlocked } = usePurchases()
  const identifiedId = useRef<string | null>(null)
  const temKitFimDeAno = isUnlocked('fim-de-ano')

  useEffect(() => {
    if (status === 'ready' && user) {
      if (identifiedId.current !== user.id) {
        identifiedId.current = user.id
        identifyUser(user.id)
      }
    } else if (status === 'signedOut' && identifiedId.current) {
      identifiedId.current = null
      resetAnalytics()
    }
  }, [status, user])

  useEffect(() => {
    if (status !== 'ready' || !user) return
    setPersonProperties({
      plano: subscription.plan,
      situacao_assinatura: subscription.status,
      tem_kit_fim_de_ano: temKitFimDeAno,
      estudio_completo: isComplete,
    })
  }, [status, user, subscription.plan, subscription.status, temKitFimDeAno, isComplete])

  return null
}
