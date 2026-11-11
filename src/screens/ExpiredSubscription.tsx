import { useEffect } from 'react'
import { track } from '../lib/analytics'
import { KIWIFY_SUBSCRIPTION_CHECKOUT_URLS } from '../lib/config'
import { useAuth } from '../state/auth'

export function ExpiredSubscription() {
  const { signOut } = useAuth()
  const renewUrl = KIWIFY_SUBSCRIPTION_CHECKOUT_URLS.anual || KIWIFY_SUBSCRIPTION_CHECKOUT_URLS.mensal

  useEffect(() => {
    track('assinatura_vencida_vista')
  }, [])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3.5 bg-night px-6 py-10 text-center">
      <img src="/icone-256.webp" alt="" width={120} height={120} className="rounded-[30px] opacity-90 saturate-[.6]" />
      <h1 className="mt-3.5 text-[28px] font-bold tracking-tight text-white">Sua assinatura venceu</h1>
      <p className="max-w-[300px] text-[16px] leading-[1.45] text-white/70">
        Seus dados e sua lista de clientes estão guardados. Renove para voltar a criar e postar.
      </p>
      {renewUrl ? (
        <a
          href={renewUrl}
          target="_blank"
          rel="noopener"
          onClick={() => track('clique_renovar')}
          className="press mt-5 flex h-[54px] w-full cursor-pointer items-center justify-center rounded-full bg-[#E07A9B] text-[17px] font-semibold text-white"
        >
          Renovar assinatura
        </a>
      ) : (
        <div className="mt-5 flex h-[54px] w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-[17px] font-semibold text-white/40">
          Renovar assinatura
        </div>
      )}
      <button type="button" onClick={signOut} className="mt-1.5 text-[16px] font-semibold text-[#E07A9B]">
        Sair
      </button>
    </div>
  )
}
