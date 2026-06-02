# Deploy do ServNow (Docker)

O projeto está dockerizado: **frontend** (React/Vite servido por nginx) e **backend**
(Spring Boot). O banco já é hospedado no **Supabase** — não precisa subir banco.

## Rodar tudo localmente com Docker

Na pasta que contém o `docker-compose.yml`:

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080

## Variáveis importantes

| Onde | Variável | Para que serve |
|------|----------|----------------|
| Front (build) | `VITE_API_URL` | URL pública do backend. O Vite "assa" essa URL no build, então precisa ser definida **no build** (build arg). |
| Back (runtime) | `APP_CORS_ALLOWED_ORIGINS` | Domínios liberados no CORS, separados por vírgula (ex.: a URL do front hospedado). |

## Hospedar de graça (sugestão: Render)

O backend precisa de Docker; o front pode ir como Static Site ou também via Docker.

### Backend (Web Service / Docker)
1. Render → **New +** → **Web Service** → conecta o repositório do GitHub.
2. **Root Directory:** `pmg-es-2026-1-ti2-3740100-servnow/src/backend`
3. **Runtime:** Docker (ele acha o `Dockerfile` automaticamente).
4. Em **Environment**, adicione:
   - `APP_CORS_ALLOWED_ORIGINS` = a URL do front publicado (ex.: `https://servnow-front.onrender.com`)
5. Deploy. Anote a URL gerada (ex.: `https://servnow-back.onrender.com`).

> Obs.: o backend usa porta 8080. No Render isso funciona direto. Se o host exigir a
> variável `PORT`, dá pra mapear com `server.port=${PORT:8080}` no application.properties.

### Frontend (Web Service / Docker)
1. Render → **New +** → **Web Service** → mesmo repositório.
2. **Root Directory:** `pmg-es-2026-1-ti2-3740100-servnow/src/front`
3. **Runtime:** Docker.
4. Em **Build Arguments** (ou Environment, dependendo do plano), defina:
   - `VITE_API_URL` = a URL do backend publicado (ex.: `https://servnow-back.onrender.com`)
5. Deploy.

### Ordem recomendada
1. Sobe o **backend** primeiro → pega a URL dele.
2. Sobe o **frontend** com `VITE_API_URL` = URL do backend.
3. Volta no **backend** e ajusta `APP_CORS_ALLOWED_ORIGINS` = URL do frontend.

## Observações
- O **limite de 15 conexões** do Supabase continua valendo. Para o backend hospedado
  não brigar com os backends locais do time, vale limitar o pool:
  `spring.datasource.hikari.maximum-pool-size=3` no application.properties.
- A imagem do backend usa `eclipse-temurin:25-jdk`. Dá para trocar o runtime por
  `eclipse-temurin:25-jre` (imagem menor) se o time quiser otimizar.
