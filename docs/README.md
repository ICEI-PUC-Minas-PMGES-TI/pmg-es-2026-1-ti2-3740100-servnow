# ServNow

![Logotipo ServNow](images/design/logo_ServNow.jpeg)

**Fábio Garcia Martins, 676102@sga.pucminas.br**

**Gabriel Henrique Fernandes Vieira, 1564418@sga.pucminas.br**

**Lucas Silva Borges, 1598846@sga.pucminas.br**

---
Professores:

** Lucca Soares de Paiva Lacerda 

** Michelle Hanne Soares de Andrade **

** Luiz Carlos da Silva **

---

_Curso de Engenharia de Software_

_Instituto de Informática e Ciências Exatas – Pontifícia Universidade Católica de Minas Gerais (PUC MINAS), Belo Horizonte – MG – Brasil_

---

_**Resumo**. A contratação de serviços residenciais no Brasil ocorre, em grande parte, de forma informal, dependendo de indicações pessoais e contatos sem qualquer mecanismo de padronização, histórico ou segurança. Este trabalho apresenta o desenvolvimento da ServNow, uma plataforma web de intermediação de serviços residenciais sob demanda, que conecta clientes a prestadores autônomos como eletricistas, encanadores e pintores. O sistema foi desenvolvido com front-end em React e back-end em Java com Spring Boot, contemplando cadastro diferenciado por perfil, geolocalização, envio e negociação de propostas, verificação de identidade do prestador, acompanhamento do atendimento em tempo real, processamento de pagamentos via PIX e cartão, e avaliação mútua entre as partes. Como resultado, foi implementada uma solução funcional e integrada, cobrindo de ponta a ponta o ciclo de contratação de um serviço residencial, validada por meio de testes automatizados e hospedada em ambiente de produção, demonstrando a viabilidade técnica da proposta para reduzir a informalidade do setor._

---


## 1. Introdução

O presente projeto propõe o desenvolvimento de um sistema digital de intermediação de serviços residenciais sob demanda, conectando clientes a prestadores de serviços, como eletricistas, encanadores e profissionais de manutenção em geral. A plataforma busca proporcionar mais praticidade, segurança, agilidade e organização no processo de prestação de serviços domésticos.

### 1.1 Contextualização

Com o avanço da tecnologia e a popularização de plataformas digitais de serviços sob demanda, como aplicativos de transporte e entrega, tornou-se cada vez mais comum a utilização de sistemas digitais como intermediadores entre clientes e prestadores de serviços. Essas plataformas contribuíram significativamente para tornar os processos mais rápidos, acessíveis, organizados e seguros.

Entretanto, muitos serviços residenciais ainda são contratados de maneira informal. Pequenos reparos domésticos, serviços hidráulicos, instalações elétricas, desentupimentos, montagem de móveis e manutenções em geral normalmente dependem de indicações de conhecidos, grupos em redes sociais ou contatos realizados diretamente por aplicativos de mensagens.

Esse modelo informal apresenta diversas limitações, como a dificuldade em encontrar profissionais confiáveis e disponíveis, ausência de padronização de preços, falta de avaliações sobre os prestadores e insegurança ao permitir a entrada de um profissional desconhecido na residência do cliente. Além disso, a comunicação e o agendamento dos serviços costumam ocorrer de forma manual, aumentando as chances de atrasos, falhas de comunicação e desencontros entre as partes.

Diante desse cenário, surge a necessidade de uma plataforma digital capaz de conectar clientes e prestadores de serviços residenciais de maneira prática, segura e organizada. O sistema proposto permitirá a solicitação de serviços, acompanhamento do atendimento, avaliação dos profissionais e gerenciamento das ordens de serviço de forma centralizada.

### 1.2 Problema

Atualmente, a contratação de profissionais para serviços residenciais enfrenta diversos desafios que comprometem a experiência do cliente e dificultam a profissionalização do setor. Entre os principais problemas identificados, destacam-se:

-Dificuldade em encontrar profissionais confiáveis e disponíveis rapidamente;
-Falta de transparência em relação a preços, prazos e qualidade do serviço;
-Ausência de histórico, avaliações e reputação dos prestadores;
-Dependência de processos manuais de contato, como telefone, mensagens ou indicações;
-Falta de organização no acompanhamento dos serviços solicitados;
-Insegurança do cliente ao permitir a entrada de profissionais desconhecidos em sua residência.

Esses fatores tornam a contratação de serviços residenciais pouco prática, menos segura e frequentemente desorganizada.

### 1.3 Objetivo geral

Desenvolver um sistema digital Sass de intermediação de serviços residenciais sob demanda, conectando clientes a prestadores de serviços, , proporcionando maior praticidade, segurança, confiabilidade e organização.

#### 1.3.1 Objetivos específicos

-Desenvolver uma plataforma digital para cadastro e gerenciamento de clientes e prestadores de serviços;
-Permitir a solicitação, acompanhamento e conclusão de serviços residenciais;
-Implementar um sistema de avaliação dos prestadores após a finalização do atendimento;
-Vincular a conclusão do serviço ao processo de pagamento e avaliação final;
-Implementar funcionalidades de gestão para os prestadores, incluindo histórico de serviços, média de preços, demandas recebidas e solicitações em andamento;
-Implementar funcionalidades de gestão para os clientes, permitindo acompanhar serviços solicitados, em análise, aceitos e concluídos;
-Implementar mecanismos de segurança, como validação de identidade do prestador por meio de código de confirmação no momento da chegada ao local do atendimento;
-Desenvolver mecanismos de organização e acompanhamento das ordens de serviço.

### 1.4 Justificativas

O desenvolvimento de um sistema de prestação de serviços residenciais sob demanda se justifica pela necessidade de modernizar, organizar e profissionalizar um mercado que ainda opera, em grande parte, de maneira informal.

Para os clientes, a plataforma proporcionará maior praticidade na contratação de serviços, mais rapidez no atendimento, maior segurança durante o processo e melhor previsibilidade de custos. Além disso, o sistema permitirá a escolha de profissionais com base em avaliações e histórico de serviços realizados.

Para os prestadores de serviço, a plataforma oferecerá maior visibilidade, melhor organização da agenda, ampliação da carteira de clientes e centralização do gerenciamento de demandas e pagamentos.

### Prestador de serviço

## 2. Participantes do processo
Cliente
Usuário que solicita serviços residenciais por meio da plataforma. Ele descreve o problema, informa o local e horário desejado e avalia o profissional após a conclusão do serviço.

Prestador de Serviço
Profissional responsável por executar os serviços solicitados, como eletricista, encanador, montador de móveis ou técnico de manutenção. Ele pode aceitar ou recusar solicitações e receber avaliações dos clientes.

## 3. Modelagem do processo de negócio

### 3.1. Análise da situação atual

No modelo tradicional de contratação de serviços residenciais, observa-se a ausência de um sistema centralizado capaz de organizar, registrar e acompanhar as solicitações realizadas pelos clientes. Atualmente, a contratação de profissionais ocorre, em grande parte, de maneira informal, por meio de indicações, redes sociais, aplicativos de mensagens ou contatos telefônicos.

Nesse cenário, não existe um ponto central de controle sobre os serviços solicitados, orçamentos realizados, atendimentos executados ou pagamentos efetuados. O cliente frequentemente entra em contato com diversos profissionais simultaneamente, sem possuir mecanismos padronizados para comparação de preços, qualidade ou reputação dos prestadores.

Da mesma forma, os profissionais dependem principalmente de indicações e contatos informais para conseguir novos serviços, não dispondo de uma plataforma estruturada para gerenciamento de agenda, histórico de atendimentos e organização de demandas.

Outro problema identificado é a ausência de um sistema confiável de avaliações e reputação, dificultando que os clientes tomem decisões baseadas na experiência de outros usuários. Além disso, a comunicação entre cliente e prestador ocorre de forma manual, aumentando a possibilidade de atrasos, falhas de comunicação, conflitos de horários e dificuldades no acompanhamento do serviço.

A informalidade presente nesse processo reduz a eficiência da contratação, compromete a segurança das partes envolvidas e dificulta a profissionalização do setor de serviços residenciais.

### 3.2. Descrição geral da proposta de solução

Com o objetivo de solucionar os problemas identificados, o projeto propõe o desenvolvimento de uma plataforma digital de intermediação de serviços residenciais sob demanda, permitindo que clientes e prestadores interajam de forma organizada, segura e centralizada.

Por meio da plataforma, os clientes poderão solicitar serviços residenciais informando o tipo de serviço desejado, descrição do problema, endereço e demais informações necessárias para o atendimento. O sistema utilizará recursos de geolocalização para localizar prestadores próximos e disponíveis, tornando o processo de contratação mais rápido e eficiente.

Os prestadores de serviço receberão as solicitações diretamente na plataforma e poderão aceitar ou recusar os atendimentos conforme sua disponibilidade. Durante o processo, o sistema permitirá o acompanhamento do status da ordem de serviço, desde a solicitação até a conclusão do atendimento.

Após a execução do serviço, o cliente poderá realizar uma avaliação do prestador, contribuindo para a construção de um histórico de reputação dentro da plataforma. Esse mecanismo auxiliará futuros clientes na escolha de profissionais mais confiáveis e qualificados.

Além disso, a solução incluirá mecanismos adicionais de segurança, como validação de identidade do prestador por meio de código de confirmação ou autenticação facial (Face ID) no momento da chegada ao local do atendimento.

O sistema também permitirá maior organização das ordens de serviço, acompanhamento de pagamentos, gerenciamento de histórico de atendimentos e controle das solicitações realizadas, proporcionando maior transparência, praticidade e segurança para ambas as partes envolvidas.

Dessa forma, a solução proposta busca reduzir a informalidade na contratação de serviços residenciais, melhorar a experiência dos usuários e contribuir para a modernização e profissionalização do setor.

### 3.3. Modelagem dos processos

[PROCESSO 1-   Gestao de Clientes ](processo1-gestão-de-clientes.md "Detalhamento do Processo 1.")

[PROCESSO 2-   Gestao de Prestadores ](processo2-gestão-de-prestadores.md "Detalhamento do Processo 2.")

[PROCESSO 3 -   Solicitar Serviço ](processo-3-solicitação-de-serviço.md "Detalhamento do Processo 3.")

[PROCESSO 4 -   Acompanhar Serviço](processo4-acompanhamento-do-serviço.md "Detalhamento do Processo 4.")

## 4. Projeto da solução


[Projeto da solução](solution-design.md "Detalhamento do projeto da solução: modelo relacional e tecnologias.")


## 5. Indicadores de desempenho

Os indicadores de desempenho permitem acompanhar, de forma objetiva, a qualidade e o volume dos serviços mediados pela plataforma. Foram definidos 4 indicadores: Avaliação média, Participação nos Ganhos Totais da Plataforma, Percentual de Efetividade e  Participação nos Ganhos Totais da Plataforma por categoria de serviço


[Indicadores de desempenho dos processos](performance-indicators.md)


## 6. Interface do sistema

A documentação de interface descreve as principais telas do ServNow: cadastro e login, painéis do cliente e do prestador, configuração de perfil, fluxo de solicitação e propostas, confirmação de chegada por código, acompanhamento do serviço em andamento (incluindo pagamento e avaliação) e histórico de serviços. O objetivo é demonstrar como os processos modelados nas seções anteriores se materializam na experiência do usuário. As imagens a seguir mostram as telas já implementadas na versão final da plataforma; o detalhamento completo de cada uma está disponível na documentação de interface.

[Documentação da interface do sistema](interface.md)

### 6.1. Página inicial

Tela de apresentação institucional da plataforma, exibida a visitantes não autenticados.

![Página inicial do ServNow](images/design/Homepage.jpeg)

### 6.2. Cadastro de usuário

Formulário de criação de conta, com alternância entre os perfis de cliente e prestador.

![Tela de cadastro](images/design/Telacadastro.jpeg)

### 6.3. Painel do cliente

Ambiente inicial do cliente após o login, com indicadores resumidos e lista de solicitações.

![Painel do cliente](images/design/Painel_Cliente.jpeg)

### 6.4. Painel do prestador

Ambiente inicial do prestador após o login, com solicitações recebidas e indicadores de desempenho.

![Painel do prestador](images/design/Painel_Prestador.jpeg)

### 6.5. Perfil do cliente

Tela de configuração dos dados pessoais e de endereço do cliente.

![Perfil do cliente](images/design/Perfil_Cliente.jpeg)

### 6.6. Perfil do prestador

Tela de configuração dos dados profissionais do prestador, incluindo especialidades, disponibilidade e raio de atendimento.

![Perfil do prestador](images/design/Perfil_Prestador.jpeg)

### 6.7. Solicitação de serviço

Formulário utilizado pelo cliente para publicar uma nova solicitação de serviço.

![Tela de solicitação de serviço](images/design/SolicitarServiço.jpeg)

### 6.8. Confirmação de chegada por código

Tela de geração e validação do código numérico utilizado para confirmar a chegada do prestador ao endereço do atendimento.

| Visão do cliente | Visão do prestador |
|---|---|
| ![Código de confirmação — cliente](images/design/CodigoCliente.jpeg) | ![Código de confirmação — prestador](images/design/CodigoPrestador.jpeg) |

### 6.9. Acompanhamento do serviço

Tela de acompanhamento da execução do atendimento em tempo real, incluindo avaliação mútua e pagamento.

| Visão do cliente | Visão do prestador |
|---|---|
| ![Acompanhamento do serviço — cliente](images/design/Acompanhamento_Cliente.jpeg) | ![Acompanhamento do serviço — prestador](images/design/Acompanhamento_Prestador.jpeg) |

### 6.10. Histórico de serviços

Tela com o registro de todos os serviços já concluídos, compartilhada entre clientes e prestadores.

![Histórico de serviços](images/design/Historico.jpeg)


## 7. Conclusão

O desenvolvimento da ServNow permitiu validar, na prática, a viabilidade de uma solução digital capaz de estruturar a contratação de serviços residenciais, hoje predominantemente informal. Ao
longo do projeto, foram implementadas com sucesso as funcionalidades centrais definidas nos objetivos específicos: cadastro e gerenciamento diferenciado de clientes e prestadores, publicação
e negociação de solicitações por meio de propostas, acompanhamento do atendimento em tempo real, mecanismos de verificação de identidade do prestador (código de confirmação e reconhecimento
facial), processamento de pagamentos via PIX e cartão, e avaliação mútua ao final do serviço. 
Os resultados obtidos demonstram que a centralização desses processos em uma única plataforma resolve boa parte das limitações identificadas no modelo tradicional de contratação: a
padronização de preços é alcançada por meio do sistema de propostas, a confiabilidade é reforçada pelo histórico de avaliações e pelos mecanismos de verificação de identidade, e a organização do
atendimento passa a ser registrada e rastreável de ponta a ponta, reduzindo a dependência exclusiva de contatos informais.

Do ponto de vista técnico, a separação entre front-end e back-end, integrada por uma API REST bem
definida, mostrou-se adequada para permitir o desenvolvimento paralelo das duas camadas pela
equipe, além de isolar as regras de negócio em módulos coesos por funcionalidade. A adoção de
testes automatizados para os principais serviços de domínio contribuiu para a confiabilidade das
regras implementadas ao longo das diversas iterações do projeto.

# REFERÊNCIAS

_Como um projeto de software não exige revisão bibliográfica extensa, a inclusão de referências não é obrigatória. Caso desejem incluir fontes sobre tecnologias, padrões ou metodologias utilizadas, relacionem-nas conforme a ABNT._

_Verifique no link abaixo o padrão de referências da PUC Minas:_

http://portal.pucminas.br/imagedb/documento/DOC_DSC_NOME_ARQUI20160217102425.pdf

**[1.1]** — ELMASRI, Ramez; NAVATHE, Sham. **Sistemas de banco de dados**. 7. ed. São Paulo: Pearson, c2019. E-book. ISBN 9788543025001.

**[1.2]** — COPPIN, Ben. **Inteligência artificial**. Rio de Janeiro, RJ: LTC, c2010. E-book. ISBN 978-85-216-2936-8.

**[1.3]** — CORMEN, Thomas H. et al. **Algoritmos: teoria e prática**. Rio de Janeiro, RJ: Elsevier, Campus, c2012. xvi, 926 p. ISBN 9788535236996.

**[1.4]** — SUTHERLAND, Jeffrey Victor. **Scrum: a arte de fazer o dobro do trabalho na metade do tempo**. 2. ed. rev. São Paulo, SP: Leya, 2016. 236, [4] p. ISBN 9788544104514.

**[1.5]** — RUSSELL, Stuart J.; NORVIG, Peter. **Inteligência artificial**. Rio de Janeiro: Elsevier, c2013. xxi, 988 p. ISBN 9788535237016.

_Como um projeto de software não requer revisão bibliográfica, a inclusão das referências não é obrigatória. No entanto, caso você deseje incluir referências relacionadas às tecnologias, padrões, ou metodologias que serão usadas no seu trabalho, relacione-as de acordo com a ABNT._

_Verifique no link abaixo como devem ser as referências no padrão ABNT:_

http://portal.pucminas.br/imagedb/documento/DOC_DSC_NOME_ARQUI20160217102425.pdf

**[1.1]** - _ELMASRI, Ramez; NAVATHE, Sham. **Sistemas de banco de dados**. 7. ed. São Paulo: Pearson, c2019. E-book. ISBN 9788543025001._

**[1.2]** - _COPPIN, Ben. **Inteligência artificial**. Rio de Janeiro, RJ: LTC, c2010. E-book. ISBN 978-85-216-2936-8._

**[1.3]** - _CORMEN, Thomas H. et al. **Algoritmos: teoria e prática**. Rio de Janeiro, RJ: Elsevier, Campus, c2012. xvi, 926 p. ISBN 9788535236996._

**[1.4]** - _SUTHERLAND, Jeffrey Victor. **Scrum: a arte de fazer o dobro do trabalho na metade do tempo**. 2. ed. rev. São Paulo, SP: Leya, 2016. 236, [4] p. ISBN 9788544104514._

**[1.5]** - _RUSSELL, Stuart J.; NORVIG, Peter. **Inteligência artificial**. Rio de Janeiro: Elsevier, c2013. xxi, 988 p. ISBN 9788535237016._



# APÊNDICES


## Apêndice A - Código fonte

[\[Código do front-end](../pmg-es-2026-1-ti2-3740100-servnow/src/front)-- repositório do código do front-end

[\[Código do back-end](../pmg-es-2026-1-ti2-3740100-servnow/src/backend)-- repositório do código do back-end


## Apêndice B - Apresentação final


[Slides da apresentação final](presentations/)


[Vídeo da apresentação final](video/)






