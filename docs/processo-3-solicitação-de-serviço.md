### 3.3.3 Processo 3 –SOLICITAR SERVIÇOS

Atualmente, o processo de solicitação de serviços ocorre de forma desorganizada e pouco padronizada, geralmente por meio de contatos informais, como mensagens ou indicações. Nesse cenário, o cliente precisa explicar o problema repetidas vezes, nem sempre consegue detalhar corretamente as informações e não possui um registro estruturado da solicitação. Além disso, há pouca ou nenhuma visibilidade sobre o andamento do serviço, o que gera incerteza, dificuldade de comunicação e falta de controle durante todo o processo.

A oportunidade de melhoria está na digitalização e centralização desse fluxo por meio da plataforma. Com ela, o cliente passa a realizar a solicitação de forma estruturada, preenchendo informações essenciais como tipo de serviço, descrição do problema, endereço, data e horário desejados, além de poder anexar imagens. Após o envio, a solicitação é registrada e pode ser acompanhada em um painel, onde o cliente visualiza o status em tempo real, acessa o histórico de atualizações e consulta os detalhes do atendimento. Dessa forma, o processo se torna mais organizado, transparente e eficiente, proporcionando maior controle, segurança e praticidade ao cliente durante toda a jornada do serviço.


![!\[Processo 3\](<images/Solicitar Serviços (1).svg>)](images/SolicitarServiços.svg)

#### Detalhamento das atividades

**Preencher solicitação**

| Campo                 | Tipo           | Restrições                                   |
| --------------------- | -------------- | -------------------------------------------- |
| Tipo de serviço       | Seleção única  | obrigatório (ex: elétrico, hidráulico, etc.) |
| Descrição do problema | Área de texto  | mínimo de 20 caracteres, máximo de 500       |
| Endereço do serviço   | Caixa de texto | CEP válido, logradouro e número              |
| Horário desejado      | Hora           | dentro do horário de operação da plataforma  |
| Fotos do problema     | Imagem         | opcional, JPG ou PNG, até 3 imagens          |


| Comando            | Destino                        | Tipo    |
| ------------------ | ------------------------------ | ------- |
| Enviar solicitação | Enviar solicitação (confirmar) | default |
| Cancelar           | Painel do cliente              | cancel  |

---

**Enviar solicitação**

Tela de revisão e confirmação antes de submeter a solicitação à plataforma.

| **Campo**           | **Tipo**       | **Restrições**     | 
| ---                 | ---            | ---                | 
| Resumo da solicitação | Área de texto | somente leitura   |                 
| Confirmação         | Seleção única  | Confirmar / Editar |               

| **Comandos**    | **Destino**                        | **Tipo**  |
| ---             | ---                                | ---       |
| Confirmar       | Registrar solicitação (sistema)    | default   |
| Editar          | Preencher solicitação              | cancel    |

---

**Listar solicitações**

Painel de acompanhamento de todas as solicitações do cliente.

| Campo                 | Tipo           | Restrições                                          |
| --------------------- | -------------- | --------------------------------------------------- |
| Lista de solicitações | Tabela         | somente leitura                                     |
| ID da solicitação     | Caixa de texto | somente leitura                                     |
| Tipo de serviço       | Caixa de texto | somente leitura                                     |
| Status                | Caixa de texto | somente leitura (aceita / em andamento / concluída) |
| Data de criação       | Data           | somente leitura                                     |

                                                  
| Comando          | Destino               |
| ---------------- | --------------------- |
| Filtrar          | Filtrar resultados    |
| Ver detalhes     | Ver detalhes          |
| Nova solicitação | Preencher solicitação |


---

**Filtrar resultados**

| Campo           | Tipo             | Restrições                                        | Valor |
| --------------- | ---------------- | ------------------------------------------------- | ----- |
| Status          | Seleção múltipla | aberta / em andamento / concluída / recusada      | todos |
| Data inicial    | Data             | anterior ou igual à data final                    |       |
| Data final      | Data             | posterior ou igual à data inicial                 |       |
| Tipo de serviço | Seleção única    | todos / elétrico / hidráulico / manutenção / etc. | todos |


| Comando        | Destino             | Tipo    |
| -------------- | ------------------- | ------- |
| Aplicar        | Listar solicitações | default |
| Limpar filtros | Listar solicitações | cancel  |


---

**Ver detalhes**

| Campo                     | Tipo           | Restrições      | Valor |
| ------------------------- | -------------- | --------------- | ----- |
| ID da solicitação         | Caixa de texto | somente leitura |       |
| Status atual              | Caixa de texto | somente leitura |       |
| Nome do prestador         | Caixa de texto | somente leitura |       |
| Avaliação do prestador    | Número         | 0 a 5 estrelas  |       |
| Histórico de atualizações | Tabela         | somente leitura |       |
| Data e hora do serviço    | Data e Hora    | somente leitura |       |


| **Comandos**        | **Destino**           | **Tipo**  |
| ---                 | ---                   | ---       |
| Voltar              | Listar solicitações   | cancel    |
