import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/ui'
import { useAuth } from '../state/auth'

export function Login() {
  const { notice, clearNotice, requestLink, verifyCode } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(notice)
  const [busy, setBusy] = useState(false)

  const sendLink = async () => {
    clearNotice()
    setError(null)
    if (!email.trim()) return
    setBusy(true)
    const r = await requestLink(email.trim().toLowerCase())
    setBusy(false)
    if (r.ok) setStep('code')
    else setError(r.message)
  }

  const onCode = async (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 8)
    setCode(digits)
    if (digits.length === 8) {
      setBusy(true)
      const r = await verifyCode(email.trim().toLowerCase(), digits)
      setBusy(false)
      if (r.ok) navigate('/inicio', { replace: true })
      else setError(r.message)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto px-6 py-10">
      <div className="flex flex-1 flex-col justify-center gap-8">
      <div className="flex flex-col items-center gap-3.5">
        <Logo size={56} />
      </div>

      {step === 'email' ? (
        <div className="flex flex-col gap-3.5">
          <h1 className="text-[28px] font-bold tracking-tight">Entrar</h1>
          <p className="text-[15px] leading-[1.4] text-muted">Digite o e-mail da sua assinatura e enviaremos um código de acesso.</p>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            type="email"
            autoComplete="email"
            className="h-[54px] rounded-[16px] border border-line bg-lilac px-[18px] text-[17px] text-ink outline-none focus:border-rose"
          />
          {error && <div className="rounded-xl bg-blush px-3.5 py-2.5 text-sm text-plum">{error}</div>}
          <button
            type="button"
            disabled={busy}
            onClick={sendLink}
            className="press flex h-[54px] cursor-pointer items-center justify-center rounded-full bg-plum text-[17px] font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Enviando…' : 'Receber código'}
          </button>
          <div className="text-center text-sm text-muted">Use o mesmo e-mail da sua assinatura.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          <h1 className="text-[28px] font-bold tracking-tight">Digite o código</h1>
          <p className="text-[15px] leading-[1.4] text-muted">
            Enviamos 8 dígitos para <b className="text-ink">{email}</b>.
          </p>
          <div className="relative h-[58px] my-1.5">
            <div className="absolute inset-0 flex gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-1 items-center justify-center rounded-xl border-[1.5px] bg-lilac text-2xl font-semibold text-plum"
                  style={{ borderColor: i === code.length ? '#E07A9B' : 'transparent' }}
                >
                  {code[i] ?? ''}
                </div>
              ))}
            </div>
            <input
              value={code}
              onChange={(e) => onCode(e.target.value)}
              maxLength={8}
              inputMode="numeric"
              autoFocus
              className="absolute inset-0 w-full cursor-text opacity-0"
            />
          </div>
          {error && <div className="rounded-xl bg-blush px-3.5 py-2.5 text-sm text-plum">{error}</div>}
          <button
            type="button"
            disabled={busy}
            onClick={sendLink}
            className="text-center text-sm font-semibold text-rose underline disabled:opacity-60"
          >
            Reenviar código
          </button>
          <div className="text-center text-sm text-muted">Use o mesmo e-mail da sua assinatura.</div>
        </div>
      )}
      </div>
    </div>
  )
}
