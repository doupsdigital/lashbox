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
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-lilac px-5 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <BackButton fallback="/vender" />
        <div className="w-[38px]" />
      </div>

      <h1 className="text-[34px] font-bold tracking-tight">Montador de ofertas</h1>

      {missingPrices && (
        <button type="button" onClick={() => navigate('/estudio')} className="press flex cursor-pointer items-center gap-3 rounded-[20px] bg-gold-soft p-3.5 text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-base font-bold text-gold-ink">!</div>
          <div className="flex-1 text-[14px] leading-[1.35] font-semibold text-gold-ink">
            Preencha o preço da aplicação e da manutenção no Meu Estúdio para calcular as ofertas.
          </div>
        </button>
      )}

      <div className="flex flex-col gap-[1px] overflow-hidden rounded-[22px] bg-line">
        <div className="flex items-center justify-between bg-white px-4 py-3.5">
          <div className="text-[16px]">Preço da aplicação</div>
          <div className="flex items-center gap-1 text-muted">
            R$
            <input
              value={studio.servicePrice}
              onChange={(e) => setField('servicePrice', e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              className="w-[70px] bg-transparent text-right text-[18px] font-bold text-plum outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-between bg-white px-4 py-3.5">
          <div className="text-[16px]">Preço da manutenção</div>
          <div className="flex items-center gap-1 text-muted">
            R$
            <input
              value={studio.maintenancePrice}
              onChange={(e) => setField('maintenancePrice', e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              className="w-[70px] bg-transparent text-right text-[18px] font-bold text-plum outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[12.5px] font-semibold text-muted">Até</span>
          <input value={fields.data_limite} onChange={(e) => setFields((f) => ({ ...f, data_limite: e.target.value }))} className="h-11 rounded-xl bg-white px-2.5 text-center text-sm outline-none" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12.5px] font-semibold text-muted">Usar até</span>
          <input value={fields.data_uso} onChange={(e) => setFields((f) => ({ ...f, data_uso: e.target.value }))} className="h-11 rounded-xl bg-white px-2.5 text-center text-sm outline-none" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12.5px] font-semibold text-muted">Vagas</span>
          <input value={fields.vagas} onChange={(e) => setFields((f) => ({ ...f, vagas: e.target.value }))} className="h-11 rounded-xl bg-white px-2.5 text-center text-sm outline-none" />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        {combos.map((c) => {
          const price = computeCombo(c, A, M)
          const msg = resolve(fillComboMessage(c, price, fields))
          return (
            <div key={c.id} className="flex flex-col gap-3 rounded-[26px] bg-white p-4 shadow-[0_8px_24px_rgba(91,42,78,.07)]">
              <div className="flex items-start justify-between gap-2">
                <div className="max-w-[180px] text-[18px] font-bold leading-[1.2]">{c.title}</div>
                <div className="shrink-0 rounded-[9px] bg-gold-soft px-2.5 py-1 text-[11.5px] font-bold text-gold-ink">{c.season}</div>
              </div>
              <div className="flex items-baseline gap-2.5">
                <div className="text-[34px] font-bold tracking-tight text-plum">R$ {money(price.preco)}</div>
                <div className="text-[15px] text-muted line-through">R$ {money(price.precoCheio)}</div>
              </div>
              <div className="rounded-[14px] bg-lilac p-3">
                <div className="text-[12px] font-semibold tracking-[.04em] text-muted">COMO FUNCIONA</div>
                <div className="mt-1 text-[14px] leading-[1.4]">{c.how}</div>
              </div>
              <MessageText text={msg} name="" className="text-[15px] leading-[1.5]" />
              <CopyButton text={msg} size="sm" onCopied={() => track('oferta_copiada', { id_combo: c.id })} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
