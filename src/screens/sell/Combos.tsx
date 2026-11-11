import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { CopyButton, MessageText, useMessageResolver } from '../../components/Messages'
import { BackButton } from '../../components/ui'
import { combos, comboDefaults } from '../../content/lash'
import { track } from '../../lib/analytics'
import { computeCombo, fillComboMessage, money } from '../../lib/combo'
import { useStudio } from '../../state/studio'

const num = (v: string) => parseInt(v.replace(/\D/g, ''), 10) || 0

export function CombosTool() {
  const navigate = useNavigate()
  const { studio, setField } = useStudio()
  const resolve = useMessageResolver()
  const [fields, setFields] = useState(comboDefaults)
  const A = num(studio.servicePrice)
  const M = num(studio.maintenancePrice)
  const missingPrices = !A && !M

  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-night px-5 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <BackButton fallback="/vender" />
        <div className="w-[38px]" />
      </div>

      <h1 className="text-[34px] font-bold tracking-tight text-white">Montador de ofertas</h1>

      {missingPrices && (
        <button type="button" onClick={() => navigate('/estudio')} className="press flex cursor-pointer items-center gap-3 rounded-[20px] border border-[#C9A15B]/30 bg-[#C9A15B]/15 p-3.5 text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-base font-bold text-[#E8C27E]">!</div>
          <div className="flex-1 text-[14px] leading-[1.35] font-semibold text-[#E8C27E]">
            Preencha o preço da aplicação e da manutenção no Meu Estúdio para calcular as ofertas.
          </div>
        </button>
      )}

      <div className="flex shrink-0 flex-col gap-[1px] overflow-hidden rounded-[22px] border border-white/[0.1]">
        <div className="flex items-center justify-between bg-white/[0.07] px-4 py-3.5">
          <div className="text-[16px] text-white">Preço da aplicação</div>
          <div className="flex items-center gap-1 text-white/60">
            R$
            <input
              value={studio.servicePrice}
              onChange={(e) => setField('servicePrice', e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              className="w-[70px] bg-transparent text-right text-[18px] font-bold text-[#E07A9B] outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-between bg-white/[0.07] px-4 py-3.5">
          <div className="text-[16px] text-white">Preço da manutenção</div>
          <div className="flex items-center gap-1 text-white/60">
            R$
            <input
              value={studio.maintenancePrice}
              onChange={(e) => setField('maintenancePrice', e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              className="w-[70px] bg-transparent text-right text-[18px] font-bold text-[#E07A9B] outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[12.5px] font-semibold text-white/60">Até</span>
          <input value={fields.data_limite} onChange={(e) => setFields((f) => ({ ...f, data_limite: e.target.value }))} className="h-11 rounded-xl border border-white/[0.15] bg-white/[0.08] px-2.5 text-center text-sm text-white outline-none" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12.5px] font-semibold text-white/60">Usar até</span>
          <input value={fields.data_uso} onChange={(e) => setFields((f) => ({ ...f, data_uso: e.target.value }))} className="h-11 rounded-xl border border-white/[0.15] bg-white/[0.08] px-2.5 text-center text-sm text-white outline-none" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12.5px] font-semibold text-white/60">Vagas</span>
          <input value={fields.vagas} onChange={(e) => setFields((f) => ({ ...f, vagas: e.target.value }))} className="h-11 rounded-xl border border-white/[0.15] bg-white/[0.08] px-2.5 text-center text-sm text-white outline-none" />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        {combos.map((c) => {
          const price = computeCombo(c, A, M)
          const msg = resolve(fillComboMessage(c, price, fields))
          return (
            <div key={c.id} className="flex flex-col gap-3 rounded-[26px] border border-white/[0.12] bg-white/[0.07] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="max-w-[180px] text-[18px] font-bold leading-[1.2] text-white">{c.title}</div>
                <div className="shrink-0 rounded-[9px] bg-[#C9A15B]/20 px-2.5 py-1 text-[11.5px] font-bold text-[#E8C27E]">{c.season}</div>
              </div>
              <div className="flex items-baseline gap-2.5">
                <div className="text-[34px] font-bold tracking-tight text-[#E07A9B]">R$ {money(price.preco)}</div>
                <div className="text-[15px] text-white/50 line-through">R$ {money(price.precoCheio)}</div>
              </div>
              <div className="rounded-[14px] bg-white/[0.06] p-3">
                <div className="text-[12px] font-semibold tracking-[.04em] text-white/60">COMO FUNCIONA</div>
                <div className="mt-1 text-[14px] leading-[1.4] text-white/85">{c.how}</div>
              </div>
              <MessageText text={msg} name="" className="text-[15px] leading-[1.5] text-white/85" />
              <CopyButton text={msg} size="sm" onCopied={() => track('oferta_copiada', { id_combo: c.id })} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
