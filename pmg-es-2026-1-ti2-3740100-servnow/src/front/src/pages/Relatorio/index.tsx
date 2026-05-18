import { BarChart3, DollarSign, Star, TrendingUp, Users } from "lucide-react";
import "./Relatorio.css";

export function Relatorio() {
  const relatorioData = [
    { mes: "Janeiro", propostas: 12, aceitas: 8, valor: "R$ 1.850" },
    { mes: "Fevereiro", propostas: 15, aceitas: 11, valor: "R$ 2.340" },
    { mes: "Março", propostas: 18, aceitas: 14, valor: "R$ 2.890" },
    { mes: "Abril", propostas: 20, aceitas: 16, valor: "R$ 3.200" },
    { mes: "Maio", propostas: 22, aceitas: 18, valor: "R$ 3.840" },
  ];

  const metricas = [
    { label: "Taxa de aceitação", valor: "81.8%", icon: TrendingUp, trend: "+2.5%" },
    { label: "Clientes atendidos", valor: "67", icon: Users, trend: "+8" },
    { label: "Ticket médio", valor: "R$ 213", icon: DollarSign, trend: "+12%" },
    { label: "Avaliação média", valor: "4.9", icon: Star, trend: "124 reviews" },
  ];

  return (
    <div className="relatorio-container">
      <div className="relatorio-header">
        <h1>Relatório de Desempenho</h1>
        <p>Acompanhe suas métricas e evolução de vendas</p>
      </div>

      <div className="metricas-grid">
        {metricas.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="metrica-card">
              <div className="metrica-header">
                <Icon size={24} className="metrica-icon" />
                <span className="metrica-trend">{m.trend}</span>
              </div>
              <div className="metrica-label">{m.label}</div>
              <div className="metrica-valor">{m.valor}</div>
            </div>
          );
        })}
      </div>

      <div className="relatorio-table-container">
        <div className="relatorio-table-header">
          <BarChart3 size={20} />
          <h2>Histórico mensal</h2>
        </div>
        <table className="relatorio-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Propostas recebidas</th>
              <th>Propostas aceitas</th>
              <th>Faturamento</th>
              <th>Taxa de aceitação</th>
            </tr>
          </thead>
          <tbody>
            {relatorioData.map((item, i) => {
              const taxa = ((item.aceitas / item.propostas) * 100).toFixed(1);
              return (
                <tr key={i}>
                  <td><strong>{item.mes}</strong></td>
                  <td>{item.propostas}</td>
                  <td>{item.aceitas}</td>
                  <td className="valor-cell">{item.valor}</td>
                  <td className="taxa-cell">{taxa}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="relatorio-actions">
        <button className="btn-secondary">Exportar relatório</button>
        <button className="btn-secondary">Imprimir</button>
      </div>
    </div>
  );
}

export default Relatorio;
