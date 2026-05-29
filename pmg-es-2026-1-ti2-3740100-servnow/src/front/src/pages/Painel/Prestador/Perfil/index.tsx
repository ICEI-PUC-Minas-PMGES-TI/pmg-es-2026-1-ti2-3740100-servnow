import { useEffect, useState } from "react";
import { MapPin, MessageSquare, Star, User } from "lucide-react";

import { AvaliacoesPerfilSecao } from "../../../../Components/Perfil/AvaliacoesPerfilSecao";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  API_URL,
  authHeader,
  getAuthSession,
  getValidAuthSession,
  type PerfilResponse,
} from "../../../../services/auth";
import { useArquivoUrl } from "../../../../hooks/useArquivoUrl";
import { formatarRotuloAvaliacoes } from "../../../../utils/formatarAvaliacao";

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

  const enderecoResumo = perfil
    ? [perfil.rua, perfil.numero, perfil.bairro, perfil.cidade, perfil.estado].filter(Boolean).join(", ")
    : "";

  const resumoAvaliacoes = formatarRotuloAvaliacoes(
    perfil?.avaliacaoMedia ?? null,
    perfil?.totalAvaliacoes ?? 0,
  );

  return (
    <>
      <PainelSectionHeader
        eyebrow="Meu perfil"
        title="Perfil"
        description="Visualize seus dados e o historico de avaliacoes e comentarios dos clientes."
      />

      <section className="painel-perfil-grid">
        <div className="painel-card painel-perfil-card painel-perfil-card-foto">
          <div className="painel-perfil-avatar-wrap">
            <div className="painel-perfil-avatar">
              {fotoPerfil ? (
                <img src={fotoPerfil} alt={`Foto de perfil de ${nome}`} style={fotoPerfilStyle} />
              ) : (
                <User size={48} strokeWidth={1.5} />
              )}
            </div>
          </div>

          <div className="painel-perfil-info">
            <span className="painel-perfil-papel">Prestador</span>
            <h2>{nome}</h2>
            <p>{email}</p>
            <p className="painel-perfil-resumo-avaliacao" style={{ marginTop: 10 }}>
              <Star size={16} fill="currentColor" />
              <strong>{resumoAvaliacoes}</strong>
            </p>
            {enderecoResumo ? (
              <p className="painel-perfil-endereco">
                <MapPin size={14} /> {enderecoResumo}
              </p>
            ) : (
              <p className="painel-perfil-endereco painel-perfil-endereco--vazio">
                Cadastre seu endereco em Configurar perfil para ver distancias nas solicitacoes.
              </p>
            )}
          </div>
        </div>

        <AvaliacoesPerfilSecao
          descricaoLista="Historico de notas deixadas por clientes apos servicos concluidos."
          mensagemVazia="Voce ainda nao recebeu avaliacoes. Conclua atendimentos para que os clientes possam avaliar seu trabalho."
        />

        <div className="painel-card painel-perfil-card">
          <div className="painel-perfil-card-cabecalho">
            <div className="painel-conta-card-icone">
              <MessageSquare size={22} />
            </div>
            <div>
              <h2>Comentarios em destaque</h2>
              <p>Comentarios recentes vinculados as suas avaliacoes.</p>
            </div>
          </div>
          <p className="painel-perfil-vazio">
            Os comentarios aparecem junto de cada avaliacao na lista acima.
          </p>
        </div>
      </section>
    </>
  );
}

export default PerfilPrestador;
