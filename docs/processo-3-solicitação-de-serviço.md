### 3.3.3 Processo 3 –SOLICITAR SERVIÇOS
//explicar o problema e melhorias 

_Apresente aqui o nome e as oportunidades de melhoria para o processo 3. 
Em seguida, apresente o modelo do processo 3, descrito no padrão BPMN._

![Exemplo de um Modelo BPMN do PROCESSO 3](images/process.png "Modelo BPMN do Processo 3.")


#### Detalhamento das atividades

_Descreva aqui cada uma das propriedades das atividades do processo 3. 
Devem estar relacionadas com o modelo de processo apresentado anteriormente._

**Preencher solicitação**

| **Campo**           | **Tipo**         | **Restrições**                               | **Valor default** |
| ---                 | ---              | ---                                          | ---               |
| Tipo de serviço     | Seleção única    | obrigatório (ex: elétrico, hidráulico, etc.) |                   |
| Descrição do problema | Área de texto  | mínimo de 20 caracteres, máximo de 500       |                   |
| Endereço do serviço | Caixa de texto   | CEP válido, logradouro e número              |                   |
| Data desejada       | Data             | data futura                                  |                   |
| Horário desejado    | Hora             | dentro do horário de operação da plataforma  |                   |
| Fotos do problema   | Imagem           | opcional, JPG ou PNG, até 3 imagens          |                   |

| **Comandos**        | **Destino**                        | **Tipo**  |
| ---                 | ---                                | ---       |
| Enviar solicitação  | Enviar solicitação (confirmar)     | default   |
| Cancelar            | Painel do cliente                  | cancel    |

---

**Enviar solicitação**

Tela de revisão e confirmação antes de submeter a solicitação à plataforma.

| **Campo**           | **Tipo**       | **Restrições**  | **Valor default** |
| ---                 | ---            | ---             | ---               |
| Resumo da solicitação | Área de texto | somente leitura |                  |
| Confirmação         | Seleção única  | Confirmar / Editar |               |

| **Comandos**    | **Destino**                        | **Tipo**  |
| ---             | ---                                | ---       |
| Confirmar       | Registrar solicitação (sistema)    | default   |
| Editar          | Preencher solicitação              | cancel    |

---

**Listar solicitações**

Painel de acompanhamento de todas as solicitações do cliente.

| **Campo**       | **Tipo**  | **Restrições**  | **Valor default** |
| ---             | ---       | ---             | ---               |
| Lista de solicitações | Tabela | somente leitura |               |
| ID da solicitação | Caixa de texto | somente leitura |           |
| Tipo de serviço | Caixa de texto | somente leitura |                |
| Status          | Caixa de texto | somente leitura (aberta / em andamento / concluída / recusada) | |
| Data de criação | Data      | somente leitura |                   |

| **Comandos**        | **Destino**            | **Tipo**  |
| ---                 | ---                    | ---       |
| Filtrar             | Filtrar resultados      | default   |
| Ver detalhes        | Ver detalhes           | default   |
| Nova solicitação    | Preencher solicitação  | default   |

---

**Filtrar resultados**

| **Campo**       | **Tipo**      | **Restrições**                                    | **Valor default** |
| ---             | ---           | ---                                               | ---               |
| Status          | Seleção múltipla | aberta / em andamento / concluída / recusada   | todos             |
| Data inicial    | Data          | anterior ou igual à data final                    |                   |
| Data final      | Data          | posterior ou igual à data inicial                 |                   |
| Tipo de serviço | Seleção única | todos / elétrico / hidráulico / manutenção / etc. | todos             |

| **Comandos**  | **Destino**         | **Tipo**  |
| ---           | ---                 | ---       |
| Aplicar       | Listar solicitações | default   |
| Limpar filtros | Listar solicitações | cancel   |

---

**Ver detalhes**

| **Campo**              | **Tipo**       | **Restrições**  | **Valor default** |
| ---                    | ---            | ---             | ---               |
| ID da solicitação      | Caixa de texto | somente leitura |                   |
| Status atual           | Caixa de texto | somente leitura |                   |
| Nome do prestador      | Caixa de texto | somente leitura |                   |
| Avaliação do prestador | Número         | somente leitura (0 a 5 estrelas) |        |
| Histórico de atualizações | Tabela      | somente leitura |                   |
| Data e hora do serviço | Data e Hora    | somente leitura |                   |

| **Comandos**        | **Destino**           | **Tipo**  |
| ---                 | ---                   | ---       |
| Voltar              | Listar solicitações   | cancel    |
