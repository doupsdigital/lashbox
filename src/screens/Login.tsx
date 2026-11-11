import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/ui'
import { track } from '../lib/analytics'
import { PRIVACY_URL, TERMS_URL } from '../lib/config'
import { useAuth } from '../state/auth'

export function Login() {
  const { status, notice, clearNotice, requestLink, verifyCode } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(notice)
  const [busy, setBusy] = useState(false)

  // Depois de validar o código, o Supabase ainda confere a assinatura (has_access) antes do
  // status virar 'ready' — navegar só aqui evita cair no "pega-tudo" do Gate (ver App.tsx),
  // que manda pra /lp enquanto o status ainda é 'signedOut'. Não inclui 'local': essa tela só
  // aparece com status já 'local' via ?preview=entrar (devPreview, só em dev, pra print) — se
  // navegasse também nesse caso, a tela nunca daria tempo de aparecer pra tirar o print.
  useEffect(() => {
    if (status === 'ready') navigate('/inicio', { replace: true })
  }, [status, navigate])

  const sendLink = async () => {
    clearNotice()
    setError(null)
    if (!email.trim()) return
    setBusy(true)
    const r = await requestLink(email.trim().toLowerCase())
    setBusy(false)
    if (r.ok) {
      track('login_codigo_enviado')
      setStep('code')
    } else setError(r.message)
  }

  const onCode = async (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 8)
    setCode(digits)
    if (digits.length === 8) {
      setBusy(true)
      const r = await verifyCode(email.trim().toLowerCase(), digits)
      setBusy(false)
      if (r.ok) {
        track('login_concluido')
        // navegação acontece no useEffect acima, quando o status virar 'ready'
      } else setError(r.message)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-night px-6 py-10">
      <div className="flex flex-1 flex-col justify-center gap-8">
      <div className="flex flex-col items-center gap-3.5">
        <Logo size={56} light />
      </div>

      {step === 'email' ? (
        <div className="flex flex-col gap-3.5">
          <h1 className="text-[28px] font-bold tracking-tight text-white">Entrar</h1>
          <p className="text-[15px] leading-[1.4] text-white/70">Digite o e-mail da sua assinatura e enviaremos um código de acesso.</p>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            type="email"
            autoComplete="email"
            className="h-[54px] rounded-[16px] border border-white/[0.15] bg-white/[0.08] px-[18px] text-[17px] text-white outline-none placeholder:text-white/40 focus:border-[#E07A9B]"
          />
          {error && <div className="rounded-xl border border-[#D1344C]/30 bg-[#D1344C]/15 px-3.5 py-2.5 text-sm text-[#FF93A8]">{error}</div>}
          <button
            type="button"
            disabled={busy}
            onClick={sendLink}
            className="press flex h-[54px] cursor-pointer items-center justify-center rounded-full bg-[#E07A9B] text-[17px] font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Enviando…' : 'Receber código'}
          </button>
          <div className="text-center text-sm text-white/50">Use o mesmo e-mail da sua assinatura.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          <h1 className="text-[28px] font-bold tracking-tight text-white">Digite o código</h1>
          <p className="text-[15px] leading-[1.4] text-white/70">
            Enviamos 8 dígitos para <b className="text-white">{email}</b>.
          </p>
          <div className="relative h-[58px] my-1.5">
            <div className="absolute inset-0 flex gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-1 items-center justify-center rounded-xl border-[1.5px] bg-white/[0.08] text-2xl font-semibold text-white"
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
          {error && <div className="rounded-xl border border-[#D1344C]/30 bg-[#D1344C]/15 px-3.5 py-2.5 text-sm text-[#FF93A8]">{error}</div>}
          <button
            type="button"
            disabled={busy}
            onClick={sendLink}
            className="text-center text-sm font-semibold text-[#E07A9B] underline disabled:opacity-60"
          >
            Reenviar código
          </button>
          <div className="text-center text-sm text-white/50">Use o mesmo e-mail da sua assinatura.</div>
        </div>
      )}
      </div>
      <div className="flex justify-center gap-4 pt-6 text-[12.5px] font-semibold text-white/50">
        <a href={TERMS_URL}>Termos de uso</a>
        <a href={PRIVACY_URL}>Privacidade</a>
      </div>
    </div>
  )
}
