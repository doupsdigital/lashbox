import { useNavigate } from 'react-router-dom'
import { BackButton } from '../../components/ui'

const CARDS = [
  { t: 'Montador de ofertas', d: 'Combos prontos com preço calculado.', ic: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5', bg: '#FBE8EE', c: '#E07A9B', to: '/vender/ofertas' },
  { t: 'Preço justo', d: 'Descubra quanto cobrar de verdade.', ic: 'M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01', bg: '#F6EBD3', c: '#8A6A24', to: '/vender/preco-justo' },
  { t: 'Meta do mês', d: 'Quantas clientes para chegar lá.', ic: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', bg: '#EDE1EA', c: '#5B2A4E', to: '/vender/meta' },
]

export function SellHub() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-lilac px-5 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <BackButton fallback="/inicio" />
        <div className="w-[38px]" />
      </div>
      <h1 className="text-[34px] font-bold tracking-tight">Vender</h1>
      <p className="-mt-2.5 text-[16px] leading-[1.4] text-muted">Ofertas e preços calculados com os valores do seu estúdio.</p>

      {CARDS.map((c) => (
        <button
          key={c.t}
          type="button"
          onClick={() => navigate(c.to)}
          className="press flex cursor-pointer items-center gap-4 rounded-[26px] bg-white p-5 text-left shadow-[0_1px_2px_rgba(42,30,39,.04),0_8px_24px_rgba(91,42,78,.07)]"
        >
          <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[19px]" style={{ background: c.bg }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c.c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d={c.ic} />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-[19px] font-bold">{c.t}</div>
            <div className="mt-0.5 text-[14px] leading-[1.35] text-muted">{c.d}</div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4B8BF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      ))}
    </div>
  )
}
