# ARRANQUE LOCAL - MF8

## Header

- `doc_id`: `GUIA-MF8-ARRANQUE-LOCAL`
- `path`: `docs/planificacao/guias-bk/MF8/ARRANQUE-LOCAL.md`
- `macro`: `MF8`
- `area`: `operacao-local`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-03`

## Objetivo

Este guia explica como arrancar o StudyFlow localmente antes dos trabalhos finais da `MF8`.

Deve ser usado antes de executar `BK-MF8-16` e `BK-MF8-17`, porque esses BKs dependem de uma aplicação que arranca de forma previsível, com API, frontend, base de dados e Redis configurados.

## Antes de começar

Confirma que tens instalado:

- Node.js LTS;
- npm;
- MongoDB a correr localmente;
- Redis a correr localmente;
- terminal aberto na raiz do projeto StudyFlow.

Para confirmar a raiz correta, o comando abaixo deve mostrar as pastas `apps`, `docs` e `README.md`:

```bash
ls
```

## Estrutura usada neste guia

- API: `apps/api`
- Frontend: `apps/web`
- API local: `http://127.0.0.1:3000`
- Frontend local: `http://localhost:5173`
- Health-check da API: `http://127.0.0.1:3000/api/health`

Mantem estes caminhos públicos nos relatórios e evidence da MF8. Não uses caminhos internos privados em documentação dos alunos.

## 1. Instalar dependências

A partir da raiz do projeto, instala as dependências da API:

```bash
cd apps/api
npm ci
```

Depois instala as dependências do frontend:

```bash
cd ../web
npm ci
```

Se `npm ci` falhar por falta de `package-lock.json`, usa `npm install` na mesma pasta. Neste projeto, os lockfiles existem e `npm ci` é o comando recomendado.

## 2. Criar ficheiros de ambiente

A partir da raiz do projeto, cria o `.env` da API:

```bash
cd apps/api
cp .env.example .env
```

No Windows PowerShell, o comando equivalente é:

```powershell
Copy-Item .env.example .env
```

No frontend, o `.env` é opcional para desenvolvimento normal, mas pode ser criado para deixar o proxy explícito:

```bash
cd ../web
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Nunca faças commit de ficheiros `.env` com segredos reais.

## 3. Rever configuração mínima da API

Abre `apps/api/.env` e confirma estes valores para desenvolvimento local:

```env
NODE_ENV=development
PORT=3000
WEB_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/studyflow
REDIS_URL=redis://127.0.0.1:6379
```

A variável `OPENAI_API_KEY` pode ficar vazia para arrancar a aplicação. Funcionalidades que chamem IA externa podem responder com erro de provider não configurado até uma chave real ser definida.

## 4. Arrancar serviços externos

Antes de arrancares a API, confirma que MongoDB e Redis estão ativos.

Checks úteis, se tiveres as ferramentas instaladas:

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
redis-cli ping
```

Resultado esperado:

- MongoDB responde sem erro;
- Redis responde `PONG`.

Se estes comandos não existirem na tua máquina, confirma pelo serviço que usaste para instalar MongoDB/Redis.

## 5. Arrancar a API

Abre um terminal para a API:

```bash
cd apps/api
npm run start:dev
```

Resultado esperado:

- o NestJS arranca sem erro;
- a API fica disponível em `http://127.0.0.1:3000`;
- o terminal fica ocupado a observar alterações.

Noutro terminal, confirma o health-check:

```bash
curl http://127.0.0.1:3000/api/health
```

Resultado esperado: resposta JSON com `status` igual a `ok` ou `degraded`. Se houver resposta JSON, a API está a responder.

## 6. Criar utilizadores de desenvolvimento

Se precisares de contas locais para testar login, executa:

```bash
cd apps/api
npm run seed:dev-users
```

Usa este passo apenas em ambiente local. A seed é para desenvolvimento e não substitui dados reais de produção.

## 7. Arrancar o frontend

Abre outro terminal para o frontend:

```bash
cd apps/web
npm run dev
```

Resultado esperado:

- o Vite arranca sem erro;
- o frontend fica disponível em `http://localhost:5173`;
- os pedidos para `/api/*` são encaminhados para `http://127.0.0.1:3000`.

Abre no browser:

```text
http://localhost:5173
```

## 8. Fluxo diário recomendado

Em cada aula ou sessão de trabalho:

1. Arranca MongoDB e Redis.
2. Abre terminal da API: `cd apps/api && npm run start:dev`.
3. Abre terminal da web: `cd apps/web && npm run dev`.
4. Confirma `http://127.0.0.1:3000/api/health`.
5. Abre `http://localhost:5173`.
6. Só depois começa o BK em curso.

## 9. Testes úteis antes da MF8 final

API:

```bash
cd apps/api
npm run test:unit
npm run build
```

Frontend:

```bash
cd apps/web
npm run build
```

E2E Playwright, quando o ambiente estiver preparado:

```bash
cd apps/web
npm run test:e2e:install
npm run test:e2e
```

O Playwright pode arrancar servidores próprios para E2E e usar IA falsa em teste. Para trabalho normal no browser, mantém a API e a web arrancadas manualmente.

## 10. Problemas comuns

### Porta 3000 ocupada

Sintoma: a API falha ao arrancar porque a porta já está em uso.

Correção:

- fecha o processo antigo;
- ou altera `PORT` em `apps/api/.env`;
- se mudares a porta da API, atualiza também `VITE_API_PROXY_TARGET` em `apps/web/.env`.

### Porta 5173 ocupada

Sintoma: o Vite escolhe outra porta ou falha ao arrancar.

Correção:

```bash
cd apps/web
npm run dev -- --host 127.0.0.1 --port 5174
```

Se usares outra porta no browser, atualiza `WEB_ORIGIN` em `apps/api/.env`.

### MongoDB desligado

Sintoma: a API arranca com erro de ligação à base de dados ou fica presa a tentar ligar.

Correção: arranca o serviço MongoDB e confirma que `MONGODB_URI` aponta para `mongodb://127.0.0.1:27017/studyflow`.

### Redis desligado

Sintoma: login, sessões, rate limit ou fluxos de autenticação falham.

Correção: arranca o serviço Redis e confirma que `REDIS_URL` aponta para `redis://127.0.0.1:6379`.

### Erro de IA externa

Sintoma: páginas normais funcionam, mas pedidos de IA devolvem erro de provider não configurado.

Correção: para testar IA real, define `OPENAI_API_KEY` em `apps/api/.env`. Para testes automatizados, usa os comandos E2E previstos, porque podem usar configuração falsa de IA.

### Dependências em falta

Sintoma: comandos como `nest`, `vite` ou `playwright` não são encontrados.

Correção: volta a executar `npm ci` dentro da pasta correta, `apps/api` ou `apps/web`.

## 11. Checklist antes de começar um BK da MF8

- `apps/api/.env` existe.
- MongoDB está ativo.
- Redis está ativo.
- `npm run start:dev` está ativo em `apps/api`.
- `npm run dev` está ativo em `apps/web`.
- `curl http://127.0.0.1:3000/api/health` devolve JSON.
- `http://localhost:5173` abre no browser.
- Não há tokens, cookies, passwords ou chaves reais em ficheiros versionados.

## Ligação aos BKs finais

- Usa este guia antes de `BK-MF8-16`, para executar a bateria final de testes com o ambiente local estável.
- Usa este guia antes de `BK-MF8-17`, para corrigir e revalidar erros sem misturar falhas de código com falhas de arranque local.
