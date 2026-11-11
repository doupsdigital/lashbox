import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BackButton } from '../../components/ui'
import { track } from '../../lib/analytics'
import { getKitCatalog, weekPlan, yearDates } from '../../content/lash'
import { usePurchases } from '../../state/purchases'

function formatDate(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

/** `links.tool` do plano da semana é uma palavra-chave da ferramenta, não uma rota. */
const TOOL_ROUTES: Record<string, string> = {
  ofertas: '/vender/ofertas',
  'preco-justo': '/vender/preco-justo',
  meta: '/vender/meta',
}

export function PlanScreen() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [tab, setTab] = useState<'week' | 'year'>(params.get('sub') === 'year' ? 'year' : 'week')
  const todayDow = new Date().getDay()
  const { isUnlocked } = usePurchases()

  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-night px-5 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <BackButton fallback="/inicio" />
        <div className="w-[38px]" />
      </div>
      <h1 className="text-[34px] font-bold tracking-tight text-white">Planejar</h1>
      <div className="flex gap-0.5 rounded-[11px] bg-white/[0.08] p-0.5">
        <button type="button" onClick={() => setTab('week')} className={`flex-1 cursor-pointer rounded-[9px] py-2 text-[14.5px] font-semibold ${tab === 'week' ? 'bg-white text-ink shadow-sm' : 'text-white/70'}`}>
          Esta semana
        </button>
        <button type="button" onClick={() => setTab('year')} className={`flex-1 cursor-pointer rounded-[9px] py-2 text-[14.5px] font-semibold ${tab === 'year' ? 'bg-white text-ink shadow-sm' : 'text-white/70'}`}>
          Datas do ano
        </button>
      </div>

      {tab === 'week' ? (
        <div className="flex flex-col gap-2.5">
          {weekPlan.map((d) => {
            const isToday = d.dow === todayDow
            const to = d.links.art
              ? `/criar/${d.links.art}`
              : d.links.message
                ? '/mensagens'
                : (d.links.tool && TOOL_ROUTES[d.links.tool]) || '/planejar'
            return (
              <button
                key={d.dow}
                type="button"
                onClick={() => {
                  if (d.links.art) track('arte_aberta', { modelo: d.links.art, origem: 'plano' })
                  navigate(to)
                }}
                className={`press flex cursor-pointer items-center gap-3.5 rounded-[22px] p-3.5 text-left ${
                  isToday ? 'bg-[#E07A9B] text-white' : 'border border-white/[0.1] bg-white/[0.05] text-white'
                }`}
              >
                <div className="w-12 shrink-0 text-center">
                  <div className="text-[12px] font-semibold opacity-75">{d.label}</div>
                </div>
                <div className="flex-1">
                  <div className="text-[16.5px] font-bold">{d.title}</div>
                  <div className="mt-0.5 text-[13.5px] leading-[1.35] opacity-80">{d.detail}</div>
                </div>
                <div
                  className="shrink-0 rounded-[9px] px-2.5 py-1 text-[11.5px] font-bold"
                  style={{ background: isToday ? '#E5C17E' : 'rgba(255,255,255,.1)', color: isToday ? '#3A2A00' : '#fff' }}
                >
                  {isToday ? 'Hoje' : d.tag}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col pl-1.5">
          {yearDates.map((d, i) => {
            const catalog = d.kitKey ? getKitCatalog(d.kitKey) : undefined
            const owned = d.kitKey ? isUnlocked(d.kitKey) : false
            const tagText = catalog ? `${catalog.name} · ${owned ? 'Comprado' : catalog.price}` : ''
            const Wrapper = d.kitKey ? 'button' : 'div'
            return (
              <div key={d.date} className="flex gap-4">
                <div className="flex w-[14px] shrink-0 flex-col items-center">
                  <div className="mt-5 h-[14px] w-[14px] rounded-full border-[3px] border-white/80" style={{ background: owned ? '#C9A15B' : '#E07A9B' }} />
                  {i < yearDates.length - 1 && <div className="w-[2px] flex-1 bg-white/[0.15]" />}
                </div>
                <Wrapper
                  type={d.kitKey ? 'button' : undefined}
                  onClick={d.kitKey ? () => navigate(`/kits/${d.kitKey}`) : undefined}
                  className={`mb-3 flex-1 rounded-[20px] border border-white/[0.1] bg-white/[0.05] p-[14px] text-left ${d.kitKey ? 'cursor-pointer' : ''}`}
                >
                  <div className="text-[12.5px] font-semibold text-white/50">{formatDate(d.date)}</div>
                  <div className="mt-0.5 text-[17px] font-bold text-white">{d.label}</div>
                  <div className="mt-1.5 text-[13.5px] leading-[1.35] text-white/70">{d.tip}</div>
                  {catalog && (
                    <div
                      className="mt-2 inline-block rounded-[10px] px-2.5 py-1 text-[12.5px] font-semibold"
                      style={{ background: owned ? 'rgba(201,161,91,.2)' : 'rgba(224,122,155,.2)', color: owned ? '#E8C27E' : '#fff' }}
                    >
                      {tagText}
                    </div>
                  )}
                </Wrapper>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
