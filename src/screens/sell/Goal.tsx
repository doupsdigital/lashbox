import { useState } from 'react'
import { BackButton } from '../../components/ui'
import { track, useDebouncedTrack } from '../../lib/analytics'
import { brl } from '../../lib/text'

type Field = 'meta' | 'serv' | 'manut'
const FIELDS: [string, Field][] = [
  ['Quanto quero faturar no mês', 'meta'],
  ['Valor médio da aplicação', 'serv'],
  ['Valor médio da manutenção', 'manut'],
]
const FREQS = [1, 1.5, 2, 2.5, 3]
const num = (v: string) => parseInt(String(v).replace(/\D/g, ''), 10) || 0

export function Goal() {
  const [meta, setMeta] = useState('6000')
  const [serv, setServ] = useState('180')
  const [manut, setManut] = useState('120')
  const [freq, setFreq] = useState(1)

  const values: Record<Field, string> = { meta, serv, manut }
  const setters: Record<Field, (v: string) => void> = { meta: setMeta, serv: setServ, manut: setManut }

  const m = num(meta)
  const sv = num(serv)
  const mt = num(manut)
  const perCli = sv + freq * mt
  const novas = perCli > 0 ? Math.ceil(m / perCli) : 0
  const manutencoes = Math.ceil(novas * freq)
  const semana = Math.ceil((novas + manutencoes) / 4.3)
  const freqTxt = String(freq).replace('.', ',')
  const explain =
    'Cada cliente rende ' + brl(sv) + ' da aplicação + ' + freqTxt + (freq === 1 ? ' manutenção' : ' manutenções') +
    ' de ' + brl(mt) + ' = ' + brl(perCli) + ' no mês. ' + brl(m) + ' ÷ ' + brl(perCli) + ' = ' + novas + ' clientes.'

  useDebouncedTrack([meta, serv, manut, freq], () => track('calculadora_usada', { tipo: 'meta' }))

  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-lilac px-5 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <BackButton fallback="/vender" />
        <div className="w-[38px]" />
      </div>

      <h1 className="text-[34px] font-bold tracking-tight">Meta do mês</h1>
      <p className="-mt-2.5 text-[15px] leading-[1.4] text-muted">Descubra quantas clientes você precisa para chegar lá.</p>

      {FIELDS.map(([label, k]) => (
        <label key={k} className="flex flex-col gap-1.5">
          <span className="text-[15px] font-semibold">{label}</span>
          <div className="flex h-[54px] items-center gap-2 rounded-[18px] bg-white px-[16px]">
            <span className="text-lg font-bold text-rose">R$</span>
            <input
              value={values[k]}
              onChange={(e) => setters[k](e.target.value.replace(/\D/g, '').slice(0, 7))}
              inputMode="numeric"
              className="min-w-0 flex-1 bg-transparent text-[20px] font-bold text-ink outline-none"
            />
          </div>
        </label>
      ))}

      <div className="flex flex-col gap-2">
        <div className="text-[15px] font-semibold">Quantas manutenções cada cliente faz por mês?</div>
        <div className="grid grid-cols-5 gap-1.5">
          {FREQS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setFreq(v)}
              className={`flex h-12 cursor-pointer items-center justify-center rounded-2xl text-lg font-bold ${freq === v ? 'bg-plum text-white' : 'bg-white text-ink'}`}
            >
              {String(v).replace('.', ',')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[26px] p-5 text-white" style={{ background: 'linear-gradient(135deg,#5B2A4E,#8A3F6F)' }}>
        <div className="text-[13px] font-semibold tracking-[.06em] opacity-85">PARA BATER {brl(m)} NO MÊS</div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-0.5 rounded-[20px] bg-white/12 p-4">
            <div className="text-[40px] font-bold leading-none">{novas}</div>
            <div className="text-[14px] font-semibold">clientes novas</div>
          </div>
          <div className="flex flex-col gap-0.5 rounded-[20px] bg-white/12 p-4">
            <div className="text-[40px] font-bold leading-none">{manutencoes}</div>
            <div className="text-[14px] font-semibold">manutenções</div>
          </div>
        </div>
        <div className="text-[15px] leading-[1.4]">
          Cerca de <b>{semana} atendimentos por semana</b>.
        </div>
        <div className="border-t border-white/15 pt-3 text-[13px] leading-normal opacity-85 text-pretty">{explain}</div>
      </div>
    </div>
  )
}
