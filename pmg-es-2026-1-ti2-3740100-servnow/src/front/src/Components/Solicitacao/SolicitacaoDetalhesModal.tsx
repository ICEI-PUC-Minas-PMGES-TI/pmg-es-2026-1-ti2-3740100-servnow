import { useEffect, useState } from "react";
import { Calendar, Clock3, FileText, ImageIcon, LoaderCircle, MapPin, User, X } from "lucide-react";

import { PerfilPublicoModal } from "../Perfil/PerfilPublicoModal";
import {
  buscarPerfilPublico,
  getValidAuthSession,
  type PerfilPublicoResponse,
  type SolicitacaoServicoResponse,
} from "../../services/auth";
import { useSolicitacaoImagemUrl } from "../../hooks/useSolicitacaoImagemUrl";
import {
  formatarDataSolicitacao,
  getFaixaPrecoLabel,
  getStatusClass,
  getStatusLabel,
} from "../../utils/solicitacaoLabels";
import { TIPOS_SERVICO_MAP } from "../../utils/tiposServico";
import { formatarDistancia } from "../../utils/formatarDistancia";
import { ClienteAvaliacaoDestaque } from "./ClienteAvaliacaoDestaque";

type Props = {
  solicitacao: SolicitacaoServicoResponse | null;
  onFechar: () => void;
  mostrarCliente?: boolean;
  mostrarPrestador?: boolean;
  distanciaKm?: number | null;
  distanciaLinhaReta?: boolean | null;
};

export function SolicitacaoDetalhesModal({
  solicitacao,
  onFechar,
  mostrarCliente = false,
  mostrarPrestador = false,
  distanciaKm,
  distanciaLinhaReta,
}: Props) {
  const [perfilCliente, setPerfilCliente] = useState<PerfilPublicoResponse | null>(null);
  const [carregandoPerfilCliente, setCarregandoPerfilCliente] = useState(false);
  const [perfilModalAberto, setPerfilModalAberto] = useState(false);

  const imagemUrl = solicitacao?.imagemUrl ?? null;
  const { src: imagemSrc, carregando: imagemCarregando } = useSolicitacaoImagemUrl(
    imagemUrl,
    solicitacao?.id ?? 0,
  );

  useEffect(() => {
    if (!solicitacao) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onFechar();
      }
    }

    document.addEventListener("keydown", handleEscape);
    const scrollAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = scrollAnterior;
    };
  }, [solicitacao, onFechar]);

  useEffect(() => {
    if (!solicitacao || !mostrarCliente) {
      setPerfilCliente(null);
      setCarregandoPerfilCliente(false);
      return;
    }

    let ativo = true;
    setPerfilCliente(null);
    setCarregandoPerfilCliente(true);

    const session = getValidAuthSession();
    if (!session?.token) {
      setCarregandoPerfilCliente(false);
      return;
    }

    void buscarPerfilPublico(solicitacao.clienteId, session.token).then((perfil) => {
      if (!ativo) return;
      setPerfilCliente(perfil);
      setCarregandoPerfilCliente(false);
    });

    return () => {
      ativo = false;
    };
  }, [solicitacao, mostrarCliente]);

  useEffect(() => {
    if (!solicitacao) {
      setPerfilModalAberto(false);
    }
  }, [solicitacao]);

  if (!solicitacao) {
    return null;
  }

  const tipoServico = TIPOS_SERVICO_MAP[solicitacao.tipoServico];
  const IconComponent = tipoServico?.icone || FileText;
  const titulo = tipoServico?.nome || solicitacao.tipoServico;

  const nomeCliente = perfilCliente?.nome ?? solicitacao.clienteNome;
  const avaliacaoMedia = perfilCliente?.avaliacaoMedia ?? null;
  const totalAvaliacoes = perfilCliente?.totalAvaliacoes ?? 0;
  const comentarioDestaque = perfilCliente?.comentarioDestaque ?? null;

  return (
    <>
      <div className="solicitacao-modal-overlay" onClick={onFechar} role="presentation">
        <div
          className="solicitacao-modal"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="solicitacao-modal-titulo"
        >
          <header className="solicitacao-modal-cabecalho">
            <div className="solicitacao-modal-titulo-grupo">
              <IconComponent size={22} />
              <h3 id="solicitacao-modal-titulo">{titulo}</h3>
            </div>
            <button type="button" className="solicitacao-modal-fechar" onClick={onFechar} aria-label="Fechar">
              <X size={20} />
            </button>
          </header>

          <div className="solicitacao-modal-corpo">
            {mostrarCliente && (
              <ClienteAvaliacaoDestaque
                nome={nomeCliente}
                fotoPerfilUrl={perfilCliente?.fotoPerfilUrl ?? null}
                avaliacaoMedia={avaliacaoMedia}
                totalAvaliacoes={totalAvaliacoes}
                comentarioDestaque={comentarioDestaque}
                carregando={carregandoPerfilCliente}
                onVerPerfil={() => setPerfilModalAberto(true)}
              />
            )}

            {imagemUrl && (
              <figure className="solicitacao-modal-foto">
                {imagemCarregando && (
                  <div className="solicitacao-modal-foto-loading" aria-hidden>
                    <LoaderCircle className="painel-spin" size={28} />
                  </div>
                )}
                {!imagemCarregando && imagemSrc && (
                  <img src={imagemSrc} alt={`Foto da solicitacao: ${titulo}`} />
                )}
                {!imagemCarregando && !imagemSrc && (
                  <div className="solicitacao-modal-foto-vazio" aria-hidden>
                    <ImageIcon size={32} />
                    <span>Nao foi possivel carregar a foto.</span>
                  </div>
                )}
              </figure>
            )}

            <div className="solicitacao-modal-meta">
              <span className={`painel-status ${getStatusClass(solicitacao.status)}`}>
                {getStatusLabel(solicitacao.status)}
              </span>
              <span className="solicitacao-modal-meta-item">{getFaixaPrecoLabel(solicitacao.faixaPreco)}</span>
            </div>

            <dl className="solicitacao-modal-detalhes">
              {mostrarPrestador && (
                <div className="solicitacao-modal-linha">
                  <dt>
                    <User size={14} /> Prestador
                  </dt>
                  <dd>{solicitacao.prestadorNome ?? "Ainda sem prestador atribuido"}</dd>
                </div>
              )}
              <div className="solicitacao-modal-linha">
                <dt>
                  <MapPin size={14} /> Endereco
                </dt>
                <dd>{solicitacao.endereco}</dd>
              </div>
              {solicitacao.data && (
                <div className="solicitacao-modal-linha">
                  <dt>
                    <Calendar size={14} /> Data preferida
                  </dt>
                  <dd>{formatarDataSolicitacao(solicitacao.data)}</dd>
                </div>
              )}
              {solicitacao.horario && (
                <div className="solicitacao-modal-linha">
                  <dt>
                    <Clock3 size={14} /> Horario
                  </dt>
                  <dd>{solicitacao.horario}</dd>
                </div>
              )}
              {distanciaKm !== undefined && (
                <div className="solicitacao-modal-linha">
                  <dt>
                    <MapPin size={14} /> Distancia
                  </dt>
                  <dd>
                    {formatarDistancia(distanciaKm, distanciaLinhaReta)}
                  </dd>
                </div>
              )}
              <div className="solicitacao-modal-linha solicitacao-modal-linha-full">
                <dt>
                  <FileText size={14} /> Descricao
                </dt>
                <dd>{solicitacao.descricao}</dd>
              </div>
            </dl>
          </div>

          <footer className="solicitacao-modal-rodape">
            <button type="button" className="btn-primary" onClick={onFechar}>
              Fechar
            </button>
          </footer>
        </div>
      </div>

      {mostrarCliente && perfilModalAberto && (
        <PerfilPublicoModal
          usuarioId={solicitacao.clienteId}
          titulo={`Perfil de ${nomeCliente}`}
          onFechar={() => setPerfilModalAberto(false)}
        />
      )}
    </>
  );
}
