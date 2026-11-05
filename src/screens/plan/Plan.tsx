import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BackButton } from '../../components/ui'
import { getKitCatalog, weekPlan, yearDates } from '../../content/lash'
import { usePurchases } from '../../state/purchases'

function formatDate(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function PlanScreen() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [tab, setTab] = useState<'week' | 'year'>(params.get('sub') === 'year' ? 'year' : 'week')
  const todayDow = new Date().getDay()
  const { isUnlocked } = usePurchases()

  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-lilac px-5 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <BackButton fallback="/inicio" />
        <div className="w-[38px]" />
      </div>
      <h1 className="text-[34px] font-bold tracking-tight">Planejar</h1>
      <div className="flex gap-0.5 rounded-[11px] bg-[#E7DFE4] p-0.5">
        <button type="button" onClick={() => setTab('week')} className={`flex-1 cursor-pointer rounded-[9px] py-2 text-[14.5px] font-semibold ${tab === 'week' ? 'bg-white shadow-sm' : ''}`}>
          Esta semana
        </button>
        <button type="button" onClick={() => setTab('year')} className={`flex-1 cursor-pointer rounded-[9px] py-2 text-[14.5px] font-semibold ${tab === 'year' ? 'bg-white shadow-sm' : ''}`}>
          Datas do ano
        </button>
      </div>

      {tab === 'week' ? (
        <div className="flex flex-col gap-2.5">
          {weekPlan.map((d) => {
            const isToday = d.dow === todayDow
            const to = d.links.art ? `/criar/${d.links.art}` : d.links.message ? '/mensagens' : d.links.tool ?? '/planejar'
            return (
              <button
                key={d.dow}
                type="button"
                onClick={() => navigate(to)}
                className="press flex cursor-pointer items-center gap-3.5 rounded-[22px] p-3.5 text-left shadow-[0_8px_22px_rgba(91,42,78,.07)]"
                style={{ background: isToday ? '#5B2A4E' : '#fff', color: isToday ? '#fff' : '#2A1E27' }}
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
                  style={{ background: isToday ? '#E5C17E' : '#FBE8EE', color: isToday ? '#3A2A00' : '#5B2A4E' }}
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
            const catalog = getKitCatalog(d.kitKey)
            const owned = isUnlocked(d.kitKey)
            const tagText = catalog ? `${catalog.name} · ${owned ? 'Comprado' : catalog.price}` : ''
            return (
              <div key={d.date} className="flex gap-4">
                <div className="flex w-[14px] shrink-0 flex-col items-center">
                  <div className="mt-5 h-[14px] w-[14px] rounded-full border-[3px] border-white" style={{ background: owned ? '#C9A15B' : '#E07A9B' }} />
                  {i < yearDates.length - 1 && <div className="w-[2px] flex-1 bg-line" />}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/kits/${d.kitKey}`)}
                  className="mb-3 flex-1 rounded-[20px] bg-white p-[14px] text-left shadow-[0_8px_22px_rgba(91,42,78,.06)]"
                >
                  <div className="text-[12.5px] font-semibold text-muted">{formatDate(d.date)}</div>
                  <div className="mt-0.5 text-[17px] font-bold">{d.label}</div>
                  <div
                    className="mt-2 inline-block rounded-[10px] px-2.5 py-1 text-[12.5px] font-semibold"
                    style={{ background: owned ? '#F6EBD3' : '#FBE8EE', color: owned ? '#8A6A24' : '#5B2A4E' }}
                  >
                    {tagText}
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
