import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ScaledBoard } from '../../components/art/ScaledBoard'
import { StoryBoard } from '../../components/art/StoryBoard'
import { studioFootStory } from '../../lib/studioFooter'
import { resolveArtPreview } from '../../lib/studioTokens'
import { useStudio } from '../../state/studio'
import { ART_CATEGORIES, genericArts, kitFimDeAno } from '../../content/lash'

const CHIPS = [...ART_CATEGORIES, 'Fim de Ano']

export function Gallery() {
  const navigate = useNavigate()
  const { studio } = useStudio()
  const [params] = useSearchParams()
  const [cat, setCat] = useState<string>(params.get('cat') ?? 'Todas')
  const foot = studioFootStory(studio)

  const arts = useMemo(() => {
    const base = [...genericArts, ...kitFimDeAno.arts.map((a) => ({ ...a, category: a.category ?? 'Fim de Ano' }))]
    return cat === 'Todas' ? base : base.filter((a) => a.category === cat)
  }, [cat])

  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-lilac px-5 pt-6 pb-8">
      <h1 className="text-[34px] font-bold tracking-tight">Criar</h1>

      <button
        type="button"
        onClick={() => navigate('/vale-presente')}
        className="press flex cursor-pointer items-center gap-4 rounded-[26px] p-5 text-left text-white shadow-[0_12px_28px_rgba(91,42,78,.28)]"
        style={{ background: 'linear-gradient(135deg,#5B2A4E,#8A3F6F)' }}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white/14">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E5C17E" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-4 0M12 7c2-4 6-3 4 0" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-[19px] font-bold">Vale-presente</div>
          <div className="mt-0.5 text-[14px] opacity-85">Monte um cartão e venda mais</div>
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E5C17E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pt-0.5">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className="shrink-0 cursor-pointer rounded-[20px] px-4 py-2.5 text-[14.5px] font-semibold shadow-[0_1px_2px_rgba(42,30,39,.05)]"
            style={{ background: c === cat ? '#5B2A4E' : '#fff', color: c === cat ? '#fff' : '#2A1E27' }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {arts.map((a) => (
          <button key={a.id} type="button" onClick={() => navigate(`/criar/${a.id}`)} className="flex cursor-pointer flex-col gap-2">
            <div className="overflow-hidden rounded-[18px] shadow-[0_8px_22px_rgba(91,42,78,.14)]">
              <ScaledBoard width={1080} height={1920} scale={0.16}>
                <StoryBoard
                  art={resolveArtPreview(a, studio)}
                  palette={a.palette === 'black' ? 'preto' : studio.palette}
                  post={false}
                  photoOn={false}
                  photoUrl={null}
                  photoPosY={40}
                  foot1={foot.foot1 || 'Seu estúdio'}
                  foot2={foot.foot2}
                  vagas="5"
                  comboTitulo="Combo"
                  preco="180,00"
                  pillText="Vagas limitadas"
                  horarios={['Seg · 14h', 'Ter · 10h']}
                />
              </ScaledBoard>
            </div>
            <div className="px-1 text-left text-[14.5px] font-semibold leading-[1.2] text-pretty">{a.title}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
