import { useEffect, useState } from "react";
import { FileText, LoaderCircle, X } from "lucide-react";
import { toast } from "react-toastify";

import { obterDetalhe, type AcompanhamentoDetalhe } from "../../services/acompanhamento";
import { TIPOS_SERVICO_MAP } from "../../utils/tiposServico";
import { RelatorioServicoConteudo } from "./RelatorioServicoConteudo";

type Props = {
  solicitacaoId: number | null;
  perfil: "CLIENTE" | "PRESTADOR";
  onFechar: () => void;
};

export function RelatorioServicoModal({ solicitacaoId, perfil, onFechar }: Props) {
  const [detalhe, setDetalhe] = useState<AcompanhamentoDetalhe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (solicitacaoId == null) {
      setDetalhe(null);
      setErro(null);
      return;
    }

    let ativo = true;
    setIsLoading(true);
    setErro(null);
    setDetalhe(null);

    void obterDetalhe(solicitacaoId)
      .then((dados) => {
        if (!ativo) return;
        setDetalhe(dados);
      })
      .catch((error) => {
        if (!ativo) return;
        const mensagem = error instanceof Error ? error.message : "Erro ao carregar relatório.";
        setErro(mensagem);
        toast.error(mensagem);
      })
      .finally(() => {
        if (ativo) setIsLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [solicitacaoId]);

  useEffect(() => {
    if (solicitacaoId == null) return;

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
  }, [solicitacaoId, onFechar]);

  if (solicitacaoId == null) {
    return null;
  }

  const tituloModal = detalhe
    ? `Relatório — ${TIPOS_SERVICO_MAP[detalhe.tipoServico]?.nome ?? detalhe.tipoServico}`
    : "Relatório do serviço";

  return (
    <div className="solicitacao-modal-overlay" onClick={onFechar} role="presentation">
      <div
        className="solicitacao-modal relatorio-servico-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="relatorio-servico-titulo"
      >
        <header className="solicitacao-modal-cabecalho">
          <div className="solicitacao-modal-titulo-grupo">
            <FileText size={22} />
            <h3 id="relatorio-servico-titulo">{tituloModal}</h3>
          </div>
          <button type="button" className="solicitacao-modal-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <div className="solicitacao-modal-corpo relatorio-servico-modal-corpo">
          {isLoading ? (
            <div className="relatorio-servico-carregando" aria-live="polite">
              <LoaderCircle className="painel-spin" size={32} />
              <p>Carregando relatório...</p>
            </div>
          ) : erro ? (
            <p className="relatorio-servico-vazio">{erro}</p>
          ) : detalhe ? (
            <RelatorioServicoConteudo detalhe={detalhe} perfil={perfil} />
          ) : null}
        </div>

        <footer className="solicitacao-modal-rodape">
          <button type="button" className="btn-primary" onClick={onFechar}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}
