import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronLeft, ChevronRight, Clock, DollarSign, MapPin, User } from "lucide-react";

import type { SolicitacaoServicoResponse } from "../../services/auth";
import { labelStatusAgendamento } from "../../utils/acompanhamentoLabels";
import { formatarMoedaBrl } from "../../utils/formatarMoeda";
import { TIPOS_SERVICO_MAP } from "../../utils/tiposServico";
import { BotaoRota } from "../Acompanhamento/BotaoRota";
import "./Agenda.css";

type AgendaCalendarioProps = {
  agendamentos: SolicitacaoServicoResponse[];
  papel: "CLIENTE" | "PRESTADOR";
};

const NOMES_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function chaveData(ano: number, mes: number, dia: number) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function AgendaCalendario({ agendamentos, papel }: AgendaCalendarioProps) {
  const navigate = useNavigate();
  const hoje = useMemo(() => new Date(), []);
  const [mesReferencia, setMesReferencia] = useState(() => new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  // Agrupa os agendamentos por data (YYYY-MM-DD)
  const porData = useMemo(() => {
    const mapa = new Map<string, SolicitacaoServicoResponse[]>();
    for (const item of agendamentos) {
      if (!item.data) continue;
      const chave = item.data.slice(0, 10);
      const lista = mapa.get(chave) ?? [];
      lista.push(item);
      mapa.set(chave, lista);
    }
    return mapa;
  }, [agendamentos]);

  const ano = mesReferencia.getFullYear();
  const mes = mesReferencia.getMonth();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const celulas: Array<number | null> = [];
  for (let i = 0; i < primeiroDiaSemana; i += 1) {
    celulas.push(null);
  }
  for (let dia = 1; dia <= diasNoMes; dia += 1) {
    celulas.push(dia);
  }

  const chaveHoje = chaveData(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const servicosDoDia = diaSelecionado ? porData.get(diaSelecionado) ?? [] : [];

  function mudarMes(delta: number) {
    setMesReferencia(new Date(ano, mes + delta, 1));
    setDiaSelecionado(null);
  }

  function formatarDiaSelecionado(chave: string) {
    const [a, m, d] = chave.split("-").map(Number);
    return `${String(d).padStart(2, "0")} de ${NOMES_MES[m - 1]} de ${a}`;
  }

  return (
    <div className="agenda">
      <div className="agenda-layout">
        <div className="agenda-calendario">
          <div className="agenda-cabecalho">
            <button type="button" className="agenda-nav" onClick={() => mudarMes(-1)} aria-label="Mês anterior">
              <ChevronLeft size={18} />
            </button>
            <strong className="agenda-mes-titulo">
              {NOMES_MES[mes]} {ano}
            </strong>
            <button type="button" className="agenda-nav" onClick={() => mudarMes(1)} aria-label="Próximo mês">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="agenda-grid agenda-grid-dias">
            {DIAS_SEMANA.map((nome) => (
              <span key={nome} className="agenda-dia-semana">{nome}</span>
            ))}
          </div>

          <div className="agenda-grid">
            {celulas.map((dia, indice) => {
          if (dia === null) {
            return <span key={`vazio-${indice}`} className="agenda-celula agenda-celula-vazia" />;
          }
          const chave = chaveData(ano, mes, dia);
          const temServico = porData.has(chave);
          const quantidade = porData.get(chave)?.length ?? 0;
          const ehHoje = chave === chaveHoje;
          const selecionado = chave === diaSelecionado;

          return (
            <button
              key={chave}
              type="button"
              className={[
                "agenda-celula",
                temServico ? "tem-servico" : "",
                ehHoje ? "hoje" : "",
                selecionado ? "selecionado" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => setDiaSelecionado(temServico ? chave : null)}
              disabled={!temServico}
            >
              <span className="agenda-celula-dia">{dia}</span>
              {temServico && <span className="agenda-celula-marcador">{quantidade}</span>}
            </button>
          );
            })}
          </div>
        </div>

        <div className="agenda-detalhes">
          {!diaSelecionado ? (
            <p className="agenda-detalhes-vazio">
              <Calendar size={16} /> Selecione um dia com serviço marcado para ver os detalhes.
            </p>
          ) : servicosDoDia.length === 0 ? (
            <p className="agenda-detalhes-vazio">Nenhum serviço para este dia.</p>
        ) : (
          <>
            <h3 className="agenda-detalhes-titulo">{formatarDiaSelecionado(diaSelecionado)}</h3>
            <div className="painel-lista">
              {servicosDoDia.map((item) => {
                const tipo = TIPOS_SERVICO_MAP[item.tipoServico]?.nome ?? item.tipoServico;
                const contraparte = papel === "CLIENTE" ? item.prestadorNome ?? "Prestador" : item.clienteNome;
                return (
                  <div key={item.id} className="painel-lista-item agenda-servico">
                    <div className="painel-lista-item-info">
                      <p className="painel-lista-item-titulo">{tipo}</p>
                      <div className="painel-lista-item-meta">
                        <span className="painel-lista-item-meta-detalhe">
                          <User size={13} /> {contraparte}
                        </span>
                        <span className="painel-lista-item-meta-detalhe">
                          <MapPin size={13} /> {item.endereco}
                        </span>
                        {item.horario && (
                          <span className="painel-lista-item-meta-detalhe">
                            <Clock size={13} /> {item.horario}
                          </span>
                        )}
                        <span className="painel-lista-item-meta-detalhe painel-proposta-valor">
                          <DollarSign size={13} />
                          {formatarMoedaBrl(item.valorAceito)}
                        </span>
                      </div>
                      {item.descricao && (
                        <p className="agenda-servico-descrição">{item.descricao}</p>
                      )}
                      {item.observacaoReagendamento && (
                        <p className="agenda-servico-descrição" style={{ marginTop: 8 }}>
                          Motivo do retorno: {item.observacaoReagendamento}
                        </p>
                      )}
                      {papel === "PRESTADOR" && (
                        <div style={{ marginTop: 12 }}>
                          <BotaoRota endereco={item.endereco} />
                        </div>
                      )}
                    </div>
                    <div className="painel-lista-item-acoes">
                      <span className="painel-status agendado">{labelStatusAgendamento(item.etapaAcompanhamento)}</span>
                      <button
                        type="button"
                        className="painel-btn-ghost"
                        onClick={() => navigate(`/acompanhamento/${item.id}`)}
                      >
                        Acompanhar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgendaCalendario;
