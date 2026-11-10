import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { track } from '../lib/analytics'

const STEPS = [
  { n: 1, t: 'Escolha um modelo', d: 'Artes prontas para cada momento do mês.' },
  { n: 2, t: 'Ele já vem com seus dados', d: 'Seu nome, foto, WhatsApp e preços.' },
  { n: 3, t: 'Poste', d: 'Compartilhe no Instagram ou no WhatsApp.' },
]

const ONBOARDING_KEY = 'lashbox:onboarding-seen'

export function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const next = () => {
    if (step < 2) {
      setStep(step + 1)
      return
    }
    try {
      localStorage.setItem(ONBOARDING_KEY, '1')
    } catch {
      // segue mesmo sem conseguir salvar
    }
    track('onboarding_concluido')
    navigate('/estudio', { replace: true })
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto px-6 py-10">
      <div className="flex min-h-[560px] flex-1 flex-col gap-8">
        <div className="flex flex-1 flex-col items-center justify-center">
          {step === 0 && (
            <div className="flex flex-col items-center gap-5 text-center">
              <img src="/icone-256.webp" alt="" width={160} height={160} className="rounded-[36px] shadow-[0_20px_40px_rgba(91,42,78,.3)]" />
              <h1 className="mt-1 text-[30px] font-bold tracking-tight">Bem-vinda ao LashBox</h1>
              <p className="max-w-[300px] text-[16px] leading-[1.45] text-muted">
                A caixa de ferramentas da lash designer. Artes, ofertas e mensagens prontas, com o seu nome e a sua foto.
              </p>
            </div>
          )}
          {step === 1 && (
            <div className="flex w-full flex-col gap-5">
              <h1 className="text-[30px] font-bold tracking-tight">Como funciona</h1>
              {STEPS.map((s) => (
                <div key={s.n} className="flex items-center gap-4 rounded-[22px] bg-lilac p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-plum text-lg font-bold text-white">{s.n}</div>
                  <div>
                    <div className="text-[16px] font-semibold">{s.t}</div>
                    <div className="mt-0.5 text-[14px] leading-[1.35] text-muted">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="flex h-[110px] w-[110px] items-center justify-center rounded-[30px] bg-blush">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#E07A9B" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </div>
              <h1 className="text-[30px] font-bold tracking-tight">Monte o seu estúdio</h1>
              <p className="max-w-[300px] text-[16px] leading-[1.45] text-muted">
                Preencha seu nome, foto, WhatsApp e preços uma vez só. Todas as artes e mensagens já saem prontas.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[6px] rounded-full bg-plum" style={{ width: i === step ? 20 : 6, opacity: i === step ? 1 : 0.25 }} />
            ))}
          </div>
          <button type="button" onClick={next} className="press flex h-[54px] cursor-pointer items-center justify-center rounded-full bg-plum text-[17px] font-semibold text-white">
            {step < 2 ? 'Continuar' : 'Montar meu estúdio'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function hasSeenOnboarding() {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1'
  } catch {
    return false
  }
}
