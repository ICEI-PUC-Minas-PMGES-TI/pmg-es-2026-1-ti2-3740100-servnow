import { useEffect, useState } from "react";
import { CalendarDays, MessageSquare, Star, User } from "lucide-react";

import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  API_URL,
  authHeader,
  getAuthSession,
  getValidAuthSession,
  type PerfilResponse,
} from "../../../../services/auth";
import { useArquivoUrl } from "../../../../hooks/useArquivoUrl";

const avaliacoesRecebidas = [
  {
    id: 1,
    autor: "Carlos Mendes",
    servico: "Instalacao eletrica",
    data: "24/04/2026",
    nota: 5,
    comentario: "Cliente acompanhou tudo com clareza e deixou o local preparado para o atendimento.",
  },
  {
    id: 2,
    autor: "Marina Costa",
    servico: "Pintura residencial",
    data: "12/04/2026",
    nota: 4,
    comentario: "Comunicacao objetiva e pagamento confirmado no prazo combinado.",
  },
];

const comentariosRecebidos = [
  {
    id: 1,
    autor: "Joao Pereira",
    data: "03/05/2026",
    texto: "Otima experiencia no agendamento. As informacoes do servico estavam completas.",
  },
  {
    id: 2,
    autor: "Ana Ribeiro",
    data: "18/04/2026",
    texto: "Cliente respondeu rapido durante a negociacao e facilitou a visita tecnica.",
  },
];

export function PerfilPrestador() {
  const session = getAuthSession();
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);

  useEffect(() => {
    const validSession = getValidAuthSession();
    if (!validSession?.token) return;
    const token = validSession.token;

    async function carregarPerfil() {
      try {
        const response = await fetch(`${API_URL}/api/perfil/prestador`, {
          headers: authHeader(token),
        });

        if (response.ok) {
          setPerfil((await response.json()) as PerfilResponse);
        }
      } catch {
        setPerfil(null);
      }
    }

    void carregarPerfil();
  }, []);

  const nome = perfil?.nome ?? session?.nome ?? "Prestador Servnow";
  const email = perfil?.email ?? session?.email ?? "prestador@servnow.com";
  const fotoPerfilUrl = perfil?.fotoPerfilUrl ?? session?.fotoPerfilUrl ?? null;
  const { src: fotoPerfil } = useArquivoUrl(fotoPerfilUrl);
  const fotoPerfilStyle = {
    objectFit: perfil?.fotoPerfilEnquadramento ?? session?.fotoPerfilEnquadramento ?? "cover",
    objectPosition: `${perfil?.fotoPerfilAjusteX ?? session?.fotoPerfilAjusteX ?? 50}% ${perfil?.fotoPerfilAjusteY ?? session?.fotoPerfilAjusteY ?? 50}%`,
  };

  return (
    <>
      <PainelSectionHeader
        eyebrow="Meu perfil"
        title="Perfil"
        description="Visualize seus dados e o historico de avaliacoes e comentarios dos clientes."
      />

      <section className="painel-perfil-grid">
        <div className="painel-card painel-perfil-card">
          <div className="painel-perfil-avatar">
            {fotoPerfil ? (
              <img src={fotoPerfil} alt={`Foto de perfil de ${nome}`} style={fotoPerfilStyle} />
            ) : (
              <User size={34} />
            )}
          </div>

          <div className="painel-perfil-info">
            <span>Prestador</span>
            <h2>{nome}</h2>
            <p>{email}</p>
          </div>
        </div>

        <div className="painel-card painel-perfil-card">
          <div className="painel-perfil-card-cabecalho">
            <div className="painel-conta-card-icone">
              <Star size={22} />
            </div>
            <div>
              <h2>Avaliacoes recebidas</h2>
              <p>Historico de notas deixadas por clientes.</p>
            </div>
          </div>

          <div className="painel-feedback-lista">
            {avaliacoesRecebidas.map((avaliacao) => (
              <article className="painel-feedback-item" key={avaliacao.id}>
                <div className="painel-feedback-topo">
                  <div>
                    <strong>{avaliacao.autor}</strong>
                    <span>{avaliacao.servico}</span>
                  </div>
                  <div className="painel-feedback-nota" aria-label={`${avaliacao.nota} estrelas`}>
                    <Star size={15} fill="currentColor" />
                    {avaliacao.nota.toFixed(1)}
                  </div>
                </div>
                <p>{avaliacao.comentario}</p>
                <span className="painel-feedback-data">
                  <CalendarDays size={14} />
                  {avaliacao.data}
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className="painel-card painel-perfil-card">
          <div className="painel-perfil-card-cabecalho">
            <div className="painel-conta-card-icone">
              <MessageSquare size={22} />
            </div>
            <div>
              <h2>Comentarios recebidos</h2>
              <p>Registros enviados por clientes apos o atendimento.</p>
            </div>
          </div>

          <div className="painel-feedback-lista">
            {comentariosRecebidos.map((comentario) => (
              <article className="painel-feedback-item" key={comentario.id}>
                <div className="painel-feedback-topo">
                  <div>
                    <strong>{comentario.autor}</strong>
                    <span>Comentario recebido</span>
                  </div>
                </div>
                <p>{comentario.texto}</p>
                <span className="painel-feedback-data">
                  <CalendarDays size={14} />
                  {comentario.data}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default PerfilPrestador;
