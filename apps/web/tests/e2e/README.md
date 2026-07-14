# Suite E2E StudyFlow `real_dev`

Esta suite valida em browser os percursos acumulados MF1-MF8 e os gates G5/G6,
sempre contra `real_dev/` e com sessão real em cookie HttpOnly. Inclui:

- professor cria turma, adiciona aluno, cria disciplina, material oficial, voz docente e publicacao;
- aluno entra na turma, consulta disciplina, cria salas e partilhas;
- mini-testes, feedback, notificações, polling/jobs, acessibilidade, responsividade e budgets;
- gates fail-closed de IA quando consentimento, política ou quota do scope não existem.

## Ambiente

Por defeito, o Playwright escolhe duas portas loopback por processo e arranca API
e web isoladas. A web é sempre compilada e servida por `vite preview`, para testar
os chunks de release sem interferência HMR. Não reutiliza servidores existentes sem
opt-in explícito.

- API/web: portas únicas ou `STUDYFLOW_E2E_API_PORT` / `STUDYFLOW_E2E_WEB_PORT`;
- MongoDB: replica set efémero exclusivo com base `studyflow_e2e`; overrides
  externos são recusados para evitar reutilizar dados de outra execução;
- Redis: store in-memory exclusivo do processo E2E;
- storage de materiais: diretório temporário dedicado por `STUDYFLOW_E2E_RUN_ID`;
- output/report: apenas sob o diretório temporário do sistema, nunca no checkout.

O arranque E2E corre a seed local protegida. O provider IA é determinístico, mas
continua atrás de consentimento, política e quota: a fixture não deve criar
automaticamente `ROOM_AI`, nem inventar quotas `CLASS`/`GROUP`.

## Comandos

Executar a partir de `real_dev/web`. A instalação dos browsers é uma ação explícita:

```bash
npm run test:e2e:install
```

### Chromium completo, três execuções isoladas

```bash
STUDYFLOW_E2E_RUN_ID=local-release-1 \
STUDYFLOW_E2E_REUSE_SERVERS=false \
STUDYFLOW_E2E_API_PORT=43110 \
STUDYFLOW_E2E_WEB_PORT=43185 \
npm run test:e2e -- --project=chromium --reporter=line

STUDYFLOW_E2E_RUN_ID=local-release-2 \
STUDYFLOW_E2E_REUSE_SERVERS=false \
STUDYFLOW_E2E_API_PORT=43120 \
STUDYFLOW_E2E_WEB_PORT=43195 \
npm run test:e2e -- --project=chromium --reporter=line

STUDYFLOW_E2E_RUN_ID=local-release-3 \
STUDYFLOW_E2E_REUSE_SERVERS=false \
STUDYFLOW_E2E_API_PORT=43130 \
STUDYFLOW_E2E_WEB_PORT=43205 \
npm run test:e2e -- --project=chromium --reporter=line
```

Cada run tem API, Mongo replica set, Redis in-memory, storage, portas e output próprios.
Não repetir um `runId` em processos simultâneos. O gate `verify:local-release` executa
estes mesmos três projetos com IDs próprios.

### Smoke crítico Firefox e WebKit

```bash
STUDYFLOW_E2E_RUN_ID=local-release-cross-browser \
STUDYFLOW_E2E_REUSE_SERVERS=false \
STUDYFLOW_E2E_API_PORT=43140 \
STUDYFLOW_E2E_WEB_PORT=43215 \
npm run test:e2e -- \
  --project=firefox-critical \
  --project=webkit-critical \
  --reporter=line
```

Os projetos críticos cobrem o percurso MF1, acessibilidade e layout responsivo. Não
substituem a suite Chromium integral.

Traces, screenshots, vídeo e relatório HTML estão desligados por defeito porque
podem conter cookies ou dados de formulários. Para diagnóstico local efémero,
ativar explicitamente `STUDYFLOW_E2E_CAPTURE_ARTIFACTS=true`; os artefactos
continuam fora de `real_dev/` e não são evidence publicável.

### Reutilização manual controlada

Usar apenas quando for necessário diagnosticar o arranque automático. Em três terminais,
com portas exclusivas e sem outra execução ativa:

Terminal 1, em `real_dev/api`:

```bash
PORT=43330 \
WEB_ORIGIN=http://127.0.0.1:43405 \
STUDYFLOW_E2E_RUN_ID=manual-cross \
npm run start:e2e
```

Terminal 2, em `real_dev/web`:

```bash
VITE_API_PROXY_TARGET=http://127.0.0.1:43330 \
STUDYFLOW_E2E_API_PORT=43330 \
npm run build

VITE_API_PROXY_TARGET=http://127.0.0.1:43330 \
STUDYFLOW_E2E_API_PORT=43330 \
npm run preview -- --host 127.0.0.1 --port 43405
```

Terminal 3, em `real_dev/web`:

```bash
STUDYFLOW_E2E_START_SERVERS=false \
STUDYFLOW_E2E_REUSE_SERVERS=true \
STUDYFLOW_E2E_RUN_ID=manual-cross \
STUDYFLOW_E2E_API_PORT=43330 \
STUDYFLOW_E2E_WEB_PORT=43405 \
PLAYWRIGHT_BASE_URL=http://127.0.0.1:43405 \
npm run test:e2e -- \
  --project=firefox-critical \
  --project=webkit-critical \
  --reporter=line
```

Antes de reutilizar servidores, o `global-setup` verifica a identidade da API,
da página e o `runId`. Nunca apontar estas variáveis para hosts não-loopback ou
dados reais.

### Cleanup e evidence

O wrapper `scripts/run-e2e.mjs` elimina o diretório temporário do `runId` depois de
os reporters terminarem, mesmo perante falha/sinal. Depois de cada run automático,
confirmar sem listar conteúdo potencialmente sensível:

```bash
test ! -d "${TMPDIR%/}/studyflow-e2e/local-release-1"
npm --prefix ../api run secrets:scan
```

Guardar apenas `runId`, projeto, contagem, exit code, timestamp e manifesto externo.
Nunca guardar cookies, passwords, traces, screenshots, vídeos, formulários, prompts,
respostas IA ou paths pessoais. Como este README pertence a `real_dev`, não embute o
SHA literal atual; o hash e a decisão vivem no ledger de remediação.
Consultar
[docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md](../../../../docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md)
sem copiar outputs sensíveis.
