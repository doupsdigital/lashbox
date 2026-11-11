import { useNavigate } from 'react-router-dom'
import { getKitCatalog, kitFimDeAno, nextPlanItem } from '../content/lash'
import { usePurchases } from '../state/purchases'

/** Chave do destaque (tela própria em /kits/black-friday) — entrada cosmética, mesma compra do Kit Fim de Ano (ver kits.json). */
const BLACK_FRIDAY_KEY = 'black-friday'
const KIT_CARD_PROMO_END = '2026-12-31' // depois disso, a propaganda do kit some sozinha

function localDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Compartilhado entre Home (carrossel) e Kits (lista cheia) — ver KitPromoCard abaixo. */
export function useKitFimDeAnoPromo() {
  const { isUnlocked } = usePurchases()
  const kitFimDeAnoCatalog = getKitCatalog(BLACK_FRIDAY_KEY)
  const kitOwned = isUnlocked(BLACK_FRIDAY_KEY)
  const todayKeyStr = localDateKey(new Date())
  const kitPlanEnd = kitFimDeAno.plan[kitFimDeAno.plan.length - 1].date
  const withinKitCardWindow = kitOwned ? todayKeyStr <= kitPlanEnd : todayKeyStr <= KIT_CARD_PROMO_END
  const show = !!kitFimDeAnoCatalog && withinKitCardWindow
  return { show, kitFimDeAnoCatalog, kitOwned }
}

/**
 * Card de destaque do Kit Fim de Ano (degradê ameixa/rosa, ícone de presente) — usado tanto no
 * carrossel "Kits promocionais" do Início quanto no topo da tela "Kits" (lista cheia), pra manter
 * a mesma propaganda nos dois lugares.
 */
export function KitPromoCard({ className = '' }: { className?: string }) {
  const navigate = useNavigate()
  const { show, kitFimDeAnoCatalog, kitOwned } = useKitFimDeAnoPromo()
  if (!show || !kitFimDeAnoCatalog) return null

  return (
    <button
      type="button"
      onClick={() => navigate(kitOwned ? `/kits/${BLACK_FRIDAY_KEY}?aba=plano` : `/kits/${BLACK_FRIDAY_KEY}`)}
      className={`press relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-[24px] p-[18px] text-left text-white shadow-[0_10px_30px_rgba(91,42,78,.25)] ${className}`}
      style={{ background: `linear-gradient(135deg,${kitFimDeAnoCatalog.color1},${kitFimDeAnoCatalog.color2})` }}
    >
      <div className="absolute -top-9 -right-9 h-32 w-32 rounded-full bg-white/10" />
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white/15 text-xl">🎁</div>
        <div className="text-[17px] font-bold leading-[1.2] text-pretty">
          {kitOwned ? 'Seu Kit Fim de Ano' : 'Black Friday, Natal e Réveillon prontos 🎁'}
        </div>
      </div>
      <div className="text-[13.5px] leading-[1.45] text-white/85">
        {kitOwned ? (
          <>Próximo passo: <span className="font-semibold" style={{ color: '#F6E3B8' }}>{nextPlanItem().title}</span></>
        ) : (
          'Kit Fim de Ano: 10 artes temáticas, vale-presente de Natal, ofertas montadas com os seus preços e um plano dia a dia até janeiro.'
        )}
      </div>
      <div
        className="flex h-11 w-fit items-center justify-center self-start rounded-full px-5 text-[14.5px] font-semibold"
        style={{ background: '#C9A15B', color: '#2A1E27' }}
      >
        {kitOwned ? 'Ver plano' : `Ver o kit · ${kitFimDeAnoCatalog.price}`}
      </div>
    </button>
  )
}
