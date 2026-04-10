import {
  Wrench, Zap, Paintbrush, Hammer, Droplet, Wind,
  Search, CheckCircle, Star, Shield, Clock, TrendingUp,
  ArrowRight, Users, Briefcase, ThumbsUp, MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Home.css";

import prestadorImg from "../../assets/prestador.svg";
import fechandoAcordoImg from "../../assets/fechandoacordo.svg";
import grafico from "../../assets/grafico.svg";
import completo from "../../assets/completo.svg";
export function Home() {
  const categorias = [
    { icon: Zap,        titulo: "Elétrica",           descricao: "Instalação e reparo elétrico" },
    { icon: Droplet,    titulo: "Hidráulica",          descricao: "Encanamento e vazamentos" },
    { icon: Hammer,     titulo: "Montagem de Móveis",  descricao: "Montadores profissionais" },
    { icon: Wrench,     titulo: "Manutenção Geral",    descricao: "Reparos diversos" },
    { icon: Paintbrush, titulo: "Pintura",             descricao: "Pintores especializados" },
    { icon: Wind,       titulo: "Eletrodomésticos",    descricao: "Conserto e instalação" },
  ];

  const avaliacoes = [
    {
      nome: "Maria Silva",
      comentario: "Atendimento incrível! O profissional chegou no horário e resolveu tudo em menos de uma hora.",
      servico: "Elétrica",
      estrelas: 5,
      avatar: "https://st.depositphotos.com/1771835/2035/i/450/depositphotos_20355973-stock-photo-portrait-real-high-definition-grey.jpg"
    },
    {
      nome: "João Santos",
      comentario: "Muito prático e rápido. Encontrei um encanador excelente em minutos. Recomendo demais!",
      servico: "Hidráulica",
      estrelas: 5,
      avatar: "https://img.freepik.com/fotos-premium/bracos-cruzados-moda-e-sorriso-com-retrato-de-homem-em-estudio-em-fundo-cinza-para-estilo-de-roupa-descontraido-casual-denim-e-feliz-com-pessoa-natural-em-roupas-roupa-para-modelo-jaqueta-ou-guarda-roupa_590464-382569.jpg"
    },
    {
      nome: "Ana Costa",
      comentario: "Profissionais qualificados e educados. Minha cadeira saiu como o esperado. Otimo serviço!",
      servico: "Marcenaria",
      estrelas: 5,
      avatar: "https://s2-oglobo.glbimg.com/6Jszzah_XGYop6I173dS4OE4lGQ=/0x107:2362x1557/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_da025474c0c44edd99332dddb09cabe8/internal_photos/bs/2023/B/7/BTZjbdREKYomgDBUVfIQ/jenn-granneman-5.jpg"
    },
    {
      nome: "Carlos Melo",
      comentario: "Serviço de pintura impecável. Preço justo e resultado profissional.",
      servico: "Pintura",
      estrelas: 4,
      avatar: "https://img.freepik.com/fotos-gratis/cara-alegre-aproveitando-a-pausa-para-o-cafe-ao-ar-livre_1262-20005.jpg"
    },
  ];


  const stats = [
    { icon: Users,     valor: "12.000+", label: "Clientes atendidos" },
    { icon: Briefcase, valor: "3.500+",  label: "Prestadores cadastrados" },
    { icon: ThumbsUp,  valor: "98%",     label: "Satisfação geral" },
    { icon: MapPin,    valor: "200+",    label: "Cidades atendidas" },
  ];

  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">Plataforma de serviços #1 do Brasil</span>
          <h1>Serviços profissionais<br />na palma da sua mão</h1>
          <p>Conectamos você aos melhores profissionais da sua região de forma rápida, segura e sem complicação.</p>
          <div className="hero-buttons">
            <Link to="/cadastro">
              <button className="btn-primary">Solicitar serviço <ArrowRight size={16} /></button>
            </Link>
            <Link to="/cadastro">
              <button className="btn-outline">Sou prestador</button>
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <img src={prestadorImg} alt="Prestador de serviço" />
          <div className="hero-card-float card-1">
            <CheckCircle size={18} className="icon-sky" />
            <span>Profissional verificado</span>
          </div>
          <div className="hero-card-float card-2">
            <Star size={18} className="icon-sky" />
            <span>4.9 — Elétrica</span>
          </div>
          <div className="hero-card-float card-3">
            <Clock size={18} className="icon-sky" />
            <span>Resposta em minutos</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-bar">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-item">
              <Icon size={22} className="icon-sky" />
              <strong>{s.valor}</strong>
              <span>{s.label}</span>
            </div>
          );
        })}
      </section>

      {/* COMO FUNCIONA */}
      <section className="section">
        <div className="section-inner">
          <p className="section-label">Simples e rápido</p>
          <h2>Como funciona</h2>
          <p className="section-sub">Em apenas 3 passos você tem o profissional ideal na sua porta</p>
          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <Search size={28} className="icon-sky" />
              <h3>Busque o serviço</h3>
              <p>Escolha a categoria do serviço que você precisa e sua localização.</p>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">02</div>
              <CheckCircle size={28} className="icon-sky" />
              <h3>Escolha o profissional</h3>
              <p>Veja perfis, avaliações e preços. Escolha o que mais combina com você.</p>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">03</div>
              <Star size={28} className="icon-sky" />
              <h3>Avalie o serviço</h3>
              <p>Após o atendimento, avalie o profissional e ajude a comunidade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="section section-alt">
        <div className="section-inner">
          <p className="section-label">O que você precisa?</p>
          <h2>Categorias de serviço</h2>
          <p className="section-sub">Profissionais especializados para cada tipo de necessidade</p>
          <div className="categorias-grid">
            {categorias.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div key={i} className="categoria-card">
                  <div className="categoria-icon">
                    <Icon size={26} />
                  </div>
                  <h3>{cat.titulo}</h3>
                  <p>{cat.descricao}</p>
                  <span className="categoria-link">Ver profissionais <ArrowRight size={13} /></span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PARA CLIENTES */}
      <section className="section split-section">
        <div className="section-inner split-inner">
          <div className="split-text">
            <p className="section-label">Para clientes</p>
            <h2>Resolva tudo sem sair de casa</h2>
            <p>Nossa plataforma foi pensada para tornar sua vida mais fácil. Chega de ligar para vários profissionais, negociar preços às cegas ou contratar sem referências.</p>
            <ul className="benefit-list">
              <li><CheckCircle size={17} className="icon-sky" /> Profissionais verificados e avaliados</li>
              <li><CheckCircle size={17} className="icon-sky" /> Orçamentos transparentes e sem surpresas</li>
              <li><CheckCircle size={17} className="icon-sky" /> Agendamento online em minutos</li>
              <li><CheckCircle size={17} className="icon-sky" /> Suporte durante todo o atendimento</li>
            </ul>
            <Link to="/cadastro">
              <button className="btn-primary">Quero contratar <ArrowRight size={15} /></button>
            </Link>
          </div>
          <div className="split-image">
            <img src={fechandoAcordoImg} alt="Cliente fechando acordo com prestador" />
          </div>
        </div>
      </section>

      {/* PARA PRESTADORES */}
      <section className="section section-alt split-section">
        <div className="section-inner split-inner reverse">
          <div className="split-image">
            <img src={grafico} alt="Grafico de ganhos" />
          </div>
          <div className="split-text">
            <p className="section-label">Para prestadores</p>
            <h2>Expanda seu negócio com a Servnow</h2>
            <p>Cadastre-se gratuitamente e comece a receber solicitações de clientes na sua região. Sem mensalidade, sem complicação.</p>
            <ul className="benefit-list">
              <li><CheckCircle size={17} className="icon-sky" /> Cadastro gratuito e rápido</li>
              <li><CheckCircle size={17} className="icon-sky" /> Receba pedidos direto no celular</li>
              <li><CheckCircle size={17} className="icon-sky" /> Gerencie sua agenda com facilidade</li>
              <li><CheckCircle size={17} className="icon-sky" /> Pagamento garantido pela plataforma</li>
            </ul>
            <Link to="/cadastro">
              <button className="btn-primary">Quero me cadastrar <ArrowRight size={15} /></button>
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="section">
        <div className="section-inner">
          <p className="section-label">Por que escolher a Servnow?</p>
          <h2>Vantagens da plataforma</h2>
          <div className="beneficios-grid">
            <div className="beneficio-card">
              <Shield size={30} className="icon-sky" />
              <h3>Profissionais verificados</h3>
              <p>Todos os prestadores passam por verificação de identidade e histórico antes de serem aceitos.</p>
            </div>
            <div className="beneficio-card">
              <Clock size={30} className="icon-sky" />
              <h3>Atendimento rápido</h3>
              <p>Receba respostas em minutos. Nossa rede de profissionais está sempre disponível para você.</p>
            </div>
            <div className="beneficio-card">
              <Star size={30} className="icon-sky" />
              <h3>Avaliações reais</h3>
              <p>Todas as avaliações são feitas por clientes reais após a conclusão do serviço.</p>
            </div>
            <div className="beneficio-card">
              <TrendingUp size={30} className="icon-sky" />
              <h3>Mais oportunidades</h3>
              <p>Prestadores ampliam sua carteira de clientes sem custo adicional de marketing.</p>
            </div>
          </div>
        </div>
      </section>

     {/* AVALIAÇÕES */}
      <section className="section section-alt">
        <div className="section-inner">
          <p className="section-label">Avaliações</p>
          <h2>O que dizem nossos clientes</h2>

          <div className="avaliacoes-grid">
            {avaliacoes.map((a, i) => (
              <div key={i} className="avaliacao-card">

                <div className="avaliacao-estrelas">
                  {Array.from({ length: a.estrelas }).map((_, j) => (
                    <Star key={j} size={14} fill="#38bdf8" color="#38bdf8" />
                  ))}
                </div>

                <p>"{a.comentario}"</p>

                <div className="avaliacao-autor">

                  {/* AVATAR COM IMAGEM */}
                  <img
                    src={a.avatar}
                    alt={a.nome}
                    className="avaliacao-avatar-img"
                  />

                  <div>
                    <strong>{a.nome}</strong>
                    <span>{a.servico}</span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* CTA FINAL */}
      <section className="cta-section">
        <div className="cta-inner">
          <img src={completo} alt="Sucesso" className="cta-image" />
          <div className="cta-text">
            <h2>Pronto para começar?</h2>
            <p>Cadastre-se gratuitamente e encontre o profissional ideal hoje mesmo.</p>
            <div className="hero-buttons">
              <Link to="/cadastro">
                <button className="btn-primary">Solicitar serviço <ArrowRight size={16} /></button>
              </Link>
              <Link to="/cadastro">
                <button className="btn-outline">Sou prestador</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}