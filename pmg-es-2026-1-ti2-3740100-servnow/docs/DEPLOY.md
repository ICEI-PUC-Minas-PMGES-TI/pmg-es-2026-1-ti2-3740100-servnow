# Deploy e infraestrutura — ServNow

Projeto hospedado: https://pmg-es-2026-1-ti2-3740100-servnow.vercel.app

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


