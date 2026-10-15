import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

import img01Home from "@/assets/manual-originacao/01-home.jpg";
import img02ListaSimulacoes from "@/assets/manual-originacao/02-lista-simulacoes.jpg";
import img03AcoesSimulacao from "@/assets/manual-originacao/03-acoes-simulacao.png";
import img04SimulacaoCpf from "@/assets/manual-originacao/04-simulacao-cpf.png";
import img05SimulacaoProdutoValor from "@/assets/manual-originacao/05-simulacao-produto-valor.png";
import img06SimulacaoVencimento from "@/assets/manual-originacao/06-simulacao-vencimento.png";
import img07SimulacaoResultado from "@/assets/manual-originacao/07-simulacao-resultado.png";
import img08bPropostaAprovada from "@/assets/manual-originacao/08b-proposta-aprovada.png";
import img09CardsProposta from "@/assets/manual-originacao/09-cards-proposta.png";
import img10Cadastro from "@/assets/manual-originacao/10-cadastro.jpg";
import img11Renovacao from "@/assets/manual-originacao/11-renovacao.png";
import img12Endereco from "@/assets/manual-originacao/12-endereco.jpg";
import img13Avalista from "@/assets/manual-originacao/13-avalista.jpg";
import img14Renda from "@/assets/manual-originacao/14-renda.jpg";
import img15Financeiro from "@/assets/manual-originacao/15-financeiro.jpg";
import img15bDespesa from "@/assets/manual-originacao/15b-despesa.jpg";
import img16Documentacao from "@/assets/manual-originacao/16-documentacao.jpg";
import img17ComprovanteRenda from "@/assets/manual-originacao/17-comprovante-renda.jpg";
import img18Parecer from "@/assets/manual-originacao/18-parecer.jpg";
import img19AguardandoCliente from "@/assets/manual-originacao/19-aguardando-cliente.png";
import imgB1RevisaoCliente from "@/assets/manual-originacao/b1-revisao-cliente.png";
import imgB2Aprovada from "@/assets/manual-originacao/b2-aprovada.png";
import imgB3PendenteAnalise from "@/assets/manual-originacao/b3-pendente-analise.png";
import imgC01BoasVindas from "@/assets/manual-originacao/c01-boas-vindas.jpg";
import imgC02PrimeiroAcesso from "@/assets/manual-originacao/c02-primeiro-acesso.png";
import imgC03JaTemSenha from "@/assets/manual-originacao/c03-ja-tem-senha.png";
import imgC04Login from "@/assets/manual-originacao/c04-login.jpg";
import imgC05CodigoSms from "@/assets/manual-originacao/c05-codigo-sms.jpg";
import imgC06ValidarDados from "@/assets/manual-originacao/c06-validar-dados.png";
import imgC07CriarSenha from "@/assets/manual-originacao/c07-criar-senha.jpg";
import imgC08ReviseProposta from "@/assets/manual-originacao/c08-revise-proposta.jpg";
import imgC09Termos from "@/assets/manual-originacao/c09-termos.jpg";
import imgC10SeguroDetalhe from "@/assets/manual-originacao/c10-seguro-detalhe.jpg";
import imgC11SeguroManter from "@/assets/manual-originacao/c11-seguro-manter.jpg";
import imgC13SeguirSemSeguro from "@/assets/manual-originacao/c13-seguir-sem-seguro.jpg";
import imgC14SemSeguro from "@/assets/manual-originacao/c14-sem-seguro.jpg";
import imgC15AdicionarSeguro from "@/assets/manual-originacao/c15-adicionar-seguro.jpg";
import imgC16EmAnalise from "@/assets/manual-originacao/c16-em-analise.jpg";
import imgC17ContratoSendoCriado from "@/assets/manual-originacao/c17-contrato-sendo-criado.png";

/*
 * Cópia do manual publicado em souaurea.com/manual-originacao (aurea-website).
 * Mantido quase verbatim para facilitar a sincronização; as animações do site
 * (StaggerGroup/StaggerItem) viram contêineres simples aqui.
 */
function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

const NAV_SECTIONS = [
  { id: "visao-geral", label: "Visão geral" },
  { id: "originacao", label: "1 · Acessar" },
  { id: "simulacao", label: "2 · Simular" },
  { id: "proposta", label: "3 · Proposta" },
  { id: "cliente", label: "4 · Cliente" },
  { id: "acompanhar", label: "5 · Acompanhar" },
  { id: "duvidas", label: "Dúvidas" },
];

function SectionWrap({
  id,
  tag,
  title,
  subtitle,
  whoTag,
  children,
}: {
  id: string;
  tag: string;
  title: string;
  subtitle?: ReactNode;
  whoTag?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="w-full scroll-mt-[70px]">
      <StaggerGroup className="flex w-full flex-col items-start gap-6">
        <StaggerItem className="w-full">
          <div className="flex w-full flex-col items-start gap-2">
            <p className="text-p-sm font-semibold uppercase tracking-widest text-brand-yellow">
              {tag}
            </p>
            <h2 className="font-fraunces text-h3 text-brand-navy">{title}</h2>
            {subtitle && <p className="text-p-lg text-slate-600">{subtitle}</p>}
            {whoTag && (
              <span className="mt-1 inline-block rounded-full border border-slate-200 bg-brand-navy/5 px-3 py-1 text-p-sm font-semibold text-brand-navy/80">
                {whoTag}
              </span>
            )}
          </div>
        </StaggerItem>
        <StaggerItem className="w-full">
          <div className="flex w-full flex-col items-start gap-4">
            {children}
          </div>
        </StaggerItem>
      </StaggerGroup>
    </section>
  );
}

function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white p-5 lg:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

function RuleCallout({
  variant = "info",
  children,
}: {
  variant?: "info" | "warn" | "tip";
  children: ReactNode;
}) {
  const icon = variant === "warn" ? "⚠️" : variant === "tip" ? "✅" : "💡";
  const styles =
    variant === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : variant === "tip"
        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : "border-slate-200 bg-brand-navy/5 text-brand-navy/80";
  return (
    <div
      className={cn(
        "flex w-full items-start gap-2.5 rounded-xl border p-4 text-p-sm",
        styles,
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function Say({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-r-xl border-l-4 border-brand-yellow bg-[#fffbe8] px-4 py-3 text-p-md italic text-brand-navy">
      {children}
    </div>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-p-md">
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-brand-navy"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SimpleList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex w-full list-disc flex-col gap-1.5 pl-5 text-p-md text-slate-700">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function CheckList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex w-full flex-col gap-2.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2.5 text-p-md text-slate-700"
        >
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function OverviewStep({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4">
      <h4 className="flex items-center gap-2.5 font-bold text-brand-navy">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-yellow font-fraunces text-p-sm font-extrabold text-brand-navy">
          {n}
        </span>
        {title}
      </h4>
      <p className="text-p-sm text-slate-600">{children}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow font-fraunces text-h6 font-extrabold text-brand-navy">
          {number}
        </span>
        <h3 className="font-fraunces text-h5 text-brand-navy">{title}</h3>
      </div>
      <div className="flex flex-col gap-3.5 text-p-md text-slate-700">
        {children}
      </div>
    </div>
  );
}

function PhoneShot({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <img
          src={src}
          alt={alt}
          className="block h-auto w-full"
          loading="lazy"
        />
      </div>
      {caption && (
        <p className="text-center text-p-sm text-slate-500">{caption}</p>
      )}
    </div>
  );
}

function PhoneShotRow({
  cols = 2,
  children,
}: {
  cols?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-4",
        cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}

function StatusBadge({
  variant,
  children,
}: {
  variant: "hold" | "ok" | "bad" | "neutral" | "gold";
  children: ReactNode;
}) {
  const map = {
    hold: "bg-amber-50 text-amber-800 border-amber-200",
    ok: "bg-emerald-50 text-emerald-800 border-emerald-200",
    bad: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-brand-navy/5 text-brand-navy border-slate-200",
    gold: "bg-brand-yellow/30 text-brand-navy border-brand-yellow",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-p-sm font-bold",
        map[variant],
      )}
    >
      {children}
    </span>
  );
}

function FaqItem({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="group w-full overflow-hidden rounded-2xl border border-slate-200 bg-white [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 font-semibold text-brand-navy">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-yellow font-fraunces text-p-sm font-extrabold text-brand-navy">
          ?
        </span>
        {q}
      </summary>
      <div className="px-5 pb-5 pl-[50px] text-p-md text-slate-600">
        {children}
      </div>
    </details>
  );
}

export function ManualOriginacaoPage() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Manual de Originação · Portal do Parceiro";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <>
      <main className="flex w-full flex-col items-center">
        <section className="flex w-full flex-col items-center bg-brand-navy px-5 pb-20 pt-6 text-center lg:px-10 lg:pb-28">
          <div className="mb-12 flex w-full max-w-[900px] justify-start">
            <a
              href="/originacao"
              className="text-p-md font-semibold text-brand-yellow hover:underline"
            >
              ← Voltar ao Portal
            </a>
          </div>
          <StaggerGroup className="flex w-full max-w-[760px] flex-col items-center gap-4">
            <StaggerItem>
              <p className="text-p-lg font-semibold text-brand-yellow">
                GUIA DE USO
              </p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="font-fraunces text-h2 text-white">
                Manual de Originação
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="text-p-lg italic text-brand-yellow">
                Simular, criar a proposta e ajudar o cliente a concluir — tudo
                pelo celular.
              </p>
            </StaggerItem>
            <StaggerItem>
              <p className="text-p-lg text-slate-300">
                Este guia mostra, tela por tela, o caminho completo: você simula
                e preenche a proposta no Portal do Parceiro, e o cliente
                confirma tudo no Portal do Cliente. Na Parte 4 está o roteiro
                para você explicar ao cliente o que ele vai ver.
              </p>
            </StaggerItem>
            <StaggerItem>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-white/10 px-4 py-2 text-p-sm text-brand-yellow">
                💡 A proposta fica salva como rascunho a cada passo. Dá pra
                parar e continuar depois.
              </span>
            </StaggerItem>
          </StaggerGroup>
        </section>

        <div className="sticky top-0 z-40 flex w-full justify-center overflow-x-auto border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur lg:px-10">
          <nav className="flex w-full max-w-[900px] flex-nowrap gap-2">
            {NAV_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-3.5 py-1.5 text-p-sm font-semibold text-brand-navy transition-colors duration-150 hover:bg-brand-yellow/40"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex w-full justify-center px-5 py-14 lg:px-10">
          <div className="flex w-full max-w-[900px] flex-col items-start gap-16">
            {/* VISÃO GERAL */}
            <SectionWrap
              id="visao-geral"
              tag="Antes de começar"
              title="O caminho em 3 etapas"
            >
              <div className="grid w-full grid-cols-1 gap-3.5 lg:grid-cols-3">
                <OverviewStep n={1} title="Simular">
                  Você informa o CPF, o valor, as parcelas e o vencimento. O
                  portal mostra a parcela com e sem seguro.
                </OverviewStep>
                <OverviewStep n={2} title="Preencher a proposta">
                  São 7 passos: Cadastro, Endereço, Avalista, Atividade e Renda,
                  Financeiro, Documentação e Parecer.
                </OverviewStep>
                <OverviewStep n={3} title="Cliente confirma">
                  Você envia o link pelo WhatsApp. O cliente entra no Portal do
                  Cliente, revisa, decide sobre o seguro e confirma.
                </OverviewStep>
              </div>
              <Card>
                <CheckList
                  items={[
                    <>
                      Tenha em mãos os <strong>documentos do cliente</strong>:
                      identificação (RG ou CNH), comprovante de residência e,
                      para propostas acima de R$ 2.000,00, comprovante de renda.
                    </>,
                    <>
                      Confira o <strong>celular do cliente</strong>. É por ele
                      que o cliente recebe o link pelo WhatsApp e o código por
                      SMS.
                    </>,
                    <>
                      Use um <strong>e-mail real</strong> do cliente. O portal
                      verifica se o e-mail existe.
                    </>,
                    <>
                      Tenha também os <strong>dados do avalista</strong>: CPF,
                      nome, nascimento, e-mail, celular e endereço.
                    </>,
                  ]}
                />
              </Card>
            </SectionWrap>

            {/* PARTE 1 */}
            <SectionWrap
              id="originacao"
              tag="Parte 1"
              title="Acessar a Originação"
              subtitle={
                <>
                  Tudo acontece no menu <strong>Originação</strong>, na barra de
                  baixo do Portal do Parceiro.
                </>
              }
              whoTag="Portal do Parceiro"
            >
              <StepCard number={1} title="Abra o menu Originação">
                <p>
                  Na barra de baixo ficam{" "}
                  <strong>Home, Carteira, Originação e Perfil</strong>. Toque em{" "}
                  <strong>Originação</strong>.
                </p>
                <PhoneShotRow>
                  <PhoneShot
                    src={img01Home}
                    alt="Home do Portal do Parceiro com a barra de menu"
                    caption="Home: o menu Originação fica na barra de baixo"
                  />
                  <PhoneShot
                    src={img02ListaSimulacoes}
                    alt="Aba Simulação com a lista de simulações"
                    caption="Originação abre na aba Simulação"
                  />
                </PhoneShotRow>
              </StepCard>

              <StepCard number={2} title="Conheça as duas abas">
                <SimpleList
                  items={[
                    <>
                      <strong>Simulação:</strong> lista as simulações que você
                      já fez. Dá pra buscar por <strong>nome ou CPF</strong> e
                      filtrar por <strong>Criada</strong> (ainda só simulação)
                      ou <strong>Proposta Iniciada</strong>.
                    </>,
                    <>
                      <strong>Proposta:</strong> lista os rascunhos, as
                      propostas aguardando o cliente e as já enviadas para
                      análise, com filtro por <strong>Status</strong>.
                    </>,
                  ]}
                />
                <p>
                  Uma simulação que ainda não virou proposta tem dois botões:{" "}
                  <strong>Editar</strong>, para mudar valor, parcelas ou
                  vencimento, e <strong>Iniciar proposta</strong>, para seguir
                  direto para o preenchimento. Assim, se o cliente pediu um
                  tempo pra pensar, você retoma de onde parou.
                </p>
                <PhoneShot
                  src={img03AcoesSimulacao}
                  alt="Cards de simulação com os botões Editar e Iniciar proposta"
                />
              </StepCard>

              <RuleCallout variant="warn">
                <strong>
                  Botões de simular ou iniciar proposta bloqueados?
                </strong>{" "}
                Quando você tem ações de cobrança pendentes na sua fila, o
                portal mostra uma faixa vermelha: &quot;Você possui ações de
                cobrança pendentes que impedem a simulação de proposta&quot; ou
                &quot;… que impedem iniciar uma proposta&quot;. Conclua ou
                reagende as ações pendentes na Home para liberar.
              </RuleCallout>
            </SectionWrap>

            {/* PARTE 2 */}
            <SectionWrap
              id="simulacao"
              tag="Parte 2"
              title="Fazer a simulação"
              subtitle={
                <>
                  Na aba Simulação, toque em <strong>+ Nova simulação</strong>.
                  Todos os campos com * são obrigatórios.
                </>
              }
              whoTag="Portal do Parceiro"
            >
              <StepCard number={3} title="Comece pelo CPF">
                <p>
                  O CPF é o primeiro campo. Se o cliente já tem cadastro na
                  Aurea, o portal mostra{" "}
                  <strong>
                    &quot;Cadastro encontrado e preenchido automaticamente&quot;
                  </strong>{" "}
                  e completa nome, data de nascimento, e-mail e celular. Se for
                  um cliente novo, preencha esses campos.
                </p>
                <PhoneShot
                  src={img04SimulacaoCpf}
                  alt="CPF com cadastro encontrado e dados preenchidos"
                />
                <RuleCallout>
                  Mesmo com o preenchimento automático,{" "}
                  <strong>confira o celular e o e-mail com o cliente</strong>.
                  São eles que recebem o link e o código de acesso.
                </RuleCallout>
              </StepCard>

              <StepCard number={4} title="Produto, valor e parcelas">
                <SimpleList
                  items={[
                    <>
                      <strong>Produto:</strong> o portal já sugere um. Toque em{" "}
                      <strong>Trocar</strong> se precisar de outro.
                      &quot;Mostrar taxa&quot; exibe a taxa do produto.
                    </>,
                    <>
                      <strong>Quanto o cliente precisa?:</strong> de R$ 500,00 a
                      R$ 30.000,00, em múltiplos de R$ 100,00.
                    </>,
                    <>
                      <strong>Em quantas parcelas?:</strong> toque no número de
                      parcelas.
                    </>,
                  ]}
                />
                <PhoneShot
                  src={img05SimulacaoProdutoValor}
                  alt="Produto sugerido, valor e parcelas"
                />
              </StepCard>

              <StepCard number={5} title="Escolha o melhor dia de vencimento">
                <p>
                  Toque em <strong>Selecionar data</strong>. O vencimento é
                  sempre no dia <strong>5, 10, 15 ou 20</strong>, dentro de até
                  45 dias a partir de hoje. Os outros dias ficam bloqueados no
                  calendário. Escolha e toque em <strong>Confirmar</strong>.
                </p>
                <PhoneShot
                  src={img06SimulacaoVencimento}
                  alt="Calendário de vencimento com os dias permitidos"
                />
              </StepCard>

              <StepCard
                number={6}
                title="Toque em Simular e apresente o resultado"
              >
                <p>
                  O resultado aparece na hora, em{" "}
                  <strong>&quot;Simulação concluída&quot;</strong>: o valor
                  solicitado e a parcela <strong>com seguro</strong>, com a
                  parcela <strong>sem seguro</strong> logo abaixo. A simulação
                  já fica salva na sua lista.
                </p>
                <PhoneShot
                  src={img07SimulacaoResultado}
                  alt="Simulação concluída com a parcela com e sem seguro"
                />
                <Say>
                  &quot;O seguro prestamista já vem incluído. Ele protege você e
                  sua família: se acontecer um imprevisto, tipo desemprego ou
                  invalidez, a dívida não fica pra trás.&quot;
                </Say>
                <RuleCallout>
                  <strong>Valores de teste.</strong> O seguro prestamista custa{" "}
                  <strong>3% do valor solicitado</strong> e é financiado junto
                  com o crédito, com os mesmos juros. Exemplo (R$ 5.000,00 em
                  10x): seguro de R$ 150,00, parcela de R$ 670,65 sem seguro e
                  R$ 690,77 com seguro.
                </RuleCallout>
                <p>
                  Se a parcela não couber no bolso do cliente, toque em{" "}
                  <strong>Simular novamente</strong> e ajuste o valor, as
                  parcelas ou o vencimento quantas vezes precisar.
                </p>
              </StepCard>

              <StepCard
                number={7}
                title="Cliente topou? Toque em Iniciar proposta"
              >
                <p>
                  O portal leva CPF, nome, valor, parcelas e produto para a
                  proposta. Você não precisa digitar nada disso de novo.
                </p>
              </StepCard>
            </SectionWrap>

            {/* PARTE 3 */}
            <SectionWrap
              id="proposta"
              tag="Parte 3"
              title="Preencher a proposta em 7 passos"
              subtitle={
                <>
                  O topo da tela mostra o passo atual (por exemplo,
                  &quot;Cadastro · 1/7&quot;), o valor, as parcelas e o produto.
                  Cada <strong>Avançar</strong> salva o passo. Se precisar
                  parar, toque na seta ← do topo: o rascunho fica salvo e
                  aparece na aba Proposta com{" "}
                  <strong>Continuar preenchimento</strong>.
                </>
              }
              whoTag="Portal do Parceiro"
            >
              <StepCard number={8} title="Passo 1 · Cadastro">
                <p>
                  A primeira pergunta é{" "}
                  <strong>&quot;É uma renovação de contrato?&quot;</strong>.
                </p>
                <SimpleList
                  items={[
                    <>
                      <strong>Não:</strong> preencha gênero, RG, composição
                      familiar (estado civil, filhos menores de 18, pessoas na
                      casa), situação e tempo de residência, se possui veículo e
                      a finalidade do crédito. Se o cliente for casado(a) ou em
                      união estável, o portal pede o CPF do cônjuge.
                    </>,
                    <>
                      <strong>Sim:</strong> o portal pergunta &quot;Continuar
                      com a renovação?&quot; e, ao confirmar,{" "}
                      <strong>
                        copia os dados de Cadastro, Endereço e Atividade e Renda
                        da última proposta desembolsada ou quitada
                      </strong>{" "}
                      desse cliente. Os valores da nova simulação são mantidos.
                      Confira cada passo antes de avançar.
                    </>,
                  ]}
                />
                <PhoneShotRow>
                  <PhoneShot
                    src={img10Cadastro}
                    alt="Passo Cadastro"
                    caption="Cadastro · 1/7"
                  />
                  <PhoneShot
                    src={img11Renovacao}
                    alt="Janela Continuar com a renovação"
                    caption="Ao marcar Sim em renovação"
                  />
                </PhoneShotRow>
                <RuleCallout>
                  Se o e-mail não passar na verificação, aparece &quot;E-mail
                  pode não ser entregável&quot;. Corrija ou, se tiver certeza,
                  toque em &quot;Continuar assim mesmo&quot;.
                </RuleCallout>
              </StepCard>

              <StepCard number={9} title="Passo 2 · Endereço">
                <p>Duas formas de preencher sem digitar tudo:</p>
                <SimpleList
                  items={[
                    <>
                      <strong>Recuperar via geolocalização:</strong> usa a
                      localização do celular. O navegador pede permissão.
                    </>,
                    <>
                      <strong>CEP:</strong> digite o CEP e o portal completa
                      rua, bairro, cidade e estado.
                    </>,
                  ]}
                />
                <p>
                  Depois informe o <strong>Número</strong> e o{" "}
                  <strong>Ponto de referência</strong> (obrigatório). Todos os
                  campos podem ser corrigidos à mão.
                </p>
                <PhoneShot
                  src={img12Endereco}
                  alt="Passo Endereço com o CEP preenchido automaticamente"
                />
                <RuleCallout variant="warn">
                  <strong>
                    A geolocalização nem sempre acerta o endereço exato.
                  </strong>{" "}
                  Confira com o cliente e corrija o que for preciso antes de
                  avançar.
                </RuleCallout>
              </StepCard>

              <StepCard number={10} title="Passo 3 · Avalista">
                <p>
                  Comece pelo <strong>CPF do avalista</strong>: se ele já tiver
                  cadastro, os dados vêm preenchidos. Informe nome, nascimento,
                  e-mail, telefone, endereço (também com CEP ou geolocalização)
                  e o <strong>grau de parentesco</strong> com o cliente. O
                  avalista não pode ser o próprio cliente.
                </p>
                <PhoneShot src={img13Avalista} alt="Passo Avalista" />
              </StepCard>

              <StepCard number={11} title="Passo 4 · Atividade e Renda">
                <SimpleList
                  items={[
                    <>
                      <strong>Renda principal:</strong> tipo de renda, atividade
                      econômica, ramo e subcategoria (ou profissão, para CLT,
                      servidor e aposentado), tempo na atividade e renda mensal.
                    </>,
                    <>
                      <strong>Outras rendas:</strong> toque em{" "}
                      <strong>+ Adicionar outra renda</strong> só se houver
                      outra fonte. Aqui existe a opção{" "}
                      <strong>Renda Familiar</strong>, que pede o grau de
                      parentesco.
                    </>,
                  ]}
                />
                <p>
                  No fim, o portal mostra a{" "}
                  <strong>Renda total declarada</strong>.
                </p>
                <PhoneShot src={img14Renda} alt="Passo Atividade e Renda" />
              </StepCard>

              <StepCard number={12} title="Passo 5 · Financeiro">
                <SimpleList
                  items={[
                    <>
                      <strong>Chave Pix</strong> (obrigatória): tipo CPF,
                      Celular, Email ou Chave Aleatória. É para ela que o
                      dinheiro vai.
                    </>,
                    <>
                      <strong>Despesas pessoais</strong> e{" "}
                      <strong>Empréstimos</strong> (opcionais): adicione as
                      despesas fixas e os empréstimos em aberto, com credor,
                      valor da parcela e frequência.
                    </>,
                  ]}
                />
                <PhoneShotRow>
                  <PhoneShot
                    src={img15bDespesa}
                    alt="Passo Financeiro com uma despesa sendo adicionada"
                    caption="+ Adicionar despesa: categoria, valor e descrição"
                  />
                  <PhoneShot
                    src={img15Financeiro}
                    alt="Passo Financeiro com um empréstimo sendo adicionado"
                    caption="+ Adicionar empréstimo: credor, valor da parcela, frequência e categoria"
                  />
                </PhoneShotRow>
                <RuleCallout variant="warn">
                  Se a soma das rendas, menos despesas e empréstimos, ficar
                  menor que a parcela, o portal não deixa avançar e avisa:
                  &quot;A parcela de R$ X excede o montante disponível…&quot;.
                  Ajuste os dados ou volte à simulação.
                </RuleCallout>
              </StepCard>

              <StepCard number={13} title="Passo 6 · Documentação">
                <DataTable
                  head={["Campo", "O que anexar", "Obrigatório?"]}
                  rows={[
                    [
                      "Documentos de Identificação",
                      "RG ou CNH, frente e verso. PDF, JPEG ou PNG.",
                      "Sim",
                    ],
                    [
                      "Comprovante de Residência",
                      "Conta de luz, água, telefone ou internet de até 90 dias. PDF, JPEG ou PNG.",
                      "Sim",
                    ],
                    [
                      "Fotos da Atividade",
                      "Fachada, local de trabalho ou estoque. JPEG ou PNG.",
                      "Opcional",
                    ],
                    [
                      "Comprovantes de Renda",
                      "Escolha o tipo (Extrato bancário, Holerite, Benefício INSS ou MEI / DAS) e depois anexe. Holerite aceita PDF, JPEG ou PNG; os demais, só PDF. Máx. 10 MB.",
                      "Acima de R$ 2.000,00",
                    ],
                  ]}
                />
                <PhoneShotRow>
                  <PhoneShot
                    src={img16Documentacao}
                    alt="Passo Documentação antes dos anexos"
                    caption="Antes de anexar"
                  />
                  <PhoneShot
                    src={img17ComprovanteRenda}
                    alt="Comprovantes de renda com o tipo escolhido e o arquivo anexado"
                    caption="Tipo do comprovante escolhido e arquivo anexado"
                  />
                </PhoneShotRow>
                <RuleCallout variant="warn">
                  <strong>
                    Foto de produto, loja ou estoque não é comprovante de renda.
                  </strong>{" "}
                  Propostas com documento errado ou foto ruim voltam para
                  correção e atrasam o crédito do cliente. Fotografe o documento
                  inteiro, em cima de uma mesa, num lugar claro e sem flash, e
                  confira se dá pra ler antes de enviar.
                </RuleCallout>
              </StepCard>

              <StepCard number={14} title="Passo 7 · Parecer do Parceiro">
                <p>
                  Conte para a mesa de crédito o que você sabe do cliente: tempo
                  de relacionamento, como conhece o cliente, se há{" "}
                  <strong>sinais de endividamento informal</strong> (agiota,
                  fiado, empréstimo com parentes) ou de{" "}
                  <strong>urgência financeira</strong>, e escreva o{" "}
                  <strong>Parecer</strong>.
                </p>
                <PhoneShot
                  src={img18Parecer}
                  alt="Passo Parecer do Parceiro preenchido"
                />
              </StepCard>

              <StepCard
                number={15}
                title="Concluir e enviar o link para o cliente"
              >
                <p>
                  Toque em <strong>Concluir proposta</strong>. A proposta vai
                  para{" "}
                  <StatusBadge variant="hold">Revisão do cliente</StatusBadge> e
                  o portal mostra{" "}
                  <strong>&quot;Aguardando o cliente&quot;</strong>.
                </p>
                <p>
                  Toque em <strong>Enviar link pelo WhatsApp</strong>. O
                  WhatsApp abre com a mensagem pronta para o celular do cliente:
                </p>
                <Say>
                  &quot;Olá, [nome]! Sua proposta na Aurea foi criada. Acesse o
                  Portal do Cliente para revisar os dados, dar os consentimentos
                  e concluir a aprovação: [link]&quot;
                </Say>
                <PhoneShot
                  src={img19AguardandoCliente}
                  alt="Tela Aguardando o cliente com o botão Enviar link pelo WhatsApp"
                />
                <RuleCallout>
                  <strong>
                    A proposta só segue para análise depois que o cliente
                    confirmar
                  </strong>{" "}
                  no Portal do Cliente. Se possível, ajude o cliente a fazer
                  isso na hora, com você do lado. A Parte 4 mostra cada tela.
                </RuleCallout>
              </StepCard>
            </SectionWrap>

            {/* PARTE 4 */}
            <SectionWrap
              id="cliente"
              tag="Parte 4"
              title="Ensinar o cliente a usar o Portal do Cliente"
              subtitle="O cliente abre o link que recebeu no WhatsApp. São 3 etapas: validar o acesso pelo CPF e código SMS, criar uma senha e revisar a proposta."
              whoTag="Portal do Cliente · no celular do cliente"
            >
              <StepCard number={16} title="Boas-vindas">
                <p>
                  No primeiro acesso, o portal explica em 4 telas rápidas o que
                  vai acontecer. O cliente toca em <strong>Próximo</strong> ou
                  em <strong>Pular explicação</strong>.
                </p>
                <PhoneShot
                  src={imgC01BoasVindas}
                  alt="Tela de boas-vindas do Portal do Cliente"
                />
              </StepCard>

              <StepCard
                number={17}
                title="Primeiro acesso: CPF e código por SMS"
              >
                <p>
                  Em <strong>Primeiro acesso</strong>, o cliente digita o CPF e
                  toca em <strong>Enviar código</strong>. Chega um{" "}
                  <strong>código de 6 dígitos por SMS</strong> no celular
                  cadastrado na proposta. Ele digita o código e toca em{" "}
                  <strong>Confirmar</strong>.
                </p>
                <PhoneShotRow>
                  <PhoneShot
                    src={imgC02PrimeiroAcesso}
                    alt="Primeiro acesso com o CPF"
                    caption="Informar o CPF"
                  />
                  <PhoneShot
                    src={imgC05CodigoSms}
                    alt="Código de verificação"
                    caption="Digitar o código do SMS"
                  />
                </PhoneShotRow>
              </StepCard>

              <StepCard
                number={18}
                title={'O SMS não chegou? Use "Validar meus dados"'}
              >
                <p>
                  Com sinal ruim ou número desatualizado, o SMS pode não chegar.
                  Há duas saídas na própria tela do código:
                </p>
                <SimpleList
                  items={[
                    <>
                      <strong>Reenviar código:</strong> manda um novo SMS.
                    </>,
                    <>
                      <strong>Validar meus dados:</strong> libera depois de
                      alguns segundos. O cliente confirma 3 informações do
                      cadastro (
                      <strong>data de nascimento, e-mail e celular</strong>) e
                      segue sem o código. O portal mostra uma dica parcial do
                      e-mail e do celular cadastrados.
                    </>,
                  ]}
                />
                <PhoneShot
                  src={imgC06ValidarDados}
                  alt="Tela Confirme seus dados"
                />
                <RuleCallout variant="tip">
                  Se o cliente estiver num lugar com sinal fraco, já ofereça o{" "}
                  <strong>Validar meus dados</strong>. É a forma mais rápida de
                  não travar o atendimento.
                </RuleCallout>
              </StepCard>

              <StepCard number={19} title="Criar a senha">
                <p>
                  O cliente cria uma senha com pelo menos{" "}
                  <strong>
                    8 caracteres, 1 letra maiúscula, 1 letra minúscula, 1 número
                    e 1 caractere especial
                  </strong>{" "}
                  (por exemplo, ! @ # $). Repete a senha e toca em{" "}
                  <strong>Salvar senha</strong>.
                </p>
                <PhoneShot
                  src={imgC07CriarSenha}
                  alt="Tela Criar senha com as regras"
                />
                <Say>
                  &quot;Escolha uma senha que você consiga lembrar. É com ela e
                  o seu CPF que você vai acompanhar a proposta.&quot;
                </Say>
              </StepCard>

              <StepCard number={20} title="Cliente que já tem senha">
                <p>
                  Se o cliente já criou senha antes, o Primeiro acesso avisa{" "}
                  <strong>&quot;Você já possui senha cadastrada&quot;</strong>.
                  Ele toca em <strong>Ir para login com senha</strong> e entra
                  com CPF e senha. Esqueceu? Toca em{" "}
                  <strong>Esqueci minha senha</strong>, recebe um código por SMS
                  e cria uma nova.
                </p>
                <PhoneShotRow>
                  <PhoneShot
                    src={imgC03JaTemSenha}
                    alt="Aviso de senha já cadastrada"
                    caption="Já tem senha"
                  />
                  <PhoneShot
                    src={imgC04Login}
                    alt="Tela de login com CPF e senha"
                    caption={'Login e "Esqueci minha senha"'}
                  />
                </PhoneShotRow>
              </StepCard>

              <StepCard number={21} title="Revisar a proposta">
                <p>
                  A tela <strong>&quot;Revise sua proposta&quot;</strong> mostra
                  o valor solicitado, o número e o valor das parcelas, a data da
                  primeira parcela, os dados pessoais, o endereço e o avalista,
                  exatamente como você preencheu. Peça ao cliente para conferir
                  tudo.
                </p>
                <PhoneShot
                  src={imgC08ReviseProposta}
                  alt="Revise sua proposta com o seguro prestamista incluso"
                />
              </StepCard>

              <StepCard
                number={22}
                title="Seguro prestamista: manter ou seguir sem"
              >
                <p>
                  O seguro já vem incluído na parcela. Tocando em{" "}
                  <strong>Seguro prestamista incluso</strong>, o cliente vê:
                </p>
                <SimpleList
                  items={[
                    "a proteção em caso de imprevistos como desemprego ou invalidez;",
                    <>
                      os benefícios de quem mantém o seguro:{" "}
                      <strong>sorteio mensal de R$ 5.000,00</strong>,{" "}
                      <strong>
                        até 60% de desconto em farmácias parceiras
                      </strong>{" "}
                      e <strong>clube de benefícios com cashback</strong>{" "}
                      (carência de até 30 dias);
                    </>,
                    <>
                      o valor do seguro, que é{" "}
                      <strong>3% do valor solicitado</strong> (no exemplo de
                      teste, R$ 150,00 sobre R$ 5.000,00), e a parcela com
                      seguro.
                    </>,
                  ]}
                />
                <p>
                  Para manter, basta tocar em <strong>Manter seguro</strong>.
                </p>
                <RuleCallout variant="tip">
                  <strong>
                    Observação: a ideia é que o cliente assine com o seguro.
                  </strong>{" "}
                  Apresente os benefícios e oriente o cliente a tocar em{" "}
                  <strong>Manter seguro</strong>. O seguro protege o cliente e a
                  família dele e, como a própria tela diz, aumenta as chances de
                  aprovação.
                </RuleCallout>
                <PhoneShotRow>
                  <PhoneShot
                    src={imgC10SeguroDetalhe}
                    alt="Janela Seguro prestamista incluído"
                    caption="Detalhes do seguro"
                  />
                  <PhoneShot
                    src={imgC11SeguroManter}
                    alt="Botão Manter seguro"
                    caption="Manter seguro"
                  />
                </PhoneShotRow>
              </StepCard>

              <StepCard number={23} title="Se o cliente não quiser o seguro">
                <p>
                  Lembre que a orientação é seguir com o seguro. Se, mesmo
                  assim, o cliente preferir não contratar, a opção fica em{" "}
                  <strong>Ver apólice completa</strong>, no fim do resumo da
                  apólice: <strong>Seguir sem o seguro</strong>. A parcela é
                  recalculada sem o seguro e a tela mostra &quot;O seguro
                  aumenta suas chances de aprovação&quot;.
                </p>
                <PhoneShotRow>
                  <PhoneShot
                    src={imgC13SeguirSemSeguro}
                    alt="Fim da apólice com Seguir sem o seguro"
                    caption="Ver apólice completa → Seguir sem o seguro"
                  />
                  <PhoneShot
                    src={imgC14SemSeguro}
                    alt="Revisão sem seguro, com a parcela menor"
                    caption="Sem seguro: parcela de R$ 670,65 no exemplo"
                  />
                </PhoneShotRow>
                <p>
                  Mudou de ideia? Toque em{" "}
                  <strong>
                    &quot;Toque aqui para incluir o seguro e acelerar sua
                    aprovação&quot;
                  </strong>{" "}
                  e depois em <strong>Adicionar seguro à proposta</strong>.
                </p>
                <PhoneShot
                  src={imgC15AdicionarSeguro}
                  alt="Janela Seguro prestamista removido com o botão Adicionar seguro à proposta"
                />
              </StepCard>

              <StepCard number={24} title="Aceitar os termos e confirmar">
                <p>
                  No fim da tela, o cliente marca{" "}
                  <strong>
                    &quot;Li e aceito os Termos de Uso e a Política de
                    Privacidade (LGPD) da Aurea&quot;
                  </strong>{" "}
                  e toca em <strong>Confirmar e continuar</strong>.
                </p>
                <PhoneShot
                  src={imgC09Termos}
                  alt="Aceite dos termos e botão Confirmar e continuar"
                />
              </StepCard>

              <StepCard number={25} title="Proposta em análise">
                <p>
                  Pronto. O cliente vê{" "}
                  <strong>&quot;Sua proposta está em análise&quot;</strong>, com
                  a contagem de <strong>resposta em até 48 horas</strong>. Ele
                  pode tocar em <strong>Verificar novamente</strong> para ver se
                  já houve resposta.
                </p>
                <PhoneShot
                  src={imgC16EmAnalise}
                  alt="Tela Sua proposta está em análise"
                />
                <Say>
                  &quot;Agora é com a nossa equipe. Em até 48 horas sai a
                  resposta, e você acompanha por aqui com o seu CPF e a senha
                  que criou.&quot;
                </Say>
              </StepCard>

              <StepCard
                number={26}
                title="Proposta aprovada: contrato sendo criado"
              >
                <p>
                  Quando a mesa de crédito aprova, a tela do cliente muda para{" "}
                  <strong>&quot;Seu contrato está sendo criado&quot;</strong>. A
                  Aurea prepara o contrato e, assim que ele estiver pronto para
                  assinar, o cliente continua pelo mesmo Portal do Cliente. Ele
                  pode tocar em <strong>Verificar novamente</strong> para
                  atualizar a tela.
                </p>
                <PhoneShot
                  src={imgC17ContratoSendoCriado}
                  alt="Tela Seu contrato está sendo criado"
                />
                <Say>
                  &quot;Sua proposta foi aprovada! Agora é só aguardar o
                  contrato ficar pronto e entrar de novo aqui com o seu CPF e a
                  sua senha para assinar.&quot;
                </Say>
              </StepCard>
            </SectionWrap>

            {/* PARTE 5 */}
            <SectionWrap
              id="acompanhar"
              tag="Parte 5"
              title="Acompanhar a proposta"
              subtitle={
                <>
                  Na aba <strong>Proposta</strong>, cada card mostra o status, o
                  valor e a ação disponível. Filtre por Status para achar rápido
                  o que precisa de você.
                </>
              }
              whoTag="Portal do Parceiro"
            >
              <StepCard number={27} title="O que cada status quer dizer">
                <PhoneShotRow>
                  <PhoneShot
                    src={img08bPropostaAprovada}
                    alt="Aba Proposta com propostas Aprovadas"
                    caption="Aba Proposta: propostas aprovadas, com Ver proposta"
                  />
                  <PhoneShot
                    src={img09CardsProposta}
                    alt="Cards de proposta Aprovada e Rascunho"
                    caption={
                      'Rascunho com "Passo X de 7" e Continuar preenchimento'
                    }
                  />
                </PhoneShotRow>
                <DataTable
                  head={["Status", "O que significa", "O que fazer"]}
                  rows={[
                    [
                      <StatusBadge variant="gold">Rascunho</StatusBadge>,
                      'Proposta ainda sendo preenchida. O card mostra "Passo X de 7".',
                      "Continuar preenchimento",
                    ],
                    [
                      <StatusBadge variant="hold">
                        Revisão do cliente
                      </StatusBadge>,
                      "Aguardando o cliente confirmar no Portal do Cliente.",
                      "Lembrar o cliente; reenviar o link se preciso",
                    ],
                    [
                      <StatusBadge variant="neutral">
                        Pendente de análise / Em análise
                      </StatusBadge>,
                      "Cliente confirmou; a mesa de crédito está avaliando.",
                      "Aguardar",
                    ],
                    [
                      <StatusBadge variant="hold">
                        Pendente com o parceiro
                      </StatusBadge>,
                      "A mesa devolveu pedindo ajuste.",
                      "Ver proposta para saber o que foi pedido",
                    ],
                    [
                      <StatusBadge variant="ok">Aprovada</StatusBadge>,
                      "Crédito aprovado.",
                      "Ver proposta",
                    ],
                    [
                      <StatusBadge variant="bad">
                        Rejeitada / Falhou
                      </StatusBadge>,
                      "Proposta não aprovada ou com erro no processamento.",
                      "Ver proposta",
                    ],
                  ]}
                />
              </StepCard>

              <StepCard number={28} title="Ver os detalhes da proposta">
                <p>
                  Ao tocar em <strong>Acompanhar proposta</strong> ou{" "}
                  <strong>Ver proposta</strong>, abre o detalhe da proposta. No
                  topo ficam o <strong>status</strong> e a{" "}
                  <strong>situação do seguro</strong>:
                </p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge variant="hold">
                    Seguro aguardando decisão
                  </StatusBadge>
                  <StatusBadge variant="ok">Seguro mantido</StatusBadge>
                  <StatusBadge variant="neutral">Seguro recusado</StatusBadge>
                </div>
                <SimpleList
                  items={[
                    <>
                      <strong>Seguro aguardando decisão:</strong> o cliente
                      ainda não confirmou a proposta no Portal do Cliente.
                    </>,
                    <>
                      <strong>Seguro mantido</strong> ou{" "}
                      <strong>recusado:</strong> o que o cliente escolheu na
                      revisão da proposta.
                    </>,
                    <>
                      Avisos como <strong>Contrato ativo encontrado</strong> e{" "}
                      <strong>Cruzamento de papéis em contrato ativo</strong>{" "}
                      mostram quando o cliente ou o avalista já participa de
                      outro contrato ativo.
                    </>,
                    <>
                      O <strong>Parecer do Parceiro</strong> que você escreveu
                      aparece na aba Parceiro, ao lado das abas do Gerente e do
                      Analista de Crédito.
                    </>,
                  ]}
                />
                <PhoneShotRow cols={3}>
                  <PhoneShot
                    src={imgB1RevisaoCliente}
                    alt="Proposta em Revisão do cliente com Seguro aguardando decisão"
                    caption="Revisão do cliente · seguro aguardando decisão"
                  />
                  <PhoneShot
                    src={imgB3PendenteAnalise}
                    alt="Proposta Pendente de análise com Seguro mantido e o parecer do parceiro"
                    caption="Pendente de análise · seguro mantido"
                  />
                  <PhoneShot
                    src={imgB2Aprovada}
                    alt="Proposta Aprovada com Seguro mantido"
                    caption="Aprovada · seguro mantido"
                  />
                </PhoneShotRow>
                <RuleCallout>
                  Os botões{" "}
                  <strong>Devolver, Analisar, Aprovar e Rejeitar</strong> são da
                  mesa de crédito. Os nomes dos clientes estão borrados nos
                  prints.
                </RuleCallout>
              </StepCard>
            </SectionWrap>

            {/* DÚVIDAS */}
            <SectionWrap
              id="duvidas"
              tag="Dúvidas comuns"
              title="Perguntas frequentes"
            >
              <div className="flex w-full flex-col gap-2.5">
                <FaqItem q="Comecei a proposta e precisei parar. Perco o que preenchi?">
                  Não. Cada &quot;Avançar&quot; salva o passo. Na aba Proposta,
                  o rascunho aparece com &quot;Passo X de 7&quot; e o botão
                  &quot;Continuar preenchimento&quot;.
                </FaqItem>
                <FaqItem q="O cliente quer mudar o valor ou as parcelas depois de simular.">
                  Antes de iniciar a proposta, use &quot;Simular novamente&quot;
                  ou o botão &quot;Editar&quot; no card da simulação.
                </FaqItem>
                <FaqItem q="O cliente não recebeu o SMS.">
                  Peça para tocar em &quot;Reenviar código&quot;. Se ainda assim
                  não chegar, use &quot;Validar meus dados&quot;: ele confirma
                  data de nascimento, e-mail e celular do cadastro e segue sem o
                  código.
                </FaqItem>
                <FaqItem q="O cliente diz que já tem senha, mas não lembra.">
                  Na tela de login, ele toca em &quot;Esqueci minha senha&quot;,
                  informa o CPF, recebe um código por SMS e cria uma senha nova.
                </FaqItem>
                <FaqItem q="O seguro é obrigatório?">
                  Não. Ele vem incluído, mas o cliente pode seguir sem o seguro
                  em &quot;Ver apólice completa&quot; → &quot;Seguir sem o
                  seguro&quot;. Mas a ideia é que o cliente assine com o seguro:
                  explique os benefícios antes (proteção em caso de imprevistos,
                  sorteio mensal, desconto em farmácias e cashback) e oriente a
                  manter.
                </FaqItem>
                <FaqItem
                  q={'O botão "Enviar link pelo WhatsApp" está desabilitado.'}
                >
                  O celular do cliente na proposta não é válido para WhatsApp.
                  Confira o número no passo Cadastro.
                </FaqItem>
                <FaqItem q="Os botões de simular e iniciar proposta estão bloqueados.">
                  Você tem ações de cobrança pendentes na sua fila. Conclua ou
                  reagende essas ações na Home e os botões voltam a funcionar.
                </FaqItem>
              </div>
            </SectionWrap>

            <p className="w-full border-t border-slate-200 pt-6 text-center text-p-md text-slate-500">
              Prints do ambiente de homologação, com dados de teste. Este
              material é vivo — sempre haverá atualização por aqui.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
