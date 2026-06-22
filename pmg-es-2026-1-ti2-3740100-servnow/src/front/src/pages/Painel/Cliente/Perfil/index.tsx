import { useEffect, useState } from "react";
import { MapPin, Star, User } from "lucide-react";

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
        const response = await fetch(`${API_URL}/api/perfil/cliente`, {
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

  const enderecosExibicao =
    perfil?.enderecos && perfil.enderecos.length > 0
      ? perfil.enderecos
      : perfil?.rua
        ? [{
            id: 0,
            rotulo: "Principal",
            rua: perfil.rua,
            numero: perfil.numero ?? "",
            cep: perfil.cep ?? "",
            complemento: perfil.complemento,
            bairro: perfil.bairro ?? "",
            cidade: perfil.cidade ?? "",
            estado: perfil.estado ?? "",
            fotoUrl: perfil.fotoLocalUrl,
            principal: true,
          }]
        : [];

  return (
    <>
      <PainelSectionHeader
        eyebrow="Meu perfil"
        title="Perfil"
        description="Visualize seus dados e o histórico de comentários e avaliações recebidas."
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
              <h2>Enderecos</h2>
              <p>Endereco em uso e outros cadastrados.</p>
            </div>
          </div>
          {isLoading ? (
            <p className="painel-perfil-vazio">Carregando enderecos...</p>
          ) : enderecosExibicao.length > 0 ? (
            <ul className="painel-perfil-lista-cadastros">
              {enderecosExibicao.map((item) => (
                <li key={item.id || `${item.rua}-${item.numero}`} className={item.principal ? "painel-perfil-item--ativo" : ""}>
                  <strong>
                    {item.rotulo || "Endereço"}
                    {item.principal ? " (em uso)" : ""}
                  </strong>
                  <span>
                    {item.rua}, {item.numero} — {item.bairro}, {item.cidade}/{item.estado}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="painel-perfil-vazio">Nenhum endereço cadastrado. Configure em Configurar perfil.</p>
          )}
        </div>

        <AvaliacoesPerfilSecao
          descricaoLista="Histórico de notas deixadas por prestadores após serviços concluídos."
          mensagemVazia="Você ainda não recebeu Avaliações. Conclua serviços para que os prestadores possam avaliar voce."
        />
      </section>
    </>
  );
}

export default PerfilCliente;
