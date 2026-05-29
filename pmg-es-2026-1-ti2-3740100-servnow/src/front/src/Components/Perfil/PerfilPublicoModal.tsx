import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";

import { useArquivoUrl } from "../../hooks/useArquivoUrl";
import {
  buscarPerfilPublico,
  getValidAuthSession,
  type PerfilPublicoResponse,
} from "../../services/auth";

type Props = {
  usuarioId: number;
  titulo?: string;
  onFechar: () => void;
};

function formatarMesAnoEntrada(valor: string | null | undefined) {
  if (!valor) return "Data de entrada nao informada";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "Data de entrada nao informada";
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(data);
}

function formatarLocalizacao(perfil: PerfilPublicoResponse) {
  return [perfil.bairro, perfil.cidade, perfil.estado].filter(Boolean).join(" - ") || "Localizacao nao informada";
}

function formatarDiasDisponiveis(valor: string | null) {
  if (!valor) return null;
  const mapa: Record<string, string> = {
    SEG: "Seg",
    TER: "Ter",
    QUA: "Qua",
    QUI: "Qui",
    SEX: "Sex",
    SAB: "Sab",
    DOM: "Dom",
  };
  return valor
    .split(",")
    .map((dia) => mapa[dia.trim().toUpperCase()] ?? dia.trim())
    .filter(Boolean)
    .join(", ");
}

export function PerfilPublicoConteudo({
  perfil,
  carregando,
}: {
  perfil: PerfilPublicoResponse | null;
  carregando: boolean;
}) {
  const { src: fotoSrc } = useArquivoUrl(perfil?.fotoPerfilUrl);

  if (carregando) {
    return <p className="perfil-publico-feedback">Carregando perfil...</p>;
  }

  if (!perfil) {
    return <p className="perfil-publico-feedback">Perfil indisponivel no momento.</p>;
  }

  const prestador = perfil.tipoUsuario === "PRESTADOR";
  const dias = formatarDiasDisponiveis(perfil.diasDisponiveis);

  return (
    <div className="perfil-publico-resumo">
      {fotoSrc ? (
        <img src={fotoSrc} alt={`Foto de ${perfil.nome}`} className="perfil-publico-avatar" />
      ) : (
        <div className="perfil-publico-avatar perfil-publico-avatar-placeholder" aria-hidden>
          {perfil.nome.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="perfil-publico-detalhes">
        <p className="perfil-publico-nome">{perfil.nome}</p>
        <p className="perfil-publico-meta">{formatarLocalizacao(perfil)}</p>

        {prestador && perfil.descricao ? (
          <p className="perfil-publico-texto">{perfil.descricao}</p>
        ) : null}

        {prestador && perfil.especialidades ? (
          <p className="perfil-publico-meta">
            <strong>Especialidades:</strong> {perfil.especialidades}
          </p>
        ) : null}

        {prestador && dias ? (
          <p className="perfil-publico-meta">
            <strong>Dias disponiveis:</strong> {dias}
          </p>
        ) : null}

        {prestador && perfil.horarioInicio && perfil.horarioFim ? (
          <p className="perfil-publico-meta">
            <strong>Horario:</strong> {perfil.horarioInicio} - {perfil.horarioFim}
          </p>
        ) : null}

        {prestador && perfil.raioAtendimentoKm != null ? (
          <p className="perfil-publico-meta">
            <strong>Raio de atendimento:</strong> {perfil.raioAtendimentoKm} km
          </p>
        ) : null}

        <p className="perfil-publico-meta perfil-publico-avaliacao-linha">
          <Star size={14} fill="currentColor" />
          {perfil.avaliacaoMedia != null && perfil.totalAvaliacoes > 0
            ? `Nota: ${perfil.avaliacaoMedia.toFixed(2).replace(".", ",")} · ${perfil.totalAvaliacoes} ${perfil.totalAvaliacoes === 1 ? "avaliacao" : "avaliacoes"}`
            : "Usuario sem avaliacoes na plataforma"}
        </p>

        {perfil.comentarioDestaque ? (
          <p className="perfil-publico-meta">
            <strong>Comentario em destaque:</strong> {perfil.comentarioDestaque}
          </p>
        ) : (
          <p className="perfil-publico-meta">Comentario: disponivel apos finalizacao de servicos</p>
        )}

        <p className="perfil-publico-meta">Entrou na plataforma em: {formatarMesAnoEntrada(perfil.criadoEm)}</p>
      </div>
    </div>
  );
}

export function PerfilPublicoModal({ usuarioId, titulo = "Perfil", onFechar }: Props) {
  const [perfil, setPerfil] = useState<PerfilPublicoResponse | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
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
  }, [onFechar]);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setPerfil(null);

    const session = getValidAuthSession();
    if (!session?.token) {
      setCarregando(false);
      return;
    }

    void buscarPerfilPublico(usuarioId, session.token).then((dados) => {
      if (!ativo) return;
      setPerfil(dados);
      setCarregando(false);
    });

    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  return (
    <div className="solicitacao-modal-overlay" role="presentation" onClick={onFechar}>
      <div
        className="solicitacao-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="perfil-publico-titulo"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="solicitacao-modal-cabecalho">
          <div className="solicitacao-modal-titulo-grupo">
            <h3 id="perfil-publico-titulo">{titulo}</h3>
          </div>
          <button type="button" className="solicitacao-modal-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        <div className="solicitacao-modal-corpo">
          <PerfilPublicoConteudo perfil={perfil} carregando={carregando} />
        </div>

        <footer className="solicitacao-modal-rodape">
          <button type="button" className="btn-secondary" onClick={onFechar}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}
