## 5. Indicadores de desempenho

_Apresente aqui os principais indicadores de desempenho e algumas metas para o processo. Atenção: as informações necessárias para gerar os indicadores devem estar contempladas no modelo relacional. Defina no mínimo 3 indicadores de desempenho._

_Usar o seguinte modelo:_

| **Indicador** | **Objetivos** | **Descrição** | **Fonte de dados** | **Fórmula de cálculo** |
| ---           | ---           | ---           | ---             | ---             |
| Avaliação média| Medir a reputação de clientes e prestadores na plataforma |Média das notas de 1 a 5 estrelas, considerando apenas serviços concluídos e pagos. | Tabela AVALIACAO E  USUARIO | somadasavaliações / número totaldeavaliacoes |
| Serviços concluídos | Medir o volume de serviços finalizados com sucesso na plataforma| Contagem de ordens de serviço encerradas somente após a confirmação de pagamento | Tabela ORDEM_SERVICO| Numero de ordens de serviço concluidas |
| Gastos mensais (cliente) / Ganhos mensais (prestador)| Acompanhar o fluxo financeiro mensal dos usuários na plataforma | Cliente: total pago em serviços no ano/mês/semana Prestador: total recebido por serviços prestados no mesmo período| Tabela ORDEM_SERVICO e PAGAMENTO | totalrecebido/mes/ano/semana

### Metas 

| **Indicador** | Meta  |
| --- | --- |
| Avaliação média | Manter média ≥ 4,0 estrelas (escala 1–5) para prestadores e clientes ativos |
| Serviços concluídos | Aumentar o número de serviços concluídos e pagos por mês (5/mês por prestador ativo) |
| Gastos / ganhos mensais | Cliente: controle de orçamento mensal  Prestador: meta de receita mensal conforme perfil profissional |

