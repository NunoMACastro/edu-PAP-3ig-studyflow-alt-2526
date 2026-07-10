# Auditoria completa da aplicação StudyFlow (`real_dev`)

```yaml
status: SUPERSEDED
authoritative_for_release: false
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
```

> Snapshot histórico da auditoria de origem. Os findings e a evidence abaixo são preservados
> para rastreabilidade, mas não descrevem o estado atual nem podem autorizar release.

- Data: 2026-07-09
- Âmbito: `real_dev/api`, `real_dev/web`, configuração operacional e documentação em `docs`
- Excluído: `apps/`, por instrução explícita
- Modo: auditoria read-only da implementação; apenas este relatório foi criado

## 1. Decisão executiva

**Decisão: NÃO PRONTA PARA PRODUÇÃO.**

A aplicação tem uma base funcional apreciável: API e frontend compilam, as 443 asserções unitárias da API passam, o smoke autenticado de 200 pedidos passou e os percursos principais de aluno e professor funcionaram no browser. Contudo, existem bloqueadores de segurança, privacidade, controlo de IA, integridade funcional e operação que impedem uma aprovação de produção responsável.

Prioridades máximas:

1. Rodar, caso estejam ativas, as credenciais presentes no `.env` e restringir imediatamente o ficheiro a `0600`.
2. Impedir que fluxos de IA contornem consentimento, políticas administrativas, quotas e auditoria.
3. Revogar todas as sessões quando um papel muda ou uma conta é eliminada.
4. Completar exportação/eliminação de dados em todas as coleções e no storage físico.
5. Corrigir o fluxo de publicação de mini-testes, a segurança de upload/SSRF e as dependências vulneráveis.
6. Recuperar confiança no gate de release: a execução E2E isolada terminou com 20/29 cenários aprovados.

## 2. Metodologia e cobertura

Foram usados:

- inventário da arquitetura, módulos, rotas, schemas, testes, scripts e documentação;
- revisão estática focada em autenticação, autorização, sessões, IA, RGPD, uploads, SSRF, jobs, persistência, notificações, testes oficiais e operação;
- builds da API e web;
- suite unitária completa da API;
- Playwright em portas isoladas e diagnóstico de uma colisão real de portas;
- smoke autenticado de 200 pedidos concorrentes;
- auditoria atual de dependências com o registry npm;
- smoke de backup em `dry-run` e gate de deploy;
- validação manual no browser dos percursos de aluno e professor, autorização visual e responsividade.

Escala usada:

- **Crítica:** exige ação imediata; pode expor credenciais ou controlo total.
- **Alta:** bloqueia produção ou um fluxo essencial.
- **Média:** risco relevante de quebra, abuso, inconsistência ou exclusão de utilizadores.
- **Baixa:** dívida ou melhoria com impacto limitado.

`Confirmado` significa provado pelo código, configuração ou execução. `Potencial` significa que o caminho existe, mas a exploração depende do ambiente/topologia e não foi executada de forma destrutiva.

## 3. Achados críticos e altos

### SF-AUD-001 — Material de credenciais em `.env` com permissões `0644`

- Severidade: **CRÍTICA**
- Estado: **confirmado quanto à presença/formato e permissões; validade não testada**
- Evidência: `real_dev/api/.env:2,6`; `stat` devolveu modo `0644`. Existem valores não vazios com formato de chave OpenAI e URI MongoDB com userinfo. Os valores não são reproduzidos neste relatório.
- Mitigação existente: `real_dev/` está ignorado por `.gitignore:2`, pelo que o ficheiro não está versionado neste checkout.
- Impacto: qualquer utilizador/processo local com leitura pode obter acesso ao provider e à base de dados; uma cópia acidental do diretório propaga os segredos.
- Recomendação: rodar imediatamente as duas credenciais se estiverem ativas, aplicar `chmod 600`, remover segredos duradouros do checkout e usar secret manager/injeção de ambiente. Não testar a validade das credenciais como parte da auditoria.

### SF-AUD-002 — Governação de IA contornada em cinco famílias de fluxo

- Severidade: **ALTA**
- Estado: **confirmado**
- Evidência:
  - finalidades configuráveis incluem `EXTERNAL_KNOWLEDGE_AI`, `ADAPTIVE_EXPLANATION`, `SUMMARY` e `STUDY_TOOL`: `real_dev/api/src/modules/ai-consents/schemas/ai-consent.schema.ts:9-18`;
  - o painel administrativo permite configurar essas finalidades: `real_dev/web/src/features/mf4/admin-governance-panel.tsx:24-34`;
  - chamadas diretas ao provider, sem `assertGranted`, `resolveForUse` ou `reserveUsage`: `summaries.service.ts:59-80`, `study-tools.service.ts:112-147`, `adaptive-learning.service.ts:157-186`, `study-rooms/room-ai.service.ts:93-121` e `external-knowledge-ai.service.ts:71-126,185-190`;
  - `AiModule` não importa os módulos de consentimentos, políticas ou quotas: `real_dev/api/src/modules/ai/ai.module.ts:49-82`;
  - o fluxo correto de referência aplica os três controlos: `private-area-ai.service.ts:106-126`.
- Impacto: materiais e perguntas privadas podem ser enviados ao provider após consentimento revogado ou inexistente; uma finalidade desativada pelo administrador continua ativa; modelo, timeout, limites de fontes/prompt e quotas podem ser ignorados; não existe auditoria uniforme do consumo.
- Recomendação: criar uma única fachada obrigatória de execução de IA, usada por todos os chamadores, e um teste arquitetural que falhe quando algum `AiProvider` for injetado fora dessa fachada. Acrescentar finalidade própria para IA de sala ou definir explicitamente a sua política.

### SF-AUD-003 — Papéis obsoletos permanecem válidos nas sessões durante até 8 horas

- Severidade: **ALTA**
- Estado: **confirmado**
- Evidência: a sessão serializa todo o utilizador, incluindo `role`, por 8 horas (`session.service.ts:11,35-42`) e devolve esse JSON sem reler MongoDB (`:53-62`). `AdminUsersService.changeRole` só atualiza MongoDB (`admin-users.service.ts:61-90`). A eliminação de conta destrói apenas a sessão corrente (`account-deletion.service.ts:52-59,82-106`).
- Impacto: um administrador despromovido pode conservar privilégios até expirar a sessão; um utilizador promovido não recebe o novo papel; outras sessões de uma conta eliminada continuam autenticadas. O mesmo contexto obsoleto é usado no handshake WebSocket.
- Recomendação: guardar `userId + sessionVersion/securityStamp`, validar estado e papel atuais ou uma cache revogável, indexar sessões por utilizador e executar `revokeAll(userId)` em mudança de papel, password, bloqueio e eliminação de conta.

### SF-AUD-004 — Exportação e eliminação RGPD não acompanham a aplicação atual

- Severidade: **ALTA**
- Estado: **confirmado**
- Evidência:
  - eliminação remove apenas materiais, áreas e eventos: `account-deletion.service.ts:69-74`;
  - exportação inclui apenas utilizador, áreas, metadados de materiais e preferências de notificação: `privacy-data-exports.service.ts:106-138`;
  - a aplicação também persiste perfis, rotinas, objetivos, artefactos/tentativas/interações IA, consentimentos, grupos, salas, chats, notificações, jobs, versões, projetos, turmas e testes oficiais;
  - o storage só oferece `save`/`read`, sem eliminação física: `material-storage.service.ts:16-43`.
- Impacto: `RF52`/`RF53` deixam dados pessoais fora do direito de acesso e apagamento; ficheiros PDF/DOCX permanecem no disco; sessões secundárias continuam válidas. A sequência também não é transacional, pelo que uma falha intermédia pode deixar uma conta parcialmente apagada.
- Recomendação: manter um inventário canónico de dados por utilizador e uma política por coleção (`delete`, `anonymize`, `retain with legal basis`), incluir o storage físico, revogar todas as sessões e executar uma saga/transação com compensação e testes end-to-end que semeiem todos os domínios.

### SF-AUD-005 — Upload autenticado pode deixar ficheiros órfãos e esgotar disco

- Severidade: **ALTA**
- Estado: **confirmado pelo caminho de código; não explorado para evitar escrita destrutiva**
- Evidência: o título multipart não passa por DTO/limite (`materials.controller.ts:59-72`); o ficheiro, até 10 MB, é escrito antes de criar o documento (`materials.service.ts:240-260`, `material-storage.service.ts:26-32`); o schema limita o título a 160 caracteres (`materials/schemas/material.schema.ts:39-40`). Se o create falhar, não existe cleanup. Também não há quota de storage por utilizador.
- Impacto: um utilizador autenticado pode repetir uploads com metadata inválida e acumular ficheiros sem registo; falhas normais de MongoDB produzem o mesmo efeito. A eliminação de conta não recupera esse espaço.
- Recomendação: validar toda a metadata antes do write, gravar temporariamente e promover apenas após persistência, remover em compensação, impor quota/rate limit e criar job periódico de reconciliação de órfãos.

### SF-AUD-006 — Mini-testes criados pela UI nunca ficam disponíveis aos alunos

- Severidade: **ALTA**
- Estado: **confirmado end-to-end pelo contrato**
- Evidência: a UI fixa a resposta correta na primeira opção e cria sempre `DRAFT` (`TeacherOfficialTestsPage.tsx:7-10,47-56`); não valida quatro opções nem oferece publicação (`:66-90`). O aluno só lista/submete testes `PUBLISHED` (`official-tests.service.ts:165-181,193-214`). Não existe outra ação frontend de publicação.
- Impacto: o fluxo professor → publicação → tentativa → ranking está quebrado pela UI; testes criados normalmente nunca aparecem ao aluno. O editor só suporta uma pergunta e resposta correta na posição zero.
- Recomendação: editor de perguntas com quatro opções distintas, escolha explícita da correta e ação segura `DRAFT → PUBLISHED`, ou criação direta publicada quando a regra de negócio o permitir. Cobrir o percurso completo por E2E.

### SF-AUD-007 — Bypass potencial do filtro SSRF com IPv4 mapeado em IPv6

- Severidade: **ALTA**
- Estado: **potencial fortemente sustentado; exploração não executada**
- Evidência: `isPrivateIp` cobre IPv4 privado e alguns prefixos IPv6, mas não normaliza `::ffff:127.0.0.1` ou `::ffff:169.254.169.254` (`material-index.service.ts:902-913`). A mesma decisão é usada antes e depois da ligação (`:771-776,879-885`).
- Pontos fortes existentes: pin de DNS, validação de cada redirect, limite de corpo, timeout e verificação do endereço remoto (`material-index.service.ts:103-198,741-815`).
- Impacto: um DNS controlado com endereço mapeado pode, dependendo da stack de rede, alcançar loopback ou metadata cloud.
- Recomendação: normalizar IPs com parser robusto, converter IPv4-mapped IPv6 para IPv4, cobrir todos os ranges reservados e acrescentar testes para representações canónicas/alternativas antes e depois da ligação.

### SF-AUD-008 — Dependências com vulnerabilidades atuais

- Severidade: **ALTA** para API; **BAIXA** para web
- Estado: **confirmado por `npm audit --omit=dev --json` em 2026-07-09**
- Evidência API: 9 entradas `high`, concentradas sobretudo em:
  - `multer@2.1.1`, vulnerável a DoS por nomes de campos profundamente aninhados (`GHSA-72gw-mp4g-v24j`, correção em `>=2.2.0`) e cleanup incompleto de upload abortado;
  - `tar@6.2.1`, transitivo por `bcrypt@5.1.1 → @mapbox/node-pre-gyp@1.0.11`, com múltiplos advisories de path traversal/symlink no caminho de instalação/build.
- Evidência web: `esbuild@0.27.7`, uma vulnerabilidade `low` do servidor de desenvolvimento em Windows (`GHSA-g7r4-m6w7-qqqr`, correção em `>=0.28.1`).
- Recomendação: atualizar `multer`/lockfile com prioridade; atualizar ou substituir a cadeia antiga de `bcrypt/node-pre-gyp`; atualizar Vite/esbuild; repetir testes e auditoria. Não interpretar as 9 entradas como 9 falhas de produto independentes.

### SF-AUD-009 — Enforcement HTTPS confia num header controlável

- Severidade: **ALTA se a API for acessível diretamente; MÉDIA com ingress fechado**
- Estado: **confirmado no código; impacto dependente da topologia**
- Evidência: em produção, o middleware aceita diretamente `x-forwarded-proto` (`require-https.middleware.ts:26-38`); `main.ts:23-44` não configura proxies confiáveis.
- Impacto: acesso HTTP direto com `X-Forwarded-Proto: https` pode passar e transportar registo/login em claro. O cookie `Secure` reduz parte do risco, mas não protege as credenciais já enviadas.
- Recomendação: tornar a API inacessível fora do ingress, configurar `trust proxy` para hops/CIDRs conhecidos e basear a decisão em `request.secure`; adicionar HSTS no edge depois de validar HTTPS.

## 4. Achados médios

### SF-AUD-011 — Jobs persistem estado, mas não têm fila durável nem recovery

- Indexação e quizzes arrancam com `void` no processo HTTP: `material-index-queue.service.ts:51-63` e `quiz-generation-jobs.service.ts:74-90`.
- Um restart deixa jobs `QUEUED/PROCESSING` sem consumidor; não há lease, retry durável, recovery de stale jobs, backpressure ou limite global de concorrência.
- Recomendação: worker durável baseado no Redis já existente ou coleção Mongo com claim/lease, idempotência, caps, graceful shutdown e recovery no arranque.

### SF-AUD-012 — Storage local quebra escala horizontal e durabilidade em hosting efémero

- `MaterialStorageService` usa `MATERIALS_STORAGE_DIR` local (`material-storage.service.ts:16-43`), enquanto a documentação afirma preparação horizontal e Redis/Mongo partilhados.
- Em múltiplas instâncias, o upload pode ocorrer numa instância e a indexação noutra; em containers efémeros, restart/redeploy pode perder ficheiros.
- Recomendação: volume partilhado com backups ou object storage privado, checksums e política de retenção. Para PAP local, documentar explicitamente a limitação.

### SF-AUD-013 — Estado de indexação e link de versões desaparecem após reload

- `jobsByMaterial` existe apenas em estado React (`MaterialList.tsx:27-29`); só é preenchido após o POST (`:69-74`) e o link `Versões` depende desse estado (`:120-127`). A API só permite obter um job quando o ID já é conhecido.
- Impacto: após reload/remount, material já indexado volta a mostrar `Indexar`, pode gerar jobs duplicados e não oferece caminho para as versões.
- Recomendação: endpoint/listagem do último job por material, hidratação inicial e bloqueio/idempotência de reindexação.

### SF-AUD-014 — Operações críticas multi-documento não são atómicas

- Eliminação de conta, mudança de papel e criação/restauro de versões executam vários writes sem transação: `account-deletion.service.ts:69-106`, `admin-users.service.ts:70-90`, `material-versions.service.ts:108-124,176-214`.
- A proteção do último administrador também é `count → write`, permitindo race entre duas despromoções/eliminações concorrentes (`admin-users.service.ts:124-133`, `account-deletion.service.ts:59-67`).
- Recomendação: transações Mongo, invariantes/índices atómicos, partial unique index para versão ativa e testes com concorrência/fault injection.

### SF-AUD-015 — Health e runtime podem declarar saúde sem MongoDB/Redis

- `HealthService` usa apenas uptime e downtime vindo do ambiente (`health.service.ts:39-55,65-74`); `RuntimeInstanceService` devolve literais `redis`/`mongodb` (`runtime-instance.service.ts:26-32`).
- Recomendação: separar liveness de readiness, ping real com timeout a MongoDB/Redis e estado degradado/fail-closed para load balancer.

### SF-AUD-016 — Gate de deploy e rollback insuficientes

- `deploy:check` faz build da API e considera pronto quando há versão e qualquer ficheiro de rollback (`package.json:21`, `validate-deploy-readiness.ts:37-60`).
- Não valida web, testes, config, Mongo/Redis, TLS, backup ou smoke. O rollback continua genérico e com campos “preencher”: `real_dev/docs/ops/DEPLOY-ROLLBACK.md:3-45`.
- Recomendação: gate agregador fail-closed, artefacto/versionamento real, validação pré/pós-deploy e critérios executáveis.

### SF-AUD-017 — Backup sem restore demonstrado, snapshot consistente ou cifragem

- O script percorre coleções e grava JSONL gzip (`backup-database.ts:151-177,208-227`), com boas permissões `0600`, mas não há snapshot consistente entre coleções, checksum, cifragem, réplica off-site ou script/teste de restore.
- Recomendação: backup consistente e cifrado, manifesto com hashes, storage durável/off-site, restore automatizado testado e RPO/RTO documentados.

### SF-AUD-018 — Playwright pode reutilizar uma aplicação errada

- Portas padrão fixas `3000/4175` e `reuseExistingServer: !CI`: `web/playwright.config.ts:6-10,37-50`.
- Confirmação dinâmica: a primeira execução ligou-se ao frontend OPSA já ativo em `4175`, produzindo 22 falhas/7 passes que não eram resultados StudyFlow. Em portas isoladas, carregou a aplicação correta.
- Recomendação: `reuseExistingServer: false` por defeito, portas e Mongo temporários por execução e uma assinatura de identidade/health antes dos testes.

### SF-AUD-019 — Suite E2E atual: 20/29; nove cenários não chegam ao objetivo

- Em portas isoladas, 20 cenários passaram e 9 falharam.
- As nove falhas partilham uma asserção de login obsoleta que procura o email visível, entretanto removido da shell: exemplos em `mf3-smoke.spec.ts:14-20`, `mf5-accessibility.spec.ts:39-45`, `mf5-responsive-layout.spec.ts:26-35`, `mf5-performance-budget.spec.ts:39-45`, `mf5-action-feedback.spec.ts:14-20` e `mf5-notification-tray.spec.ts:14-20`.
- Consequência: acessibilidade, feedback, notificações, performance e responsividade deixam de ser exercitados. `docs/evidence/MF8/TESTES-FINAIS.md:3-6,204-205` ainda declara PASS total com 97 suites/412 testes, quando o estado atual é 100/443 e E2E parcial.
- Recomendação: esperar por um elemento estável da sessão/rota, corrigir as seis helpers e regenerar evidence apenas após 29/29.

### SF-AUD-020 — Rotas frontend protegidas não aplicam papel antes de montar páginas

- Todas as rotas de aluno/professor/admin são resolvidas antes de qualquer role-gating (`protectedRoutes.tsx:62-255`); o papel só é usado no fallback (`:256-258`).
- Confirmação manual: uma sessão de aluno abriu `/app/admin/governanca`, mostrou a UI e só depois recebeu `403` da API. O backend permaneceu a autoridade e não houve leitura/escrita administrativa.
- Recomendação: tabela de rotas com `allowedRoles`, página 403 e teste negativo por papel, mantendo sempre a autorização backend.

### SF-AUD-021 — Quebra responsiva real a 320 px

- O header é uma única linha flex sem wrap/menu compacto (`AppShell.tsx:35-92`). O teste só começa em 390 px (`mf5-responsive-layout.spec.ts:13-17`) e atualmente nem ultrapassa o login.
- Confirmação no browser: a 320 px, `clientWidth=305` e `scrollWidth=364` (59 px de overflow horizontal); a 375 px foi observado overflow residual.
- Recomendação: navegação mobile/hamburger ou overflow controlado e testes a 320/360/390 px com foco e teclado.

### SF-AUD-022 — Acessibilidade: nomes acessíveis e contraste insuficientes

- Inputs/selects/textarea usam apenas placeholder em páginas críticas: `TeacherClassPostsPage.tsx:70-76`, `TeacherOfficialMaterialsPage.tsx:109-118`, `TeacherAiContentReviewsPage.tsx:85-91`, `MaterialVersionsPage.tsx:95-106`, `privacy-panel.tsx:141-148`, `RoomSharesPage.tsx:132-136`.
- Cores calculadas a partir de `tailwind.config.js:8-17`: texto `#E0E0E0` sobre `#1473E6` ≈ 3,44:1; alerta `#9E5252` sobre `#193138` ≈ 2,46:1, abaixo de WCAG AA para texto normal.
- Recomendação: `label htmlFor`, `aria-describedby`, `role=alert`/`aria-live`, contraste >=4,5:1 e axe/keyboard smoke além de selectors manuais.

### SF-AUD-023 — Erros de sessão e mutações não têm estado robusto na UI

- `useSession` converte qualquer erro de `/auth/me`, incluindo rede/500, em logout (`useSession.ts:24-32`) e o logout não trata falhas (`:40-43`).
- Privacidade, consentimentos e eliminação não têm `try/catch`/pending (`privacy-panel.tsx:58-102`); várias mutações permitem duplo clique e respostas fora de ordem.
- Recomendação: erro HTTP tipado, estados `authenticated/anonymous/unavailable`, tratamento central de 401, pending síncrono/idempotency keys e feedback de falha.

### SF-AUD-024 — Polling e chat admitem races

- `setInterval(async)` pode sobrepor pedidos e regredir estado em `MaterialList.tsx:32-61` e `StudyToolsPage.tsx:95-118`.
- O chat carrega histórico antes de ligar/juntar a socket e limpa o draft sem ack (`SubjectChatPanel.tsx:50-85,112-125`), criando janela de perda e envio sem confirmação.
- Recomendação: polling recursivo após conclusão com abort/in-flight guard; no chat, join com cursor, reconciliação pós-join e ack/retry.

### SF-AUD-025 — Registo público e parsing pesado sem bulkheads suficientes

- `POST /api/auth/register` executa bcrypt cost 12 por email novo sem rate limit (`auth.controller.ts:59-61`, `auth.service.ts:43-60`, `password-hashing.service.ts:7,20-22`).
- O timeout de parsing usa `Promise.race`, mas não cancela PDF/DOCX em curso (`document-processing-safety.service.ts:88-106`); uploads concorrentes podem continuar a consumir CPU/memória.
- Recomendação: rate limit/capacidade para registo, comprimento máximo de password, worker isolado/cancelável para parsing e limites de concorrência/recursos.

### SF-AUD-026 — Notificações revelam a lista completa de destinatários/supressões

- Qualquer destinatário recebe a vista que inclui `recipientIds` e `suppressedRecipientIds` (`context-notifications.service.ts:139-146,184-206`).
- Impacto: revela identificadores de membros e quem desativou notificações.
- Recomendação: vista mínima por destinatário; detalhes de supressão apenas para operador autorizado e de forma agregada.

### SF-AUD-027 — Ranking aceita tentativas ilimitadas e múltiplas linhas do mesmo aluno

- Cada submissão cria uma tentativa (`official-tests.service.ts:193-240`), devolve resultados com a opção correta e o ranking lista todas as tentativas (`official-test-ranking.service.ts:138-152`).
- Impacto: após uma primeira tentativa, um aluno pode repetir com 100% e ocupar várias posições.
- Recomendação: política explícita de tentativas, ranking pela primeira/melhor tentativa por aluno e regra clara para revelar soluções.

## 5. Qualidade, documentação e operação

### SF-AUD-010 — Proveniência e pipeline da implementação real não são demonstráveis neste checkout

- Severidade: **MÉDIA e condicional**
- Estado: `real_dev/` estar ignorado é uma convenção esperada deste checkout PAP e não é, por si só, um defeito. Contudo, `.gitignore:2` ignora toda a raiz, `git ls-files real_dev` devolve zero ficheiros e não foram encontrados workflows CI, Dockerfiles, Compose ou manifestos de deploy para a implementação real.
- Risco: se não existir outro repositório privado/versionado, faltam revisão, rastreabilidade, rollback por commit, lockfile auditável e pipeline que reproduza a release real.
- Recomendação: documentar a fonte privada canónica e ligar CI/CD ao artefacto efetivamente publicado; se ela não existir, versionar `real_dev` num repositório privado.

### SF-AUD-028 — Ausência de testes unitários/componentes no frontend

- `real_dev/web/package.json:6-12` só define build e Playwright. Foram encontrados 100 specs API, 16 ficheiros E2E e zero specs unitários/componentes web.
- O inventário de coverage MF8 verifica existência nominal de apenas oito pares source/spec, não cobertura executada nem thresholds.
- Recomendação: Vitest/Testing Library para hooks/componentes críticos, coverage por domínio e gates mínimos; manter E2E para percursos completos.

### SF-AUD-029 — Documentação/evidence sem source of truth único

- `docs/evidence/MF8/TESTES-FINAIS.md` está desatualizado face aos testes/bundle atuais.
- Existem mapas técnicos diferentes em `docs/technical` e `real_dev/docs/technical`; o exportador gera ainda outro resultado.
- O README E2E continua descrito como MF1 apesar de existirem suites MF1-MF8.
- Recomendação: um mapa gerado e versionado, diff fail-closed e evidence associada ao commit/artefacto exato.

### SF-AUD-030 — Scripts standalone não carregam o `.env` local

- Seed, backup, TLS, smokes e deploy validator leem `process.env` diretamente; `package.json` não usa `--env-file`. A seed falhou quando `.env` existia mas `MONGODB_URI` não estava exportada.
- Recomendação: importar o loader nos entrypoints ou usar `node --env-file=.env`; produção deve continuar com env injetado por secret manager.

### SF-AUD-031 — Runtime e operação não estão fixados/documentados para reprodução

- Os manifests não definem `engines`; não existe `.nvmrc`/`.node-version`.
- Não existe runbook próprio de `real_dev` com `npm ci`, env, Mongo/Redis, seed, testes e troubleshooting.
- A seed usa contas previsíveis e só recusa `NODE_ENV=production`, podendo ser executada acidentalmente em staging.
- Recomendação: fixar versão Node suportada, CI nessa versão, runbook e opt-in explícito/host local para seed.

### SF-AUD-032 — Bundle único e carregamento excessivo

- `App` importa `ProtectedRoutes` estaticamente e este importa todas as páginas (`App.tsx:4-8`, `protectedRoutes.tsx:4-46`).
- Build atual: um JS de 456,47 kB (122,70 kB gzip), contra 357,31 kB na evidence anterior.
- Recomendação: `React.lazy`/dynamic imports por papel/rota e orçamento de bundle. É otimização, não bloqueador isolado.

## 6. Observações baixas

- Rota desconhecida autenticada cai silenciosamente no dashboard (`protectedRoutes.tsx:256-258`) em vez de 404.
- Foi observado o label não traduzido `Contexts` numa página em PT-PT.
- O painel de exportação mostra o JSON em `<pre>` em vez de produzir o ficheiro descrito no guia.
- Não há HSTS na API; deve ser aplicado no edge após HTTPS correto.
- `real_dev/web/real_dev/web/node_modules` parece um install aninhado residual; deve ser removido do processo de packaging.
- Não existe code path de verificação de email/SSO escolar; registo massivo é possível enquanto não houver proteção adicional.
- O sanitizador de evidence não cobre de forma robusta todas as formas de segredo (`sk-*`, URI, JSON aninhado); nunca deve receber outputs com secrets.
- Não existe estratégia explícita de migrations/índices para os muitos schemas Mongoose; produção deve desativar criação implícita e aplicar migrations controladas.

## 7. Resultados das validações

| Validação | Resultado | Nota |
| --- | --- | --- |
| `npm run test:unit` na API | **PASS** | 100 suites, 443 testes |
| Build API | **PASS** | Nest/TypeScript sem erros |
| Build web | **PASS** | Vite 7.3.5, 163 módulos, JS 456,47 kB |
| Validador da planificação | **PASS** | score 100, `overall_pass=true` |
| E2E nas portas padrão | **INVÁLIDO** | colidiu com OPSA em 4175; diagnóstico confirmado por PID/cwd |
| E2E isolado StudyFlow | **PARCIAL** | 20 pass, 9 fail, 40,6 s; falhas na helper de login |
| Smoke autenticado 200 pedidos | **PASS** | 200/200 HTTP 200; sem erro de rede/5xx; p95 28 ms no ambiente local E2E |
| `npm audit --omit=dev` API | **FAIL** | 9 entradas high, agrupadas em Multer e cadeia tar/bcrypt |
| `npm audit --omit=dev` web | **FAIL baixo** | 1 low em esbuild dev server |
| `deploy:check` | **PASS formal** | gate considerado insuficiente por SF-AUD-016 |
| Backup `dry-run` | **PASS formal** | 0 coleções/documentos; não prova restore real |
| Browser aluno | **PASS parcial** | login, área, material, indexação e logout funcionaram |
| Browser professor | **PASS parcial** | login, dashboard, validação/criação de turma funcionaram |
| Browser role-gating | **FAIL UI / PASS API** | aluno viu página admin; API respondeu 403 |
| Browser 320 px | **FAIL** | overflow horizontal de 59 px |

## 8. Pontos fortes

- `ValidationPipe` global usa whitelist, rejeita campos extra e transforma DTOs (`main.ts:30-37`).
- Cookies de sessão são aleatórios, `HttpOnly`, `SameSite=Lax` e `Secure` em produção.
- Ownership/membership é, na generalidade, derivado da sessão e aplicado nas queries backend.
- A UI não guarda token/cookie em `localStorage`.
- Uploads têm limite de 10 MB, MIME/extensão e assinatura mínima.
- A proteção URL já usa pin DNS, revalidação de redirects, limites e timeout.
- Muitos outputs IA são validados contra fontes autorizadas e não são aceites cegamente.
- O browser não apresentou erros de consola nos percursos principais auditados.
- A suite unitária backend é extensa e rápida, embora lhe faltem os contratos transversais assinalados.

## 9. Plano recomendado

### P0 — Hoje

1. Rodar credenciais potencialmente ativas, aplicar `0600` e retirar secrets do diretório de trabalho.
2. Atualizar Multer e reavaliar a cadeia bcrypt/tar.
3. Bloquear temporariamente ou colocar atrás da fachada governada os cinco fluxos IA sem enforcement.
4. Invalidar todas as sessões após mudança de papel/eliminação.
5. Fechar acesso direto à API e o caso SSRF IPv4-mapped.

### P1 — Antes da próxima release

1. Completar export/delete RGPD e cleanup físico de uploads.
2. Corrigir upload atómico/quotas, publicação de testes oficiais e reidratação de jobs.
3. Implementar worker/recovery e storage compatível com o ambiente alvo.
4. Corrigir e isolar os E2E até 29/29; tornar o resultado obrigatório no gate.
5. Tornar role-gating, 320 px e formulários acessíveis parte da aceitação.
6. Separar liveness/readiness e provar restore de backup.

### P2 — Sprint seguinte

1. Versionar a implementação real num repositório privado e criar CI/CD.
2. Transações/invariantes para operações multi-documento.
3. Testes frontend, concorrência, crash/recovery, SSRF, sessões múltiplas, RGPD e ranking.
4. Runbook, Node fixo, mapa técnico único e evidence ligada a versão/commit.
5. Code splitting, 404, traduções e limpeza de artefactos locais.

## 10. Limitações da auditoria

Não foram executados:

- chamadas reais ao provider OpenAI;
- validação da atividade das credenciais encontradas;
- TLS contra um host público de produção;
- backup/restore de uma base real com dados;
- failover real MongoDB/Redis, restart durante jobs ou múltiplas instâncias atrás de load balancer;
- Safari/Firefox e leitores de ecrã reais;
- exploração destrutiva de disk exhaustion, SSRF, zip bomb ou brute force.

Estas limitações não anulam os achados estáticos/dinâmicos confirmados; delimitam apenas o que ainda precisa de prova num staging isolado.
