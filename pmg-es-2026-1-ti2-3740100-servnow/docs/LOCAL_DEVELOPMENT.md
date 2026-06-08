# Como rodar o ServNow (primeira vez)

Guia para quem acabou de clonar o projeto.

## Estrutura do projeto

```
pmg-es-2026-1-ti2-3740100-servnow/
├── docs/                      → documentação (este arquivo e demais guias)
├── deploy/
│   └── docker/
│       └── docker-compose.yml → containers locais
└── src/
    ├── backend/               → API Java (Spring Boot), porta 8080
    └── front/                 → site React (Vite), porta 5173
```

Índice da documentação: [README.md](./README.md)

Você precisa de **dois terminais abertos ao mesmo tempo**: um para o backend e outro para o front.

---

## 1. O que instalar antes

| Programa | Versão sugerida | Para quê |
|----------|-----------------|----------|
| [Git](https://git-scm.com/) | qualquer recente | clonar o repositório |
| [Node.js](https://nodejs.org/) | 20 LTS ou superior | rodar o front (`npm`) |
| [Java JDK](https://adoptium.net/) | **25** (igual ao `pom.xml`) | rodar o backend (Maven) |

No Windows, depois de instalar o Java, abra um terminal novo e confira:

```powershell
node -v
java -version
```

---

## 2. Clonar e entrar na pasta

```powershell
git clone <URL_DO_REPOSITORIO>
cd pmg-es-2026-1-ti2-3740100-servnow-1
```

---

## 3. Subir o backend (terminal 1)

```powershell
cd pmg-es-2026-1-ti2-3740100-servnow\src\backend
.\mvnw spring-boot:run
```

Na primeira vez o Maven baixa dependências — pode demorar alguns minutos.

**Deu certo quando aparecer** algo como: `Started BackendApplication` e `Tomcat started on port 8080`.

Teste no navegador: [http://localhost:8080](http://localhost:8080) — pode retornar erro 404 ou “Whitelabel”.
Deixe este terminal **aberto** enquanto usa o sistema.

---

## 4. Subir o front (terminal 2)

Abra **outro** terminal:

```powershell
cd pmg-es-2026-1-ti2-3740100-servnow\src\front
npm install
npm run dev
```

**Deu certo quando aparecer** a URL local, em geral: **http://localhost:5173**

O front chama a API em `http://localhost:8080` (valor padrão de `VITE_API_URL`).

---

## 5. Entrar no sistema (contas de teste)

Use os logins que cadastramos no banco Supabase compartilhado

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Cliente | PerfilCliente@gmail.com | PerfilCliente |
| Prestador | PerfilPrestador@gmail.com | PerfilPrestador |

Mais detalhes: [ORIENTACOES_PROJETO.md](./ORIENTACOES_PROJETO.md)

---

## Rodar localmente com Docker 

```bash
cd pmg-es-2026-1-ti2-3740100-servnow
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080

Deploy em produção: [DEPLOY.md](./DEPLOY.md)
