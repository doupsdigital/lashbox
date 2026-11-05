import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { copyText, fillName } from '../lib/text'
import { applyStudioTokens } from '../lib/studioTokens'
import { useStudio } from '../state/studio'

/** Resolve os marcadores do Meu Estúdio e preenche [nome]; o que sobrar fica para o MessageText destacar. */
export function useMessageResolver() {
  const { studio } = useStudio()
  return useCallback((text: string, name = '') => fillName(applyStudioTokens(text, studio), name), [studio])
}

/**
 * Texto da mensagem com os dados do Meu Estúdio e o [nome] preenchidos; os outros marcadores
 * ([valor], [dia]...) ficam destacados em amarelo.
 */
export function MessageText({ text, name, className = '' }: { text: string; name: string; className?: string }) {
  const { studio } = useStudio()
  const n = name.trim()
  const parts = applyStudioTokens(text, studio).split(/(\[[^\]\n]+\])/g)
  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {parts.map((p, i) => {
        if (!/^\[[^\]\n]+\]$/.test(p)) return <Fragment key={i}>{p}</Fragment>
        if (p === '[nome]' && n) return <Fragment key={i}>{n}</Fragment>
        return (
          <mark key={i} title="Troque antes de enviar" className="rounded-md bg-warn-bg px-0.5 font-semibold text-warn-ink [box-decoration-break:clone]">
            {p}
          </mark>
        )
      })}
    </div>
  )
}

/** Botão Copiar → "Copiado! ✓" por 1,8s. */
export function CopyButton({ text, label = 'Copiar', size = 'md' }: { text: string; label?: string; size?: 'md' | 'sm' }) {
  const [copied, setCopied] = useState(false)
  const t = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(t.current), [])
  const h = size === 'md' ? 'h-[46px] text-[15px]' : 'h-10 text-sm'
  const onCopy = async () => {
    await copyText(text)
    setCopied(true)
    window.clearTimeout(t.current)
    t.current = window.setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-live="polite"
      className={`press flex w-fit cursor-pointer items-center gap-1.5 rounded-full px-5 font-semibold transition-colors ${h} ${
        copied ? 'bg-green text-white' : 'bg-plum text-white'
      }`}
    >
      {copied ? 'Copiado! ✓' : label}
    </button>
  )
}
