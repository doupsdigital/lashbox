// Arte de Story (1080×1920) ou Post (1080×1350), portada fiel do protótipo de referência
// (referencia/lash-artes/Lash Artes.dc.html, Parte B/C).
import { fit, fit2, PAL, PAL2, CQW, type PaletteId } from '../../lib/artPalettes'
import type { KitArt } from '../../content/lash/kitFimDeAno'
import { artKind } from '../../content/lash/kitFimDeAno'

export interface StoryBoardProps {
  art: KitArt
  palette: PaletteId
  post: boolean
  photoOn: boolean
  photoUrl: string | null
  photoPosY: number
  foot1: string
  foot2: string
  vagas?: string
  comboTitulo?: string
  preco?: string
  pillText?: string
  horarios?: string[]
  /** "beforeAfter": a 2ª foto ("Depois"). A 1ª usa `photoUrl`. */
  photoUrl2?: string | null
  /** "photo" sem foto: não mostra o fundo listrado de "esperando foto" (usado na prévia do Início, que não é o editor). */
  hidePhotoPlaceholder?: boolean
  guides?: boolean
}

const NEW_KINDS = ['beforeAfter', 'menu', 'quote', 'bullets', 'photo'] as const
type NewKind = (typeof NEW_KINDS)[number]

function isNewKind(k: string): k is NewKind {
  return (NEW_KINDS as readonly string[]).includes(k)
}

export function StoryBoard(props: StoryBoardProps) {
  const kind = artKind(props.art)
  if (isNewKind(kind)) return <NewArtBoard {...props} kind={kind} />
  return <ClassicArtBoard {...props} />
}

function ClassicArtBoard({
  art,
  palette,
  post,
  photoOn,
  photoUrl,
  photoPosY,
  foot1,
  foot2,
  vagas,
  comboTitulo,
  preco,
  pillText,
  horarios,
  guides,
}: StoryBoardProps) {
  const p = PAL[palette]
  const kind = artKind(art)
  const bf = art.palette === 'black'
  const pf = post ? 0.88 : 1
  const H = post ? 1350 : 1920
  const pad = post ? '92px 84px 84px' : '260px 84px 350px'
  const gap = post ? 24 : 34
  const hasPhoto = photoOn && art.photo === 'optional'
  const title = art.headline
  const sub = kind === 'text' ? art.subline : ''
  const hasSub = !!sub

  const titleFs = Math.round(fit(title, kind === 'price' ? 100 : hasPhoto ? 104 : 126, 54, 24) * pf)
  const priceFs = Math.round(fit(preco, hasPhoto ? 230 : 330, 110, 4) * pf)
  const comboLabel = comboTitulo ? `${comboTitulo}:` : ''
  const comboFs = Math.round(fit(comboLabel, 68, 40, 22) * pf)
  const rsFs = Math.round(priceFs * 0.26)
  const rsPad = Math.round(priceFs * 0.1)
  const pillFs = Math.round(fit(pillText, 34, 26, 34) * pf)
  const bigFs = Math.round(fit(vagas, 520, 200, 2) * pf)
  const urgentLabelFs = Math.round(78 * pf)
  const list = (horarios ?? []).slice(0, 5)
  const n = Math.max(2, list.length)
  const maxLen = Math.max(0, ...list.map((x) => x.length))
  const listBase = ({ 2: 84, 3: 76, 4: 68, 5: 60 }[n] ?? 60) * pf * (hasPhoto ? 0.82 : 1)
  const listFs = Math.round(fit('x'.repeat(maxLen), listBase, 34, 22))
  const rowPad = hasPhoto ? 12 : 22
  const subFs = Math.round(fit(sub, 56, 36, 44) * pf)
  const foot1Fs = Math.round(fit(foot1, 34, 24, 30) * pf)
  // O rodapé de contato precisa continuar legível mesmo em Post (fonte ×0,88): mínimo de 30px já com esse fator.
  const foot2Fs = Math.round(fit(foot2, 40, 36, 34) * pf)

  return (
    <div
      style={{
        width: 1080,
        height: H,
        position: 'relative',
        overflow: 'hidden',
        background: p.bg,
        color: p.ink,
        fontFamily: 'var(--font-kit-sans)',
      }}
    >
      <div style={{ position: 'absolute', top: -220, right: -240, width: 760, height: 760, borderRadius: '50%', background: p.bg2 }} />
      <div
        style={{ position: 'absolute', bottom: -300, left: -260, width: 820, height: 820, borderRadius: '50%', background: p.bg2, opacity: 0.7 }}
      />
      <div
        style={{
          position: 'absolute',
          top: '34%',
          left: -180,
          width: 520,
          height: 520,
          borderRadius: '50%',
          border: `2px solid ${p.deco}`,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${p.deco} 1.2px, transparent 1.6px)`,
          backgroundSize: '26px 26px',
          opacity: 0.22,
        }}
      />
      <div style={{ position: 'absolute', inset: 34, border: `2px solid ${p.deco}`, opacity: 0.7 }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: pad,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, color: p.deco, fontSize: 30 }}>
            <span style={{ width: 90, height: 2, background: p.deco }} />✦<span style={{ width: 90, height: 2, background: p.deco }} />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-kit-serif)',
              fontWeight: 500,
              fontSize: titleFs,
              lineHeight: 1.04,
              letterSpacing: '-.01em',
              textWrap: 'balance',
              overflowWrap: 'anywhere',
              color: bf ? p.accent : p.ink,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap,
          }}
        >
          {hasPhoto && (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                width: '100%',
                boxSizing: 'border-box',
                border: `3px solid ${p.deco}`,
                borderRadius: '460px 460px 44px 44px',
                padding: 14,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: '446px 446px 30px 30px',
                  overflow: 'hidden',
                  background: `repeating-linear-gradient(135deg, ${p.bg2} 0 18px, ${p.bg} 18px 36px)`,
                }}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `center ${photoPosY}%` }}
                  />
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'monospace',
                      fontSize: 26,
                      color: p.muted,
                    }}
                  >
                    foto da lash
                  </div>
                )}
              </div>
            </div>
          )}
          {kind === 'urgent' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontStyle: 'italic', fontSize: urgentLabelFs }}>Restam</div>
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontWeight: 500, fontSize: bigFs, lineHeight: 0.95, color: p.accent }}>
                {vagas}
              </div>
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontStyle: 'italic', fontSize: urgentLabelFs, textWrap: 'balance' }}>
                horários da Black Friday
              </div>
            </div>
          )}
          {kind === 'price' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%' }}>
              <div
                style={{ fontFamily: 'var(--font-kit-serif)', fontStyle: 'italic', fontSize: comboFs, lineHeight: 1.08, textWrap: 'balance', overflowWrap: 'anywhere' }}
              >
                {comboLabel}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 12, color: p.accent }}>
                <span style={{ fontFamily: 'var(--font-kit-sans)', fontWeight: 500, fontSize: rsFs, paddingTop: rsPad }}>R$</span>
                <span style={{ fontFamily: 'var(--font-kit-serif)', fontWeight: 600, fontSize: priceFs, lineHeight: 0.92, letterSpacing: '-.02em' }}>
                  {preco}
                </span>
              </div>
              <div
                style={{
                  marginTop: 26,
                  padding: '16px 34px',
                  borderRadius: 999,
                  background: p.accent,
                  color: p.onAccent,
                  fontWeight: 500,
                  fontSize: pillFs,
                  letterSpacing: '.04em',
                  textWrap: 'balance',
                }}
              >
                {pillText}
              </div>
            </div>
          )}
          {kind === 'list' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', borderTop: `2px solid ${p.deco}` }}>
              {list.map((h, i) => (
                <div
                  key={i}
                  style={{
                    padding: `${rowPad}px 10px`,
                    borderBottom: `2px solid ${p.deco}`,
                    fontFamily: 'var(--font-kit-serif)',
                    fontSize: listFs,
                    lineHeight: 1.1,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
          )}
          {hasSub && (
            <div
              style={{
                fontFamily: 'var(--font-kit-serif)',
                fontStyle: 'italic',
                fontSize: subFs,
                lineHeight: 1.18,
                textWrap: 'balance',
                overflowWrap: 'anywhere',
                padding: '0 10px',
              }}
            >
              {sub}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
          <div style={{ width: 120, height: 2, background: p.deco, marginBottom: 12 }} />
          <div style={{ fontWeight: 500, fontSize: foot1Fs, letterSpacing: '.06em', textTransform: 'uppercase', lineHeight: 1.2, overflowWrap: 'anywhere' }}>
            {foot1}
          </div>
          <div style={{ fontSize: foot2Fs, lineHeight: 1.25, color: p.accent, fontWeight: 500, overflowWrap: 'anywhere' }}>{foot2}</div>
        </div>
      </div>
      {guides && !post && (
        <>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 250,
              background: 'repeating-linear-gradient(45deg, rgba(220,40,60,.28) 0 12px, rgba(220,40,60,.1) 12px 24px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 340,
              background: 'repeating-linear-gradient(45deg, rgba(220,40,60,.28) 0 12px, rgba(220,40,60,.1) 12px 24px)',
              pointerEvents: 'none',
            }}
          />
        </>
      )}
    </div>
  )
}

/**
 * Os 5 tipos novos (antes/depois, tabela, depoimento, tópicos, foto), portados fiéis do protótipo
 * referencia/artes-novas/LashBox Art2.dc.html — layout e paleta (PAL2) bem diferentes do board clássico,
 * por isso vivem num componente próprio em vez de ramificar o de cima.
 */
function NewArtBoard({
  art,
  palette,
  post,
  photoOn,
  photoUrl,
  photoUrl2,
  foot1,
  foot2,
  kind,
  hidePhotoPlaceholder,
  guides,
}: StoryBoardProps & { kind: NewKind }) {
  const c = PAL2[palette]
  const k = post ? 0.82 : 1
  const H = post ? 1350 : 1920
  const title = art.headline
  const sub = art.subline || ''
  const hasSub = !!sub
  const rows = art.rows ?? []
  const bulletItems = (art.items ?? []).map((it) => (typeof it === 'string' ? it : it.t))
  const quote = art.quote ?? ''
  const author = art.author ?? ''
  const labels = art.labels ?? ['Antes', 'Depois']

  const titleTable: [number, number][] =
    kind === 'quote' ? [[24, 5], [40, 4.2], [999, 3.6]] : [[18, 9], [28, 7.6], [44, 6.4], [999, 5.4]]
  const tSize = fit2(title.length, titleTable, k)
  // Mínimo de 36px pedido para o subtítulo, em qualquer formato — abaixo disso ele quebra linha, não encolhe mais.
  const sSize = Math.max(36, fit2(sub.length, [[28, 4.8], [60, 4.2], [999, 3.6]], k))

  const rowItemsForSize = kind === 'menu' ? rows.map((r) => r[0]) : bulletItems
  const n = rowItemsForSize.length || 1
  const longest = Math.max(0, ...rowItemsForSize.map((s) => s.length))
  // Mínimo de 40px (Story) / 36px (Post) para linhas de tabela e tópicos — mesma lógica: quebra, não encolhe mais.
  const rowMin = post ? 36 : 40
  const rSize =
    kind === 'menu'
      ? Math.max(rowMin, fit2(longest + (n > 5 ? 12 : 0), [[16, 5.2], [26, 4.6], [999, 4]], k))
      : Math.max(rowMin, fit2(longest + (n > 4 ? 10 : 0), [[26, 4.8], [40, 4.2], [999, 3.6]], k))
  const noteSize = art.note ? Math.max(36, fit2(art.note.length, [[28, 4.8], [60, 4.2], [999, 3.6]], k)) : 0

  const mSize = Math.round((palette === 'nude' ? 4 : 3.6) * CQW)
  const qSize = fit2(quote.length, [[70, 6.6], [110, 5.8], [170, 5], [999, 4.1]], k)

  const top = Math.round((post ? 8 : 14) * CQW)
  const bot = Math.round((post ? 22 : 32) * CQW)
  const fBot = Math.round((post ? 6 : 9) * CQW)
  const gap = Math.round((post ? 2.6 : 4) * CQW)
  const rowGap = Math.round((post ? 3 : 4.6) * CQW)
  const phW = Math.round((post ? 62 : 76) * CQW)
  const phH = Math.round((post ? 56 : 96) * CQW)
  const baH = Math.round((post ? (hasSub ? 50 : 56) : 82) * CQW)

  const mk = (i: number) => (palette === 'preto' ? '★' : palette === 'rosa' ? '♥' : String(i + 1))

  const baPhotos = [
    { l: labels[0], src: photoUrl, bg: 'rgba(255,255,255,.88)', fg: '#4A3426' },
    { l: labels[1], src: photoUrl2 ?? null, bg: c.acc, fg: palette === 'preto' ? '#0E0C0B' : '#fff' },
  ]

  const placeholderBg = `repeating-linear-gradient(135deg, rgba(128,100,100,.16) 0 ${Math.round(3 * CQW)}px, transparent ${Math.round(3 * CQW)}px ${Math.round(6 * CQW)}px)`

  return (
    <div
      style={{
        width: 1080,
        height: H,
        position: 'relative',
        overflow: 'hidden',
        background: c.bg,
        color: c.fg,
        fontFamily: "'Playfair Display', serif",
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: Math.round(-22 * CQW),
          top: Math.round(-14 * CQW),
          width: Math.round(62 * CQW),
          height: Math.round(62 * CQW),
          borderRadius: '50%',
          background: c.acc,
          opacity: 0.16,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: Math.round(-18 * CQW),
          bottom: Math.round(-18 * CQW),
          width: Math.round(50 * CQW),
          height: Math.round(50 * CQW),
          borderRadius: '50%',
          background: c.acc,
          opacity: 0.12,
        }}
      />
      <div style={{ position: 'absolute', inset: Math.round(4 * CQW), border: `1px solid ${c.acc}`, opacity: 0.5 }} />

      <div
        style={{
          position: 'absolute',
          left: Math.round(10 * CQW),
          right: Math.round(10 * CQW),
          top,
          bottom: bot,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap,
          textAlign: 'center',
          color: c.fg,
        }}
      >
        {kind === 'photo' && (art.photo === 'required' || photoOn) && (photoUrl || !hidePhotoPlaceholder) && (
          <div
            style={{
              width: phW,
              height: phH,
              borderRadius: `${phW}px ${phW}px ${Math.round(3 * CQW)}px ${Math.round(3 * CQW)}px`,
              borderTopLeftRadius: Math.round(40 * CQW),
              borderTopRightRadius: Math.round(40 * CQW),
              overflow: 'hidden',
              border: `1px solid ${c.acc}`,
              flex: 'none',
              background: placeholderBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'monospace',
              fontSize: Math.round(2.8 * CQW),
            }}
          >
            {photoUrl ? <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>foto da lash</span>}
          </div>
        )}

        {kind !== 'photo' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(2 * CQW), color: c.acc, flex: 'none' }}>
            <div style={{ width: Math.round(9 * CQW), height: 1, background: 'currentColor' }} />
            <div style={{ fontSize: Math.round(3.4 * CQW), lineHeight: 1 }}>✦</div>
            <div style={{ width: Math.round(9 * CQW), height: 1, background: 'currentColor' }} />
          </div>
        )}

        <div style={{ fontSize: tSize, lineHeight: 1.12, fontWeight: 500, textWrap: 'balance', overflowWrap: 'anywhere', maxWidth: '100%' }}>
          {title}
        </div>
        {hasSub && (
          <div
            style={{ fontStyle: 'italic', fontSize: sSize, lineHeight: 1.3, opacity: 0.88, textWrap: 'balance', overflowWrap: 'anywhere', maxWidth: '100%' }}
          >
            {sub}
          </div>
        )}

        {kind === 'beforeAfter' && (
          <div style={{ display: 'flex', gap: Math.round(3 * CQW), width: '100%', justifyContent: 'center' }}>
            {baPhotos.map((ph, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  width: Math.round(40 * CQW),
                  height: baH,
                  borderRadius: `${Math.round(20 * CQW)}px ${Math.round(20 * CQW)}px ${Math.round(3 * CQW)}px ${Math.round(3 * CQW)}px`,
                  overflow: 'hidden',
                  border: `1px solid ${c.acc}`,
                  background: placeholderBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'monospace',
                  fontSize: Math.round(2.6 * CQW),
                }}
              >
                {ph.src ? <img src={ph.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>foto {ph.l}</span>}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: Math.round(3 * CQW),
                    transform: 'translateX(-50%)',
                    padding: `${Math.round(1 * CQW)}px ${Math.round(4 * CQW)}px`,
                    borderRadius: Math.round(6 * CQW),
                    background: ph.bg,
                    color: ph.fg,
                    fontFamily: 'var(--font-kit-sans)',
                    fontSize: Math.round(2.8 * CQW),
                    fontWeight: 600,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  {ph.l}
                </div>
              </div>
            ))}
          </div>
        )}

        {kind === 'menu' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: rowGap }}>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: Math.round(1.6 * CQW), fontSize: rSize }}>
                <span style={{ textAlign: 'left', overflowWrap: 'anywhere', maxWidth: '60%' }}>{r[0]}</span>
                <span style={{ flex: 1, minWidth: Math.round(4 * CQW), borderBottom: `1.5px dotted ${c.acc}`, transform: 'translateY(-.5ch)' }} />
                <span style={{ color: c.acc, fontWeight: 500, whiteSpace: 'nowrap', filter: `brightness(${c.pb})` }}>{r[1]}</span>
              </div>
            ))}
            {art.note && (
              <div style={{ marginTop: Math.round(2 * CQW), fontStyle: 'italic', fontSize: noteSize, opacity: 0.8 }}>{art.note}</div>
            )}
          </div>
        )}

        {kind === 'quote' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Math.round(2.5 * CQW), width: '100%' }}>
            <div style={{ fontSize: Math.round(30 * CQW), lineHeight: 0.6, height: Math.round(14 * CQW), color: c.acc }}>“</div>
            <div style={{ fontStyle: 'italic', fontSize: qSize, lineHeight: 1.32, textWrap: 'pretty', overflowWrap: 'anywhere' }}>{quote}</div>
            <div style={{ color: c.acc, fontSize: Math.round(4 * CQW), letterSpacing: `${Math.round(0.5 * CQW)}px` }}>★★★★★</div>
            <div style={{ fontFamily: 'var(--font-kit-sans)', fontSize: Math.round(3.6 * CQW), fontWeight: 500, letterSpacing: '.06em' }}>
              — {author}
            </div>
          </div>
        )}

        {kind === 'bullets' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: rowGap, textAlign: 'left' }}>
            {bulletItems.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: Math.round(3 * CQW), alignItems: 'center', fontSize: rSize, lineHeight: 1.25 }}>
                <div
                  style={{
                    flex: 'none',
                    width: Math.round(8.4 * CQW),
                    height: Math.round(8.4 * CQW),
                    borderRadius: '50%',
                    border: `1.5px solid ${c.acc}`,
                    color: c.acc,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: mSize,
                    fontFamily: 'var(--font-kit-sans)',
                    fontWeight: 500,
                  }}
                >
                  {mk(i)}
                </div>
                <div style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{t}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          left: Math.round(8 * CQW),
          right: Math.round(8 * CQW),
          bottom: fBot,
          textAlign: 'center',
          fontFamily: 'var(--font-kit-sans)',
          color: c.fg,
        }}
      >
        <div style={{ width: Math.round(12 * CQW), height: 1, background: c.acc, margin: `0 auto ${Math.round(2.4 * CQW)}px` }} />
        <div
          style={{ fontSize: Math.round(2.7 * CQW), fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', overflowWrap: 'anywhere' }}
        >
          {foot1}
        </div>
        <div style={{ fontSize: Math.round(2.7 * CQW), color: c.acc, marginTop: Math.round(1 * CQW), fontWeight: 500, overflowWrap: 'anywhere' }}>
          {foot2}
        </div>
      </div>

      {guides && !post && (
        <>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 250,
              background: 'repeating-linear-gradient(45deg, rgba(220,40,60,.28) 0 12px, rgba(220,40,60,.1) 12px 24px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 340,
              background: 'repeating-linear-gradient(45deg, rgba(220,40,60,.28) 0 12px, rgba(220,40,60,.1) 12px 24px)',
              pointerEvents: 'none',
            }}
          />
        </>
      )}
    </div>
  )
}
