# ServNow

**Fábio Garcia Martins, 676102@sga.pucminas.br**

**Gabriel Henrique Fernandes Vieira, 1564418@sga.pucminas.br**

**Lucas Silva Borges, 1598846@sga.pucminas.br**

**Marco Túlio Sales de Deus, 891847@sga.pcuminas.br**

---
Professores:

** ProfLucca Soares de Paiva Lacerda 

** Michelle Hanne Soares de Andrade **

** Luiz Carlos da Silva **

---

_Curso de Engenharia de Software_

_Instituto de Informática e Ciências Exatas – Pontifícia Universidade Católica de Minas Gerais (PUC MINAS), Belo Horizonte – MG – Brasil_

---

_**Resumo**. Escrever aqui o resumo. O resumo deve contextualizar rapidamente o trabalho, descrever seu objetivo e, ao final, 
mostrar algum resultado relevante do trabalho (até 10 linhas)._

---


## 1. Introdução

Um sistema digital de intermediação de serviços residenciais sob demanda, conectando clientes a prestadores como eletricistas, encanadores e profissionais de manutenção, proporcionando praticidade, segurança e organização.

### 1.1 Contextualização

Com o avanço da tecnologia e a popularização de aplicativos de serviços sob demanda, 
como Uber, tornou-se comum a mediação digital entre prestadores de serviços e clientes. 
Plataformas digitais passaram a facilitar o acesso a diferentes tipos de serviços, tornando os 
processos mais rápidos, organizados e seguros. 

Entretanto, muitos serviços do cotidiano  como pequenos reparos residenciais, serviços 
hidráulicos, desentupimento, troca de chuveiro, montagem de móveis e manutenção elétrica 
básica  ainda são contratados de maneira informal. Na maioria das vezes, os clientes dependem 
de indicações de conhecidos, grupos em redes sociais ou contatos diretos por aplicativos de 
mensagens. 

Esse modelo de contratação pode gerar diversos problemas, como dificuldade em 
encontrar profissionais confiáveis, falta de padronização de preços, ausência de avaliações sobre 
o prestador e insegurança ao permitir a entrada de um profissional desconhecido em casa. Além 
disso, a comunicação e o agendamento costumam ocorrer de forma manual, o que pode gerar 
atrasos e desencontros. 

Diante desse cenário, surge a necessidade de um sistema digital que conecte clientes a 
profissionais de manutenção residencial de forma prática, segura e organizada. A proposta do 
projeto é desenvolver uma plataforma que permita solicitar serviços de forma rápida, além de 
avaliar o prestador após a conclusão do serviço.

### 1.2 Problema

Atualmente, a contratação de profissionais para serviços domésticos apresenta diversos desafios: 

• Dificuldade em encontrar profissionais confiáveis e disponíveis 
rapidamente. 

• Falta de transparência quanto a preços e prazos. 

• Ausência de histórico, avaliações e reputação dos prestadores. 

• Processos manuais de contato (telefone, mensagens ou indicações), que 
tornam a experiência do cliente pouco prática. 

• Insegurança do cliente ao permitir a entrada de profissionais desconhecidos 
em sua residência. 

Esses fatores impactam negativamente a experiência do usuário e dificultam a 
profissionalização do setor de prestação de serviços residenciais.

### 1.3 Objetivo geral

Desenvolver um sistema digital de intermediação de serviços residenciais sob demanda, 
conectando clientes a prestadores de serviços como eletricistas, encanadores e profissionais de 
manutenção, proporcionando mais praticidade, segurança e organização no processo de 
solicitação e execução dos serviços.

#### 1.3.1 Objetivos específicos

• Desenvolver uma plataforma digital para cadastro de clientes e prestadores 
de serviços. 

• Permitir a conclusão do serviço após a finalização do atendimento pelo prestador(vinculado a uma avaliação final do serviço e o respectivo pagamento).

• Implementar gestão de prestadores (crud, media de preços de serviços,  historico de serviços, demandas, solicitações de serviço)

• Implementar gestão de clientes( solicitar serviço, serviços em analise, em andamento, aceitos)

• Implementar mecanismos de segurança, como verificação da identidade do 
prestador por código de confirmação  quando o profissional 
chegar ao local para iniciar o serviço.

### 1.4 Justificativas

A criação de um sistema de prestação de serviços residenciais sob demanda se justifica 
pela necessidade de modernizar e organizar um mercado ainda bastante informal. 

Para os clientes, o sistema oferece mais praticidade, rapidez, segurança e previsibilidade 
de custos, além da possibilidade de escolher profissionais com base em avaliações reais de outros 
usuários. 

Para os prestadores de serviço, a plataforma proporciona maior visibilidade, organização 
da agenda e ampliação da carteira de clientes. 

No contexto acadêmico, o projeto permite aplicar conhecimentos de análise de sistemas, 
modelagem de processos, banco de dados e desenvolvimento de aplicações. 


## 2. Participantes do processo
Cliente
Usuário que solicita serviços residenciais por meio da plataforma. Ele descreve o problema, informa o local e horário desejado e avalia o profissional após a conclusão do serviço.

Prestador de Serviço
Profissional responsável por executar os serviços solicitados, como eletricista, encanador, montador de móveis ou técnico de manutenção. Ele pode aceitar ou recusar solicitações e receber avaliações dos clientes.

## 3. Modelagem do processo de negócio

### 3.1. Análise da situação atual

A análise da situação atual permite identificar diversos pontos de atenção e problemas no processo de contratação de serviços residenciais.

Primeiramente, existe dificuldade em localizar profissionais confiáveis e disponíveis rapidamente, pois o processo depende principalmente de indicações informais ou buscas em redes sociais.

Outro problema é a falta de transparência nos valores dos serviços, já que cada profissional define o preço individualmente, sem qualquer referência ou comparação.

Também não existe um sistema estruturado de avaliações e histórico de serviços, o que impede que os clientes tomem decisões baseadas na experiência de outros usuários.

Além disso, a comunicação ocorre de forma manual, por telefone ou aplicativos de mensagens, o que pode gerar atrasos, falhas de comunicação e dificuldades para organizar horários e agendamentos.

Esses fatores tornam o processo atual pouco eficiente, inseguro e pouco profissional.

### 3.2. Descrição geral da proposta de solução

Para solucionar os problemas identificados, o projeto propõe a criação de uma plataforma digital que intermedeie a contratação de serviços residenciais de forma organizada e segura.

Com a utilização do sistema, os clientes poderão solicitar serviços diretamente pela plataforma, informando o tipo de serviço, descrição do problema e localização. O sistema utilizará geolocalização para encontrar prestadores próximos e disponíveis.

Os prestadores de serviço receberão as solicitações e poderão aceitar ou recusar o atendimento. Após a conclusão do serviço, o cliente poderá avaliar o profissional, criando um histórico de reputação dentro da plataforma.

Além disso, o sistema poderá incluir mecanismos de segurança, como verificação da identidade do prestador por meio de código de confirmação ou Face ID quando o profissional chegar ao local.

Dessa forma, a solução proposta busca tornar o processo mais rápido, seguro e organizado, reduzindo a informalidade e melhorando a experiência tanto para clientes quanto para prestadores de serviço.

### 3.3. Modelagem dos processos

[PROCESSO 1 - Finalização de serviço ](processo-1-nome-do-processo.md "Detalhamento do Processo 2.")

[PROCESSO 2 - Gestao de Clientes ](processo-2-nome-do-processo.md "Detalhamento do Processo 2.")

[PROCESSO 3 - Gestao de Prestadores](processo-3-nome-do-processo.md "Detalhamento do Processo 3.")

[PROCESSO 4 - Finalização de serviço](processo-4-nome-do-processo.md "Detalhamento do Processo 4.")

## 4. Projeto da solução

O documento a seguir apresenta o detalhamento do projeto da solução. São apresentadas duas seções que descrevem, respectivamente: modelo relacional e tecnologias._

[Projeto da solução](solution-design.md "Detalhamento do projeto da solução: modelo relacional e tecnologias.")


## 5. Indicadores de desempenho

_O documento a seguir apresenta os indicadores de desempenho dos processos._

[Indicadores de desempenho dos processos](performance-indicators.md)


## 6. Interface do sistema

_A sessão a seguir apresenta a descrição do produto de software desenvolvido._ 

[Documentação da interface do sistema](interface.md)

## 7. Conclusão

_Apresente aqui a conclusão do seu trabalho. Deve ser apresentada aqui uma discussão dos resultados obtidos no trabalho, local em que se verifica as observações pessoais de cada aluno. Essa seção poderá também apresentar sugestões de novas linhas de estudo._

# REFERÊNCIAS

_Como um projeto de software não requer revisão bibliográfica, a inclusão das referências não é obrigatória. No entanto, caso você deseje incluir referências relacionadas às tecnologias, padrões, ou metodologias que serão usadas no seu trabalho, relacione-as de acordo com a ABNT._

_Verifique no link abaixo como devem ser as referências no padrão ABNT:_

http://portal.pucminas.br/imagedb/documento/DOC_DSC_NOME_ARQUI20160217102425.pdf

**[1.1]** - _ELMASRI, Ramez; NAVATHE, Sham. **Sistemas de banco de dados**. 7. ed. São Paulo: Pearson, c2019. E-book. ISBN 9788543025001._

**[1.2]** - _COPPIN, Ben. **Inteligência artificial**. Rio de Janeiro, RJ: LTC, c2010. E-book. ISBN 978-85-216-2936-8._

**[1.3]** - _CORMEN, Thomas H. et al. **Algoritmos: teoria e prática**. Rio de Janeiro, RJ: Elsevier, Campus, c2012. xvi, 926 p. ISBN 9788535236996._

**[1.4]** - _SUTHERLAND, Jeffrey Victor. **Scrum: a arte de fazer o dobro do trabalho na metade do tempo**. 2. ed. rev. São Paulo, SP: Leya, 2016. 236, [4] p. ISBN 9788544104514._

**[1.5]** - _RUSSELL, Stuart J.; NORVIG, Peter. **Inteligência artificial**. Rio de Janeiro: Elsevier, c2013. xxi, 988 p. ISBN 9788535237016._



# APÊNDICES


_Atualizar os links e adicionar novos links para que a estrutura do código esteja corretamente documentada._


## Apêndice A - Código fonte

[Código do front-end](../src/front) -- repositório do código do front-end

[Código do back-end](../src/back)  -- repositório do código do back-end


## Apêndice B - Apresentação final


[Slides da apresentação final](presentations/)


[Vídeo da apresentação final](video/)






