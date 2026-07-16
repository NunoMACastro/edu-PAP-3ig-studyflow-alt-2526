# StudyFlow — runbook da PAP local endurecida

> Estado operacional atual: `BLOQUEADO_OPERADOR`. Este runbook descreve o alvo e os
> procedimentos; não prova que os gates passaram. A decisão e o hash atuais vivem no
> [ledger de remediação](../../../docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md).
> Nunca copiar para aqui chaves, passwords, cookies, URIs com credenciais, prompts,
> respostas IA ou dados pessoais.

## Âmbito suportado

Este runbook cobre apenas `PAP_LOCAL_ENDURECIDA`: API/web single-instance em loopback,
com persistência principal em MongoDB Atlas ou num replica set local para testes isolados.
Não autoriza exposição pública da aplicação nem uma claim de produção. `apps/` não participa
no runtime.
Versões obrigatórias: Node.js `24.11.1` e npm `11.6.2`.

Blockers que têm de estar fechados no ledger antes de declarar aptidão:

1. rotação de credenciais e `.env` privado, com Atlas autenticado ou Mongo local (`OP-001`);
2. backup/restore real com chave manual fora da documentação (`OP-005`);
3. remoção, pelo operador, do install residual `real_dev/web/real_dev/web`;
4. `verify:local-release` integral verde, ligado ao manifesto final.

## MongoDB Atlas ou replica set local e Redis dedicado

O runtime principal da PAP suporta MongoDB Atlas por `mongodb+srv://`. A URI tem de apontar
para `*.mongodb.net`, incluir utilizador/password, usar uma base `studyflow*` permitida e não
pode desativar TLS nem ativar `directConnection`. O utilizador Atlas deve ter apenas as
permissões necessárias à base da aplicação e a Network Access List deve limitar as origens
autorizadas.

Para desenvolvimento e testes isolados também é suportado um replica set Mongo local sem
credenciais. Exemplo de bootstrap de um nó, a executar uma única vez com os binários Mongo
instalados:

```bash
install -d -m 700 "$HOME/.studyflow/mongo-rs"
mongod --dbpath "$HOME/.studyflow/mongo-rs" \
  --replSet studyflow-rs --bind_ip 127.0.0.1 --port 27017
```

Noutro terminal:

```bash
mongosh "mongodb://127.0.0.1:27017/?directConnection=true" \
  --eval 'rs.initiate({_id:"studyflow-rs",members:[{_id:0,host:"127.0.0.1:27017"}]})'
mongosh "mongodb://127.0.0.1:27017/?replicaSet=studyflow-rs" \
  --eval 'db.adminCommand({ping:1}); rs.status().ok'
```

Configuração obrigatória da API:

```dotenv
STUDYFLOW_DEPLOYMENT_SCOPE=local-pap
HOST=127.0.0.1
PORT=3000
WEB_ORIGIN=http://127.0.0.1:5173
STUDYFLOW_TRUST_PROXY=false
MONGODB_URI=<URI_MONGODB_ATLAS_REDACTED>
REDIS_URL=redis://127.0.0.1:6379/1
MATERIALS_STORAGE_DIR="/Users/UTILIZADOR/Library/Application Support/StudyFlow/studyflow-materials"
MATERIALS_STORAGE_USER_QUOTA_BYTES=262144000
MATERIALS_STORAGE_GLOBAL_QUOTA_BYTES=5368709120
MATERIALS_STORAGE_STAGING_RETENTION_MS=3600000
MATERIALS_STORAGE_ORPHAN_RETENTION_MS=86400000
MATERIALS_STORAGE_RECONCILE_INTERVAL_MS=60000
QUIZ_JOB_LEASE_MS=30000
QUIZ_JOB_POLL_MS=1000
MATERIAL_INDEX_JOB_LEASE_MS=30000
MATERIAL_INDEX_JOB_POLL_MS=1000
```

Para usar o replica set local em vez de Atlas, substituir apenas `MONGODB_URI` por
`mongodb://127.0.0.1:27017/studyflow?replicaSet=studyflow-rs`.

Redis deve usar uma DB dedicada entre 1 e 15, sem userinfo. O storage deve ser absoluto,
fora de `real_dev/`, terminar em `studyflow-*` e ter permissões privadas. Copiar
`.env.example` para `.env` e aplicar `chmod 600 .env`.
Substituir `UTILIZADOR` pelo nome real da conta local; ficheiros `.env` não expandem
automaticamente `$HOME`. O storage normal nunca deve ficar em `/tmp`, porque esse volume
pode ser limpo pelo sistema. `/tmp` fica reservado a E2E, reset local e restore drills
descartáveis.

O arranque recusa host/origem públicos, wildcard, Mongo remoto fora do Atlas oficial,
Atlas sem autenticação ou com TLS desativado, Mongo local sem o replica set `studyflow-rs`,
Redis remoto/DB 0 e trust proxy ativo. Não contornar estas validações com headers
`X-Forwarded-*`. O filtro de URLs usa `ipaddr.js` e volta a validar DNS/endereço antes e depois
da ligação e em redirects, incluindo IPv4-mapped, metadata, link-local, privados e reservados.

## Limites de abuso e passwords

- registo: 5 pedidos por hora e IP observado, guardado apenas em chave técnica com hash;
- upload: 20 pedidos por hora e utilizador autenticado;
- ficheiro PDF/DOCX: máximo 10 MiB; Markdown `.md`: máximo 128 KiB bruto,
  20 000 caracteres Unicode normalizados e título até 160 caracteres;
- quota de materiais: 250 MiB por utilizador;
- password HTTP: máximo 128 caracteres; o bootstrap local aplica ainda requisitos de força e
  o limite seguro de bytes aceite pelo bcrypt;
- parsing PDF/DOCX e runners: concorrência máxima 2.

O rate limit usa Redis dedicado e falha fechado quando não consegue reservar a operação. Não
reduzir estes limites nem mudar o cliente IP para headers controláveis sem nova auditoria.

## Seed, reset e primeiro administrador

A seed requer `NODE_ENV=development|test`, URI loopback e confirmação explícita:

```bash
STUDYFLOW_ALLOW_DEV_SEED=true npm run seed:dev-users
```

Além dos dados pedagógicos, a seed normal cria políticas de modelo e dez defaults de
quota IA com `5 000` unidades mensais: sete finalidades pessoais em `USER`, `CLASS_AI`
em `CLASS`, e `GROUP_AI`/`ROOM_AI` em `GROUP`. Uma política específica continua a
prevalecer sobre o default. O consumo é sempre contabilizado no aluno, turma, grupo ou
sala real; o default não representa um balde de consumo partilhado. A seed normal não
concede consentimentos. Grants sintéticos continuam limitados ao modo demo fake e E2E.

Em Atlas, a seed completa continua a exigir substituição e confirmação exata. Criar e
verificar um snapshot antes da execução; nunca usar a seed como reparação parcial de
uma base com dados que tenham de ser preservados.

O bootstrap local do primeiro administrador não tem password por defeito e recusa correr se
já existir um administrador ativo:

```bash
STUDYFLOW_ALLOW_ADMIN_BOOTSTRAP=true \
STUDYFLOW_ADMIN_EMAIL=admin.local@example.test \
STUDYFLOW_ADMIN_PASSWORD='<fornecida apenas no ambiente do comando>' \
npm run admin:bootstrap:local
```

Reset exige confirmação explícita e só aceita Mongo loopback com base
`studyflow`, `studyflow_dev`, `studyflow_test` ou `studyflow_e2e`, Redis dedicado 1..15 e
storage com marker StudyFlow fora do checkout. Confirmar primeiro, fora do report, que os três
destinos contêm apenas dados locais/sintéticos:

```bash
STUDYFLOW_ALLOW_DATA_RESET=true \
STUDYFLOW_RESET_CONFIRMATION=studyflow_dev \
MONGODB_URI='mongodb://127.0.0.1:27017/studyflow_dev?replicaSet=studyflow-rs' \
REDIS_URL='redis://127.0.0.1:6379/2' \
MATERIALS_STORAGE_DIR='/tmp/studyflow-materials-dev' \
npm run data:reset:local
```

`STUDYFLOW_RESET_CONFIRMATION` tem de coincidir literalmente com a base. O reset valida todos
os destinos antes da primeira operação destrutiva e recusa URIs com credenciais. Nunca o
executar como parte de um gate de release nem sobre dados reais.

## Storage, outbox e reconciliação

Cada upload passa por metadata/quota/rate limit, staging, SHA-256, chave UUID e promoção
atómica por `rename` no mesmo volume. A raiz e os ficheiros ficam `0700/0600`. A outbox local
mantém apenas metadata técnica da promoção/eliminação; não contém o conteúdo do material.

No arranque e no intervalo configurado, a reconciliação trata staging expirado, operações de
outbox e órfãos de forma idempotente. Não apagar manualmente `users/`, `.staging/` ou `.outbox/`.
Quota individual/global rejeita apenas o upload com erro controlado; uma falha do probe de
escrita torna a readiness indisponível. Inspecionar apenas logs sanitizados antes de reiniciar.
Este storage é apenas single-instance; hosting efémero ou mais do que uma API reabre a decisão
de object storage.

## Parsing e jobs recuperáveis

PDF e DOCX são processados em `worker_threads` com timeout que termina o worker, limites de
memória/stack e concorrência 2. Não adicionar parsers in-process ou um caminho alternativo sem
os mesmos limites.

Os jobs de indexação e quiz persistem no MongoDB com lease de 30 segundos, heartbeat/fencing,
concorrência 2, três tentativas e backoff de 1/5/30 segundos. Leases expiradas são recuperadas
no arranque e os processadores são idempotentes. Existe no máximo um job ativo por material.
Para diagnóstico autorizado:

- `GET /api/student/study-areas/:studyAreaId/material-index-jobs?latestByMaterial=true`
  reidrata o último job de cada material;
- um `POST` de indexação reutiliza o job ativo e responde `202`;
- polling frontend mantém um único pedido em voo, usa abort e não regride estados.

Se a aplicação passar a multi-instância, parar: o runner local deixa de ser o contrato suportado
e é obrigatória nova coordenação distribuída antes de continuar.

## Sessões, IA e transações

A sessão Redis v2 guarda apenas `{ userId, sessionVersion }`. Cada pedido relê role,
`accountStatus` e `sessionVersion` no MongoDB; divergência devolve `401 SESSION_REVOKED`.
Mudança de papel ou eliminação incrementa a versão. WebSockets revalidam no handshake,
`join`, `send` e antes de broadcasts; o cliente só limpa o draft após ack positivo.

`GovernedAiExecutionService` é a única fachada que pode injetar `AI_PROVIDER`. A ordem é:
autorização, consentimento, policy, limites, guardrails, reserva atómica de quota, provider,
validação de output e audit seguro. `ROOM_AI` inicia desativada e sem grants automáticos. Um
erro de consentimento, finalidade, quota, output ou timeout não pode ser convertido em chamada
direta ao provider.

O modo `start:demo` substitui apenas o provider em runtime. As políticas persistidas devem
continuar a indicar o modelo real configurado em `OPENAI_MODEL`; nunca guardar sentinels como
`studyflow-demo-fake` numa base que também seja usada pelo arranque normal. Ao alternar de um
snapshot demo antigo para o provider real, confirmar primeiro no painel administrativo que as
dez finalidades apontam para o modelo configurado. Uma rejeição do provider por autenticação,
modelo, rate limit ou upstream é devolvida por código público próprio, sem expor mensagens,
headers ou request IDs da OpenAI.

Mudanças de papel, eliminação e versões usam transactions MongoDB. O sentinel atómico do último
administrador e os índices parciais de versão/job ativo dependem do replica set. Não executar
estas operações contra Mongo standalone.

## Migração de paridade professor-aluno

A migração `2026-07-11-student-teacher-parity-v2` é idempotente, transacional e deve ser
executada com a API parada, depois de backup válido e antes de disponibilizar o novo web.
Começar sempre pelo modo de simulação:

```bash
npm run migrate:student-teacher-parity:dry-run
```

O output contém apenas contagens e anomalias técnicas, nunca conteúdos, emails ou IDs pessoais.
Rever as contagens de memberships, lifecycle, versões, projetos, notificações e atividade. Só
depois executar:

```bash
npm run migrate:student-teacher-parity
```

O runner cria o marker apenas depois do commit. Uma repetição com marker concluído não volta a
alterar dados. O backfill:

- cria memberships a partir das inscrições legadas e remove `profile.className`;
- inicializa lifecycle de turmas/disciplinas e a projeção da versão ativa dos materiais;
- associa projetos a disciplinas apenas por correspondência exata inequívoca;
- migra notificações legadas para o estado de leitura;
- fecha combinações inconsistentes de sala aberta/teste fechado;
- deriva atividade apenas de fluxos oficiais existentes, nunca de estudo privado.

Se o runner reportar ambiguidades ou falhar, não editar o marker nem os documentos manualmente:
restaurar o snapshot de pré-migração, corrigir a causa e repetir primeiro o dry-run.

## Privacidade, exportação e eliminação

`PersonalDataRegistry` classifica cada model como `DELETE`, `PULL_MEMBERSHIP`,
`ANONYMIZE_90D` ou `RETAIN_NONPERSONAL`. Model novo sem política deve falhar o teste de
arquitetura antes de chegar ao runtime.

A exportação inclui todas as categorias próprias registadas, exclui hashes, secrets, chaves de
respostas e dados de terceiros, e descarrega um attachment JSON `private, no-store`. A eliminação
corre numa transaction, revoga sessões e deixa na outbox apenas os deletes físicos necessários.
Conteúdo colaborativo passa a tombstone sem autor/conteúdo; memberships removem o ID; contextos
exclusivamente detidos são apagados. O recibo público é aleatório, não contém `userId` e, tal como
audit anonimizado relacionado, expira por TTL aos 90 dias.

Nunca copiar exports, recibos, IDs pessoais ou conteúdos para evidence. Depois de um restore
drill, validar export/delete apenas com contas sintéticas.

## Mini-testes, ranking e notificações

- ciclo oficial: `DRAFT -> PUBLISHED -> CLOSED`; apenas `DRAFT` é editável;
- 1–60 perguntas, exatamente quatro opções distintas e correta explícita;
- máximo três tentativas por aluno/teste, numeradas atomicamente e idempotentes por attempt key;
- soluções completas só após terceira tentativa ou teste `CLOSED`;
- ranking `BEST_ATTEMPT`: uma linha por aluno, maior percentagem, depois tentativa melhor mais
  antiga e ID estável; DTO inclui `attemptCount`, `bestPercentage` e `bestAnsweredAt`;
- notificações do destinatário nunca devolvem `recipientIds` ou `suppressedRecipientIds`;
  administração usa apenas contagens agregadas;
- a inbox suportada é exclusivamente in-app, com leitura, arquivo e cursor; email/push são
  rejeitados pelo DTO;
- o worker de outbox usa lease, retry e backoff. Falhas esgotadas ficam persistidas e auditadas,
  não são convertidas silenciosamente em entrega bem-sucedida.

## Frontend, acessibilidade e bundle

React Router usa rotas lazy, `ProtectedLayout`, `RoleGuard`, 403/404 e error boundary. Uma rota
proibida não monta a página nem inicia pedidos; `returnTo` aceita apenas paths internos. O cliente
HTTP comum trata JSON/texto/204, `AbortSignal` e invalida a sessão apenas em 401. O estado da
sessão distingue `checking`, `authenticated`, `anonymous` e `unavailable`; rede/5xx não simula
logout.

Mutações críticas usam `useAsyncAction`; polling é single-flight e monotónico; chat usa ack,
reconciliação e deduplicação. O menu mobile tem alvos de 44 px, Escape/devolução de foco e zero
overflow a 320/360/375/390 px. Labels, `aria-describedby`, `aria-invalid`, fieldsets, live regions,
skip link, foco e contraste devem continuar a passar axe sem violações serious/critical.

Budgets: entrada pública <=90 KiB gzip, entrada + primeira rota <=160 KiB gzip, cada chunk
lazy <=25 KiB gzip e percurso cumulativo alcançável por papel <=190 KiB gzip. O percurso é
calculado pelo manifesto Vite e soma uma única vez o entry, todas as páginas que esse papel pode
visitar e os respetivos imports estáticos. O total do catálogo JS aparece apenas como diagnóstico:
somá-lo como payload seria incorreto, porque inclui páginas lazy mutuamente exclusivas de aluno,
professor e administração. O `socket.io-client` só pode entrar no chunk do chat. A partir de
`real_dev/api`, validar com `npm --prefix ../web run build:budget`; diretamente em `real_dev/web`,
usar `npm run build:budget`.

## Arranque e health

Em `real_dev/api`: `npm run start:dev`. Em `real_dev/web`:
`npm run dev -- --host 127.0.0.1`.

- `GET /api/health/live`: processo vivo;
- `GET /api/health/ready`: Mongo, Redis, storage e runners prontos;
- `GET /api/health`: alias fail-closed da readiness.

Uma readiness `503` bloqueia a utilização. O teste negativo usa uma instância local separada
cuja dependência Redis foi deliberadamente parada; nunca degradar a instância que contém os
dados normais da PAP.

## Backup offline completo

RPO local: 24 h. RTO local: 60 min. O backup cifrado aceita como origem o Atlas configurado no
runtime ou o replica set local. Não existe cron nesta configuração: o operador tem de agendar e
registar um backup manual pelo menos a cada 24 horas, porque só é consistente com API, web e
runners parados. `STUDYFLOW_BACKUP_DIR` deve apontar para storage durável fora do checkout e
nunca para `/tmp`; por exemplo:

```bash
STUDYFLOW_BACKUP_DIR='/Users/UTILIZADOR/Library/Application Support/StudyFlow/studyflow-backups' \
STUDYFLOW_BACKUP_OFFLINE_CONFIRMED=true npm run backup:daily
```

Confirmar antes que já não existem listeners/processos da StudyFlow. Substituir `UTILIZADOR`
literalmente e fornecer `STUDYFLOW_BACKUP_KEY` apenas no ambiente seguro do comando ou da sessão,
nunca no histórico do shell, `.env.example`, report ou evidence.

`STUDYFLOW_BACKUP_KEY` tem exatamente 32 bytes em base64 ou hex e nunca fica em logs,
reports ou no exemplo. O backup inclui coleções e `MATERIALS_STORAGE_DIR`: usa Extended JSON,
streaming, gzip, AES-256-GCM, SHA-256 e manifesto HMAC. Paths dos materiais só existem no
índice cifrado. Diretórios e ficheiros ficam `0700/0600`.

## Restore drill para destinos novos

O restore nunca escreve no Atlas nem sobrepõe dados: exige uma DB local vazia de drill e um path
de storage que ainda não exista. Exemplo, ajustando o diretório exato do backup:

```bash
STUDYFLOW_ALLOW_RESTORE=true \
STUDYFLOW_RESTORE_OFFLINE_CONFIRMED=true \
STUDYFLOW_RESTORE_DIR=/caminho/studyflow-backups/daily-AAAA-MM-DD... \
STUDYFLOW_RESTORE_CONFIRMATION=studyflow_restore \
STUDYFLOW_RESTORE_STORAGE_CONFIRMATION=studyflow-materials-restore \
MONGODB_URI='mongodb://127.0.0.1:27017/studyflow_restore?replicaSet=studyflow-rs' \
MATERIALS_STORAGE_DIR=/tmp/studyflow-materials-restore \
npm run backup:restore
```

O script valida todos os payloads, prepara o storage em staging, insere MongoDB por batches
e compensa coleções se houver erro. Depois do drill, validar login, exportação RGPD,
materiais, mini-testes e readiness. Só então registar no ledger o SHA-256 do manifesto; não
registar chave, URI, paths pessoais ou conteúdo. A remoção dos destinos de drill é uma ação
manual separada.

## Evidence MF8 histórica

Os comandos `mf8:test-inventory`, `mf8:final-tests` e `mf8:error-register` são anteriores ao
gate integral. Por omissão terminam com exit code 1. Uma reprodução deliberada exige
`STUDYFLOW_ALLOW_LEGACY_MF8_EVIDENCE=true` e escreve apenas em
`docs/evidence/MF8/historico/gerado/`; nunca substitui os banners `SUPERSEDED` nem fecha a
release. Não ativar estes comandos durante `verify:local-release`.

## Gate de release local

`npm run verify:local-release:plan` lista as 21 provas automáticas versionadas: scanner de
secrets e verificação documental; instalação limpa, build, mapas/inventários, suites,
recovery/restore sintético e audit da API; instalação limpa, coverage, build, bundle e audit da
web; três runs Chromium isolados; smoke crítico Firefox/WebKit; readiness negativa live; e smoke
autenticado de 200 pedidos. O resumo do CLI contém apenas IDs, estados, exit codes, blockers, hash
e snapshot ID; nunca copiar stdout que possa conter dados para o ledger.

Antes de o executar:

1. Executar um restore real para destinos de drill novos.
2. Executar crash/restart real dos runners e smoke Firefox/WebKit.
3. Obter `sha256` com `npm run manifest:hash` e colocar esse mesmo valor em
   `STUDYFLOW_RELEASE_RESTORE_DRILL_SHA256`,
   `STUDYFLOW_RELEASE_CRASH_RECOVERY_SHA256` e
   `STUDYFLOW_RELEASE_CROSS_BROWSER_SHA256`.
4. Preparar uma API local isolada/degradada em `STUDYFLOW_NEGATIVE_READINESS_URL`, e uma API
   saudável com credenciais de teste para `STUDYFLOW_BASE_URL`/`STUDYFLOW_SMOKE_*`.
5. Configurar `STUDYFLOW_RELEASE_SNAPSHOT_ROOT` fora de `real_dev/` e uma chave independente
   `STUDYFLOW_RELEASE_SNAPSHOT_KEY` de 32 bytes.
6. Confirmar que OP-001, OP-005 e a remoção do install residual estão fechados no ledger.

Executar em `real_dev/api`:

```bash
npm run verify:local-release
```

Se o código mudar durante o gate, o hash final diverge e toda a evidence é invalidada. Um
gate verde cria no fim um snapshot autenticado ligado ao mesmo manifesto.

O mapa e este runbook pertencem a `real_dev` e entram no próprio manifesto; por isso nunca
embutem o hash literal atual. O hash e a decisão ficam apenas no ledger externo. Depois de mudar
qualquer ficheiro de `real_dev`, gerar um novo hash, repetir a evidence afetada e só então atualizar
o ledger.

## Snapshot e rollback

Para criar apenas um artefacto: `npm run release:snapshot`. Para rollback, seguir
`DEPLOY-ROLLBACK.md`. Nenhum destes comandos substitui backup/restore dos dados.
