// Arte de Story (1080×1920) ou Post (1080×1350), portada fiel do protótipo de referência
// (referencia/lash-artes/Lash Artes.dc.html, Parte B/C).
import { fit, PAL, type PaletteId } from '../../lib/artPalettes'
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
  guides?: boolean
}

export function StoryBoard({
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
