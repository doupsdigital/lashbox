import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ScaledBoard } from '../../components/art/ScaledBoard'
import { StoryBoard } from '../../components/art/StoryBoard'
import { CopyButton, MessageText, useMessageResolver } from '../../components/Messages'
import { BackButton, SoftButton } from '../../components/ui'
import { getKitCatalog, kitFimDeAno, nextPlanItem } from '../../content/lash'
import { track } from '../../lib/analytics'
import { KIT_CHECKOUT_URLS } from '../../lib/config'
import { studioFootStory } from '../../lib/studioFooter'
import { resolveArtPreview } from '../../lib/studioTokens'
import { useAuth } from '../../state/auth'
import { usePurchases } from '../../state/purchases'
import { useStudio } from '../../state/studio'

const TOOLS = [
  { id: 'artes', label: 'Artes prontas', glyph: '🖼' },
  { id: 'vale-presente', label: 'Vale-presente', glyph: '🎁' },
  { id: 'ofertas', label: 'Montador de ofertas', glyph: 'R$' },
  { id: 'plano', label: 'Plano dia a dia', glyph: '📅' },
  { id: 'mensagens', label: 'Mensagens', glyph: '“' },
]

function formatDate(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function KitDetail() {
  const { key } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resolve = useMessageResolver()
  const { user } = useAuth()
  const { studio } = useStudio()
  const { isUnlocked, refresh, loading } = usePurchases()
  const catalog = getKitCatalog(key)
  const [section, setSection] = useState<'tools' | 'plan' | 'mensagens'>(searchParams.get('aba') === 'plano' ? 'plan' : 'tools')

  const nextItem = useMemo(nextPlanItem, [])

  const groups = useMemo(() => {
    const map = new Map<string, typeof kitFimDeAno.messages>()
    for (const m of kitFimDeAno.messages) map.set(m.group, [...(map.get(m.group) ?? []), m])
    return [...map.entries()]
  }, [])

  useEffect(() => {
    if (!catalog) return
    track('kit_visualizado', { kit: catalog.key, comprado: isUnlocked(catalog.key) ? 'sim' : 'não' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog?.key])

  if (!catalog) return <Navigate to="/kits" replace />
  const unlocked = isUnlocked(catalog.key)
  const foot = studioFootStory(studio)
  const previewArts = kitFimDeAno.arts.slice(0, 4)
  const insideList = [
    `${kitFimDeAno.arts.length} artes temáticas prontas`,
    'Vale-presente de Natal personalizado',
    'Ofertas de Black Friday e Natal com os seus preços',
    `Plano dia a dia, de ${formatDate(kitFimDeAno.plan[0].date)} a ${formatDate(kitFimDeAno.plan[kitFimDeAno.plan.length - 1].date)}`,
    `${kitFimDeAno.messages.length} mensagens prontas para as clientes`,
  ]

  const checkoutUrl = (() => {
    const base = KIT_CHECKOUT_URLS[catalog.key]
    if (!base) return null
    if (!user?.email) return base
    try {
      const url = new URL(base)
      url.searchParams.set('email', user.email)
      return url.toString()
    } catch {
      return base
    }
  })()

  const onTool = (id: string) => {
    if (id === 'artes') navigate(`/criar?cat=${encodeURIComponent('Fim de Ano')}`)
    else if (id === 'vale-presente') navigate('/vale-presente')
    else if (id === 'ofertas') navigate('/vender/ofertas')
    else if (id === 'plano') setSection('plan')
    else if (id === 'mensagens') setSection('mensagens')
  }

  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-lilac px-5 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <BackButton fallback={section === 'tools' ? '/kits' : undefined} onClick={section !== 'tools' ? () => setSection('tools') : undefined} />
        <div className="w-[38px]" />
      </div>

      <div className="flex items-center gap-3.5">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] text-2xl"
          style={{ background: `linear-gradient(135deg,${catalog.color1},${catalog.color2})` }}
        >
          🎁
        </div>
        <div>
          <h1 className="text-[23px] font-bold leading-[1.15] text-pretty">{catalog.title ?? kitFimDeAno.title}</h1>
          <div className="mt-0.5 text-sm leading-[1.35] text-muted">{catalog.subtitle ?? kitFimDeAno.subtitle}</div>
        </div>
      </div>

      {!unlocked ? (
        <div className="flex flex-col gap-4">
          <div className="relative flex gap-2">
            {previewArts.map((a) => (
              <div key={a.id} className="flex-1 overflow-hidden rounded-[14px]" style={{ filter: 'blur(5px)' }}>
                <ScaledBoard width={1080} height={1920} scale={0.1}>
                  <StoryBoard art={resolveArtPreview(a, studio)} palette={a.palette === 'black' ? 'preto' : studio.palette} post={false} photoOn={false} photoUrl={null} photoPosY={40} foot1={foot.foot1 || 'Seu estúdio'} foot2={foot.foot2} />
                </ScaledBoard>
              </div>
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5B2A4E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
              </div>
            </div>
          </div>

          <ul className="flex flex-col gap-2 rounded-[18px] bg-white p-4">
            {insideList.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] leading-[1.4] text-ink">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A15B" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener"
              onClick={() => track('kit_clique_comprar', { kit: catalog.key })}
              className="press flex h-[54px] w-full cursor-pointer items-center justify-center rounded-full bg-plum text-[17px] font-semibold text-white"
            >
              {catalog.price} · Comprar
            </a>
          ) : (
            <div className="flex h-[54px] w-full items-center justify-center rounded-full bg-lock text-[17px] font-semibold text-muted">
              {catalog.price} · Comprar
            </div>
          )}

          {user?.email && (
            <div className="text-center text-[13px] text-muted">
              Use o mesmo e-mail da sua conta: <span className="font-semibold">{user.email}</span>
            </div>
          )}

          <SoftButton className="h-[50px] text-[15px]" disabled={loading} onClick={refresh}>
            {loading ? 'Atualizando…' : 'Já comprei, atualizar'}
          </SoftButton>
        </div>
      ) : section === 'tools' ? (
        <div className="grid grid-cols-2 gap-2.5">
          {TOOLS.map((t) => (
            <button key={t.id} type="button" onClick={() => onTool(t.id)} className="press flex cursor-pointer flex-col items-start gap-3 rounded-[22px] bg-white p-4 text-left">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blush text-lg font-bold text-plum">{t.glyph}</div>
              <div className="text-[15px] leading-[1.2] font-bold text-pretty">{t.label}</div>
            </button>
          ))}
        </div>
      ) : section === 'plan' ? (
        <div className="flex flex-col gap-2.5">
          {kitFimDeAno.plan.map((item) => (
            <div
              key={item.date}
              className="flex flex-col gap-2 rounded-[20px] p-3.5"
              style={{ background: item.date === nextItem.date ? '#FBE8EE' : '#fff' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 shrink-0 items-center justify-center rounded-full bg-ink px-2.5 text-sm font-bold text-white">{formatDate(item.date)}</div>
                <div className="text-[15px] font-bold leading-[1.2] text-pretty">{item.title}</div>
              </div>
              <div className="text-[14px] leading-[1.4] text-ink">{item.todo}</div>
              <div className="flex flex-wrap gap-2">
                {item.links.art && (
                  <button
                    type="button"
                    onClick={() => {
                      track('arte_aberta', { modelo: item.links.art, origem: 'kit' })
                      navigate(`/criar/${item.links.art}`)
                    }}
                    className="flex h-8 cursor-pointer items-center rounded-full bg-blush px-3 text-[13px] font-semibold text-plum"
                  >
                    Ver arte
                  </button>
                )}
                {item.links.message && (
                  <button type="button" onClick={() => setSection('mensagens')} className="flex h-8 cursor-pointer items-center rounded-full bg-blush px-3 text-[13px] font-semibold text-plum">
                    Ver mensagem
                  </button>
                )}
                {item.links.tool && (
                  <button type="button" onClick={() => onTool(item.links.tool!)} className="flex h-8 cursor-pointer items-center rounded-full bg-blush px-3 text-[13px] font-semibold text-plum">
                    Abrir ferramenta
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(([group, list]) => (
            <div key={group} className="flex flex-col gap-2.5">
              <div className="text-[15px] font-bold text-rose">{group}</div>
              {list.map((m) => (
                <div key={m.id} className="flex flex-col gap-2.5 rounded-3xl bg-white p-4">
                  <div className="text-base font-bold">{m.title}</div>
                  <MessageText text={m.text} name="" className="text-[15px] leading-[1.55]" />
                  <CopyButton text={resolve(m.text)} size="sm" onCopied={() => track('mensagem_copiada', { id_mensagem: m.id, categoria: m.group })} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
