# Documentação — ServNow

Índice central da documentação do projeto.

## Guias

| Documento | Conteúdo |
|-----------|----------|
| [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) | Instalar dependências e rodar localmente |
| [DEPLOY.md](./DEPLOY.md) | Deploy em produção (Vercel, Render, Docker) |
| [APIS.md](./APIS.md) | Rotas da API REST do backend |
| [ORIENTACOES_PROJETO.md](./ORIENTACOES_PROJETO.md) | Logins de teste e padrões de commit |

## Código-fonte

| Pasta | Descrição |
|-------|-----------|
| [`../src/backend/`](../src/backend/) | API Spring Boot (porta 8080) |
| [`../src/front/`](../src/front/) | App React + Vite (porta 5173) |

## Configuração por ambiente

| Arquivo | Uso |
|---------|-----|
| `src/front/vite.config.ts` | Dev server e build Vite |
| `src/front/vercel.json` | Deploy Vercel (SPA) |
| `src/front/.env.example` | Variáveis locais (`VITE_API_URL`) |
| `src/front/Dockerfile` + `src/front/docker/nginx.conf` | Container do front |
| `src/backend/Dockerfile` | Container do back (Render + Docker local) |
| `deploy/docker/docker-compose.yml` | Orquestração local |
| `render.yaml` (raiz do repo Git) | Blueprint Render |
