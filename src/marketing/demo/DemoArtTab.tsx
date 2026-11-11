// As 3 artes escolhidas usam os tipos "classic" e "new" (ver StoryBoard.tsx) — por isso as
// mesmas fontes do app completo (nunca carregadas na /lp normalmente). Como este arquivo só
// entra no chunk sob demanda do demo, elas nunca pesam no carregamento comum da /lp.
import '@fontsource/jost/latin-300.css'
import '@fontsource/jost/latin-400.css'
import '@fontsource/jost/latin-500.css'
import '@fontsource/jost/latin-600.css'
import '@fontsource/playfair-display/latin-500.css'
import '@fontsource/playfair-display/latin-400-italic.css'
import '@fontsource/bodoni-moda/latin-400.css'
import '@fontsource/bodoni-moda/latin-500.css'
import '@fontsource/bodoni-moda/latin-600.css'
import '@fontsource/bodoni-moda/latin-400-italic.css'
import '@fontsource/bodoni-moda/latin-500-italic.css'
import '@fontsource/bodoni-moda/latin-600-italic.css'

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { ScaledBoard } from '../../components/art/ScaledBoard'
import { StoryBoard } from '../../components/art/StoryBoard'
import { artKind, getAnyArt } from '../../content/lash'
import { track } from '../../lib/analytics'
import type { PaletteId } from '../../lib/artPalettes'
import { exportNodeToPng, shareOrDownloadPng } from '../../lib/exportBoard'
import { studioFootStory } from '../../lib/studioFooter'
import { applyGenericMarkers, applyStudioTokens } from '../../lib/studioTokens'
import { useDragScroll } from '../../lib/useDragScroll'
import { emptyStudio, type Studio } from '../../state/studio'
import { DEMO_ART_IDS } from './demoContent'

const DEMO_ANTES_URL = '/lp/demo-antes.webp'
const DEMO_DEPOIS_URL = '/lp/demo-depois.webp'

const TEMPLATES = DEMO_ART_IDS.map((id) => getAnyArt(id)).filter((a): a is NonNullable<typeof a> => !!a)

const PALETTES: { id: PaletteId; label: string; swatch: string }[] = [
  { id: 'rosa', label: 'Rosa', swatch: '#E07A9B' },
  { id: 'nude', label: 'Nude e dourado', swatch: '#D9BFA3' },
  { id: 'preto', label: 'Preto e dourado', swatch: '#1A1614' },
]

export function DemoArtTab({ onWantApp }: { onWantApp: () => void }) {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id)
  const [palette, setPalette] = useState<PaletteId>('rosa')
  const [studioName, setStudioName] = useState('')
  const [rows, setRows] = useState<[string, string][]>(() => (getAnyArt('tabela-valores')?.rows ?? []).slice(0, 3) as [string, string][])
  const [antesUrl, setAntesUrl] = useState(DEMO_ANTES_URL)
  const [depoisUrl, setDepoisUrl] = useState(DEMO_DEPOIS_URL)
  const [horariosText, setHorariosText] = useState('Hoje · 15h30')
  const [exporting, setExporting] = useState(false)
  const [justExported, setJustExported] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const antesInput = useRef<HTMLInputElement>(null)
  const depoisInput = useRef<HTMLInputElement>(null)
  const templatesDrag = useDragScroll<HTMLDivElement>()

  useEffect(() => () => URL.revokeObjectURL(antesUrl), [antesUrl])
  useEffect(() => () => URL.revokeObjectURL(depoisUrl), [depoisUrl])

  const onPickAntes = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAntesUrl(URL.createObjectURL(file))
    e.target.value = ''
  }
  const onPickDepois = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setDepoisUrl(URL.createObjectURL(file))
    e.target.value = ''
  }

  const art = getAnyArt(templateId) ?? TEMPLATES[0]
  const kind = artKind(art)

  const studio: Studio = useMemo(() => ({ ...emptyStudio(), studioName, palette }), [studioName, palette])
  const foot = studioFootStory(studio)

  const resolvedArt = useMemo(
    () => ({
      ...art,
      subline: kind === 'beforeAfter' ? applyGenericMarkers(art.subline, { '[estilo]': 'Volume brasileiro' }) : art.subline,
      note: art.note ? applyStudioTokens(art.note, studio) : art.note,
      rows: kind === 'menu' ? rows : art.rows,
    }),
    [art, kind, studio, rows],
  )

  const boardProps = {
    art: resolvedArt,
    palette,
    post: false,
    photoOn: kind === 'beforeAfter',
    photoUrl: kind === 'beforeAfter' ? antesUrl : null,
    photoUrl2: kind === 'beforeAfter' ? depoisUrl : null,
    photoPosY: 40,
    foot1: foot.foot1 || 'Seu estúdio',
    foot2: foot.foot2,
    horarios: kind === 'list' ? horariosText.split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 5) : undefined,
  }

  function selectTemplate(id: string) {
    setTemplateId(id)
    setJustExported(false)
    track('demo_modelo_escolhido', { modelo: id })
  }

  async function doExport() {
    if (!exportRef.current) return
    setExporting(true)
    try {
      const blob = await exportNodeToPng(exportRef.current, 1080, 1920)
      const acao = await shareOrDownloadPng(blob, `lashbox-teste-${art.id}.png`)
      track('demo_arte_exportada', { modelo: art.id, acao: acao === 'shared' ? 'compartilhar' : 'salvar' })
      setJustExported(true)
    } catch (e) {
      console.warn('exportar arte (demo)', e)
      alert('Não foi possível gerar a imagem. Tente de novo.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div ref={templatesDrag.ref} {...templatesDrag.bind} className="flex cursor-grab gap-2 overflow-x-auto pb-1 select-none">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTemplate(t.id)}
            className={`press shrink-0 cursor-pointer rounded-full px-4 py-2 text-[13.5px] font-semibold whitespace-nowrap ${
              templateId === t.id ? 'bg-[#E07A9B] text-white' : 'border border-white/[0.18] text-white/80'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-white/70">Nome do seu estúdio</span>
        <input
          value={studioName}
          onChange={(e) => setStudioName(e.target.value)}
          placeholder="Ex.: Studio Ana Lash"
          className="h-12 rounded-[14px] border border-white/[0.18] bg-white/[0.08] px-4 text-[15px] text-white placeholder:text-white/40 outline-none"
        />
      </label>

      {kind === 'menu' && (
        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-semibold text-white/70">Seus valores</span>
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={r[0]}
                onChange={(e) => setRows((rs) => rs.map((row, idx) => (idx === i ? [e.target.value, row[1]] : row)) as [string, string][])}
                placeholder="Serviço"
                className="h-11 min-w-0 flex-1 rounded-[12px] border border-white/[0.18] bg-white/[0.08] px-3 text-[14.5px] text-white placeholder:text-white/40 outline-none"
              />
              <input
                value={r[1]}
                onChange={(e) => setRows((rs) => rs.map((row, idx) => (idx === i ? [row[0], e.target.value] : row)) as [string, string][])}
                placeholder="R$"
                className="h-11 w-[90px] shrink-0 rounded-[12px] border border-white/[0.18] bg-white/[0.08] px-3 text-right text-[14.5px] text-white placeholder:text-white/40 outline-none"
              />
              <button
                type="button"
                onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                aria-label="Remover"
                className="press flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/70"
              >
                ✕
              </button>
            </div>
          ))}
          {rows.length < 6 && (
            <button
              type="button"
              onClick={() => setRows((rs) => [...rs, ['', '']])}
              className="press cursor-pointer self-start text-[13.5px] font-semibold text-[#E07A9B] underline"
            >
              + Adicionar item
            </button>
          )}
        </div>
      )}

      {kind === 'beforeAfter' && (
        <div className="ph-no-capture flex flex-col gap-2.5">
          <span className="text-[13px] font-semibold text-white/70">Suas fotos de antes e depois</span>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col items-center gap-2">
              <img src={antesUrl} alt="Antes" className="h-20 w-20 rounded-2xl object-cover" />
              <button type="button" onClick={() => antesInput.current?.click()} className="press cursor-pointer text-[12.5px] font-semibold text-[#E07A9B] underline">
                Trocar "Antes"
              </button>
              <input ref={antesInput} type="file" accept="image/*" onChange={onPickAntes} className="hidden" />
            </div>
            <div className="flex flex-1 flex-col items-center gap-2">
              <img src={depoisUrl} alt="Depois" className="h-20 w-20 rounded-2xl object-cover" />
              <button type="button" onClick={() => depoisInput.current?.click()} className="press cursor-pointer text-[12.5px] font-semibold text-[#E07A9B] underline">
                Trocar "Depois"
              </button>
              <input ref={depoisInput} type="file" accept="image/*" onChange={onPickDepois} className="hidden" />
            </div>
          </div>
        </div>
      )}

      {kind === 'list' && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-white/70">Horários livres (um por linha, até 5)</span>
          <textarea
            value={horariosText}
            onChange={(e) => setHorariosText(e.target.value)}
            rows={3}
            placeholder={'Hoje · 15h30\nAmanhã · 10h'}
            className="rounded-[14px] border border-white/[0.18] bg-white/[0.08] px-4 py-3 text-[15px] text-white placeholder:text-white/40 outline-none"
          />
        </label>
      )}

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-semibold text-white/70">Paleta</span>
        <div className="flex gap-4">
          {PALETTES.map((p) => (
            <button key={p.id} type="button" onClick={() => setPalette(p.id)} className="flex flex-1 cursor-pointer flex-col items-center gap-1.5">
              <div
                className="h-10 w-10 rounded-full border-[3px] border-white/80"
                style={{ background: p.swatch, boxShadow: palette === p.id ? '0 0 0 2.5px #E07A9B' : 'none' }}
              />
              <span className="text-center text-[11.5px] text-white/70">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center rounded-[20px] bg-white/[0.06] p-3">
        <ScaledBoard width={1080} height={1920} scale={0.22}>
          <StoryBoard {...boardProps} />
        </ScaledBoard>
      </div>

      <button
        type="button"
        onClick={doExport}
        disabled={exporting}
        className="press flex h-[52px] cursor-pointer items-center justify-center rounded-full bg-[#E07A9B] text-[16px] font-bold text-white disabled:opacity-60"
      >
        {exporting ? 'Gerando...' : 'Baixar imagem'}
      </button>

      {justExported && (
        <div className="flex flex-col gap-3 rounded-[20px] border border-white/[0.14] bg-[#E07A9B]/18 p-4 text-center">
          <p className="text-[14.5px] leading-[1.4] text-white">
            Essa foi só uma arte. Lá dentro tem mais 19 modelos, vale-presente, ofertas e mensagens prontas.
          </p>
          <button
            type="button"
            onClick={onWantApp}
            className="press flex h-12 cursor-pointer items-center justify-center rounded-full bg-white text-[15px] font-bold text-[#5B2A4E]"
          >
            Quero o app LashBox
          </button>
        </div>
      )}

      <div className="ph-no-capture" style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }} aria-hidden="true">
        <div ref={exportRef}>
          <StoryBoard {...boardProps} />
        </div>
      </div>
    </div>
  )
}
