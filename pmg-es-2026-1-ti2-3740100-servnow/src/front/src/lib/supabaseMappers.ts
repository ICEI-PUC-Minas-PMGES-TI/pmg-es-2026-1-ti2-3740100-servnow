import type { NotificacaoResponse, TipoNotificacao } from "../services/notificacoes";

export type NotificacaoRow = {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  proposta_id: number | null;
  solicitacao_id: number | null;
  lida: boolean;
  criado_em: string;
};

export function mapNotificacaoRow(row: NotificacaoRow): NotificacaoResponse {
  return {
    id: row.id,
    tipo: row.tipo as TipoNotificacao,
    titulo: row.titulo,
    mensagem: row.mensagem,
    propostaId: row.proposta_id,
    solicitacaoId: row.solicitacao_id,
    lida: row.lida,
    criadoEm: row.criado_em,
  };
}
