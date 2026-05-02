# 6. Interface do sistema

_Visão geral da interação do usuário por meio das telas do sistema. Abaixo são apresentadas as principais interfaces da plataforma ServNow._


## 6.1. Tela principal do sistema

Na tela da Home Page, serão apresentadas informações gerais sobre a plataforma, explicando de forma clara como ela funciona e qual é o seu propósito.

Também serão exibidas as principais categorias de serviços disponíveis, destacando os tipos de atividades nas quais os prestadores podem se cadastrar e atuar.

Além disso, a página contará com uma seção dedicada às vantagens da plataforma, evidenciando seus benefícios tanto para clientes quanto para prestadores de serviço.

Por fim, serão exibidos feedbacks e avaliações de clientes, com o objetivo de gerar confiança e demonstrar a qualidade dos serviços oferecidos.

![ Home page)](<images/design/homepage (1).jpg>)

---
## 6.1.2 Tela  de Login
![Tela login](images/design/telalogin.png)


## 6.2. Telas do processo 1 — Gestão de Clientes

_As telas referentes ao processo de Gestão de Clientes serão adicionadas nesta seção._

### 6.2.1. Tela de cadastro de cliente

![Cadastro cliente](images/design/telacadastrocliente.png)

Tela destinada ao cadastro de novos  clientes na plataforma ServNow. Nela, o cliente informa seus dados pessoais (nome, CPF, e-mail, telefone e CEP), e define sua senha de acesso. O layout segue o padrão visual da plataforma, com uma seção ilustrativa à esquerda reforçando os benefícios de se tornar um cliente e o formulário de cadastro à direita. O usuário também pode alternar entre as opções "Sou cliente" e "Sou prestador" no topo do formulário.

### 6.2.2. Tela de configuração de perfil !

![Configurar perfil cliente](images/design/Painel(cliente).jpeg)

Visão do Cliente
Tela de configuração de perfil do cliente. Permite inserir nome completo, endereço detalhado (rua, número, CEP, bairro, cidade e estado) e uma foto do local/endereço. Ao final, o botão "Salvar alterações" confirma as informações cadastradas.



---

## 6.3. Telas do processo 2 — Gestão de Prestadores

_Telas referentes ao processo de cadastro, login e gerenciamento do prestador de serviços na plataforma._


### 6.3.1. Tela de cadastro do prestador

Tela destinada ao cadastro de novos prestadores na plataforma ServNow. Nela, o profissional informa seus dados pessoais (nome, CPF, e-mail, telefone e CEP), seleciona sua área de atuação (eletricista, encanador, pintor, etc.) e define sua senha de acesso. O layout segue o padrão visual da plataforma, com uma seção ilustrativa à esquerda reforçando os benefícios de se tornar um prestador e o formulário de cadastro à direita. O usuário também pode alternar entre as opções "Sou cliente" e "Sou prestador" no topo do formulário.

![Tela cadastro prestador](images/design/telacadastroprestador.png)


### 6.2.2. Tela de configuração de perfil 

![Configurar perfil prestador](images/design/Perfil(prestador).jpeg)

Tela de configuração de perfil do prestador de serviço. Além do nome completo, o prestador preenche uma descrição profissional destacando sua experiência e especialidades, e seleciona os tipos de serviço que realiza (como Elétrico, Hidráulico, Limpeza, Pintura, entre outros). O botão "Salvar alterações" confirma o perfil.

---


## 6.4. Telas do processo 3 — Solicitação de Serviço


### 6.4.1. Painel do cliente

![Painel CLiente](images/design/Painel(cliente).jpeg)


Após a aprovação do cadastro e do login, o cliente é direcionado ao seu painel de controle. O painel apresenta um resumo das solicitações (solicitações publicadas por ele, solicitações concluídas e gastos mensais).

Na seção central, o cliente pode visualizar e filtrar suas solicitações por status, como concluídas, aguardando aceite e com data mais recente , além de criar novas solicitações.

O painel também permite acesso ao gerenciamento do perfil do cliente 


### 6.4.2. Tela de nova solicitação

![Criar solicitação](images/design/Solicitação.jpeg)
colocar pagamento e descrever 

### 6.3.3. Painel do prestador

![Painel do prestador](images/design//figma-tela-prestador.png)

Após a aprovação do cadastro e login, o prestador é direcionado ao seu painel de controle. O painel apresenta um resumo das principais informações do profissional, incluindo indicadores de desempenho (solicitações novas, serviços concluídos no mês, ganhos acumulados e avaliação média). Na seção central, o prestador pode visualizar e filtrar as solicitações de clientes por proximidade, valor, data ou urgência, com informações detalhadas sobre cada serviço, podendo recusar ou aceitar solicitações. O painel também exibe o histórico de serviços recentes e a barra lateral permite acesso ao gerenciamento do perfil profissional 






## 6.5. Telas do processo 4 — Acompanhamento do serviço 


### 6.5.1. Tela de confirmação de chegada do prestador

Esta tela tem como objetivo validar a chegada do prestador ao local do cliente de forma segura, utilizando um código de verificação de 4 dígitos. Após aceitar o serviço, o cliente visualiza um código único gerado automaticamente, com validade limitada, que deve ser informado ao prestador no momento da chegada. Ao chegar ao local, o prestador acessa a tela de confirmação de chegada e insere o código fornecido pelo cliente, garantindo que o serviço só seja iniciado com a presença física confirmada no local correto. Após a validação correta do código, o sistema libera automaticamente o início do serviço, avançando o fluxo para a próxima etapa.

Visão do Prestador
![Codigo Prestador](images/design/Codigoprestador.png)



Visão do Cliente 
![Codigo Cliente](images/design/Codigocliente.png)


### 6.5.2. Tela de acompanhamento da ordem de Serviço 


Visão do Cliente
![Acompanhar serviço-Cliente](images/design/Acompanhar(cliente).png)
Tela onde o cliente acompanha um serviço concluído. Exibe as atualizações enviadas pelo prestador com fotos e descrições do trabalho realizado. Inclui uma seção de avaliação do prestador com estrelas e comentário opcional, e uma seção de pagamento onde o cliente escolhe a forma de pagamento (PIX, Cartão de Crédito ou Débito) e confirma o valor do serviço.



Visão do Prestador 
![Acompanhar serviço-Prestador](images/design/Acompanhar(prestador).jpeg)
Tela onde o prestador de serviço acompanha e gerencia um serviço em andamento. Exibe o nome do serviço, o cliente, horário de início e previsão de término. O prestador pode enviar atualizações em texto e fotos sobre o progresso do trabalho, além de visualizar o histórico de atualizações já enviadas anteriormente.

