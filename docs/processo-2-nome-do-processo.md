### 3.3.2 Processo 2 – Gestão de Prestadores

O processo de gestão de prestadores atualmente ocorre de forma informal e descentralizada, sem uma plataforma que padronize o cadastro, a validação de identidade ou o histórico de serviços dos profissionais. Isso gera insegurança para os clientes e falta de visibilidade para os prestadores.

A oportunidade de melhoria está em centralizar todo o ciclo do prestador na plataforma ServNow: desde o cadastro com validação de dados, passando pelo aceite ou recusa de solicitações, até a verificação de identidade por código de confirmação no momento do atendimento, e o registro de avaliações ao final do serviço.

![Modelo BPMN do Processo 2 – Gestão de Prestadores](images/gestao_prestadores_servnow%20Diagrama.png "Modelo BPMN do Processo 2.")

---

#### Detalhamento das atividades

Os tipos de dados utilizados nas atividades são:

* **Área de texto** - campo texto de múltiplas linhas
* **Caixa de texto** - campo texto de uma linha
* **Número** - campo numérico
* **Data** - campo do tipo data (dd-mm-aaaa)
* **Hora** - campo do tipo hora (hh:mm:ss)
* **Data e Hora** - campo do tipo data e hora (dd-mm-aaaa, hh:mm:ss)
* **Imagem** - campo contendo uma imagem
* **Seleção única** - campo com várias opções de valores que são mutuamente exclusivas (radio button ou combobox)
* **Seleção múltipla** - campo com várias opções que podem ser selecionadas mutuamente (checkbox ou listbox)
* **Arquivo** - campo de upload de documento
* **Link** - campo que armazena uma URL
* **Tabela** - campo formado por uma matriz de valores

---

**Solicitar cadastro**

| **Campo**             | **Tipo**        | **Restrições**                        | **Valor default** |
| ---                   | ---             | ---                                   | ---               |
| Nome completo         | Caixa de texto  | mínimo de 3 caracteres                |                   |
| E-mail                | Caixa de texto  | formato de e-mail válido              |                   |
| Senha                 | Caixa de texto  | mínimo de 8 caracteres                |                   |
| CPF                   | Caixa de texto  | formato 000.000.000-00, único         |                   |
| Telefone              | Caixa de texto  | formato (00) 00000-0000               |                   |
| Tipo de serviço       | Seleção múltipla | pelo menos 1 opção selecionada       |                   |
| Área de atuação (CEP) | Caixa de texto  | formato de CEP válido                 |                   |
| Documento de identidade | Arquivo       | PDF ou imagem, máx. 5 MB             |                   |
| Foto de perfil        | Imagem          | JPG ou PNG, máx. 2 MB                 |                   |

| **Comandos**     | **Destino**                          | **Tipo**  |
| ---              | ---                                  | ---       |
| Enviar cadastro  | Validar dados do prestador (sistema) | default   |
| Cancelar         | Tela inicial                         | cancel    |

---

**Configurar perfil e disponibilidade**

| **Campo**              | **Tipo**         | **Restrições**                         | **Valor default** |
| ---                    | ---              | ---                                    | ---               |
| Descrição profissional | Área de texto    | máximo de 500 caracteres               |                   |
| Preço médio por serviço | Número          | valor positivo, em R$                  |                   |
| Dias disponíveis       | Seleção múltipla | pelo menos 1 dia selecionado           |                   |
| Horário de início      | Hora             | anterior ao horário de fim             |                   |
| Horário de fim         | Hora             | posterior ao horário de início         |                   |
| Raio de atendimento (km) | Número         | entre 1 e 100                          | 10                |

| **Comandos**     | **Destino**                              | **Tipo**  |
| ---              | ---                                      | ---       |
| Salvar perfil    | Aguardar solicitações (fila do sistema)  | default   |
| Editar depois    | Painel do prestador                      | cancel    |

---

**Analisar solicitação de serviço**

| **Campo**              | **Tipo**       | **Restrições**  | **Valor default** |
| ---                    | ---            | ---             | ---               |
| Tipo de serviço        | Caixa de texto | somente leitura |                   |
| Descrição do problema  | Área de texto  | somente leitura |                   |
| Endereço do cliente    | Caixa de texto | somente leitura |                   |
| Data e hora desejada   | Data e Hora    | somente leitura |                   |
| Valor estimado pelo cliente | Número    | somente leitura |                   |

| **Comandos**      | **Destino**                          | **Tipo**  |
| ---               | ---                                  | ---       |
| Aceitar           | Deslocar ao local (prestador)        | default   |
| Recusar           | Fim do processo (solicitação recusada) | cancel  |

---

**Deslocar ao local e apresentar código de confirmação**

| **Campo**              | **Tipo**       | **Restrições**              | **Valor default** |
| ---                    | ---            | ---                         | ---               |
| Código de confirmação  | Caixa de texto | 6 dígitos numéricos gerados pelo sistema | —      |
| Status de deslocamento | Seleção única  | "A caminho" / "Chegou"      | A caminho         |

| **Comandos**           | **Destino**                              | **Tipo**  |
| ---                    | ---                                      | ---       |
| Informar chegada       | Verificar código de confirmação (sistema)| default   |

---

**Executar serviço**

| **Campo**           | **Tipo**      | **Restrições**           | **Valor default** |
| ---                 | ---           | ---                      | ---               |
| Hora de início      | Hora          | preenchido automaticamente pelo sistema | —    |
| Observações do serviço | Área de texto | máximo de 300 caracteres |                  |
| Fotos do serviço    | Imagem        | JPG ou PNG, até 5 imagens, máx. 3 MB cada |          |

| **Comandos**        | **Destino**               | **Tipo**  |
| ---                 | ---                       | ---       |
| Concluir atendimento | Concluir atendimento      | default   |

---

**Concluir atendimento**

| **Campo**              | **Tipo**      | **Restrições**                        | **Valor default** |
| ---                    | ---           | ---                                   | ---               |
| Hora de conclusão      | Hora          | preenchido automaticamente            | —                 |
| Valor final cobrado    | Número        | valor positivo, em R$                 |                   |
| Método de pagamento    | Seleção única | Pix / Cartão / Dinheiro               |                   |
| Confirmação do cliente | Seleção única | "Confirmar conclusão" / "Contestar"   |                   |

| **Comandos**           | **Destino**                                    | **Tipo**  |
| ---                    | ---                                            | ---       |
| Finalizar atendimento  | Registrar avaliação e conclusão (sistema)      | default   |
| Cancelar conclusão     | Executar serviço                               | cancel    |
