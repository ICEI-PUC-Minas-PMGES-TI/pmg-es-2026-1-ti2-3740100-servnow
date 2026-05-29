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

export function PerfilCliente() {
  const session = getAuthSession();
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);

  useEffect(() => {
    const validSession = getValidAuthSession();
    if (!validSession?.token) return;
    const token = validSession.token;

    async function carregarPerfil() {
      try {
        const response = await fetch(`${API_URL}/api/perfil/cliente`, {
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

  const nome = perfil?.nome ?? session?.nome ?? "Cliente Servnow";
  const email = perfil?.email ?? session?.email ?? "cliente@servnow.com";
  const fotoPerfilUrl = perfil?.fotoPerfilUrl ?? session?.fotoPerfilUrl ?? null;
  const { src: fotoPerfil } = useArquivoUrl(fotoPerfilUrl);
  const fotoPerfilStyle = {
    objectFit: perfil?.fotoPerfilEnquadramento ?? session?.fotoPerfilEnquadramento ?? "cover",
    objectPosition: `${perfil?.fotoPerfilAjusteX ?? session?.fotoPerfilAjusteX ?? 50}% ${perfil?.fotoPerfilAjusteY ?? session?.fotoPerfilAjusteY ?? 50}%`,
  };

  const resumoAvaliacoes = formatarRotuloAvaliacoes(
    perfil?.avaliacaoMedia ?? null,
    perfil?.totalAvaliacoes ?? 0,
  );

  const enderecoPrincipal =
    perfil?.enderecos?.find((item) => item.principal) ?? perfil?.enderecos?.[0];
  const chavePixPrincipal =
    perfil?.chavesPix?.find((item) => item.principal) ?? perfil?.chavesPix?.[0];

  return (
    <>
      <PainelSectionHeader
        eyebrow="Meu perfil"
        title="Perfil"
        description="Visualize seus dados e o historico de comentarios e avaliacoes recebidas."
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
            <span className="painel-perfil-papel">Cliente</span>
            <h2>{nome}</h2>
            <p>{email}</p>
            <p className="painel-perfil-resumo-avaliacao" style={{ marginTop: 10 }}>
              <Star size={16} fill="currentColor" />
              <strong>{resumoAvaliacoes}</strong>
            </p>
          </div>
        </div>

        <div className="painel-card painel-perfil-card">
          <div className="painel-perfil-card-cabecalho">
            <div className="painel-conta-card-icone">
              <MapPin size={22} />
            </div>
            <div>
              <h2>Enderecos</h2>
              <p>Endereco em uso e outros cadastrados.</p>
            </div>
          </div>
          {perfil?.enderecos && perfil.enderecos.length > 0 ? (
            <ul className="painel-perfil-lista-cadastros">
              {perfil.enderecos.map((item) => (
                <li key={item.id} className={item.principal ? "painel-perfil-item--ativo" : ""}>
                  <strong>
                    {item.rotulo || "Endereco"}
                    {item.principal ? " (em uso)" : ""}
                  </strong>
                  <span>
                    {item.rua}, {item.numero} — {item.bairro}, {item.cidade}/{item.estado}
                  </span>
                </li>
              ))}
            </ul>
          ) : enderecoPrincipal || perfil?.rua ? (
            <p className="painel-perfil-resumo-linha">
              {[perfil?.rua, perfil?.numero, perfil?.bairro, perfil?.cidade, perfil?.estado]
                .filter(Boolean)
                .join(", ")}
            </p>
          ) : (
            <p className="painel-perfil-vazio">Nenhum endereco cadastrado.</p>
          )}
        </div>

        <div className="painel-card painel-perfil-card">
          <div className="painel-perfil-card-cabecalho">
            <div className="painel-conta-card-icone">
              <CreditCard size={22} />
            </div>
            <div>
              <h2>Pagamentos (PIX)</h2>
              <p>Chaves cadastradas para receber pagamentos.</p>
            </div>
          </div>
          {perfil?.chavesPix && perfil.chavesPix.length > 0 ? (
            <ul className="painel-perfil-lista-cadastros">
              {perfil.chavesPix.map((item) => (
                <li key={item.id} className={item.principal ? "painel-perfil-item--ativo" : ""}>
                  <strong>
                    {item.rotulo || item.tipo}
                    {item.principal ? " (em uso)" : ""}
                  </strong>
                  <span>{item.chave}</span>
                </li>
              ))}
            </ul>
          ) : chavePixPrincipal || perfil?.chavePix ? (
            <p className="painel-perfil-resumo-linha">{chavePixPrincipal?.chave ?? perfil?.chavePix}</p>
          ) : (
            <p className="painel-perfil-vazio">Nenhuma chave PIX cadastrada.</p>
          )}
        </div>

        <AvaliacoesPerfilSecao
          descricaoLista="Historico de notas deixadas por prestadores apos servicos concluidos."
          mensagemVazia="Voce ainda nao recebeu avaliacoes. Conclua servicos para que os prestadores possam avaliar voce."
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

export default PerfilCliente;
