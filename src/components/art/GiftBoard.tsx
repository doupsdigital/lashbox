// Vale-presente (1080×1350), portado fiel do protótipo de referência
// (referencia/lash-artes/Lash Artes.dc.html, Parte A).
import { useMemo } from 'react'
import { fit, PAL, type PaletteId } from '../../lib/artPalettes'
import type { VoucherStyle } from '../../content/lash/kitFimDeAno'

export interface GiftBoardProps {
  style: VoucherStyle['id']
  palette: PaletteId
  para: string
  de: string
  servico: string
  mensagem: string
  validade: string
  foot: string
}

export function GiftBoard({ style, palette, para, de, servico, mensagem, validade, foot }: GiftBoardProps) {
  const p = PAL[palette]
  const tight = style === 'natal'
  const paraFs = fit(para, style === 'minimal' ? 64 : 66, 34, tight ? 14 : 16)
  const deFs = fit(de, style === 'minimal' ? 64 : 66, 34, tight ? 14 : 16)
  const servFs = fit(servico, 38, 26, 34)
  const msgFs = fit(mensagem, 44, 28, 36)
  const footFs = fit(foot, 30, 22, 50)

  const baubles = useMemo(
    () =>
      ([
        [110, 150, 92, 'accent'],
        [300, 270, 120, 'deco'],
        [520, 120, 104, 'accent'],
        [745, 240, 112, 'deco'],
        [950, 170, 86, 'accent'],
      ] as [number, number, number, 'accent' | 'deco'][]).map(([x, len, size, c]) => ({
        x,
        len,
        size,
        cx: x - size / 2 + 1,
        color: p[c],
        capx: x - 10,
        capy: len - 10,
      })),
    [p],
  )
  const snow = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ x: ((i * 397) % 1020) + 20, y: ((i * 233) % 1250) + 100, d: 6 + (i % 4) * 4 })), [])

  return (
    <div style={{ width: 1080, height: 1350, position: 'relative', overflow: 'hidden', background: p.bg, color: p.ink, fontFamily: 'var(--font-kit-sans)' }}>
      {style === 'rosa' && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: p.accent }} />
          <div style={{ position: 'absolute', inset: 64, borderRadius: 40, background: p.card, overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `radial-gradient(${p.deco} 1.2px, transparent 1.6px)`,
                backgroundSize: '26px 26px',
                opacity: 0.18,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 880,
                boxSizing: 'border-box',
                padding: '56px 70px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 26,
              }}
            >
              <div style={{ color: p.deco, fontSize: 34 }}>✦</div>
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 124, lineHeight: 1, color: p.accent }}>
                Vale-presente
              </div>
              <div style={{ width: '100%', display: 'flex', alignItems: 'baseline', gap: 20, borderBottom: `2px solid ${p.deco}`, paddingBottom: 6 }}>
                <span style={{ fontSize: 26, letterSpacing: '.2em', textTransform: 'uppercase', color: p.muted }}>Para</span>
                <span style={{ flex: 1, minWidth: 0, textAlign: 'left', fontFamily: 'var(--font-kit-serif)', fontStyle: 'italic', fontSize: paraFs, lineHeight: 1.1, overflowWrap: 'anywhere' }}>
                  {para}
                </span>
              </div>
              <div style={{ width: '100%', display: 'flex', alignItems: 'baseline', gap: 20, borderBottom: `2px solid ${p.deco}`, paddingBottom: 6 }}>
                <span style={{ fontSize: 26, letterSpacing: '.2em', textTransform: 'uppercase', color: p.muted }}>De</span>
                <span style={{ flex: 1, minWidth: 0, textAlign: 'left', fontFamily: 'var(--font-kit-serif)', fontStyle: 'italic', fontSize: deFs, lineHeight: 1.1, overflowWrap: 'anywhere' }}>
                  {de}
                </span>
              </div>
              <div
                style={{
                  padding: '14px 34px',
                  borderRadius: 999,
                  background: p.accent,
                  color: p.onAccent,
                  fontWeight: 500,
                  fontSize: servFs,
                  lineHeight: 1.2,
                  overflowWrap: 'anywhere',
                  textWrap: 'balance',
                }}
              >
                {servico}
              </div>
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontStyle: 'italic', fontSize: msgFs, lineHeight: 1.2, textWrap: 'balance', overflowWrap: 'anywhere' }}>
                {mensagem}
              </div>
            </div>
            <div style={{ position: 'absolute', top: 840, left: -40, width: 80, height: 80, borderRadius: '50%', background: p.accent }} />
            <div style={{ position: 'absolute', top: 840, right: -40, width: 80, height: 80, borderRadius: '50%', background: p.accent }} />
            <div style={{ position: 'absolute', top: 878, left: 60, right: 60, borderTop: `3px dashed ${p.deco}` }} />
            <div
              style={{
                position: 'absolute',
                top: 880,
                bottom: 0,
                left: 0,
                right: 0,
                boxSizing: 'border-box',
                padding: '0 60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 500, fontSize: 34, letterSpacing: '.14em', textTransform: 'uppercase', color: p.accent }}>Válido até {validade}</div>
              <div style={{ fontSize: footFs, lineHeight: 1.25, overflowWrap: 'anywhere' }}>{foot}</div>
            </div>
          </div>
        </>
      )}

      {style === 'natal' && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(${p.deco} 1.2px, transparent 1.6px)`,
              backgroundSize: '26px 26px',
              opacity: 0.2,
            }}
          />
          {snow.map((s, i) => (
            <div key={i} style={{ position: 'absolute', left: s.x, top: s.y, width: s.d, height: s.d, borderRadius: '50%', background: p.deco, opacity: 0.55 }} />
          ))}
          {baubles.map((o, i) => (
            <div key={i}>
              <div style={{ position: 'absolute', left: o.x, top: 0, width: 3, height: o.len, background: p.deco }} />
              <div
                style={{
                  position: 'absolute',
                  left: o.cx,
                  top: o.len,
                  width: o.size,
                  height: o.size,
                  borderRadius: '50%',
                  background: o.color,
                  boxShadow: 'inset -10px -12px 0 rgba(0,0,0,.12)',
                }}
              >
                <div style={{ position: 'absolute', top: '16%', left: '20%', width: '22%', height: '22%', borderRadius: '50%', background: 'rgba(255,255,255,.55)' }} />
              </div>
              <div style={{ position: 'absolute', left: o.capx, top: o.capy, width: 24, height: 16, borderRadius: 4, background: p.deco }} />
            </div>
          ))}
          <div style={{ position: 'absolute', left: 80, right: 80, top: 400, bottom: 90, borderRadius: 28, background: p.card, border: `3px solid ${p.deco}`, overflow: 'hidden' }}>
            <div style={{ height: 34, background: `repeating-linear-gradient(135deg, ${p.accent} 0 20px, ${p.deco} 20px 40px)` }} />
            <div
              style={{
                position: 'absolute',
                top: 34,
                bottom: 34,
                left: 0,
                right: 0,
                boxSizing: 'border-box',
                padding: '20px 64px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 22,
              }}
            >
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 116, lineHeight: 1, color: p.accent }}>
                Vale-presente
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: p.deco, fontSize: 28 }}>
                <span style={{ width: 110, height: 2, background: p.deco }} />✦ ✦ ✦<span style={{ width: 110, height: 2, background: p.deco }} />
              </div>
              <div style={{ fontSize: 26, letterSpacing: '.2em', textTransform: 'uppercase', color: p.muted }}>Para</div>
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontSize: paraFs, lineHeight: 1.05, marginTop: -14, overflowWrap: 'anywhere' }}>{para}</div>
              <div style={{ fontSize: 26, letterSpacing: '.2em', textTransform: 'uppercase', color: p.muted }}>De</div>
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontSize: deFs, lineHeight: 1.05, marginTop: -14, overflowWrap: 'anywhere' }}>{de}</div>
              <div style={{ fontWeight: 500, fontSize: servFs, lineHeight: 1.2, color: p.accent, overflowWrap: 'anywhere', textWrap: 'balance' }}>{servico}</div>
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontStyle: 'italic', fontSize: msgFs, lineHeight: 1.2, overflowWrap: 'anywhere', textWrap: 'balance' }}>
                {mensagem}
              </div>
              <div style={{ fontWeight: 500, fontSize: 30, letterSpacing: '.12em', textTransform: 'uppercase' }}>Válido até {validade}</div>
              <div style={{ fontSize: footFs, lineHeight: 1.25, overflowWrap: 'anywhere', color: p.muted }}>{foot}</div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 34, background: `repeating-linear-gradient(135deg, ${p.accent} 0 20px, ${p.deco} 20px 40px)` }} />
          </div>
        </>
      )}

      {style === 'dourado' && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${p.bg}, ${p.bg2})` }} />
          <div style={{ position: 'absolute', inset: 46, border: `2px solid ${p.deco}` }} />
          <div style={{ position: 'absolute', inset: 62, border: `1px solid ${p.deco}` }} />
          <div
            style={{
              position: 'absolute',
              inset: 62,
              boxSizing: 'border-box',
              padding: '70px 70px 56px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  border: `2px solid ${p.deco}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    background: p.accent,
                    color: p.onAccent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 40,
                  }}
                >
                  ✦
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 148, lineHeight: 1, color: p.accent }}>
                Vale-presente
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
              <div style={{ fontSize: 26, letterSpacing: '.3em', textTransform: 'uppercase', color: p.muted }}>Para</div>
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontSize: paraFs, lineHeight: 1.05, overflowWrap: 'anywhere' }}>{para}</div>
              <div style={{ height: 2, width: 160, background: p.deco, margin: '14px 0' }} />
              <div style={{ fontSize: 26, letterSpacing: '.3em', textTransform: 'uppercase', color: p.muted }}>De</div>
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontSize: deFs, lineHeight: 1.05, overflowWrap: 'anywhere' }}>{de}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
              <div
                style={{
                  width: '100%',
                  padding: '18px 0',
                  borderTop: `2px solid ${p.deco}`,
                  borderBottom: `2px solid ${p.deco}`,
                  fontWeight: 500,
                  fontSize: servFs,
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  lineHeight: 1.2,
                  color: p.accent,
                  overflowWrap: 'anywhere',
                  textWrap: 'balance',
                }}
              >
                {servico}
              </div>
              <div style={{ fontFamily: 'var(--font-kit-serif)', fontStyle: 'italic', fontSize: msgFs, lineHeight: 1.2, overflowWrap: 'anywhere', textWrap: 'balance' }}>
                {mensagem}
              </div>
              <div style={{ fontSize: 28, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 500 }}>Válido até {validade}</div>
              <div style={{ fontSize: footFs, lineHeight: 1.25, overflowWrap: 'anywhere', color: p.muted }}>{foot}</div>
            </div>
          </div>
        </>
      )}

      {style === 'minimal' && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: p.card }} />
          <div style={{ position: 'absolute', top: -260, right: -260, width: 800, height: 800, borderRadius: '50%', border: `2px solid ${p.deco}` }} />
          <div style={{ position: 'absolute', top: -120, right: -120, width: 520, height: 520, borderRadius: '50%', background: p.accent }} />
          <div style={{ position: 'absolute', inset: 0, boxSizing: 'border-box', padding: '120px 110px 100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--font-kit-serif)', fontWeight: 500, fontSize: 176, lineHeight: 0.92, letterSpacing: '-.02em', marginTop: 150 }}>
              Vale-
              <br />
              presente
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: '22px 0', borderTop: `2px solid ${p.ink}` }}>
                <span style={{ width: 130, flex: 'none', fontSize: 24, letterSpacing: '.2em', textTransform: 'uppercase', color: p.muted }}>Para</span>
                <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-kit-serif)', fontSize: paraFs, lineHeight: 1.1, overflowWrap: 'anywhere' }}>{para}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: '22px 0', borderTop: `1px solid ${p.deco}` }}>
                <span style={{ width: 130, flex: 'none', fontSize: 24, letterSpacing: '.2em', textTransform: 'uppercase', color: p.muted }}>De</span>
                <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-kit-serif)', fontSize: deFs, lineHeight: 1.1, overflowWrap: 'anywhere' }}>{de}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: '22px 0', borderTop: `1px solid ${p.deco}` }}>
                <span style={{ width: 130, flex: 'none', fontSize: 24, letterSpacing: '.2em', textTransform: 'uppercase', color: p.muted }}>Válido</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 38, fontWeight: 500 }}>até {validade}</span>
              </div>
              <div style={{ padding: '22px 0', borderTop: `2px solid ${p.ink}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontWeight: 500, fontSize: servFs, lineHeight: 1.2, color: p.accent, overflowWrap: 'anywhere' }}>{servico}</div>
                <div style={{ fontFamily: 'var(--font-kit-serif)', fontStyle: 'italic', fontSize: msgFs, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{mensagem}</div>
              </div>
            </div>
            <div style={{ fontSize: footFs, lineHeight: 1.3, overflowWrap: 'anywhere', color: p.muted }}>{foot}</div>
          </div>
        </>
      )}
    </div>
  )
}
