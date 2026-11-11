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

import { useMemo, useRef, useState } from 'react'
import { ScaledBoard } from '../../components/art/ScaledBoard'
import { StoryBoard } from '../../components/art/StoryBoard'
import { artKind, getAnyArt } from '../../content/lash'
import { track } from '../../lib/analytics'
import type { PaletteId } from '../../lib/artPalettes'
import { exportNodeToPng, shareOrDownloadPng } from '../../lib/exportBoard'
import { studioFootStory } from '../../lib/studioFooter'
import { applyStudioTokens } from '../../lib/studioTokens'
import { emptyStudio, type Studio } from '../../state/studio'
import { DEMO_ART_IDS } from './demoContent'

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
  const [quoteText, setQuoteText] = useState(getAnyArt('elogio-cliente')?.quote ?? '')
  const [authorText, setAuthorText] = useState(getAnyArt('elogio-cliente')?.author ?? '')
  const [horario, setHorario] = useState('Hoje · 15h30')
  const [exporting, setExporting] = useState(false)
  const [justExported, setJustExported] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const art = getAnyArt(templateId) ?? TEMPLATES[0]
  const kind = artKind(art)

  const studio: Studio = useMemo(() => ({ ...emptyStudio(), studioName, palette }), [studioName, palette])
  const foot = studioFootStory(studio)

  const resolvedArt = useMemo(
    () => ({
      ...art,
      note: art.note ? applyStudioTokens(art.note, studio) : art.note,
      rows: kind === 'menu' ? rows : art.rows,
      quote: kind === 'quote' ? quoteText : art.quote,
      author: kind === 'quote' ? authorText : art.author,
    }),
    [art, kind, studio, rows, quoteText, authorText],
  )

  const boardProps = {
    art: resolvedArt,
    palette,
    post: false,
    photoOn: false,
    photoUrl: null,
    photoUrl2: null,
    photoPosY: 40,
    foot1: foot.foot1 || 'Seu estúdio',
    foot2: foot.foot2,
    horarios: kind === 'list' ? [horario] : undefined,
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
      <div className="flex gap-2 overflow-x-auto pb-1">
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
            <div key={i} className="flex items-center gap-2.5">
              <span className="flex-1 text-[14.5px] text-white/85">{r[0]}</span>
              <input
                value={r[1]}
                onChange={(e) => setRows((rs) => rs.map((row, idx) => (idx === i ? [row[0], e.target.value] : row)) as [string, string][])}
                className="h-11 w-[110px] rounded-[12px] border border-white/[0.18] bg-white/[0.08] px-3 text-right text-[14.5px] text-white outline-none"
              />
            </div>
          ))}
        </div>
      )}

      {kind === 'quote' && (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-white/70">O que a cliente disse</span>
            <textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              rows={3}
              className="rounded-[14px] border border-white/[0.18] bg-white/[0.08] px-4 py-3 text-[15px] text-white outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-white/70">Quem disse</span>
            <input
              value={authorText}
              onChange={(e) => setAuthorText(e.target.value)}
              className="h-12 rounded-[14px] border border-white/[0.18] bg-white/[0.08] px-4 text-[15px] text-white outline-none"
            />
          </label>
        </div>
      )}

      {kind === 'list' && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-white/70">Horário livre hoje</span>
          <input
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="h-12 rounded-[14px] border border-white/[0.18] bg-white/[0.08] px-4 text-[15px] text-white outline-none"
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
