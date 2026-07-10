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

Este guia define o arranque e a validação da release `PAP_LOCAL_ENDURECIDA`. O alvo é uma única instância, exposta apenas em loopback; este procedimento não autoriza publicação na Internet nem uma declaração de prontidão para produção.

Deve ser seguido antes de `BK-MF8-16` e `BK-MF8-17`. O gate final é `verify:local-release`: um build isolado, uma readiness positiva ou uma execução E2E isolada não bastam para aprovar a release.

## Antes de começar

Confirma que tens instalado exatamente:

- Node.js `24.11.1`;
- npm `11.6.2`;
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
- Frontend local: `http://127.0.0.1:5173`
- Liveness: `http://127.0.0.1:3000/api/health/live`
- Readiness: `http://127.0.0.1:3000/api/health/ready`
- Alias compatível e fail-closed: `http://127.0.0.1:3000/api/health`

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

Não substituas `npm ci` por `npm install`. Um lockfile ausente, incoerente ou uma versão de runtime diferente bloqueia a release até ser corrigido. A baseline documentada é Multer `2.2.0`, bcrypt `6.0.0`, Nest `11.1.28`, Vite `8.1.4`, esbuild `0.28.1` e Socket.IO/client `4.8.3`; confirma no lockfile e exige audits sem vulnerabilidades conhecidas nestas cadeias.

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
STUDYFLOW_DEPLOYMENT_SCOPE=local-pap
HOST=127.0.0.1
PORT=3000
TRUST_PROXY=false
WEB_ORIGIN=http://127.0.0.1:5173
MONGODB_URI=mongodb://127.0.0.1:27017/studyflow
REDIS_URL=redis://127.0.0.1:6379
STORAGE_ROOT=/caminho/local/fora/do/checkout/studyflow-storage
```

O arranque deve falhar se `HOST` for público, `WEB_ORIGIN` contiver wildcard, `TRUST_PROXY` estiver ativo ou a base/Redis não forem locais. `STORAGE_ROOT` fica fora do checkout e a diretoria deve ter permissão `0700`.

Nunca registes chaves, cookies, URIs com credenciais, prompts, respostas IA ou dados pessoais. Se `OPENAI_API_KEY` não estiver configurada, os fluxos IA têm de falhar de forma controlada e sem bypass à `GovernedAiExecutionService`.

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

Resultado esperado:

- `/api/health/live` devolve `200` se o processo estiver vivo, sem depender de MongoDB, Redis, storage ou runner;
- `/api/health/ready` e `/api/health` devolvem `200` apenas se MongoDB, Redis, storage e runner estiverem disponíveis;
- a indisponibilidade de qualquer dependência obrigatória devolve `503`.

## 6. Criar utilizadores de desenvolvimento

Se precisares de contas locais para testar login, consulta primeiro a ajuda do script de seed instalado.

Seed e reset são operações destrutivas e exigem flags explícitas definidas pelo script. Antes de as executar, confirma que a URI aponta para uma base local/de teste e escreve a confirmação pedida pelo comando. Não copies para este guia uma flag inventada: consulta `npm run` e a ajuda do script da versão instalada.

O script deve recusar URIs de produção, hosts remotos e uma base sem confirmação explícita. Não existe migração retrocompatível dos dados atuais neste alvo: quando necessário, faz reset apenas sobre dados locais descartáveis.

## 7. Arrancar o frontend

Abre outro terminal para o frontend:

```bash
cd apps/web
npm run dev
```

Resultado esperado:

- o Vite arranca sem erro;
- o frontend fica disponível em `http://127.0.0.1:5173`;
- os pedidos para `/api/*` são encaminhados para `http://127.0.0.1:3000`.

Abre no browser:

```text
http://127.0.0.1:5173
```

## 8. Fluxo diário recomendado

Em cada aula ou sessão de trabalho:

1. Arranca MongoDB e Redis.
2. Abre terminal da API: `cd apps/api && npm run start:dev`.
3. Abre terminal da web: `cd apps/web && npm run dev`.
4. Confirma `/api/health/live` e `/api/health/ready`.
5. Abre `http://127.0.0.1:5173`.
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

E2E Playwright é obrigatório e isolado:

```bash
cd apps/web
npm run test:e2e:install
npm run test:e2e
```

O Playwright pode arrancar servidores próprios para E2E e usar IA falsa em teste. Para trabalho normal no browser, mantém a API e a web arrancadas manualmente.

Cada execução E2E usa portas, base Mongo, namespace Redis e `runId` únicos, com `reuseExistingServer=false`, e verifica a identidade da API e da web antes do primeiro cenário. A aceitação exige três execuções Chromium completas e consecutivas, além do smoke crítico em Firefox e WebKit.

Executa por fim, a partir da raiz pública onde o script estiver declarado:

```bash
npm run verify:local-release
```

O gate não é opcional. Deve incluir configuração e secrets, instalação limpa, builds, testes API unit/integration/contracts, testes web unit/component, bundle budgets, E2E, axe, audits de dependências, smoke de 200 pedidos, crash/recovery, readiness negativa e restore real. A entrada pública deve ficar até `90 KiB gzip` e entrada + primeira rota até `160 KiB gzip`; `socket.io-client` só pode entrar no chunk do chat.

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

Se usares outra porta no browser, atualiza `WEB_ORIGIN` em `apps/api/.env`, mantendo sempre `127.0.0.1`.

### MongoDB desligado

Sintoma: a API falha readiness com `503` por ligação à base de dados.

Correção: arranca o serviço MongoDB e confirma que `MONGODB_URI` aponta para `mongodb://127.0.0.1:27017/studyflow`.

### Redis desligado

Sintoma: readiness devolve `503`; login, sessões, rate limit e jobs ficam indisponíveis.

Correção: arranca o serviço Redis e confirma que `REDIS_URL` aponta para `redis://127.0.0.1:6379`.

### Erro de IA externa

Sintoma: páginas normais funcionam, mas pedidos de IA devolvem erro de provider não configurado.

Correção: para testar IA real, define a chave apenas em `apps/api/.env` com permissão `0600`; nunca a coloques em comandos, evidence ou relatórios. Para testes automatizados, usa o provider falso através da fachada governada.

### Backup e restore local

Antes do gate final, executa um backup local offline com gzip e AES-256-GCM, usando uma chave manual de 32 bytes que não fica no repositório. Valida o manifesto SHA-256 e as permissões seguras. O restore só pode apontar para uma base local vazia, exige confirmação explícita e tem de ser realmente ensaiado. Objetivos locais: RPO de 24 horas e RTO de 60 minutos.

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
