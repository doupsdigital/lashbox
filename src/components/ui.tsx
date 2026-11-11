import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }

/** Botão principal ameixa, 54px, pílula. */
export function PrimaryButton({ className = '', disabled, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`press flex h-[54px] w-full shrink-0 cursor-pointer items-center justify-center rounded-full text-[17px] font-semibold transition-colors ${
        disabled ? 'cursor-default bg-lock text-muted' : 'bg-plum text-white'
      } ${className}`}
      {...rest}
    />
  )
}

/** Botão secundário blush. */
export function SoftButton({ className = '', ...rest }: BtnProps) {
  return (
    <button
      type="button"
      className={`press flex h-[54px] w-full shrink-0 cursor-pointer items-center justify-center rounded-full bg-blush text-[17px] font-semibold text-plum ${className}`}
      {...rest}
    />
  )
}

export function TextButton({ className = '', ...rest }: BtnProps) {
  return (
    <button
      type="button"
      className={`flex h-12 w-full cursor-pointer items-center justify-center font-semibold text-muted ${className}`}
      {...rest}
    />
  )
}

/** Botão redondo de voltar, estilo "vidro" sobre o topo da tela. */
export function BackButton({ fallback = '/inicio', onClick }: { fallback?: string; onClick?: () => void }) {
  const navigate = useNavigate()
  const go = () => {
    if (onClick) return onClick()
    if (window.history.state && window.history.state.idx > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }
  return (
    <button
      type="button"
      aria-label="Voltar"
      onClick={go}
      className="flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 6l-6 6 6 6" />
      </svg>
    </button>
  )
}

/**
 * Logo (ícone + nome), usado no login e no "splash" de carregamento (`App.tsx`).
 * `light`: texto branco, pra usar sobre fundo escuro (ex.: telas já migradas pro reskin
 * ameixa) — sem isso, continua o texto escuro de sempre (o splash ainda é sobre `bg-white`).
 */
export function Logo({ size = 30, light }: { size?: number; light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <img src="/icone-64.webp" alt="LashBox" width={size} height={size} style={{ width: size, height: size }} className="rounded-[22%]" />
      <div className={`text-[19px] font-bold ${light ? 'text-white' : ''}`}>LashBox</div>
    </div>
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`text-[13px] font-semibold tracking-[.06em] text-gold-ink uppercase ${className}`}>{children}</div>
}
