import { useEffect } from 'react'
import { SUPPORT_EMAIL } from '../lib/config'
import { LegalLayout } from './LegalLayout'

export function Terms() {
  useEffect(() => {
    document.title = 'Termos de Uso · LashBox'
  }, [])

  return (
    <LegalLayout>
      <h1 className="text-[32px] font-extrabold tracking-tight">Termos de Uso</h1>
      <p className="text-[14px] text-[#6B5C66]">Última atualização: 6 de novembro de 2026</p>

      <p>
        Estes termos explicam as regras de assinatura, acesso e uso do <b>LashBox - Um produto Doup - Soluções Digitais</b>.
        Ao assinar ou usar o app, você concorda com eles.
      </p>

      <h2>1. O que é o LashBox</h2>
      <p>
        O LashBox é um aplicativo digital (PWA) para lash designers, acessado pelo navegador em lashbox.app. Ele reúne artes
        prontas para Instagram e WhatsApp, vale-presente, montador de ofertas, calculadoras, mensagens prontas e um plano de
        divulgação — tudo preenchido com o nome, a foto e os preços do seu estúdio. Não é um produto físico nem um curso.
      </p>

      <h2>2. Assinatura e cobrança</h2>
      <ul>
        <li>
          O LashBox é vendido por <b>assinatura</b>, nos planos <b>mensal (R$ 19,90)</b> ou <b>anual (R$ 149,00)</b>, com{' '}
          <b>renovação automática</b> até você cancelar.
        </li>
        <li>O pagamento é feito pela Kiwify, por cartão de crédito, Pix (inclusive Pix Automático) ou boleto.</li>
        <li>
          O acesso é liberado automaticamente para o <b>e-mail usado na compra</b>. Para entrar, você recebe um link ou código
          nesse e-mail.
        </li>
        <li>O acesso é <b>pessoal e intransferível</b>. Não é permitido compartilhar a sua conta.</li>
        <li>
          Se uma cobrança de renovação falhar (cartão recusado, Pix não pago, boleto vencido), o acesso ao app fica suspenso
          até a cobrança ser regularizada, sem perder os seus dados ou o conteúdo já comprado.
        </li>
      </ul>

      <h2>3. Cancelamento</h2>
      <p>
        Você pode cancelar a assinatura <b>a qualquer momento</b>, diretamente pela Kiwify (depois da compra e em cada
        renovação, ela envia um e-mail com um botão próprio para isso, ou você acessa dashboard.kiwify.com.br com o e-mail da
        compra). Depois de cancelar, você continua com acesso até o fim do período que já pagou — não há reembolso
        proporcional pelo tempo não usado, fora do prazo de garantia abaixo.
      </p>

      <h2>4. Garantia de 7 dias</h2>
      <p>
        Você tem <b>7 dias corridos</b> a partir da primeira assinatura para pedir o reembolso <b>de 100% do valor</b>, sem
        precisar explicar o motivo, como garante o Código de Defesa do Consumidor. O pedido é feito pela Kiwify ou pelo e-mail{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Depois do reembolso, ou em caso de estorno no cartão, o acesso
        ao app é encerrado automaticamente.
      </p>

      <h2>5. Kits sazonais (compras avulsas)</h2>
      <p>
        Além da assinatura, o LashBox vende kits sazonais dentro do app (como o Kit Fim de Ano), em <b>compra avulsa</b>, sem
        mensalidade. Um kit comprado fica <b>liberado para sempre na sua conta</b>, mesmo que a assinatura seja cancelada e
        depois reativada. Kits não são reembolsáveis fora do prazo padrão de 7 dias da própria compra do kit.
      </p>

      <h2>6. Mudanças de preço</h2>
      <p>
        Podemos reajustar os preços dos planos ou dos kits a qualquer momento. Uma mudança de preço <b>nunca afeta quem já é
        assinante</b>: ela vale só para novas assinaturas feitas depois da mudança. Se um dia precisarmos reajustar o preço de
        quem já assina, avisaremos com antecedência pelo e-mail da conta.
      </p>

      <h2>7. Uso das artes e do conteúdo</h2>
      <ul>
        <li>Você pode usar as artes, mensagens e demais conteúdos gerados no app livremente, no seu próprio negócio de lash designer.</li>
        <li>
          Não é permitido <b>revender, redistribuir ou publicar os modelos</b> do LashBox (artes, mensagens, planos) como
          material próprio, curso, pacote ou produto destinado a outras lash designers.
        </li>
        <li>Também não é permitido compartilhar o seu acesso com outras pessoas, nem tentar copiar o app ou burlar o login.</li>
      </ul>
      <p>Se alguma dessas regras for descumprida, o acesso pode ser encerrado sem reembolso após o prazo de garantia.</p>

      <h2>8. Resultados</h2>
      <p>
        O LashBox entrega ferramentas práticas, mas <b>não garante um número de clientes, agendamentos ou faturamento</b>. Os
        resultados dependem de como você usa as ferramentas, da sua região, dos seus preços, da qualidade do seu trabalho e de
        outros fatores que não controlamos.
      </p>

      <h2>9. Funcionamento do app</h2>
      <p>
        Trabalhamos para manter o app no ar e funcionando bem, mas podem acontecer interrupções para manutenção ou por falhas
        de serviços de terceiros (Supabase, Vercel, Kiwify). Podemos melhorar, atualizar ou reorganizar o conteúdo ao longo do
        tempo, sem retirar o que é essencial do produto.
      </p>

      <h2>10. Propriedade intelectual</h2>
      <p>
        Os textos, artes, a marca e o design do LashBox pertencem aos seus criadores e são protegidos pela lei de direitos
        autorais. A assinatura dá a você uma licença de uso pessoal, conforme estes termos, e não transfere esses direitos.
      </p>

      <h2>11. Privacidade</h2>
      <p>
        A forma como tratamos os seus dados está descrita na <a href="/privacidade">Política de Privacidade</a>.
      </p>

      <h2>12. Mudanças nestes termos</h2>
      <p>
        Podemos atualizar estes termos. Quando a mudança for importante, avisaremos pelo e-mail da conta ou dentro do app. As
        mudanças não reduzem direitos que você já tinha na data da sua assinatura.
      </p>

      <h2>13. Lei aplicável</h2>
      <p>
        Estes termos seguem as leis brasileiras, incluindo o Código de Defesa do Consumidor. Fica eleito o foro do seu
        domicílio para resolver qualquer questão.
      </p>

      <p className="pt-2">
        Dúvidas ou suporte? <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalLayout>
  )
}
