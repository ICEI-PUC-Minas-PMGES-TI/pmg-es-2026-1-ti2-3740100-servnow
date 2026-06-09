## 5. Indicadores de desempenho


| **Indicador**                                | **Objetivos**                                                    | **Descrição**                                                                                                                           | **Fonte de dados**                                | **Fórmula de cálculo**                                                                                                                                                                                                    |
| -------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Avaliação média                              | Medir a reputação do prestador na plataforma                     | Média das notas de 1 a 5 estrelas recebidas dos usuarios considerando apenas serviços concluídos e pagos.                               | Tabela `ordens_servico` (`nota_avaliacao`)        | Soma das avaliações ÷ número total de avaliações                                                                                                                                                                          |
| Percentual de efetividade                    | Medir a taxa de sucesso dos serviços realizados pelo prestador   | Representa a porcentagem de serviços concluídos em relação ao total de serviços agendados pelo prestador no período.                    | Tabelas `solicitacoes_servico` e `ordens_servico` | (Número de serviços concluídos ÷ Número total de serviços recebidos) × 100                                                                                                                                                |
| Participação nos Ganhos Totais da Plataforma | Medir a representatividade financeira e a evolução do prestador  | Exibe o percentual do faturamento do prestador em relação ao faturamento total da plataforma e o crescimento mensal dessa participação. | Tabela `ordens_servico` com pagamento confirmado  | Participação: (Total recebido pelo prestador ÷ Total faturado pela plataforma) × 100. Crescimento: ((Participação do mês atual − Participação do mês anterior) ÷ Participação do mês anterior) × 100                      |
| Participação nos Ganhos por tipo de serviço  | Medir a representatividade financeira do prestador por categoria | Exibe o percentual do faturamento do prestador em cada categoria e o crescimento trimestral da receita em cada categoria atendida.      | Tabela `ordens_servico` com pagamento confirmado  | Participação: (Total do prestador na categoria ÷ Total da plataforma na categoria) × 100. Crescimento trimestral: ((Receita dos últimos 3 meses − Receita dos 3 meses anteriores) ÷ Receita dos 3 meses anteriores) × 100 |


### Metas


| **Indicador**                                | **Meta**                                                         | **Como é verificada no sistema**                            |
| -------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| Avaliação média                              | Manter média ≥ 4,0 estrelas (escala 1–5) para prestadores ativos | Painel do prestador → Métricas → Avaliação média            |
| Percentual de efetividade                    | ≥ 85%                                                            | Painel do prestador → Métricas → Efetividade                |
| Participação nos Ganhos Totais da Plataforma | Crescimento mensal ≥ 5%                                          | Painel do prestador → Métricas → Participação na plataforma |
| Participação nos Ganhos por tipo de serviço  | Crescimento trimestral ≥ 10% em cada categoria atendida          | Painel do prestador → Métricas → Por tipo de serviço        |


