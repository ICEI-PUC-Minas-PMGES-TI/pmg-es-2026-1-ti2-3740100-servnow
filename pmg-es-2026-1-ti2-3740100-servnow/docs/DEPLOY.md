# Deploy e infraestrutura — ServNow

Visão geral dos arquivos de deploy e onde cada um fica no repositório.

## Mapa de arquivos

| Arquivo | Local | Plataforma |
|---------|-------|------------|
| `render.yaml` | **Raiz do repositório Git** | Render (Blueprint) |
| `src/front/vercel.json` | Root Directory do Vercel | Vercel (SPA rewrites) |
| `src/front/vite.config.ts` | App React/Vite | Dev local + build |
| `src/front/.env.example` | App React/Vite | Variáveis de ambiente |
| `src/front/Dockerfile` | App React/Vite | Docker / compose local |
| `src/front/docker/nginx.conf` | Container do front | Nginx no Docker |
| `src/backend/Dockerfile` | App Spring Boot | Render + compose local |
| `deploy/docker/docker-compose.yml` | Orquestração local | Docker Compose |

## Arquitetura em produção

| Parte | Onde | Como |
|-------|------|------|
| **Frontend** (React/Vite) | **Vercel** | Root Directory = `pmg-es-2026-1-ti2-3740100-servnow/src/front`, env `VITE_API_URL` |
| **Backend** (Spring Boot) | **Render** | Blueprint (`render.yaml` na raiz do repo) com Docker |
| **Banco de dados** | **Supabase** | Config em `application.properties` |

URLs atuais:

- Front: https://pmg-es-2026-1-ti2-3740100-servnow.vercel.app
- Back: https://servnow-backend.onrender.com

## Backend no Render

1. Render → **New +** → **Blueprint** → conecta este repositório.
2. O Render lê o `render.yaml` (na raiz do repo) e cria o serviço `servnow-backend` (Docker).
3. Deploy. A URL fica tipo `https://servnow-backend.onrender.com`.

O backend respeita a porta do host via `server.port=${PORT:8080}` e o CORS já libera
`*.vercel.app` e `*.onrender.com` por padrão (ver `CorsConfig.java`).

## Frontend no Vercel

1. Vercel → **Add New** → **Project** → importa o repositório.
2. **Root Directory:** `pmg-es-2026-1-ti2-3740100-servnow/src/front`
3. Framework: **Vite** (detectado automaticamente).
4. **Environment Variables:** `VITE_API_URL` = URL do backend (ex.: `https://servnow-backend.onrender.com`).
5. Deploy.

O `vercel.json` cuida do roteamento SPA (todas as rotas caem no `index.html`).

> O `VITE_API_URL` é "assado" no build. Se mudar a URL do backend, faça um novo deploy do front.

## Docker local

```bash
cd pmg-es-2026-1-ti2-3740100-servnow
docker compose up --build
```

Ou com caminho explícito:

```bash
docker compose -f pmg-es-2026-1-ti2-3740100-servnow/deploy/docker/docker-compose.yml up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080

## Variáveis de ambiente

| Variável | Onde | Para que serve |
|----------|------|----------------|
| `VITE_API_URL` | Front (build) | URL pública do backend |
| `APP_CORS_ALLOWED_ORIGINS` | Back (runtime) | Domínios extras no CORS (vírgula). Normalmente não precisa. |
| `APP_JWT_SECRET` | Back (runtime) | Segredo do JWT (default em `application.properties`). |
