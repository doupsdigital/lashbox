import { useNavigate } from 'react-router-dom'
import { ScaledBoard } from '../components/art/ScaledBoard'
import { StoryBoard } from '../components/art/StoryBoard'
import { copyText } from '../lib/text'
import { studioFootStory } from '../lib/studioFooter'
import { useStudio } from '../state/studio'
import { getAnyArt, kitsCatalog, suggestionOfTheDay } from '../content/lash'
import { usePurchases } from '../state/purchases'

const ICONS: Record<string, string> = {
  spark: 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z',
  tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01',
  msg: 'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z',
  cal: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4',
  gift: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-4 0M12 7c2-4 6-3 4 0',
}

const TILES = [
  { t: 'Criar', d: 'Artes e vale-presentes', ic: 'spark', bg: '#FBE8EE', c: '#E07A9B', to: '/criar' },
  { t: 'Vender', d: 'Ofertas e preços', ic: 'tag', bg: '#F6EBD3', c: '#8A6A24', to: '/vender' },
  { t: 'Conversar', d: 'Mensagens e clientes', ic: 'msg', bg: '#EDE1EA', c: '#5B2A4E', to: '/mensagens' },
  { t: 'Planejar', d: 'Sua semana e as datas do ano', ic: 'cal', bg: '#FBE8EE', c: '#E07A9B', to: '/planejar' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia,'
  if (h < 18) return 'Boa tarde,'
  return 'Boa noite,'
}

export function Home() {
  const navigate = useNavigate()
  const { studio } = useStudio()
  const { isUnlocked } = usePurchases()
  const suggestion = suggestionOfTheDay()
  const art = getAnyArt(suggestion.art)
  const foot = studioFootStory(studio)
  const initials = (studio.ownerName || 'LB').trim().slice(0, 2).toUpperCase()
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()

  return (
    <div className="flex flex-1 flex-col gap-[24px] overflow-auto bg-lilac px-5 pt-9 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold tracking-[.06em] text-muted">{today}</div>
          <div className="mt-0.5 text-[30px] font-bold tracking-tight">{greeting()} {studio.ownerName || ''}</div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/estudio')}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-white text-[18px] font-semibold text-white shadow-[0_4px_12px_rgba(91,42,78,.25)]"
          style={{ background: 'linear-gradient(135deg,#E07A9B,#5B2A4E)' }}
        >
          {initials}
        </button>
      </div>

      {art && (
        <div className="flex flex-col gap-4 rounded-[28px] bg-white p-[18px] shadow-[0_1px_2px_rgba(42,30,39,.04),0_10px_30px_rgba(91,42,78,.08)]">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" />
            </svg>
            PARA POSTAR HOJE
          </div>
          <div className="flex gap-4">
            <div className="w-32 shrink-0 overflow-hidden rounded-[16px] shadow-[0_8px_20px_rgba(91,42,78,.18)]">
              <ScaledBoard width={1080} height={1920} scale={128 / 1080}>
                <StoryBoard
                  art={art}
                  palette={art.palette === 'black' ? 'preto' : studio.palette}
                  post={false}
                  photoOn={false}
                  photoUrl={null}
                  photoPosY={40}
                  foot1={foot.foot1 || 'Seu estúdio'}
                  foot2={foot.foot2}
                  horarios={['Hoje · 15h30']}
                />
              </ScaledBoard>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <div className="text-[21px] font-bold leading-[1.15] tracking-tight">{art.title}</div>
              <div className="text-[13px] leading-[1.4] text-muted">{suggestion.caption}</div>
              <div className="self-start rounded-[10px] bg-blush px-2.5 py-1 text-[12px] font-semibold text-plum">{suggestion.tag}</div>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`/criar/${art.id}`)}
              className="press flex h-12 flex-1 cursor-pointer items-center justify-center rounded-full bg-plum text-[15.5px] font-semibold text-white"
            >
              Criar agora
            </button>
            <button
              type="button"
              onClick={() => copyText(suggestion.caption)}
              className="press flex h-12 flex-1 cursor-pointer items-center justify-center rounded-full bg-blush text-[15.5px] font-semibold text-plum"
            >
              Copiar legenda
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {TILES.map((t) => (
          <button
            key={t.t}
            type="button"
            onClick={() => navigate(t.to)}
            className="press flex cursor-pointer flex-col gap-3 rounded-[24px] bg-white p-4 text-left shadow-[0_1px_2px_rgba(42,30,39,.04),0_8px_24px_rgba(91,42,78,.06)]"
          >
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px]" style={{ background: t.bg }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={t.c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d={ICONS[t.ic]} />
              </svg>
            </div>
            <div>
              <div className="text-[18px] font-bold">{t.t}</div>
              <div className="mt-0.5 text-[13px] leading-[1.3] text-muted">{t.d}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="-mx-5 flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-5">
          <div className="text-[22px] font-bold tracking-tight">Kits da temporada</div>
          <button type="button" onClick={() => navigate('/kits')} className="text-[15px] font-semibold text-rose">
            Ver todos
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pt-1 pb-3.5">
          {kitsCatalog.map((k) => {
            const owned = isUnlocked(k.key)
            return (
              <button
                key={k.key}
                type="button"
                onClick={() => navigate(`/kits/${k.key}`)}
                className="flex w-[200px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-[24px] bg-white text-left shadow-[0_1px_2px_rgba(42,30,39,.04),0_8px_24px_rgba(91,42,78,.08)]"
              >
                <div className="relative flex h-[116px] items-center justify-center" style={{ background: `linear-gradient(135deg,${k.color1},${k.color2})` }}>
                  <div className="absolute -top-[30px] -right-6 h-[110px] w-[110px] rounded-full bg-white/18" />
                  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICONS[k.icon]} />
                  </svg>
                </div>
                <div className="flex flex-col gap-2 p-3.5">
                  <div>
                    <div className="text-[16px] font-bold">{k.name}</div>
                    <div className="mt-0.5 text-[13px] text-muted">{k.desc}</div>
                  </div>
                  <div
                    className="w-fit rounded-[10px] px-2.5 py-1 text-[12.5px] font-semibold"
                    style={{ background: owned ? '#F6EBD3' : '#FBE8EE', color: owned ? '#8A6A24' : '#5B2A4E' }}
                  >
                    {owned ? 'Comprado' : k.price}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
