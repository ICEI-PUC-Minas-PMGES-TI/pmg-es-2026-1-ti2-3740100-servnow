import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Droplets,
  Hammer,
  MapPin,
  Paintbrush,
  PlugZap,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UsersRound,
  Wrench,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

import completoImg from "../../assets/completo.svg";
import eletricistaImg from "../../assets/eletricista.svg";
import clientesGlobaisImg from "../../assets/globalclientes.svg";
import prestadorImg from "../../assets/prestador.jpg";
import { getAuthSession } from "../../services/auth";

type IconItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const categories: Array<IconItem & { signal: string }> = [
  { icon: PlugZap, title: "Elétrica", description: "Instalações, reparos e vistorias residenciais.", signal: "8k+" },
  { icon: Droplets, title: "Hidráulica", description: "Vazamentos, encanamentos e emergências.", signal: "4k+" },
  { icon: Hammer, title: "Montagem", description: "Móveis planejados, ajustes e acabamentos.", signal: "+1k" },
  { icon: Wrench, title: "Manutenção", description: "Pequenos reparos com orçamento transparente.", signal: "+3k" },
  { icon: Paintbrush, title: "Pintura", description: "Paredes, textura, restauração e acabamento fino.", signal: "10k+" },
  { icon: Wind, title: "Eletrodomésticos", description: "Instalação, diagnóstico e conserto técnico.", signal: "7k+" },
];

const stats = [
  { icon: UsersRound, value: "12k+", label: "clientes atendidos" },
  { icon: BriefcaseBusiness, value: "3.5k", label: "prestadores verificados" },
  { icon: Star, value: "4.9/5", label: "média de Avaliação" },
  { icon: MapPin, value: "200+", label: "cidades cobertas" },
];

const steps: IconItem[] = [
  {
    icon: Search,
    title: "Descreva a demanda",
    description: "Escolha a categoria, detalhe o problema, informe seu Endereço e publique o serviço.",
  },
  {
    icon: BadgeCheck,
    title: "Compare profissionais",
    description: "Veja disponibilidade, Avaliações, experiência e proposta antes de confirmar.",
  },
  {
    icon: CheckCircle2,
    title: "Acompanhe até o fim",
    description: "Receba Atualizações do atendimento e avalie o serviço quando tudo estiver pronto.",
  },
];

const platformBenefits: IconItem[] = [
  {
    icon: ShieldCheck,
    title: "Confiança operacional",
    description: "Perfis verificados, Histórico de atendimentos e Avaliações reais reduzem risco na contratação.",
  },
  {
    icon: Clock3,
    title: "Resposta rápida",
    description: "Pedidos chegam para profissionais ativos na região, diminuindo o tempo entre busca e orçamento.",
  },
  {
    icon: TrendingUp,
    title: "Crescimento previsível",
    description: "Prestadores organizam agenda, recebem novas oportunidades e constroem reputação em um só lugar.",
  },
];

const reviews = [
  {
    name: "Patrícia Oliveira",
    role: "Cliente",
    initials: "PO",
    quote: "Encontrei um encanador para um vazamento urgente e consegui resolver no mesmo dia, sem ficar ligando para várias pessoas.",
  },
  {
    name: "Rommel Silva",
    role: "Eletricista",
    initials: "RS",
    quote: "A plataforma deixou meus pedidos mais organizados. Consigo responder clientes, combinar horários e acompanhar tudo com clareza.",
  },
  {
    name: "Lucas Martins",
    role: "Prestador",
    initials: "LM",
    quote: "O perfil com Avaliações ajudou muito a passar confiança. Hoje fecho serviços maiores e tenho uma rotina mais previsível.",
  },
];

function PrimaryCta({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="home-button home-button-primary">
      {children}
      <ArrowRight size={18} />
    </Link>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`home-section-intro home-section-intro-${align}`}>
      <span className="home-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export function Home() {
  const session = getAuthSession();
  const ctaRoute = session
    ? session.tipoUsuario === "CLIENTE"
      ? "/painel/cliente"
      : "/painel/prestador"
    : "/cadastro";

  return (
    <div className="home-shell">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-bg" />

        <div className="home-container home-hero-grid">
          <div className="home-hero-copy">
            <span className="home-hero-kicker">
              <Sparkles size={16} />
             Saas para serviços locais
            </span>

            <h1 id="home-hero-title">
          Tudo o que você precisa para contratar profissionais.
            </h1>

            <p>
              A Servnow conecta clientes e prestadores em uma experiência simples,
              segura e elegante, do orçamento ao atendimento concluído.
            </p>

            <div className="home-hero-actions">
              <PrimaryCta to={ctaRoute}>Solicitar serviço</PrimaryCta>
              <Link to={ctaRoute} className="home-button home-button-secondary">
                Sou prestador
              </Link>
            </div>

            <div className="home-hero-proof" aria-label="Indicadores da plataforma">
              <div>
                <strong>98%</strong>
                <span>satisfação geral</span>
              </div>
              <div>
                <strong>18 min</strong>
                <span>tempo médio de resposta</span>
              </div>
              <div>
                <strong>R$ 0</strong>
                <span>para começar</span>
              </div>
            </div>
          </div>

          <div className="home-product-stage" aria-label="Prévia do produto Servnow">
            <div className="home-product-panel">
              <div className="home-panel-topbar">
                <span />
                <span />
                <span />
              </div>

              <div className="home-panel-header">
                <div>
                  <span>solicitacao ativa</span>
                  <strong>Reparo elétrico</strong>
                </div>
                <span className="home-live-pill">ao vivo</span>
              </div>

              <div className="home-provider-card">
                <img src={prestadorImg} alt="Prestador de serviço" />
                <div>
                  <strong>Marcos A.</strong>
                  <span>Eletricista verificado</span>
                  <div className="home-rating-row">
                    <Star size={15} fill="currentColor" />
                    4.9 · 327 serviços
                  </div>
                </div>
              </div>

              <div className="home-progress">
                <div className="home-progress-line">
                  <span />
                </div>
                <div className="home-progress-labels">
                  <span>Pedido</span>
                  <span>Orçamento</span>
                  <span>Agendado</span>
                </div>
              </div>

              <div className="home-panel-metrics">
                <div>
                  <span>Chegada</span>
                  <strong>14:30</strong>
                </div>
                <div>
                  <span>Faixa</span>
                  <strong>R$ 120-180</strong>
                </div>
              </div>
            </div>

        
          </div>
        </div>
      </section>

      <section className="home-stats-band">
        <div className="home-container home-stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div className="home-stat" key={stat.label}>
                <Icon size={21} />
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="home-section home-section-light">
        <div className="home-container">
          <SectionIntro
            eyebrow="Como funciona"
            title="Uma jornada clara e tracejada sem improviso."
            description="A experiência foi estruturada para dar confiança antes, durante e depois do atendimento."
          />

          <div className="home-steps">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="home-step" key={step.title}>
                  <span className="home-step-index">{String(index + 1).padStart(2, "0")}</span>
                  <div className="home-step-icon">
                    <Icon size={24} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-section home-section-muted">
        <div className="home-container home-categories-layout">
          <SectionIntro
            eyebrow="Categorias"
            title=" Categorias de serviços oferecidos."
            description="Priorizamos profissionais ativos com disponibilidade real e sinais claros de confiança."
            align="left"
          />

          <div className="home-categories-list">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link to={ctaRoute} className="home-category-row" key={category.title}>
                  <div className="home-category-icon">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                  </div>
                  <span>{category.signal}</span>
                  <ArrowRight size={18} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-section home-split-section">
        <div className="home-container home-split-grid">
          <div className="home-split-copy">
            <SectionIntro
              eyebrow="Para clientes"
              title="Resolva serviços domésticos com facilidade."
              align="left"
            />
            <p>
              Compare profissionais sem pressa, acompanhe o andamento e mantenha
              todos os detalhes importantes em um fluxo simples de entender.
            </p>
            <ul className="home-check-list">
              <li><CheckCircle2 size={18} /> Profissionais verificados e avaliados</li>
              <li><CheckCircle2 size={18} /> Orçamentos claros antes da contratação</li>
              <li><CheckCircle2 size={18} /> Agendamento online e Historico do atendimento</li>
            </ul>
            <br />
            <PrimaryCta to={ctaRoute}>Encontrar profissional</PrimaryCta>
          </div>

          <div className="home-visual-frame home-visual-frame-client">
            <img src={clientesGlobaisImg} alt="Cliente fechando acordo com prestador" />
          </div>
        </div>
      </section>

      <section className="home-section home-section-dark home-split-section">
        <div className="home-container home-split-grid home-split-grid-reverse">
          <div className="home-split-copy">
            <SectionIntro
              eyebrow="Para prestadores"
              title="Transforme reputação em agenda cheia."
              align="left"
            />
            <p>
              Receba solicitações qualificadas, organize o contato com clientes
              e construa uma vitrine profissional sem depender de indicação informal.
            </p>
            <ul className="home-check-list">
              <li><CheckCircle2 size={18} /> Perfil com Avaliacoes e especialidades</li>
              <li><CheckCircle2 size={18} /> Pedidos por região e tipo de serviço</li>
              <li><CheckCircle2 size={18} /> Rotina comercial mais previsível</li>
            </ul>
            <br/>

            <PrimaryCta to={ctaRoute}>Criar perfil profissional</PrimaryCta>
          </div>

          <div className="home-visual-frame home-visual-frame-provider">
            <img src={eletricistaImg} alt="Gráfico de crescimento de atendimentos" />
          </div>
        </div>
      </section>

      <section className="home-section home-section-light">
        <div className="home-container">
          <SectionIntro
            eyebrow="Vantagens"
            title="A base de confiança que  SaaS de serviços precisa."
          />

          <div className="home-benefits-grid">
            {platformBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article className="home-benefit" key={benefit.title}>
                  <Icon size={26} />
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-section home-reviews-section">
        <div className="home-container">
          <SectionIntro
            eyebrow="Relatos"
            title="Pessoas reais, rotinas mais simples."
            description="A Servnow foi pensada para quem precisa resolver rápido e para quem quer trabalhar melhor."
          />

          <div className="home-reviews-grid">
            {reviews.map((review) => (
              <article className="home-review" key={review.name}>
                <div className="home-review-header">
                  <span>{review.initials}</span>
                  <div>
                    <h3>{review.name}</h3>
                    <p>{review.role}</p>
                  </div>
                </div>
                <p>{review.quote}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-final-cta">
        <div className="home-container home-final-cta-inner">
          <div>
            <span className="home-eyebrow">Comece hoje</span>
        <h2>A plataforma que conecta profissionais a clientes prontos para contratar.</h2>
            <p>
              Cadastre-se gratuitamente e encontre o profissional ideal ou comece
              a receber novas oportunidades na sua região.
            </p>
            <div className="home-hero-actions">
              <PrimaryCta to={ctaRoute}>Entrar na Servnow</PrimaryCta>
              <Link to={ctaRoute} className="home-button home-button-secondary">
                Ver oportunidades
              </Link>
            </div>
          </div>

          <img src={completoImg} alt="Atendimento concluído com sucesso" />
        </div>
      </section>
    </div>
  );
}
