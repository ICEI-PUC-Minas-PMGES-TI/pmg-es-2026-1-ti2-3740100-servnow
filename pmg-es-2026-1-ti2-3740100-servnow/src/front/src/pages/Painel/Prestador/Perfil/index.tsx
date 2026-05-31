import { useEffect, useState } from "react";
import { CreditCard, MapPin, MessageSquare, Star, User } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validSession = getValidAuthSession();
    if (!validSession?.token) {
      setIsLoading(false);
      return;
    }
    const token = validSession.token;

    async function carregarPerfil() {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/perfil/prestador`, {
          headers: authHeader(token),
        });

        if (response.ok) {
          setPerfil((await response.json()) as PerfilResponse);
        } else {
          setPerfil(null);
        }
      } catch {
        setPerfil(null);
      } finally {
        setIsLoading(false);
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

  const chavesPixExibicao =
    perfil?.chavesPix && perfil.chavesPix.length > 0
      ? perfil.chavesPix
      : perfil?.chavePix
        ? [{
            id: 0,
            rotulo: "Principal",
            chave: perfil.chavePix,
            tipo: "OUTRA",
            principal: true,
          }]
        : [];

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
              <strong>{isLoading ? "Carregando..." : resumoAvaliacoes}</strong>
            </p>
          </div>
        </div>

        <div className="painel-card painel-perfil-card">
          <div className="painel-perfil-card-cabecalho">
            <div className="painel-conta-card-icone">
              <MapPin size={22} />
            </div>
            <div>
              <h2>Endereco base</h2>
              <p>Local usado para calcular distancias nas solicitacoes.</p>
            </div>
          </div>
          {isLoading ? (
            <p className="painel-perfil-vazio">Carregando endereco...</p>
          ) : enderecoResumo ? (
            <p className="painel-perfil-resumo-linha">{enderecoResumo}</p>
          ) : (
            <p className="painel-perfil-vazio">Nenhum endereco cadastrado. Configure em Configurar perfil.</p>
          )}
        </div>

        <div className="painel-card painel-perfil-card">
          <div className="painel-perfil-card-cabecalho">
            <div className="painel-conta-card-icone">
              <CreditCard size={22} />
            </div>
            <div>
              <h2>Pagamentos (PIX)</h2>
              <p>Chave cadastrada para receber pagamentos.</p>
            </div>
          </div>
          {isLoading ? (
            <p className="painel-perfil-vazio">Carregando chave PIX...</p>
          ) : chavesPixExibicao.length > 0 ? (
            <ul className="painel-perfil-lista-cadastros">
              {chavesPixExibicao.map((item) => (
                <li key={item.id || item.chave} className={item.principal ? "painel-perfil-item--ativo" : ""}>
                  <strong>
                    {item.rotulo || item.tipo}
                    {item.principal ? " (em uso no QR Code)" : ""}
                  </strong>
                  <span>{item.chave}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="painel-perfil-vazio">Nenhuma chave PIX cadastrada. Configure em Configurar perfil.</p>
          )}
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
