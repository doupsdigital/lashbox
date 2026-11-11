import { useState } from 'react'
import { BackButton } from '../../components/ui'
import { track, useDebouncedTrack } from '../../lib/analytics'
import { brl } from '../../lib/text'

const num = (v: string) => parseInt(v.replace(/\D/g, ''), 10) || 0

export function FairPrice() {
  const [custo, setCusto] = useState('45')
  const [horas, setHoras] = useState('3')
  const [vhora, setVhora] = useState('60')

  const c = num(custo)
  const h = num(horas)
  const v = num(vhora)
  const minimo = c + h * v
  const sugerido = Math.round((minimo * 1.3) / 5) * 5

  useDebouncedTrack([custo, horas, vhora], () => track('calculadora_usada', { tipo: 'preco_justo' }))

  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-night px-5 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <BackButton fallback="/vender" />
        <div className="w-[38px]" />
      </div>

      <h1 className="text-[34px] font-bold tracking-tight text-white">Preço justo</h1>
      <p className="-mt-2.5 text-[15px] leading-[1.4] text-white/60">
        Informe o custo do material, quantas horas você gasta numa aplicação e quanto quer ganhar por hora.
      </p>

      <div className="flex shrink-0 flex-col gap-[1px] overflow-hidden rounded-[22px] border border-white/[0.1]">
        <div className="flex items-center justify-between bg-white/[0.07] px-4 py-3.5">
          <div className="text-[16px] text-white">Custo do material</div>
          <div className="flex items-center gap-1 text-white/60">
            R$
            <input value={custo} onChange={(e) => setCusto(e.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" className="w-[64px] bg-transparent text-right text-[18px] font-bold text-[#E07A9B] outline-none" />
          </div>
        </div>
        <div className="flex items-center justify-between bg-white/[0.07] px-4 py-3.5">
          <div className="text-[16px] text-white">Horas de atendimento</div>
          <input value={horas} onChange={(e) => setHoras(e.target.value.replace(/\D/g, '').slice(0, 2))} inputMode="numeric" className="w-[64px] bg-transparent text-right text-[18px] font-bold text-[#E07A9B] outline-none" />
        </div>
        <div className="flex items-center justify-between bg-white/[0.07] px-4 py-3.5">
          <div className="text-[16px] text-white">Quanto quer ganhar por hora</div>
          <div className="flex items-center gap-1 text-white/60">
            R$
            <input value={vhora} onChange={(e) => setVhora(e.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" className="w-[64px] bg-transparent text-right text-[18px] font-bold text-[#E07A9B] outline-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[26px] p-[22px] text-white" style={{ background: 'linear-gradient(135deg,#5B2A4E,#8A3F6F)' }}>
        <div>
          <div className="text-[13px] font-semibold tracking-[.06em] opacity-80">PREÇO MÍNIMO</div>
          <div className="mt-1 text-[36px] font-bold tracking-tight">{brl(minimo)}</div>
          <div className="mt-1 text-[14px] leading-[1.4] opacity-85">Material + horas × valor da hora. É o que cobre seu custo e seu tempo.</div>
        </div>
        <div className="border-t border-white/15 pt-4">
          <div className="text-[13px] font-semibold tracking-[.06em] opacity-80">PREÇO SUGERIDO</div>
          <div className="mt-1 text-[42px] font-bold tracking-tight">{brl(sugerido)}</div>
          <div className="mt-1 text-[14px] leading-[1.4] opacity-85">Preço mínimo + uma margem de 30%, arredondado para ficar redondo.</div>
        </div>
      </div>

      <div className="rounded-[18px] border border-white/[0.1] bg-white/[0.05] p-4 text-[14px] leading-[1.5] text-white/70">
        A conta: {brl(c)} de material + {h}h × {brl(v)} = {brl(minimo)} (mínimo). {brl(minimo)} × 1,3, arredondado para múltiplo de 5 = {brl(sugerido)} (sugerido).
      </div>
    </div>
  )
}
