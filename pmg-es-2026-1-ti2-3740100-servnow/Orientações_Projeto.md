É necessário ter dois terminais abertos para startar o back e o front.

```
cd pmg-es-2026-1-ti2-3740100-servnow-1\pmg-es-2026-1-ti2-3740100-servnow\src\front
npm run dev
```

```
cd pmg-es-2026-1-ti2-3740100-servnow-1\pmg-es-2026-1-ti2-3740100-servnow\src\backend
.\mvnw spring-boot:run
```
## Logins para testes/desenvolvimento

Perfil cliente  
Nome: Eduardo Costa
PerfilCliente@gmail.com
PerfilCliente

Perfil prestador  
Nome: Sergio Matos
PerfilPrestador@gmail.com  
PerfilPrestador

## Imagens (Supabase Storage)

As fotos ficam no **Supabase Storage** (bucket `servnow`), não no Postgres. O banco guarda só o caminho (ex.: `usuarios/perfil/uuid.jpg`).

1. No [painel Supabase](https://supabase.com/dashboard) → **Storage** → criar bucket **`servnow`** (privado).
2. Em **Project Settings** → **API** → copiar a chave **`service_role`** (não use no front-end).
3. A **service_role** fica em `application.properties` (mesmo arquivo da senha do banco; não vai pro Git — está no `.gitignore`).

4. Reiniciar o backend após alterar a chave.

No **Render**, use a variável `SUPABASE_SERVICE_ROLE_KEY` em vez de commitar a chave.

## Padrões para commit

feat: → nova funcionalidade  
fix: → correção de bug  
refactor: → mudança interna sem alterar comportamento  
chore: → coisas gerais (config, limpeza, etc.)  
docs: → documentação  
test: → testes  
style: → formatação (indentação, etc.)
