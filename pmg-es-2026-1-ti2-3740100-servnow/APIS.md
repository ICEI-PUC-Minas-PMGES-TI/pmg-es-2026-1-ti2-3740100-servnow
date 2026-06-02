# Código do projeto — ServNow

- **Como rodar:** [InstruçõesparaRodar.md](./InstruçõesparaRodar.md)
- **Backend:** `backend/` (Spring Boot, porta **8080**)
- **Front:** `front/` (React + Vite, porta **5173**)

Todas as rotas abaixo exigem autenticação JWT (`Authorization: Bearer <token>`), exceto `/api/auth/register` e `/api/auth/login`.

Base URL local: `http://localhost:8080`

---

## Autenticação — `/api/auth`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/register` | Cadastra novo usuário (cliente ou prestador) e retorna token JWT. |
| `POST` | `/api/auth/login` | Autentica com e-mail e senha; retorna token JWT. |
| `GET` | `/api/auth/me` | Retorna dados do usuário logado (perfil resumido, URLs de fotos, horários do prestador, etc.). |

---

## Perfil — `/api/perfil`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/perfil` | Busca perfil do usuário autenticado. |
| `GET` | `/api/perfil/cliente` | Busca perfil no fluxo de cliente. |
| `GET` | `/api/perfil/prestador` | Busca perfil no fluxo de prestador. |
| `GET` | `/api/perfil/publico/{id}` | Perfil público de outro usuário (ex.: prestador na proposta). |
| `GET` | `/api/perfil/avaliacoes-recebidas` | Lista avaliações recebidas e média (cliente ou prestador). |
| `PUT` | `/api/perfil` | Atualiza perfil (JSON ou `multipart` com fotos/documento). |
| `PUT` | `/api/perfil/cliente` | Atualiza perfil do cliente (JSON ou `multipart`). |
| `PUT` | `/api/perfil/prestador` | Atualiza perfil do prestador (JSON ou `multipart`). |
| `PUT` | `/api/perfil/cliente/cadastros` | Sincroniza endereços/cadastros extras do cliente. |
| `POST` | `/api/perfil/cliente/enderecos/{id}/foto` | Envia foto de um endereço do cliente (`multipart`). |
| `GET` | `/api/perfil/cliente/enderecos/{id}/foto` | Baixa a foto do endereço (bytes; Supabase Storage ou disco). |
| `GET` | `/api/perfil/foto-perfil` | Baixa a foto de perfil do usuário logado. |
| `GET` | `/api/perfil/publico/{id}/foto-perfil` | Baixa a foto de perfil pública de outro usuário. |
| `GET` | `/api/perfil/foto-local` | Baixa a foto do local/atendimento do prestador. |
| `GET` | `/api/perfil/documento-identidade` | Baixa o documento de identidade do prestador (PDF/imagem). |

**Upload de arquivos:** fotos e documentos são gravados no **Supabase Storage** (bucket configurado em `application.properties`) ou em disco local quando `app.storage.provider=local`.

---

## Solicitações de serviço — `/api/solicitacoes`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/solicitacoes` | Cliente cria solicitação (JSON ou `multipart` com `dados` + `imagem` opcional). |
| `GET` | `/api/solicitacoes/cliente` | Lista todas as solicitações do cliente logado. |
| `GET` | `/api/solicitacoes/prestador` | Lista solicitações **publicadas** disponíveis para o prestador (com distância quando possível). |
| `GET` | `/api/solicitacoes/cliente/agendadas` | Lista solicitações do cliente com status **AGENDADA** (prestador já definido). |
| `GET` | `/api/solicitacoes/prestador/agendadas` | Lista solicitações **AGENDADA** do prestador logado. |
| `GET` | `/api/solicitacoes/cliente/pagas` | Lista serviços do cliente com **pagamento confirmado** (ganhos/gastos no painel). |
| `GET` | `/api/solicitacoes/prestador/pagas` | Lista serviços do prestador com **pagamento confirmado** (gráfico de ganhos). |
| `GET` | `/api/indicadores/prestador?periodo=mes\|semana` | Indicadores do prestador: ganhos, efetividade, participação na plataforma e por tipo de serviço. |
| `PUT` | `/api/solicitacoes/{id}` | Cliente edita solicitação (JSON ou `multipart`; parâmetro `removerImagem`). |
| `DELETE` | `/api/solicitacoes/{id}` | Cliente exclui solicitação (se permitido pelo status). |
| `GET` | `/api/solicitacoes/{id}/imagem` | Baixa a imagem anexada à solicitação. |

---

## Propostas — `/api/propostas`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/propostas` | Prestador envia proposta (valor, prazo) para uma solicitação. |
| `GET` | `/api/propostas/cliente` | Cliente lista propostas recebidas nas suas solicitações. |
| `GET` | `/api/propostas/prestador` | Prestador lista propostas que ele enviou. |
| `POST` | `/api/propostas/{id}/aceitar` | Cliente aceita proposta → solicitação fica **AGENDADA** e valor aceito é definido. |
| `POST` | `/api/propostas/{id}/recusar` | Cliente recusa a proposta. |

---

## Acompanhamento do serviço — `/api/acompanhamento`

Fluxo após a solicitação estar agendada: ordem de serviço, código de chegada, execução, pagamento e avaliações.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/acompanhamento/disponiveis` | Lista serviços em andamento disponíveis para acompanhar (cliente/prestador). |
| `GET` | `/api/acompanhamento/{solicitacaoId}` | Detalhe da ordem de serviço (etapa, código, atualizações, valores). |
| `POST` | `/api/acompanhamento/{solicitacaoId}/iniciar` | Prestador inicia o serviço e gera código de verificação de chegada. |
| `POST` | `/api/acompanhamento/{solicitacaoId}/renovar-codigo` | Renova o código de chegada (expiração). |
| `POST` | `/api/acompanhamento/{solicitacaoId}/verificar-identidade` | Prestador registra verificação facial (`similaridade` 0–100, calculada no navegador). |
| `POST` | `/api/acompanhamento/{solicitacaoId}/confirmar-chegada` | Prestador informa o código do cliente → confirma chegada (exige verificação facial se habilitada). |
| `POST` | `/api/acompanhamento/{solicitacaoId}/atualizacoes` | Prestador registra atualização do serviço (`descricao` + `foto` opcional). |
| `POST` | `/api/acompanhamento/{solicitacaoId}/concluir-execucao` | Prestador marca execução como concluída → etapa de pagamento. |
| `POST` | `/api/acompanhamento/{solicitacaoId}/solicitar-reagendamento` | Solicita reagendamento (nova data/observação). |
| `POST` | `/api/acompanhamento/{solicitacaoId}/confirmar-reagendamento` | Confirma reagendamento acordado. |
| `POST` | `/api/acompanhamento/{solicitacaoId}/selecionar-metodo-pagamento` | Cliente escolhe método (Pix, cartão, dinheiro) antes de confirmar. |
| `POST` | `/api/acompanhamento/{solicitacaoId}/confirmar-pagamento` | Cliente confirma pagamento → libera avaliações; entra no resumo financeiro (`/pagas`). |
| `GET` | `/api/acompanhamento/{solicitacaoId}/pix-qrcode` | Gera imagem PNG do QR Code Pix (prestador). |
| `GET` | `/api/acompanhamento/{solicitacaoId}/pix-copia-cola` | Retorna payload Pix copia e cola (texto). |
| `POST` | `/api/acompanhamento/{solicitacaoId}/avaliar` | Cliente avalia o prestador (nota e comentário). |
| `POST` | `/api/acompanhamento/{solicitacaoId}/avaliar-cliente` | Prestador avalia o cliente. |
| `GET` | `/api/acompanhamento/{solicitacaoId}/atualizacoes/{atualizacaoId}/foto` | Baixa foto de uma atualização do acompanhamento. |

Quando cliente e prestador avaliam, a solicitação passa para status **CONCLUIDA**.

---

## Indicadores — `/api/indicadores`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/indicadores/prestador?periodo=mes` | Ganhos próprios, efetividade, participação na plataforma e por tipo de serviço (últimos 6 meses). |
| `GET` | `/api/indicadores/prestador?periodo=semana` | Mesmos indicadores para a semana atual (por dia). |

---

## Notificações — `/api/notificacoes`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/notificacoes` | Lista notificações do usuário logado. |
| `GET` | `/api/notificacoes/resumo` | Resumo (total, não lidas). |
| `PATCH` | `/api/notificacoes/{id}/lida` | Marca uma notificação como lida. |
| `PATCH` | `/api/notificacoes/lidas` | Marca todas como lidas. |

---

## Resumo das APIs mais usadas no painel

| Uso no front | API |
|--------------|-----|
| Login / cadastro | `POST /api/auth/login`, `POST /api/auth/register` |
| Início cliente — gastos do mês | `GET /api/solicitacoes/cliente/pagas` |
| Início cliente — próximo serviço | `GET /api/solicitacoes/cliente/agendadas` |
| Início prestador — ganhos do mês | `GET /api/solicitacoes/prestador/pagas` |
| Gráfico de ganhos e indicadores | `GET /api/indicadores/prestador?periodo=mes` ou `semana` |
| Agenda | `GET /api/solicitacoes/cliente/agendadas` ou `/prestador/agendadas` |
| Fotos de perfil/solicitação | `GET /api/perfil/...`, `GET /api/solicitacoes/{id}/imagem` |

---



