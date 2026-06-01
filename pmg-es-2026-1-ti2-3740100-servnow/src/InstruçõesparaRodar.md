# Como rodar o ServNow (primeira vez)

Guia para quem acabou de clonar o projeto 

## Estrutura do projeto

```
pmg-es-2026-1-ti2-3740100-servnow/
└── src/
    ├── backend/     → API Java (Spring Boot), porta 8080
    ├── front/       → site React (Vite), porta 5173
    ├── InstruçõesparaRodar.md   → este arquivo
    └── README.md    → documentação das APIs
```

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
cd pmg-es-2026-1-ti2-3740100-servnow\pmg-es-2026-1-ti2-3740100-servnow\src
```

(Ajuste o caminho se a pasta do clone tiver outro nome.)




## 3. Subir o backend (terminal 1)

```powershell
cd src\backend
.\mvnw spring-boot:run
```

Na primeira vez o Maven baixa dependências — pode demorar alguns minutos.

**Deu certo quando aparecer** algo como: `Started BackendApplication` e `Tomcat started on port 8080`.

Teste no navegador: [http://localhost:8080](http://localhost:8080) — pode retornar erro 404 ou “Whitelabel”; 
Deixe este terminal **aberto** enquanto usa o sistema.

---

## 3. Subir o front (terminal 2)

Abra **outro** terminal:

```powershell
cd src\front
npm install
npm run dev
```

**Deu certo quando aparecer** a URL local, em geral:

**http://localhost:5173**

Abra esse endereço no navegador.

O front chama a API em `http://localhost:8080` automaticamente. 

```

---

## 4. Entrar no sistema (contas de teste)

Use os logins que o time já cadastrou no banco Supabase compartilhado, por exemplo:

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Cliente | PerfilCliente@gmail.com | PerfilCliente |
| Prestador | PerfilPrestador@gmail.com | PerfilPrestador |

Se o login falhar, o banco local não está apontando para o mesmo Supabase do time ou o usuário ainda não existe — peça a URL/senha corretas ou cadastre pela tela de registro.

---



## Problemas comuns

### `Port 8080 already in use`

Outro programa (ou outra instância do backend) está usando a porta. Feche o processo antigo ou mude `server.port` no `application.properties`.

### Front abre mas login/API não funciona

- Backend está rodando no terminal 1?
- `application.properties` tem banco e JWT preenchidos?
- No navegador (F12 → Rede), as chamadas vão para `http://localhost:8080`?

### Erro ao enviar foto / Supabase 400

- Nome do bucket no Supabase = `app.storage.supabase.bucket` no properties (ex.: `Imagens`).
- `service-role-key` correta no properties.
- Reinicie o backend depois de alterar o properties.

### Java / Maven não encontrado

Instale o JDK **25** e use um terminal novo. No Windows, `JAVA_HOME` deve apontar para a pasta do JDK.

### `npm install` falha

Use Node 20+ e tente de novo dentro de `src/front`.

---

## Testes do backend (opcional)

```powershell
cd src\backend
.\mvnw test
```

---

## Mais documentação
- **APIs REST:** [README.md](./README.md)
- **Commits:** [Orientações_Projeto.md](../Orientações_Projeto.md)
