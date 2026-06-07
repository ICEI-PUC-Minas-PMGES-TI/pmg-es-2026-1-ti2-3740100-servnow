# Deploy do ServNow

Arquitetura em produção:

| Parte | Onde | Como |
|-------|------|------|
| **Frontend** (React/Vite) | **Vercel** | Importar o repo, Root Directory = `pmg-es-2026-1-ti2-3740100-servnow/src/front`, env `VITE_API_URL` = URL do backend |
| **Backend** (Spring Boot) | **Render** | Blueprint (`render.yaml`) com Docker |
| **Banco de dados** | **Supabase** | Já hospedado (config no `application.properties`) |

URLs atuais:
- Front: https://pmg-es-2026-1-ti2-3740100-servnow.vercel.app
- Back: https://servnow-backend.onrender.com

## Backend no Render (Blueprint)

1. Render → **New +** → **Blueprint** → conecta este repositório.
2. O Render lê o `render.yaml` (na raiz) e cria o serviço `servnow-backend` (Docker).
3. Deploy. A URL fica tipo `https://servnow-backend.onrender.com`.

O backend respeita a porta do host via `server.port=${PORT:8080}` e o CORS já libera
`*.vercel.app` e `*.onrender.com` por padrão (ver `CorsConfig.java`).

> Plano free: o backend "dorme" após 15 min parado; o primeiro acesso demora ~50s
> (cold start) e depois fica rápido.

## Frontend no Vercel

1. Vercel → **Add New** → **Project** → importa o repositório.
2. **Root Directory:** `pmg-es-2026-1-ti2-3740100-servnow/src/front`
3. Framework: **Vite** (detectado automaticamente).
4. **Environment Variables:** `VITE_API_URL` = URL do backend (ex.: `https://servnow-backend.onrender.com`).
5. Deploy.

O `vercel.json` (em `src/front`) cuida do roteamento SPA (todas as rotas caem no `index.html`).

> Importante: o `VITE_API_URL` é "assado" no build. Se mudar a URL do backend, faça um
> novo deploy do front.

## Rodar localmente com Docker (opcional)

Há também `Dockerfile` no back e no front + `docker-compose.yml` para subir tudo em
containers localmente:

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080

## Variáveis de ambiente úteis

| Variável | Onde | Para que serve |
|----------|------|----------------|
| `VITE_API_URL` | Front (build) | URL pública do backend |
| `APP_CORS_ALLOWED_ORIGINS` | Back (runtime) | Domínios extras no CORS (separados por vírgula). Normalmente não precisa, pois `*.vercel.app` e `*.onrender.com` já são liberados. |
| `APP_JWT_SECRET` | Back (runtime) | Segredo do JWT (tem default no `application.properties`). |
