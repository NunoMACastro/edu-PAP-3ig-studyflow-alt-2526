# Plano de correção da auditoria completa do StudyFlow (`real_dev`)

```yaml
doc_id: SF-REM-2026-07-09
audit_source: docs/AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
implementation_root: real_dev
excluded_root: apps
target: PAP_LOCAL_ENDURECIDA
data_reset_allowed: true
external_actions: GATES_MANUAIS
ranking_policy: BEST_ATTEMPT
privacy_retention: ANONYMIZED_90_DAYS
status: BLOQUEADO_OPERADOR
created_at: 2026-07-09T20:26:24+01:00
updated_at: 2026-07-14T01:58:00+01:00
implementation_manifest_sha256: 68bcf3b45d3fc2fd674de16fa2a613127ad7dd29ac3bf7d1c4400ccce519670c
```

## 1. Autoridade e âmbito

Este documento é o ledger operacional obrigatório para a remediação dos 32 findings de
`docs/AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md`. A implementação real está apenas em
`real_dev/`; `apps/` está explicitamente excluída. O alvo é uma instância local de PAP
endurecida e acessível apenas por loopback. Este plano nunca autoriza uma declaração de
prontidão para produção.

Não existem commits autorizados. Alterações anteriores do utilizador devem ser preservadas.
Baseline do worktree antes da primeira alteração de código:

- `M docs/cabulas/CABULA-TECNICA-RELATORIO-PAP.md`
- `M docs/cabulas/FUNCOES-FUNDAMENTAIS-APLICACAO.md`
- `M docs/evidence/MF8/TESTES-FINAIS.md`
- `M docs/ops/DEPLOY-ROLLBACK.md`
- `M docs/planificacao/features/PLANO-CHAT-WEBSOCKET-ALUNO-PROFESSOR.md`
- `M docs/technical/STUDYFLOW-TECHNICAL-MAP.md`
- `?? docs/AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md`
- `?? docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md`

Baseline da correção documental iniciada em 2026-07-10:

- manifesto de referência anterior: `b112da6549e36d1526b593d1f09548d55509589d8974aa3b0c7e4220624cdc02`
  (716 ficheiros);
- qualquer alteração posterior em `real_dev/` invalida a designação de “manifesto final” e a
  evidence documental que dependa desse hash;
- os ficheiros modificados acima são alterações preexistentes e devem ser preservados durante
  a sincronização documental.

## 2. Instruções vinculativas ao agente executor

1. Atualizar este report antes de iniciar um finding e imediatamente após cada validação.
2. Manter os 32 IDs separados, mesmo quando uma alteração corrige vários findings.
3. Registar data, agente, manifesto, comando, exit code e resultado sanitizado em cada transição.
4. Nunca guardar chaves, passwords, cookies, URIs com credenciais, prompts, respostas IA ou
   dados pessoais em evidence.
5. Um build isolado ou uma descrição narrativa nunca fecha um finding.
6. Se o código mudar depois de validado, invalidar e repetir a evidence afetada.
7. Como `real_dev/` é ignorada por Git, usar leituras diretas, testes, builds e manifestos de
   hashes; `git status` nunca é evidence suficiente.
8. Em cada gate, atualizar contagens, blockers, risco residual e changelog.
9. Findings críticos/altos exigem revisão independente antes de `FECHADO`.
10. Uma ação manual não realizada mantém o finding em `BLOQUEADO_OPERADOR`; é proibido
    inventar confirmações.
11. Não editar `apps/`, não limpar alterações alheias e não criar commits.
12. O estado global só pode ser `APTA_PARA_PAP_LOCAL_ENDURECIDA` após reauditoria fresca.

## 3. Estados e gates

Fluxo principal:

`PLANEADO -> EM_IMPLEMENTACAO -> PRONTO_VALIDAR -> VALIDADO -> FECHADO`

Estados laterais:

- `BLOQUEADO_OPERADOR`: falta rotação, chave, acesso, download ou confirmação externa.
- `MITIGADO_POR_ESCOPO`: risco exclusivamente de produção, com controlo compensatório e
  condição explícita de reabertura.
- `NAO_REPRODUZIDO`: finding potencial não confirmado após teste negativo documentado.
- `RISCO_ACEITE`: exige aprovação explícita, justificação e prazo de expiração.
- `REABERTO`: regressão ou evidence invalidada por alteração posterior.

| Gate | Conteúdo | Condição de passagem |
| --- | --- | --- |
| G0 | Report e contenção | Ledger criado; permissões seguras; gates manuais registados; dependências críticas tratadas. |
| G1 | Baseline/configuração | Runtime local fail-closed; scripts seguros; SSRF/rate limits; E2E baseline isolada. |
| G2 | Sessões/IA/atomicidade | Sessões revogáveis; fachada IA única; invariantes transacionais. |
| G3 | Storage/jobs/parsing | Storage reconciliável; parsing cancelável; jobs recuperáveis e reidratados. |
| G4 | Privacidade | Registry total; export/delete/storage/sessões e retenção de 90 dias validados. |
| G5 | Testes/ranking/notificações | Publicação completa; três tentativas; ranking único; DTO mínimo. |
| G6 | Frontend | Routing/roles/erros/races/mobile/a11y/code splitting validados. |
| G7 | Operação/fecho | Readiness, backup/restore, gate local, docs/evidence e reauditoria completos. |

## 4. Gates manuais

| ID | Ação | Estado | Evidence permitida | Bloqueia |
| --- | --- | --- | --- | --- |
| OP-001 | Rodar/substituir as credenciais OpenAI e MongoDB e preparar `.env` exclusivamente local. | PENDENTE | Confirmação sem valores; `.env` local sem userinfo remoto. | SF-AUD-001/SF-AUD-016/G0/G7 |
| OP-002 | Confirmar que Mongo/Redis/storage contêm apenas dados locais/sintéticos antes de um reset. | NÃO_ACIONADO | Nenhum reset destrutivo foi executado; a confirmação só é exigida antes de um futuro reset. | Condicional |
| OP-003 | Disponibilizar registry npm para auditoria final. | CONCLUÍDO | API e web: zero vulnerabilidades, sem guardar output sensível. | SF-AUD-008/G7 |
| OP-004 | Disponibilizar browsers Playwright Firefox/WebKit. | CONCLUÍDO | Firefox/WebKit 10/10 no manifesto final. | G6/G7 |
| OP-005 | Fornecer chave local de backup com 32 bytes fora do report e autorizar restore real. | PENDENTE | Confirmação de presença/comprimento e hash do drill, nunca a chave. | SF-AUD-017/SF-AUD-016/G7 |

O gate integral foi executado e falhou cedo, de forma segura, porque o `.env` atual não cumpre
`scope=local-pap`, `HOST=127.0.0.1` e `trust proxy=false`. Não foram contactados destinos remotos.
O install residual `real_dev/web/real_dev/web` continua propriedade de `root` e é tratado em
`SF-OBS-005`; nenhuma remoção privilegiada foi inventada.

## 5. Ledger mestre

| ID | Severidade | Natureza | Resultado esperado | Dependências | Estado | Gate | Evidence | Risco residual/reabertura |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SF-AUD-001 | CRÍTICA | CONFIRMADO/POTENCIAL | Credenciais rodadas, `.env` 0600 e scanner seguro. | OP-001 | BLOQUEADO_OPERADOR | G0 | EV-FINAL-SECRETS-001 parcial | Rotação/configuração local por confirmar; reabre perante novo secret material. |
| SF-AUD-002 | ALTA | CONFIRMADO | Todos os fluxos IA passam pela governação única. | G1 | FECHADO | G2 | EV-FINAL-AI-001,EV-FINAL-REVIEW-001 | Reabre com injeção direta/provider sem policy. |
| SF-AUD-003 | ALTA | CONFIRMADO | Papel/estado atuais e revogação global imediata. | G1 | FECHADO | G2/G6 | EV-FINAL-SESSION-001,EV-FINAL-REVIEW-001 | TOCTOU WS estreito documentado; multi-instância reabre. |
| SF-AUD-004 | ALTA | CONFIRMADO | Export/delete cobrem todos os models e storage. | G2,G3 | FECHADO | G4 | EV-FINAL-PRIVACY-001,EV-FINAL-REVIEW-001 | Reabre com model sem política ou novo efeito pós-delete. |
| SF-AUD-005 | ALTA | CONFIRMADO | Upload validado, atómico, limitado e reconciliável. | G1 | FECHADO | G3 | EV-FINAL-STORAGE-001,EV-FINAL-REVIEW-001 | Reabre com ficheiro sem documento/outbox. |
| SF-AUD-006 | ALTA | CONFIRMADO | Professor publica e aluno completa o percurso oficial. | G2 | FECHADO | G5/G6 | EV-FINAL-OFFICIAL-001,EV-FINAL-E2E-CHR-001 | Reabre com teste preso em DRAFT. |
| SF-AUD-007 | ALTA | POTENCIAL | IPv4-mapped e todos os ranges internos bloqueados. | G0 | FECHADO | G1 | EV-FINAL-SSRF-001,EV-FINAL-REVIEW-001 | Reabre com representação equivalente aceite. |
| SF-AUD-008 | ALTA/BAIXA | CONFIRMADO | Cadeias vulneráveis corrigidas e auditadas. | OP-003 | FECHADO | G0/G1 | EV-FINAL-AUDITS-001,EV-FINAL-REVIEW-001 | Reabre perante advisory aplicável. |
| SF-AUD-009 | ALTA/MÉDIA | CONFIRMADO/CONDICIONAL | Loopback fail-closed e sem confiança em header. | G1 | FECHADO | G1/G7 | EV-FINAL-CONFIG-001,EV-FINAL-REVIEW-001 | Fecho local; exposição pública reabre TLS/proxy/HSTS. |
| SF-AUD-010 | MÉDIA | CONDICIONAL | Manifesto/gate local e fronteira privada documentados. | G7 | MITIGADO_POR_ESCOPO | G1/G7 | EV-FINAL-MANIFEST-001 | Produção/CI/repositório privado canónico reabre. |
| SF-AUD-011 | MÉDIA | CONFIRMADO | Jobs com lease, retry, recovery e idempotência. | G2 | FECHADO | G3 | EV-FINAL-JOBS-001 | Multi-instância reabre runner distribuído. |
| SF-AUD-012 | MÉDIA | CONFIRMADO/CONDICIONAL | Storage local seguro e limitação explícita. | G3 | MITIGADO_POR_ESCOPO | G3/G7 | EV-FINAL-STORAGE-001 | Hosting efémero/multi-instância reabre. |
| SF-AUD-013 | MÉDIA | CONFIRMADO | Últimos jobs/versões reaparecem após reload. | G3 | FECHADO | G3/G6 | EV-FINAL-JOBS-001,EV-FINAL-E2E-CHR-001 | Reabre com estado apenas local. |
| SF-AUD-014 | MÉDIA | CONFIRMADO | Operações críticas e último admin atómicos. | G2 | FECHADO | G2/G4 | EV-FINAL-ATOMIC-001 | Reabre com write fora da transaction/invariante. |
| SF-AUD-015 | MÉDIA | CONFIRMADO | Liveness/readiness refletem dependências reais. | G3 | FECHADO | G7 | EV-FINAL-HEALTH-001 | Reabre com probe literal/config. |
| SF-AUD-016 | MÉDIA | CONFIRMADO | Gate local fail-closed e rollback executável. | OP-001,OP-005 | BLOQUEADO_OPERADOR | G7 | EV-FINAL-GATE-FAIL-001 | Gate completo/restore/snapshot não passaram. |
| SF-AUD-017 | MÉDIA | CONFIRMADO | Backup consistente, cifrado e restore demonstrado. | OP-005 | BLOQUEADO_OPERADOR | G7 | EV-FINAL-BACKUP-UNIT-001 parcial | Restore real/chave manual pendentes; off-site fora do âmbito. |
| SF-AUD-018 | MÉDIA | CONFIRMADO | Playwright nunca reutiliza app errada silenciosamente. | G1 | FECHADO | G1 | EV-FINAL-E2E-CHR-001..003,EV-FINAL-E2E-CROSS-001 | Reabre com reuse/identidade não isolados. |
| SF-AUD-019 | MÉDIA | CONFIRMADO | Suite final totalmente verde em três runs. | G1 | FECHADO | G1/G7 | EV-FINAL-E2E-CHR-001..003 | Reabre com helper/evidence stale. |
| SF-AUD-020 | MÉDIA | CONFIRMADO | Role guard antes do mount/request. | G2 | FECHADO | G6 | EV-FINAL-WEB-001,EV-FINAL-REVIEW-001 | Backend permanece autoridade final. |
| SF-AUD-021 | MÉDIA | CONFIRMADO | Zero overflow a 320/360/375/390 px. | G6 | FECHADO | G6 | EV-FINAL-VISUAL-001,EV-FINAL-E2E-CROSS-001 | Reabre em viewport suportado. |
| SF-AUD-022 | MÉDIA | CONFIRMADO | Labels, teclado, focus e contraste WCAG AA. | G6 | FECHADO | G6 | EV-FINAL-VISUAL-001,EV-FINAL-E2E-CROSS-001 | Reabre com axe serious/critical. |
| SF-AUD-023 | MÉDIA | CONFIRMADO | Sessão/mutações distinguem pending e falhas. | G2 | FECHADO | G6 | EV-FINAL-WEB-001 | Reabre com rede/5xx tratado como logout. |
| SF-AUD-024 | MÉDIA | CONFIRMADO | Polling/chat sem sobreposição, perda ou duplicação. | G3 | FECHADO | G3/G6 | EV-FINAL-SESSION-001,EV-FINAL-WEB-001 | Reabre com resposta stale/sem ack. |
| SF-AUD-025 | MÉDIA | CONFIRMADO | Rate limit/bulkheads e parsing terminável. | G1 | FECHADO | G1/G3 | EV-FINAL-PARSING-001,EV-FINAL-REVIEW-001 | Reabre sem resource limits/concorrência. |
| SF-AUD-026 | MÉDIA | CONFIRMADO | Destinatário não vê IDs/supressões de terceiros. | G5 | FECHADO | G5/G6 | EV-FINAL-API-001 | Reabre se DTO público expuser arrays. |
| SF-AUD-027 | MÉDIA | CONFIRMADO | Máximo três tentativas e best-attempt único. | G5 | FECHADO | G5/G6 | EV-FINAL-OFFICIAL-001,EV-FINAL-PRIVACY-001 | Reabre com answer key antecipado/múltiplas linhas. |
| SF-AUD-028 | MÉDIA | CONFIRMADO | Unit/component tests web com thresholds. | G1 | FECHADO | G1/G6 | EV-FINAL-WEB-001 | Threshold não baixa sem decisão explícita. |
| SF-AUD-029 | MÉDIA | CONFIRMADO | Fonte técnica/evidence ligada ao manifesto. | G1-G7,SF-DOC-001..010 | FECHADO | G7/DOC | EV-DOC-MANIFEST-001,EV-DOC-009,EV-DOC-010,EV-DOC-SOLVER-001,EV-DOC-REAUDIT-001 | Reabre com drift de manifesto, gerador, solver, mapa, inventário ou autoridade documental. |
| SF-AUD-030 | MÉDIA | CONFIRMADO | Scripts usam loader comum. | G1 | FECHADO | G1 | EV-FINAL-CONFIG-001 | Reabre com env avulso/bypass E2E. |
| SF-AUD-031 | MÉDIA | CONFIRMADO | Runtime/runbook/seed reproduzíveis e seguros. | G1 | FECHADO | G1/G7 | EV-FINAL-CONFIG-001 | Fecho local; runtime divergente reabre. |
| SF-AUD-032 | MÉDIA | CONFIRMADO | Lazy routes e budgets ativos. | G6 | FECHADO | G6 | EV-FINAL-BUNDLE-001 | Reabre ao exceder budget/socket no entry. |

### 5.1 Ledger da correção documental

Os IDs abaixo controlam a sincronização documental sem fundir ou substituir os 32 findings da
auditoria. O estado `estado` dos BK continua a representar apenas o progresso pedagógico; o
estado da implementação de referência é registado separadamente em `real_dev_status`.

| ID | Âmbito | Resultado esperado | Estado | Evidence atual | Risco residual/reabertura |
| --- | --- | --- | --- | --- | --- |
| SF-DOC-001 | Autoridade documental e modelo de estados | Hierarquia explícita, dois estados por BK e referência ligada ao manifesto. | FECHADO | EV-DOC-001,EV-DOC-SOLVER-001,EV-DOC-REAUDIT-001 | Reabre com BK sem os dois estados ou autoridade/solver ambíguos. |
| SF-DOC-002 | Sessões, atomicidade e chat | Sessão v2, transações, sentinel e acks/revalidação documentados sem padrões antigos copiáveis. | FECHADO | EV-DOC-002,EV-DOC-REAUDIT-001 | Reabre com sessão stale, write não atómico ou socket sem revalidação. |
| SF-DOC-003 | Governação IA e `ROOM_AI` | Fachada única e sequência governada completa em todos os fluxos copiáveis. | FECHADO | EV-DOC-003,EV-DOC-REAUDIT-001 | Reabre com injeção direta de provider ou consentimento automático. |
| SF-DOC-004 | Exportação, eliminação e retenção RGPD | Registry total, políticas, tombstones, outbox, attachment e TTL documentados. | FECHADO | EV-DOC-004,EV-DOC-REAUDIT-001 | Reabre com modelo não classificado ou export/delete parcial. |
| SF-DOC-005 | Storage, parsing, jobs e polling | Storage atómico, workers termináveis, runner recuperável e polling single-flight. | FECHADO | EV-DOC-005,EV-DOC-REAUDIT-001 | Reabre com write direto, `void` job, `Promise.race` isolado ou polling sobreposto. |
| SF-DOC-006 | Mini-testes, ranking e notificações | Ciclo completo, três tentativas, `BEST_ATTEMPT` e DTO mínimo. | FECHADO | EV-DOC-006,EV-DOC-REAUDIT-001 | Reabre com answer key antecipado, ranking por tentativa ou IDs públicos. |
| SF-DOC-007 | Runtime local, segurança, health, backup e release | Perfil local fail-closed e gates manuais descritos honestamente. | FECHADO | EV-DOC-007,EV-DOC-REAUDIT-001 | OP-001/OP-005 continuam bloqueadores; publicação reabre controlos de produção. |
| SF-DOC-008 | Frontend, acessibilidade e bundle | Router/HTTP/sessão/async/chat/mobile/WCAG/budgets sincronizados. | FECHADO | EV-DOC-008,EV-DOC-REAUDIT-001 | Reabre com rota proibida montada, falha de rede como logout ou regressão WCAG/bundle. |
| SF-DOC-009 | Mapa técnico, cábulas e inventários | Nove interfaces finais e inventários gerados/checkáveis ligados ao manifesto. | FECHADO | EV-DOC-009,EV-DOC-REAUDIT-001 | Reabre com inventário manual ou contrato final ausente. |
| SF-DOC-010 | Evidence histórica, geradores e validação semântica | História inequívoca, sem segredos, e `docs:verify` fail-closed. | FECHADO | EV-DOC-010,EV-DOC-SOLVER-001,EV-DOC-REAUDIT-001 | Reabre com histórico confundível, solver inválido ou padrão antigo não detetado. |

### 5.2 Log de transições documentais

| Data | IDs | Transição | Implementador | Manifesto | Comando/procedimento | Exit code | Resultado sanitizado |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| 2026-07-10T15:30:36+01:00 | SF-AUD-029,SF-DOC-001 | FECHADO→REABERTO; PLANEADO→EM_IMPLEMENTACAO | Codex/root | `b112da65…cdc02` invalidado para o ciclo | baseline direta de docs/worktree | 0 | 8 paths preexistentes registados; sem conteúdo sensível. |
| 2026-07-10T15:34:00+01:00 | SF-DOC-002..008 | PLANEADO→EM_IMPLEMENTACAO | Codex + revisão paralela independente | `b112da65…cdc02` (baseline) | pesquisa semântica por contratos/padrões | 0 | Targets MF0-MF8, chat, RF/RNF e operação distribuídos sem sobreposição. |
| 2026-07-10T15:45:00+01:00 | SF-DOC-009 | PLANEADO→EM_IMPLEMENTACAO | Codex/root | INVALIDADO após alteração em `real_dev` | API build; inventário AST write/check; teste Jest focado | 0 | build PASS; write/check PASS; 2/2 testes do gerador PASS. |
| 2026-07-10T15:47:00+01:00 | SF-DOC-010 | PLANEADO→EM_IMPLEMENTACAO | Codex/root | INVALIDADO | `validate_planificacao_canonica.py --semantic-fixtures --json` | 0 | 9 fixtures, zero falhas; validação integral ainda pendente. |
| 2026-07-10T16:21:41+01:00 | SF-DOC-001..010 | EM_IMPLEMENTACAO→PRONTO_VALIDAR→VALIDADO | Codex/root + revisões paralelas | `b4cab253…94c995` | `npm --prefix real_dev/api run docs:verify`; geradores `--check`; suites regressivas | 0 | 107 BK; score 100; 9 fixtures; 30 históricos; zero issues/secrets; mapa/inventário PASS. |
| 2026-07-10T16:21:41+01:00 | SF-AUD-029 | REABERTO→PRONTO_VALIDAR | Codex/root | `b4cab253…94c995` | `manifest:hash`; `technical-map:check`; `function-inventory:check`; `docs:verify` | 0 | 720 ficheiros; ligações ao manifesto coerentes; aguarda reauditoria documental independente. |
| 2026-07-10T16:29:27+01:00 | SF-DOC-001,007..010,SF-AUD-029 | VALIDADO/PRONTO_VALIDAR→REABERTO | final_docs_reaudit + Codex/root | `b4cab253…94c995` invalidado; novo `0412e329…25a111` | reauditoria read-only + correção de `.env.example` | 0 | Drift MF8 corrigido; 13 guias/344 refs pedagógicas e template reabertos para correção; nenhuma claim fechada. |
| 2026-07-10T16:57:58+01:00 | SF-DOC-001,007..010 | REABERTO→PRONTO_VALIDAR→VALIDADO | Codex/root + revisões paralelas | `799990e7…4e538` | correções paths/estados/examples; regressão completa; `docs:verify` | 0 | 352 paths públicos; 107 BK; 11 fixtures; 31 históricos; API 633; web 144; E2E 30×3+10; zero issues/secrets. |
| 2026-07-10T16:57:58+01:00 | SF-AUD-029 | REABERTO→PRONTO_VALIDAR | Codex/root | `799990e7…4e538` | manifesto, mapas gerados, audit/conformity, gate documental | 0 | SHA estável em 720 ficheiros; reauditoria independente final pendente. |
| 2026-07-10T17:26:50+01:00 | SF-DOC-001,010,SF-AUD-029 | VALIDADO/PRONTO_VALIDAR→REABERTO→VALIDADO/PRONTO_VALIDAR | solver_check_diagnosis + Codex/root | `799990e7…4e538` | solver self-test/check; output canónico; `docs:verify` | 0 | 107 BK/164u; três repairs; 9 owner/17 sprint changes; zero violations; output determinístico. |
| 2026-07-10T17:32:46+01:00 | SF-DOC-001..010,SF-AUD-029 | VALIDADO/PRONTO_VALIDAR→FECHADO | final_docs_reaudit | `799990e7…4e538` | reauditoria fresh read-only; manifesto/solver/docs gate/apps/blockers | 0 | PASS sem finding documental aberto; caches removidas; blockers manuais preservados. |
| 2026-07-11T11:31:28+01:00 | SF-DOC-002,008..010,SF-AUD-029 | FECHADO→REABERTO→VALIDADO→FECHADO | Codex/root | `2f6ad3f7…9ed55c` | correção dos dois chats; mapa/inventário write/check; manifesto repetido; `docs:verify` | 0 | PASS: contratos atuais, extensão transversal sem novo RF/BK, 734 ficheiros, score 100 e blockers manuais preservados. |

## 6. Observações baixas

| ID | Observação original | Estado | Gate | Resultado esperado | Evidence |
| --- | --- | --- | --- | --- | --- |
| SF-OBS-001 | Rota desconhecida autenticada cai silenciosamente no dashboard. | FECHADO | G6 | 404 explícito por role; testes router/E2E. | EV-FINAL-WEB-001,EV-FINAL-E2E-CHR-001 |
| SF-OBS-002 | Label `Contexts` não traduzido. | FECHADO | G6 | `Contextos` e enums PT-PT. | EV-FINAL-WEB-001 |
| SF-OBS-003 | Exportação mostra JSON em `<pre>`. | FECHADO | G4/G6 | Attachment JSON API + Blob UI. | EV-FINAL-PRIVACY-001,EV-FINAL-WEB-001 |
| SF-OBS-004 | Não há HSTS na API. | MITIGADO_POR_ESCOPO | G7 | Loopback apenas; publicação reabre TLS/HSTS no edge. | EV-FINAL-CONFIG-001 |
| SF-OBS-005 | Install aninhado residual em `real_dev/web/real_dev/web/node_modules`. | BLOQUEADO_OPERADOR | G7 | Diretório pertence a root; `rm` e `sudo -n rm` falharam por permissões/password. | EV-FINAL-OWNER-001 |
| SF-OBS-006 | Sem verificação de email/SSO escolar. | MITIGADO_POR_ESCOPO | G1/G7 | PAP local + rate limit; publicação reabre email/SSO. | EV-FINAL-CONFIG-001,EV-FINAL-API-001 |
| SF-OBS-007 | Sanitizador de evidence não cobre todas as formas de segredo. | FECHADO | G0/G7 | Scanner PASS; temp storage/reports E2E 11 → 0. | EV-FINAL-SECRETS-001,EV-FINAL-CLEANUP-001 |
| SF-OBS-008 | Sem estratégia explícita de migrations/índices. | FECHADO | G1/G7 | Reset/index bootstrap fail-closed local; produção reabre migrations. | EV-FINAL-CONFIG-001,EV-FINAL-ATOMIC-001 |

## 7. Fichas dos findings

As evidências abaixo preservam a importação da auditoria de origem. As linhas de implementação
plan-time foram substituídas por referências às fichas finais de §7A; a importação literal integral
está no Anexo A.

### SF-AUD-001 — Material de credenciais em `.env` com permissões `0644`

- Severidade/estado original: **CRÍTICA**; confirmado quanto à presença/formato e permissões,
  validade não testada.
- Evidência original: `real_dev/api/.env:2,6`; `stat` devolveu `0644`; existem valores não
  vazios com formato de chave OpenAI e URI MongoDB com userinfo.
- Resultado/aceitação: modo `0600`, exemplos sanitizados, scanner seguro e rotação confirmada
  sem expor valores.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-002 — Governação de IA contornada em cinco famílias de fluxo

- Severidade/estado original: **ALTA**, confirmado.
- Evidência original: chamadas diretas ao provider em summaries, study-tools, adaptive-learning,
  room-ai e external-knowledge; `AiModule` não importa consentimentos, policies ou quotas.
- Resultado/aceitação: fachada única, `ROOM_AI`, fail-closed e teste arquitetural sem injeções
  diretas; consentimento/policy/quota bloqueiam antes do provider.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-003 — Papéis obsoletos permanecem válidos nas sessões durante até 8 horas

- Severidade/estado original: **ALTA**, confirmado.
- Evidência original: a sessão serializa todo o utilizador durante 8 horas e não relê Mongo;
  mudança de papel só atualiza Mongo e eliminação destrói apenas a sessão corrente.
- Resultado/aceitação: payload mínimo versionado, releitura do utilizador e revogação REST/WS
  em todas as sessões.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-004 — Exportação e eliminação RGPD não acompanham a aplicação atual

- Severidade/estado original: **ALTA**, confirmado.
- Evidência original: eliminação cobre apenas materiais, áreas e eventos; exportação apenas
  utilizador, áreas, materiais e preferências; muitos domínios e ficheiros físicos ficam de fora.
- Resultado/aceitação: registry de todos os models, export/delete completos, storage físico,
  sessões e teste integral.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-005 — Upload autenticado pode deixar ficheiros órfãos e esgotar disco

- Severidade/estado original: **ALTA**, confirmado pelo caminho de código.
- Evidência original: metadata multipart sem DTO; ficheiro escrito antes do documento; falha de
  create não faz cleanup e não há quota por utilizador.
- Resultado/aceitação: validação prévia, staging/commit, compensação, quota, rate limit e
  reconciliação.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-006 — Mini-testes criados pela UI nunca ficam disponíveis aos alunos

- Severidade/estado original: **ALTA**, confirmado end-to-end pelo contrato.
- Evidência original: UI fixa a primeira opção como correta, cria sempre `DRAFT`, não valida
  quatro opções e não oferece publicação; aluno só vê `PUBLISHED`.
- Resultado/aceitação: editor completo, publicação/fecho e E2E professor-aluno-ranking.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-007 — Bypass potencial do filtro SSRF com IPv4 mapeado em IPv6

- Severidade/estado original: **ALTA**, potencial fortemente sustentado.
- Evidência original: `isPrivateIp` não normaliza `::ffff:127.0.0.1` nem
  `::ffff:169.254.169.254`; a mesma decisão é usada antes/depois da ligação.
- Resultado/aceitação: parser robusto e testes de todas as representações equivalentes.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-008 — Dependências com vulnerabilidades atuais

- Severidade/estado original: **ALTA** API e **BAIXA** web, confirmado por audit em 2026-07-09.
- Evidência original: Multer 2.1.1; `tar@6.2.1` via bcrypt/node-pre-gyp; esbuild 0.27.7.
- Resultado/aceitação: lockfiles corrigidos, builds/testes verdes e audit atual sem os advisories.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-009 — Enforcement HTTPS confia num header controlável

- Severidade/estado original: **ALTA** com API direta e **MÉDIA** com ingress fechado.
- Evidência original: middleware aceita `x-forwarded-proto`; `main.ts` não configura proxies
  confiáveis.
- Resultado/aceitação: loopback obrigatório, proxy desligado e tentativa pública rejeitada.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-010 — Proveniência e pipeline da implementação real não são demonstráveis neste checkout

- Severidade/estado original: **MÉDIA e condicional**.
- Evidência original: `real_dev/` é intencionalmente ignorada, não existem ficheiros tracked nem
  pipeline/manifestos de deploy demonstráveis neste checkout.
- Resultado/aceitação: manifesto SHA-256, gate local e fronteira PAP documentada.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-011 — Jobs persistem estado, mas não têm fila durável nem recovery

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: indexação/quizzes arrancam com `void`; restart abandona
  `QUEUED/PROCESSING`; não há lease, retry, recovery ou backpressure.
- Resultado/aceitação: runner Mongo com claim/lease, retry, recovery e idempotência.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-012 — Storage local quebra escala horizontal e durabilidade em hosting efémero

- Severidade/estado original: **MÉDIA**, confirmado/condicional.
- Evidência original: storage usa diretório local enquanto documentação afirma preparação
  horizontal; instâncias/redeploy podem perder ou não encontrar ficheiros.
- Resultado/aceitação: storage local endurecido e limitação single-instance explícita.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-013 — Estado de indexação e link de versões desaparecem após reload

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: `jobsByMaterial` só existe em estado React e a API exige conhecer o ID do
  job; reload volta a mostrar `Indexar` e esconde `Versões`.
- Resultado/aceitação: endpoint latest-by-material, hidratação inicial e idempotência.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-014 — Operações críticas multi-documento não são atómicas

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: eliminação, mudança de papel e versões fazem writes sem transaction; último
  admin usa `count -> write`, permitindo race.
- Resultado/aceitação: transactions, sentinel/índices atómicos e testes de concorrência/falha.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-015 — Health e runtime podem declarar saúde sem MongoDB/Redis

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: health usa uptime/env e runtime devolve literais `redis`/`mongodb` sem ping.
- Resultado/aceitação: liveness separada, readiness com timeouts e 503 em falha.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-016 — Gate de deploy e rollback insuficientes

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: `deploy:check` só faz build API e procura qualquer ficheiro de rollback;
  não valida web, testes, config, dependências, backup ou smoke.
- Resultado/aceitação: gate local agregador fail-closed e rollback/restore ensaiado.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-017 — Backup sem restore demonstrado, snapshot consistente ou cifragem

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: JSONL gzip com 0600, mas sem consistência entre coleções, checksum,
  cifragem ou script/teste de restore.
- Resultado/aceitação: backup offline cifrado, manifesto e restore real em base vazia.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-018 — Playwright pode reutilizar uma aplicação errada

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: portas fixas e `reuseExistingServer: !CI`; execução chegou a ligar-se à
  aplicação OPSA na porta 4175.
- Resultado/aceitação: isolamento por execução, reuse opt-in e assinatura da aplicação.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-019 — Suite E2E atual: 20/29; nove cenários não chegam ao objetivo

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: nove falhas partilham assertion obsoleta que procura email removido da
  shell; evidence ainda declara PASS e contagens antigas.
- Resultado/aceitação: helper central, 29/29 x3 e evidence regenerada pela suite final.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-020 — Rotas frontend protegidas não aplicam papel antes de montar páginas

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: rotas são resolvidas antes do role-gating; aluno abriu UI admin e só a API
  respondeu 403.
- Resultado/aceitação: tabela declarativa, role guard, 403 e zero requests proibidos.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-021 — Quebra responsiva real a 320 px

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: header em linha única; a 320 px, `clientWidth=305`, `scrollWidth=364` e
  overflow horizontal de 59 px.
- Resultado/aceitação: menu mobile acessível e zero overflow nas quatro larguras.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-022 — Acessibilidade: nomes acessíveis e contraste insuficientes

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: controlos críticos usam apenas placeholder; contraste medido ≈3,44:1 e
  ≈2,46:1 em combinações de texto.
- Resultado/aceitação: labels/associações/live regions, WCAG AA, teclado e axe.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-023 — Erros de sessão e mutações não têm estado robusto na UI

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: qualquer erro de `/auth/me` vira logout; logout e várias mutações não
  tratam falha/pending e admitem duplo clique/respostas tardias.
- Resultado/aceitação: cliente tipado, sessão `unavailable`, async actions e abort/idempotência.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-024 — Polling e chat admitem races

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: `setInterval(async)` sobrepõe pedidos; chat carrega antes de join e limpa
  draft sem ack.
- Resultado/aceitação: polling recursivo monotónico, join/send ack e reconciliação/deduplicação.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-025 — Registo público e parsing pesado sem bulkheads suficientes

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: registo executa bcrypt cost 12 sem rate limit; `Promise.race` não cancela
  parsing PDF/DOCX.
- Resultado/aceitação: rate limit, limite de password, workers termináveis e concorrência 2.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-026 — Notificações revelam a lista completa de destinatários/supressões

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: destinatários recebem `recipientIds` e `suppressedRecipientIds`.
- Resultado/aceitação: DTO mínimo e apenas contagens agregadas em contexto autorizado.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-027 — Ranking aceita tentativas ilimitadas e múltiplas linhas do mesmo aluno

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: cada submissão cria tentativa, revela correta e ranking lista todas as
  tentativas.
- Resultado/aceitação: máximo três, feedback controlado e best-attempt único.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-028 — Ausência de testes unitários/componentes no frontend

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: package web só tem build/Playwright; zero specs unitários/componentes e
  inventário MF8 não mede coverage real.
- Resultado/aceitação: Vitest/RTL, coverage global e thresholds críticos.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-029 — Documentação/evidence sem source of truth único

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: TESTES-FINAIS desatualizado, mapas técnicos divergentes e README E2E ainda
  descrito como MF1.
- Resultado/aceitação: geração única, diff fail-closed e evidence ligada ao manifesto final.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-030 — Scripts standalone não carregam o `.env` local

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: seed, backup, TLS, smokes e deploy validator leem `process.env` diretamente;
  seed falhou apesar de `.env` existente.
- Resultado/aceitação: loader comum em todos os entrypoints, com env injetado a prevalecer.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-031 — Runtime e operação não estão fixados/documentados para reprodução

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: sem `engines`, `.nvmrc` ou `.node-version`; sem runbook `real_dev`; seed só
  recusa `NODE_ENV=production`.
- Resultado/aceitação: runtime fixo, runbook e seed/reset explicitamente opt-in/local.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

### SF-AUD-032 — Bundle único e carregamento excessivo

- Severidade/estado original: **MÉDIA**, confirmado.
- Evidência original: `App`/`ProtectedRoutes` importam todas as páginas; build gera JS único de
  456,47 kB (122,70 kB gzip).
- Resultado/aceitação: lazy routes, socket apenas no chat e budgets fail-closed.
- Implementação/evidence/rollback final: ver a ficha correspondente em §7A e o registry em §8.

## 7A. Fichas finais de remediação

### Controlo comum das transições

- Transição final: 2026-07-10; implementador: Codex/root; reviewer independente:
  final_reaudit; manifesto: b112da6549e36d1526b593d1f09548d55509589d8974aa3b0c7e4220624cdc02.
- Os comandos, exit codes e resultados sanitizados são referenciados por Evidence ID em §8.2.
- Rollback comum: parar a instância, restaurar apenas os módulos indicados a partir de uma cópia
  correspondente ao manifesto anterior e repetir bootstrap/reset somente numa base local vazia.
  Não existe rollback por Git porque real_dev é intencionalmente ignorada.
- Qualquer alteração futura a real_dev invalida as provas afetadas e move o finding para REABERTO.

### SF-AUD-001 — Ficha final

- Causa raiz: segredos duradouros estavam no checkout local e o ficheiro era legível além do titular.
- Implementação/interfaces: modo 0600, scanner seguro e runtime que recusa Mongo/Redis remotos,
  userinfo, host público, proxy ativo e flags E2E fora de NODE_ENV=test.
- Aceitação/testes: permission check e EV-FINAL-SECRETS-001; rotação externa não foi executada.
- Estado/evidence: BLOQUEADO_OPERADOR; OP-001; evidence parcial no manifesto final.
- Rollback/risco: não reabrir permissões nem reintroduzir valores; fecha apenas após confirmação
  não secreta da rotação e substituição do env por configuração local.

### SF-AUD-002 — Ficha final

- Causa raiz: cinco famílias chamavam o provider sem consentimento, policy e quota comuns.
- Implementação/interfaces: GovernedAiExecutionService tornou-se a única injeção de AI_PROVIDER;
  ROOM_AI e erros estáveis de consentimento/policy/quota/timeout foram adicionados.
- Aceitação/testes: arquitetura provider-only, provider-not-called, guardrails, output validation e
  audit seguro; EV-FINAL-AI-001 e EV-FINAL-REVIEW-001.
- Estado/evidence: FECHADO, com revisão independente.
- Rollback/risco: desativar finalidades na policy; nova injeção direta reabre imediatamente.

### SF-AUD-003 — Ficha final

- Causa raiz: a sessão guardava role durante oito horas e WebSockets herdavam contexto stale.
- Implementação/interfaces: sessão Redis v2 {userId, sessionVersion}, releitura Mongo, 401
  SESSION_REVOKED, revoke-all e revalidação join/send/passive broadcast.
- Aceitação/testes: duas sessões reais, mudança/delete e socket passivo revogado; EV-FINAL-SESSION-001.
- Estado/evidence: FECHADO, com revisão independente.
- Rollback/risco: rollout invalida sessões antigas; TOCTOU de broadcast em voo fica residual local
  e multi-instância reabre o desenho.

### SF-AUD-004 — Ficha final

- Causa raiz: export/delete eram listas manuais incompletas e jobs podiam recriar dados após delete.
- Implementação/interfaces: registry fail-closed de 59 models; export completo; políticas
  DELETE/PULL/TOMBSTONE/ANONYMIZE_90D; storage pós-commit; lifecycle barrier no quiz runner.
- Aceitação/testes: integração real semeia todos os models, duas salas, duas sessões, storage, TTL,
  provider atrasado e answer-key omitido; EV-FINAL-PRIVACY-001.
- Estado/evidence: FECHADO, com revisão independente.
- Rollback/risco: modelo novo sem regra ou efeito pós-delete reabre; cleanup temporário rejeitado
  pelo filesystem permanece follow-up operacional baixo.

### SF-AUD-005 — Ficha final

- Causa raiz: ficheiro era persistido antes da metadata/documento e não existiam quota/compensação.
- Implementação/interfaces: nome NFC até 255, título até 160, staging UUID/SHA-256, quota 250 MiB,
  promoção atómica, abort/delete/outbox/reconcile e rate limit.
- Aceitação/testes: 3 suites/30 testes focados, physical delete all-model e full API;
  EV-FINAL-STORAGE-001.
- Estado/evidence: FECHADO, com revisão independente.
- Rollback/risco: remover staging/documento por compensação; ficheiro sem documento reabre.

### SF-AUD-006 — Ficha final

- Causa raiz: editor fixava a primeira resposta correta e só criava DRAFT sem publicação.
- Implementação/interfaces: editor 1–60 perguntas, quatro opções distintas, correta explícita e
  endpoints publish/close/attempts-me.
- Aceitação/testes: percurso professor-publicação-aluno-três tentativas-ranking em unit,
  concorrência e E2E; EV-FINAL-OFFICIAL-001.
- Estado/evidence: FECHADO, com revisão independente.
- Rollback/risco: testes publicados são imutáveis; regresso a DRAFT-only reabre.

### SF-AUD-007 — Ficha final

- Causa raiz: parser artesanal não canonizava IPv4-mapped IPv6.
- Implementação/interfaces: ipaddr.js, pin DNS, allowlist de protocolos/portas, redirects e
  validação pré/pós ligação e remoteAddress.
- Aceitação/testes: loopback, metadata, link-local, reservados, IPv4/IPv6/mapped;
  EV-FINAL-SSRF-001.
- Estado/evidence: FECHADO, com revisão independente.
- Rollback/risco: representação interna aceite ou remoção do pin reabre.

### SF-AUD-008 — Ficha final

- Causa raiz: lockfiles continham Multer vulnerável, cadeia bcrypt/tar antiga e Vite/esbuild afetado.
- Implementação/interfaces: multer 2.2.0, bcrypt 6.0.0 sem tar e Vite 8.1.4; locks reproduzíveis.
- Aceitação/testes: builds, suites e npm audit API/web com zero vulnerabilidades;
  EV-FINAL-AUDITS-001.
- Estado/evidence: FECHADO, com revisão independente.
- Rollback/risco: não fazer downgrade; advisory novo aplicável reabre.

### SF-AUD-009 — Ficha final

- Causa raiz: HTTPS aceitava X-Forwarded-Proto sem proxy confiável.
- Implementação/interfaces: scope local-pap, bind 127.0.0.1, trust proxy=false e falha com host
  público/wildcard; middleware usa request.secure.
- Aceitação/testes: config/HTTPS negativos e gate que rejeita env atual não local;
  EV-FINAL-CONFIG-001.
- Estado/evidence: FECHADO no âmbito local, com revisão independente.
- Rollback/risco: publicação reabre TLS, proxy e HSTS.

### SF-AUD-010 — Ficha final

- Causa raiz: real_dev é ignorada e não há proveniência/CI demonstrável neste checkout.
- Implementação/interfaces: manifesto SHA-256 seguro, mapa canónico e gate local ligados ao hash.
- Aceitação/testes: hash reproduzido por executor e reviewer; EV-FINAL-MANIFEST-001.
- Estado/evidence: MITIGADO_POR_ESCOPO.
- Rollback/risco: produção/CI ou ausência de repositório privado canónico reabre.

### SF-AUD-011 — Ficha final

- Causa raiz: jobs eram void fire-and-forget sem recovery.
- Implementação/interfaces: runner Mongo, lease 30 s, heartbeat/fencing, concorrência 2, três
  tentativas, backoff 1/5/30 e recovery no arranque.
- Aceitação/testes: leases expiradas reais para index e quiz, crash/retry/idempotência;
  EV-FINAL-JOBS-001.
- Estado/evidence: FECHADO.
- Rollback/risco: multi-instância reabre necessidade de runner distribuído.

### SF-AUD-012 — Ficha final

- Causa raiz: storage local não suporta scale-out ou disco efémero.
- Implementação/interfaces: diretório dedicado 0700/0600, checksums, reconcile e backup local.
- Aceitação/testes: storage/reconcile/readiness e documentação single-instance;
  EV-FINAL-STORAGE-001.
- Estado/evidence: MITIGADO_POR_ESCOPO.
- Rollback/risco: hosting efémero ou múltiplas instâncias reabre object storage.

### SF-AUD-013 — Ficha final

- Causa raiz: jobsByMaterial existia apenas em estado React.
- Implementação/interfaces: GET latestByMaterial, POST idempotente 202, hidratação, polling
  single-flight/abort/estado monotónico.
- Aceitação/testes: API, component e E2E reload; EV-FINAL-JOBS-001 e EV-FINAL-E2E-CHR-001.
- Estado/evidence: FECHADO.
- Rollback/risco: state exclusivamente local reabre.

### SF-AUD-014 — Ficha final

- Causa raiz: writes críticos eram multi-documento sem transaction e último admin fazia count-write.
- Implementação/interfaces: transactions, sentinel atómico, índices parciais e versões únicas.
- Aceitação/testes: concorrência/rollback/pending deletion em Mongo real e fault injection;
  EV-FINAL-ATOMIC-001.
- Estado/evidence: FECHADO.
- Rollback/risco: write fora da transaction ou invariante sem índice reabre.

### SF-AUD-015 — Ficha final

- Causa raiz: health reportava uptime/literais sem probes.
- Implementação/interfaces: /live, /ready e alias /health fail-closed para Mongo, Redis, storage e runner.
- Aceitação/testes: HTTP real live 200, ready/alias 503 negativo e readiness 200 no smoke;
  EV-FINAL-HEALTH-001.
- Estado/evidence: FECHADO.
- Rollback/risco: probe substituído por config/literal reabre.

### SF-AUD-016 — Ficha final

- Causa raiz: deploy check não agregava config, suites, audits, restore e smoke.
- Implementação/interfaces: verify:local-release lista/executa gates e invalida drift do manifesto.
- Aceitação/testes: plano PASS; execução integral exit 1 por env não local antes de qualquer remoto.
- Estado/evidence: BLOQUEADO_OPERADOR; EV-FINAL-GATE-FAIL-001.
- Rollback/risco: só fecha após OP-001/OP-005/OBS-005, gate PASS e snapshot final.

### SF-AUD-017 — Ficha final

- Causa raiz: backup não tinha snapshot, cifragem, checksum ou restore provado.
- Implementação/interfaces: gzip + AES-256-GCM, EJSON, manifesto SHA-256 e restore apenas local/vazio.
- Aceitação/testes: roundtrip sintético e gates negativos; restore real aguarda chave OP-005.
- Estado/evidence: BLOQUEADO_OPERADOR; EV-FINAL-BACKUP-UNIT-001 parcial.
- Rollback/risco: operação off-site fora do âmbito; nunca guardar a chave no report.

### SF-AUD-018 — Ficha final

- Causa raiz: portas fixas e reuseExistingServer podiam ligar a outra aplicação.
- Implementação/interfaces: portas/Mongo/Redis/runId dedicados, reuse opt-in, identidade API/web,
  boundary STUDYFLOW_E2E_MODE e cleanup por runId.
- Aceitação/testes: três runs Chromium e cross-browser, todos isolados; temp roots 11→0.
- Estado/evidence: FECHADO; EV-FINAL-E2E-CHR-001..003 e EV-FINAL-CLEANUP-001.
- Rollback/risco: reuse silencioso ou storage temporário residual reabre.

### SF-AUD-019 — Ficha final

- Causa raiz: helper de login procurava email removido e evidence antiga dizia PASS.
- Implementação/interfaces: helper usa shell/rota estável e evidence é regenerada no hash.
- Aceitação/testes: 30/30 em três execuções isoladas consecutivas.
- Estado/evidence: FECHADO; EV-FINAL-E2E-CHR-001..003.
- Rollback/risco: alteração de spec/harness invalida e exige três runs novas.

### SF-AUD-020 — Ficha final

- Causa raiz: páginas eram montadas antes da decisão de role.
- Implementação/interfaces: React Router lazy, ProtectedLayout, RoleGuard, 403/404 e returnTo interno.
- Aceitação/testes: rota proibida não monta nem pede API; web/review/E2E.
- Estado/evidence: FECHADO; EV-FINAL-WEB-001.
- Rollback/risco: backend continua autoridade; mount proibido reabre.

### SF-AUD-021 — Ficha final

- Causa raiz: header horizontal único excedia 320 px.
- Implementação/interfaces: disclosure mobile abaixo do header, alvos 44 px, Escape/foco/outside click.
- Aceitação/testes: 320/360/375/390 sem overflow em Chromium/Firefox/WebKit; inspeção visual 320/390.
- Estado/evidence: FECHADO; EV-FINAL-VISUAL-001 e EV-FINAL-E2E-CROSS-001.
- Rollback/risco: overflow em viewport suportado reabre.

### SF-AUD-022 — Ficha final

- Causa raiz: placeholders substituíam labels e cores não atingiam WCAG AA.
- Implementação/interfaces: labels, describedby/invalid, fieldset/legend, live regions, skip link e foco.
- Aceitação/testes: axe sem serious/critical, teclado/Escape/foco e inspeção visual.
- Estado/evidence: FECHADO; EV-FINAL-VISUAL-001 e EV-FINAL-E2E-CROSS-001.
- Rollback/risco: contraste/label regressivo reabre.

### SF-AUD-023 — Ficha final

- Causa raiz: qualquer erro auth/me simulava logout e ações não tinham pending/failure.
- Implementação/interfaces: ApiError/AbortSignal/204 e sessão checking/authenticated/anonymous/unavailable;
  useAsyncAction nas mutações críticas.
- Aceitação/testes: web unit/component/E2E 401/403/5xx.
- Estado/evidence: FECHADO; EV-FINAL-WEB-001.
- Rollback/risco: 5xx convertido em anonymous reabre.

### SF-AUD-024 — Ficha final

- Causa raiz: setInterval async sobrepunha polling e chat enviava/limpava sem ack.
- Implementação/interfaces: polling recursivo single-flight; join/send ack tipado, reconciliação e dedupe.
- Aceitação/testes: hook/component, socket real e E2E.
- Estado/evidence: FECHADO; EV-FINAL-SESSION-001 e EV-FINAL-WEB-001.
- Rollback/risco: resposta stale, duplicação ou draft limpo sem ack reabre.

### SF-AUD-025 — Ficha final

- Causa raiz: bcrypt público e parsing pesado não tinham bulkheads/cancelamento real.
- Implementação/interfaces: limites Redis de registo/upload, password 128, workers termináveis,
  concorrência 2 e resourceLimits 128/32/16/4 MiB.
- Aceitação/testes: worker real e 3 suites/30 testes focados.
- Estado/evidence: FECHADO; EV-FINAL-PARSING-001.
- Rollback/risco: parser no processo HTTP ou worker sem caps reabre.

### SF-AUD-026 — Ficha final

- Causa raiz: DTO público devolvia recipientIds e suppressedRecipientIds.
- Implementação/interfaces: vista de destinatário mínima e administração só com contagens.
- Aceitação/testes: service/controller e full API.
- Estado/evidence: FECHADO; EV-FINAL-API-001.
- Rollback/risco: arrays de terceiros em DTO público reabrem.

### SF-AUD-027 — Ficha final

- Causa raiz: tentativas ilimitadas, ranking por tentativa e answer key exportável.
- Implementação/interfaces: DRAFT/PUBLISHED/CLOSED, três slots atómicos, BEST_ATTEMPT, desempate
  estável, solutions gating e omissão recursiva da chave no export RGPD.
- Aceitação/testes: unit/ranking, concorrência real, E2E e integração all-model com answer key.
- Estado/evidence: FECHADO; EV-FINAL-OFFICIAL-001 e EV-FINAL-PRIVACY-001.
- Rollback/risco: resposta correta antes do unlock ou mais de uma linha/aluno reabre.

### SF-AUD-028 — Ficha final

- Causa raiz: web não tinha testes unit/component nem coverage gate.
- Implementação/interfaces: Vitest, jsdom, RTL, user-event, V8 e axe.
- Aceitação/testes: 32 ficheiros/144 testes; 73,78% lines e 63,44% branches; críticos ≥90/85.
- Estado/evidence: FECHADO; EV-FINAL-WEB-001.
- Rollback/risco: baixar threshold sem decisão reabre.

### SF-AUD-029 — Ficha final

- Causa raiz: mapas/evidence divergiam e não estavam ligados ao artefacto.
- Implementação/interfaces: TECHNICAL_MAP único, export/check byte-for-byte e manifesto seguro.
- Aceitação/testes: map check, inventário AST e validação semântica PASS sobre um novo hash
  reproduzido independentemente.
- Estado/evidence: REABERTO em 2026-07-10; EV-FINAL-MAP-001 e EV-FINAL-MANIFEST-001
  pertencem ao manifesto anterior e foram invalidadas para este ciclo documental.
- Rollback/risco: alteração depois da evidence reabre.

### SF-AUD-030 — Ficha final

- Causa raiz: scripts standalone liam env de forma divergente.
- Implementação/interfaces: loader/config tipada comum e boundary E2E central.
- Aceitação/testes: entrypoints/config/flags E2E e gate contaminado.
- Estado/evidence: FECHADO; EV-FINAL-CONFIG-001.
- Rollback/risco: process.env avulso que contorne o loader reabre.

### SF-AUD-031 — Ficha final

- Causa raiz: versões/runtime/seed não eram reproduzíveis nem suficientemente fail-closed.
- Implementação/interfaces: Node 24.11.1, npm 11.6.2, engines, packageManager, nvmrc/node-version,
  runbook e seed/reset/bootstrap opt-in local.
- Aceitação/testes: clean install prévio, builds, config/scripts.
- Estado/evidence: FECHADO no âmbito local; EV-FINAL-CONFIG-001.
- Rollback/risco: runtime divergente ou seed fora de local/teste reabre.

### SF-AUD-032 — Ficha final

- Causa raiz: import estático carregava todas as páginas e socket no entry.
- Implementação/interfaces: rotas lazy por papel; socket apenas no chunk de chat; budget fail-closed.
- Aceitação/testes: public 79,31 KiB gzip; entry 78,97; entry+rota 89,13; total 167,46; 52 chunks.
- Estado/evidence: FECHADO; EV-FINAL-BUNDLE-001.
- Rollback/risco: budget excedido ou socket no entry reabre.

## 8. Evidence registry

### 8.1 Evidence histórica invalidada/supersedida

As linhas baseline abaixo são preservadas para rastreabilidade, mas não fecham findings no manifesto final.

| Evidence ID | Finding | Tipo | Manifesto | Ambiente | Comando/procedimento | Exit/result | Artefacto seguro | Data | Reviewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EV-G0-REPORT-001 | TODOS | DOCUMENT_CONTROL | PENDENTE | workspace | Criação do ledger antes do código | PASS | Este ficheiro | 2026-07-09 | PENDENTE |
| EV-G0-PERM-001 | SF-AUD-001 | FILE_PERMISSION | baseline | local | `stat`, `chmod 600`, `stat` sobre `.env` | PASS: 0644 -> 0600 | Apenas modo/path | 2026-07-09 | PENDENTE |
| EV-G0-DEPS-001 | SF-AUD-008 | DEPENDENCY_UPDATE | baseline | local/npm | Multer 2.2.0, bcrypt 6.0.0, Nest 11.1.28, Vite 8.1.4/esbuild 0.28.1 | Instalação PASS; audit final pendente | package/lockfiles | 2026-07-09 | PENDENTE |
| EV-G0-SECRETS-001 | SF-AUD-001,SF-OBS-007 | SECRET_SCAN | baseline | workspace | `npm run secrets:scan` | PASS | Contagem sanitizada | 2026-07-09 | PENDENTE |
| EV-G1-CONFIG-001 | SF-AUD-009,SF-AUD-030,SF-AUD-031 | UNIT_TEST | baseline | API local | Jest config/HTTPS/auth/health focado | PASS: 22 testes relevantes; parser suite bloqueada por alteração G3 em curso | Output sanitizado | 2026-07-09 | PENDENTE |
| EV-G1-SSRF-001 | SF-AUD-007 | CODE_AND_NEGATIVE_TEST | baseline | API local | ipaddr.js, IPv4-mapped, ranges, portas e credenciais URL | Implementado; suite aguarda conclusão G3 | Source/spec | 2026-07-09 | PENDENTE |
| EV-G1-E2E-001 | SF-AUD-018,SF-AUD-019 | E2E_HARNESS | baseline | web local | Portas por run, reuse opt-in, identidade API/web e helpers corrigidas | Implementado; execução pendente | Config/global setup/specs | 2026-07-09 | PENDENTE |
| EV-G1-AUTH-001 | SF-AUD-025 | UNIT_TEST | baseline | API local | Rate limit de registo e limites de password | PASS nos testes focados; parsing em curso | Output sanitizado | 2026-07-09 | PENDENTE |
| EV-G0-AUDIT-002 | SF-AUD-008 | DEPENDENCY_SCAN | baseline | npm registry | `npm audit --omit=dev --json` em API e web | PASS: 0 total em ambos | Totais sanitizados | 2026-07-09 | PENDENTE |
| EV-G2-SESSION-001 | SF-AUD-003 | UNIT_CONTRACT_TEST | baseline | API local | Sessão v2, releitura Mongo, role/delete e WS revogado | PASS dentro de 19 suites/93 testes G2 | Output sanitizado | 2026-07-09 | PENDENTE |
| EV-G2-AI-001 | SF-AUD-002 | ARCHITECTURE_AND_UNIT_TEST | baseline | API local | Fachada única, 10 consumidores, ROOM_AI, consent/policy/quota | PASS dentro de 19 suites/93 testes G2 | Output sanitizado | 2026-07-09 | PENDENTE |
| EV-G2-ATOMIC-001 | SF-AUD-014 | TRANSACTION_CONTRACT_TEST | baseline | API local | Role/audit, último admin, delete e versões transacionais | PASS; suite API 107 suites/500 testes e build | Output sanitizado | 2026-07-09 | PENDENTE |
| EV-G7-BACKUP-001 | SF-AUD-017 | UNIT_ROUNDTRIP_TEST | baseline | API local/sintético | AES-256-GCM, EJSON, checksum, destino vazio e gates | PASS: 2 suites/11 testes; restore real aguarda OP-005 | Output sanitizado | 2026-07-09 | PENDENTE |
| EV-G7-HEALTH-001 | SF-AUD-015 | UNIT_NEGATIVE_TEST | baseline | API local | Liveness/readiness, probes Mongo/Redis/storage/jobs e falha 503 | PASS focado e build | Output sanitizado | 2026-07-09 | PENDENTE |
| EV-G3-STORAGE-001 | SF-AUD-005,SF-AUD-012 | UNIT_INTEGRATION_TEST | baseline | API/local FS | Staging, outbox, reconcile, quota 250 MiB, traversal, permissões e readiness | PASS dentro de 8 suites/54 testes | Output sanitizado | 2026-07-09 | PENDENTE |
| EV-G3-JOBS-001 | SF-AUD-011,SF-AUD-013 | UNIT_CONCURRENCY_TEST | baseline | API/Mongo mock | Claim/lease/retry/recovery/idempotência/latest-by-material | PASS dentro de 8 suites/54 testes | Output sanitizado | 2026-07-09 | PENDENTE |
| EV-G3-PARSING-001 | SF-AUD-025 | UNIT_CONCURRENCY_TEST | baseline | worker_threads | Timeout terminável, transfer seguro, bulkhead 2 e cleanup | PASS focado | Output sanitizado | 2026-07-09 | PENDENTE |
| EV-G4-PRIVACY-001 | SF-AUD-004 | CONTRACT_AND_UNIT_TEST | baseline | API/Mongo mock/FS | Registry de 59 models, export, delete, receipt anónimo e TTL 90 dias | PASS dentro de 8 suites/54 testes | Output sanitizado | 2026-07-09 | PENDENTE |
| EV-API-FULL-001 | G1-G4,G7 | REGRESSION_TEST | baseline | API local | `npm test -- --runInBand` | PASS: 107 suites/502 testes | Output sanitizado | 2026-07-09 | PENDENTE |

### 8.2 Evidence do freeze anterior, supersedida pelo ciclo documental

Esta evidence preserva o freeze `b112da65…cdc02`, mas deixou de ser autoritativa assim que os
geradores em `real_dev/` mudaram. Pode apoiar a rastreabilidade histórica de um domínio; só a
evidence de §8.3 fecha o ciclo documental e a revalidação no manifesto corrente.

| Evidence ID | Finding | Tipo | Manifesto | Comando/procedimento | Exit/result sanitizado | Data | Reviewer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-FINAL-MANIFEST-001 | TODOS | MANIFEST | b112da65…cdc02 | npm run manifest:hash, antes/depois das suites | PASS: 716 ficheiros; hash estável e reproduzido | 2026-07-10 | final_reaudit |
| EV-FINAL-API-001 | G1-G5,G7 | REGRESSION | b112da65…cdc02 | npm test -- --runInBand | PASS: 125/125 suites; 626/626 testes | 2026-07-10 | final_reaudit |
| EV-FINAL-AI-001 | SF-AUD-002 | ARCH/UNIT | b112da65…cdc02 | fachada, provider-not-called, policy/quota/guardrails/output/audit | PASS dentro de API + review focada | 2026-07-10 | final_reaudit |
| EV-FINAL-SESSION-001 | SF-AUD-003,SF-AUD-024 | REAL INTEGRATION | b112da65…cdc02 | duas sessões + Socket.IO real + delete/passive broadcast | PASS: 2/2 integração; full API | 2026-07-10 | final_reaudit |
| EV-FINAL-PRIVACY-001 | SF-AUD-004,SF-AUD-027 | ALL-MODEL INTEGRATION | b112da65…cdc02 | registry real, export/delete/storage/TTL/jobs/answer-key | PASS: 2/2; 59 schemas; zero efeitos pós-delete | 2026-07-10 | final_reaudit |
| EV-FINAL-STORAGE-001 | SF-AUD-005,SF-AUD-012 | UNIT/FS/INTEGRATION | b112da65…cdc02 | metadata, staging, quota, outbox, reconcile, physical delete | PASS: 3 suites/30 focados + full API | 2026-07-10 | final_reaudit |
| EV-FINAL-PARSING-001 | SF-AUD-025 | WORKER | b112da65…cdc02 | worker_threads, timeout, concurrency e resourceLimits | PASS: worker real + focused/full API | 2026-07-10 | final_reaudit |
| EV-FINAL-JOBS-001 | SF-AUD-011,SF-AUD-013 | MONGO RECOVERY | b112da65…cdc02 | leases expiradas index/quiz, fencing/retry/hidratação | PASS: 2/2 integração + full API | 2026-07-10 | final_reaudit |
| EV-FINAL-ATOMIC-001 | SF-AUD-014 | MONGO TRANSACTION | b112da65…cdc02 | último admin concorrente, rollback, versions/delete | PASS em Mongo real + full API | 2026-07-10 | final_reaudit |
| EV-FINAL-OFFICIAL-001 | SF-AUD-006,SF-AUD-027 | UNIT/CONCURRENCY/E2E | b112da65…cdc02 | publish/close, 3 tentativas, BEST_ATTEMPT, unlock | PASS: concurrency 2/2 + unit/ranking/E2E | 2026-07-10 | final_reaudit |
| EV-FINAL-SSRF-001 | SF-AUD-007 | NEGATIVE SECURITY | b112da65…cdc02 | IPv4/IPv6/mapped/reserved/redirect/remoteAddress | PASS em suite focada independente | 2026-07-10 | final_reaudit |
| EV-FINAL-CONFIG-001 | SF-AUD-009,SF-AUD-030,SF-AUD-031 | FAIL-CLOSED CONFIG | b112da65…cdc02 | runtime/HTTPS/seed/reset/E2E flags | PASS; env de release atual rejeitado | 2026-07-10 | final_reaudit |
| EV-FINAL-HEALTH-001 | SF-AUD-015 | LIVE HTTP | b112da65…cdc02 | /live, /ready, alias e readiness real | PASS: negativo 2/2; readiness final 200 | 2026-07-10 | final_reaudit |
| EV-FINAL-WEB-001 | SF-AUD-020..024,SF-AUD-028 | UNIT/COMPONENT/COVERAGE | b112da65…cdc02 | npm run test:coverage | PASS: 32/32 ficheiros; 144/144; 73,78/63,44 | 2026-07-10 | final_reaudit |
| EV-FINAL-BUNDLE-001 | SF-AUD-032 | BUILD/BUDGET | b112da65…cdc02 | npm run build:budget | PASS: 79,31/78,97/89,13/167,46 KiB; 52 chunks | 2026-07-10 | Codex/root |
| EV-FINAL-E2E-CHR-001 | SF-AUD-006,018,019,021..024 | E2E CHROMIUM | b112da65…cdc02 | isolated run stable-final-2 | PASS: 30/30 | 2026-07-10 | Codex/root |
| EV-FINAL-E2E-CHR-002 | SF-AUD-018,019 | E2E CHROMIUM | b112da65…cdc02 | isolated run stable-final-3 | PASS: 30/30 | 2026-07-10 | Codex/root |
| EV-FINAL-E2E-CHR-003 | SF-AUD-018,019 | E2E CHROMIUM | b112da65…cdc02 | isolated run stable-cross-browser | PASS: 30/30 | 2026-07-10 | Codex/root |
| EV-FINAL-E2E-CROSS-001 | SF-AUD-018,021,022 | FIREFOX/WEBKIT | b112da65…cdc02 | critical projects | PASS: 10/10 | 2026-07-10 | Codex/root |
| EV-FINAL-VISUAL-001 | SF-AUD-021,022 | IN-APP BROWSER | b112da65…cdc02 | release preview 320/390; DOM/screenshot/focus | PASS: overflow 0; form 288 px; focus visible | 2026-07-10 | Codex/root |
| EV-FINAL-CLEANUP-001 | SF-AUD-018,SF-OBS-007 | TEMP CLEANUP | b112da65…cdc02 | cleanup por runId + scan TMPDIR | PASS: storage roots 11→0; report roots 0 | 2026-07-10 | final_reaudit |
| EV-FINAL-SMOKE-001 | SF-AUD-015,SF-AUD-016 | AUTH SMOKE | b112da65…cdc02 | 200 pedidos concorrentes com uma sessão sintética | PASS: 200/200; p95 98 ms; 0 network/5xx | 2026-07-10 | Codex/root |
| EV-FINAL-AUDITS-001 | SF-AUD-008 | DEPENDENCY AUDIT | b112da65…cdc02 | npm audit --omit=dev --json API/web | PASS: 0 vulnerabilidades em ambos | 2026-07-10 | final_reaudit |
| EV-FINAL-SECRETS-001 | SF-AUD-001,SF-OBS-007 | SECRET/EVIDENCE SCAN | b112da65…cdc02 | mode check + npm run secrets:scan | PARCIAL: 0600 e scanner PASS; rotação pendente | 2026-07-10 | final_reaudit |
| EV-FINAL-MAP-001 | SF-AUD-029 | SOURCE OF TRUTH | b112da65…cdc02 | npm run technical-map:check | PASS: canonical real_dev/docs/technical | 2026-07-10 | Codex/root |
| EV-FINAL-BACKUP-UNIT-001 | SF-AUD-017 | SYNTHETIC ROUNDTRIP | b112da65…cdc02 | backup/restore unit suites | PARCIAL: cifra/checksum/vazio PASS; drill real pendente | 2026-07-10 | Codex/root |
| EV-FINAL-GATE-PLAN-001 | SF-AUD-016 | RELEASE PLAN | b112da65…cdc02 | npm run verify:local-release:plan | PASS: 19 passos listados | 2026-07-10 | Codex/root |
| EV-FINAL-GATE-FAIL-001 | SF-AUD-016 | FAIL-CLOSED GATE | b112da65…cdc02 | npm run verify:local-release | EXPECTED FAIL exit 1: scope/host/proxy locais em falta | 2026-07-10 | final_reaudit |
| EV-FINAL-OWNER-001 | SF-OBS-005 | FILE OWNERSHIP | b112da65…cdc02 | stat do install aninhado, sem conteúdo | BLOCKED: raiz e node_modules pertencem a root:staff | 2026-07-10 | final_reaudit |
| EV-FINAL-REVIEW-001 | CRÍTICOS/ALTOS | INDEPENDENT REAUDIT | b112da65…cdc02 | review read-only + suites focadas | PASS: API 13/106; web 8/29; sem blocker novo | 2026-07-10 | final_reaudit |

### 8.3 Evidence autoritativa do ciclo documental

Nenhum comando abaixo guardou credenciais, cookies, URIs autenticadas ou dados pessoais. O
ledger corrente está ligado ao manifesto
`68bcf3b45d3fc2fd674de16fa2a613127ad7dd29ac3bf7d1c4400ccce519670c`; cada linha histórica
mantém explicitamente o manifesto do ciclo em que a respetiva evidence foi recolhida.

| Evidence ID | Finding | Tipo | Manifesto | Comando/procedimento | Exit/result sanitizado | Data | Reviewer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-DOC-CHAT-20260711 | SF-DOC-002,008..010,SF-AUD-029 | CHAT DOCS/GENERATED SOURCES | 2f6ad3f7…9ed55c | teste focado do mapa; regeneração/check de mapa e inventário; `docs:verify` | PASS: 734 ficheiros; 9/9 testes do gerador; dois chats separados; 57 RF/45 RNF/107 BK; score 100; zero drift/issues/secrets | 2026-07-11 | Codex/root |
| EV-DOC-MANIFEST-001 | TODOS | MANIFEST | 799990e7…4e538 | `npm --prefix real_dev/api run manifest:hash` antes/depois da validação | PASS: 720 ficheiros; SHA-256 reproduzido | 2026-07-10 | Codex/root |
| EV-DOC-001 | SF-DOC-001 | AUTHORITY/STATUS | 799990e7…4e538 | `sync_real_dev_status.py --manifest … --check`; auditoria canónica | PASS: 107/107 BK; `estado=TODO|DONE`; referência/hash coerentes | 2026-07-10 | Codex/root |
| EV-DOC-002 | SF-DOC-002 | SEMANTIC CONTRACT | 799990e7…4e538 | scanner semântico sobre 107 guias e planos transversais | PASS: sessão v2/atomicidade/chat presentes; zero padrão legado | 2026-07-10 | Codex/root |
| EV-DOC-003 | SF-DOC-003 | SEMANTIC CONTRACT | 799990e7…4e538 | scanner semântico + contrato arquitetural documentado | PASS: fachada única, sequência governada e `ROOM_AI`; zero bypass copiável | 2026-07-10 | Codex/root |
| EV-DOC-004 | SF-DOC-004 | SEMANTIC CONTRACT | 799990e7…4e538 | auditoria de registry/export/delete/retention nos guias | PASS: quatro políticas, tombstones, outbox, attachment e TTL cobertos | 2026-07-10 | Codex/root |
| EV-DOC-005 | SF-DOC-005 | SEMANTIC CONTRACT | 799990e7…4e538 | scanner de storage/jobs/polling/parser + fixtures negativas | PASS: zero `void` job, `setInterval(async)` ou timeout apenas por `Promise.race` | 2026-07-10 | Codex/root |
| EV-DOC-006 | SF-DOC-006 | SEMANTIC CONTRACT | 799990e7…4e538 | auditoria de lifecycle/tentativas/ranking/DTO | PASS: `DRAFT→PUBLISHED→CLOSED`, três tentativas, `BEST_ATTEMPT`, sem IDs públicos | 2026-07-10 | Codex/root |
| EV-DOC-007 | SF-DOC-007 | OPS/FAIL-CLOSED | 799990e7…4e538 | runbook + `verify:local-release:plan` e execução integral | PASS documental: 21 passos; EXPECTED FAIL exit 1, blocker `OP-001` | 2026-07-10 | Codex/root |
| EV-DOC-008 | SF-DOC-008 | FRONTEND/ACCESSIBILITY | 799990e7…4e538 | guias + coverage/build/bundle + quatro runs E2E | PASS: 352 paths pedagógicos em `apps/...`; contratos/budgets sincronizados | 2026-07-10 | Codex/root |
| EV-DOC-009 | SF-DOC-009,SF-AUD-029 | GENERATED SOURCES | 799990e7…4e538 | `technical-map:check`; `function-inventory:check` | PASS: nove grupos finais; mapa e inventário AST byte-for-byte | 2026-07-10 | Codex/root |
| EV-DOC-010 | SF-DOC-010,SF-AUD-029 | DOCS GATE | 799990e7…4e538 | `npm --prefix real_dev/api run docs:verify` | PASS: score 100; 11 fixtures; 31 históricos; solver/mapa/inventário/secrets; zero issues | 2026-07-10 | Codex/root |
| EV-DOC-SOLVER-001 | SF-DOC-001,010,SF-AUD-029 | DETERMINISTIC SCHEDULER | 799990e7…4e538 | `solver_replaneamento.py --self-test`; `--check`; duas gerações | PASS: 107 BK/164u; 3 repairs; 9 owner/17 sprint changes; zero violations; JSON SHA-256 `d4f96ecb…50dc` | 2026-07-10 | solver_check_diagnosis |
| EV-DOC-API-001 | TODOS AFETADOS | REGRESSION | 799990e7…4e538 | `npm test -- --runInBand`; `npm run build` na API | PASS: 126/126 suites; 633/633 testes; build PASS | 2026-07-10 | Codex/root |
| EV-DOC-WEB-001 | SF-AUD-020..024,028,032 | REGRESSION/COVERAGE | 799990e7…4e538 | coverage, build e bundle budget na web | PASS: 32/32 ficheiros; 144/144 testes; 73,78% lines/63,44% branches; budgets PASS | 2026-07-10 | Codex/root |
| EV-DOC-E2E-CHR-001 | SF-AUD-006,018,019,021..024 | E2E CHROMIUM | 799990e7…4e538 | run isolada `final-docs-hash-1` | PASS: 30/30 | 2026-07-10 | Codex/root |
| EV-DOC-E2E-CHR-002 | SF-AUD-006,018,019,021..024 | E2E CHROMIUM | 799990e7…4e538 | run isolada `stable-final-2` | PASS: 30/30 | 2026-07-10 | Codex/root |
| EV-DOC-E2E-CHR-003 | SF-AUD-006,018,019,021..024 | E2E CHROMIUM | 799990e7…4e538 | run isolada `stable-final-3` | PASS: 30/30 | 2026-07-10 | Codex/root |
| EV-DOC-E2E-CROSS-001 | SF-AUD-018,021,022 | FIREFOX/WEBKIT | 799990e7…4e538 | projetos críticos `stable-cross-browser` | PASS: 10/10 | 2026-07-10 | Codex/root |
| EV-DOC-SMOKE-001 | SF-DOC-001,SF-AUD-016 | AUTH SMOKE | 799990e7…4e538 | 200 pedidos concorrentes com uma única sessão sintética | PASS: 200/200; p95 82 ms; zero network/unexpected/5xx; não prova 200 utilizadores | 2026-07-10 | Codex/root |
| EV-DOC-AUDITS-001 | SF-AUD-008 | DEPENDENCY AUDIT | 799990e7…4e538 | `npm audit --omit=dev --json` API/web | PASS: zero vulnerabilidades em ambos | 2026-07-10 | Codex/root |
| EV-DOC-SECRETS-001 | SF-AUD-001,SF-OBS-007 | SECRET/EVIDENCE SCAN | 799990e7…4e538 | `npm --prefix real_dev/api run secrets:scan` sobre docs/evidence | PARCIAL: scanner PASS; rotação `OP-001` continua pendente | 2026-07-10 | Codex/root |
| EV-DOC-PLANIFICATION-001 | SF-DOC-001,010 | GENERATOR CHECK | 799990e7…4e538 | audit/conformity write; normalizer/annexes `--check` | PASS: 107 BK; sem inferência por `estado`; output read-only nos checks | 2026-07-10 | Codex/root |
| EV-DOC-REAUDIT-001 | SF-DOC-001..010,SF-AUD-029 | INDEPENDENT REAUDIT | 799990e7…4e538 | revisão fresh read-only após solver/output/gate final | PASS: zero finding documental aberto; 107 BK; 11 fixtures; 31 históricos; solver/mapa/inventário/secrets/apps PASS | 2026-07-10 | final_docs_reaudit |

## 9. Checkpoints e contagens

| Checkpoint | PLANEADO | EM_IMPLEMENTACAO | PRONTO_VALIDAR | VALIDADO | FECHADO | MITIGADO | BLOQUEADO | Decisão |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Baseline inicial | 30 | 0 | 0 | 0 | 0 | 0 | 2 | Execução autorizada; gates manuais pendentes. |
| Freeze final — 32 findings | 0 | 0 | 0 | 0 | 27 | 2 | 3 | BLOQUEADO_OPERADOR; não apta enquanto OP-001/OP-005/OBS-005 persistirem. |
| Freeze final — 8 observações | 0 | 0 | 0 | 0 | 5 | 2 | 1 | 404/tradução/download/scanner/migrations locais tratados; root-owned pendente. |
| Freeze documental — 10 IDs | 0 | 0 | 0 | 0 | 10 | 0 | 0 | PASS documental; não altera os blockers nem o estado global. |

Blockers operacionais distintos: rotação/configuração local de credenciais; chave + restore real;
remoção privilegiada do install aninhado. SF-AUD-016 agrega os dois primeiros e não é um quarto
ato manual independente.
## 10. Changelog

- 2026-07-09T20:26:24+01:00 — Report criado antes da primeira alteração ao código; importados
  os 32 findings, oito observações, gates, regras de evidence e baseline do worktree.
- 2026-07-09T20:49:09+01:00 — `.env` restringido a 0600; dependências críticas atualizadas;
  runtime local fail-closed, scanner/manifesto, rate limit de registo, SSRF canónico e harness
  E2E isolado implementados. OP-001 continua pendente e nenhuma credencial foi validada.
- 2026-07-09T21:06:21+01:00 — G2 implementado e validado (sessões v2, fachada IA/ROOM_AI e
  atomicidade); audits npm API/web com zero vulnerabilidades de produção; readiness e
  backup/restore cifrado validados por testes. A remoção do install residual ficou
  `BLOQUEADO_OPERADOR` porque o diretório pertence a root e sudo exige password.
- 2026-07-09T21:08:39+01:00 — G3-G4 implementados e validados: storage/outbox/quota,
  workers canceláveis, jobs com lease/recovery e registry de 59 models com export/delete.
  Suite completa da API passou com 107 suites/502 testes; revisões independentes iniciadas.
- 2026-07-09T23:53:47+01:00 — Execução retomada após interrupção. A revisão independente
  anterior reabriu sessões/WS, defaults IA, transações, privacidade, storage/jobs e segurança
  de paths; a evidence associada foi invalidada antes de prosseguir. Build API/web passou,
  web teve 5/5 testes verdes e a suite API teve 510/511, com uma única expectativa obsoleta
  de anonimização corrigida. Nenhum reset, restore ou rotação externa foi declarado.
- 2026-07-10T00:16:59+01:00 — Corrigidos blockers independentes de paths destrutivos,
  Redis dedicado, replica set obrigatório, sessão `SESSION_REVOKED`, receção WebSocket
  passiva, governação IA com guardrail/validação semântica/audit, fencing/heartbeat de jobs,
  rate limit/quota de upload e bootstrap admin explícito. Audits completos e runtime API/web
  passaram com zero vulnerabilidades; 38 MiB de traces browser potencialmente sensíveis foram
  removidos e o scanner passou a bloquear a sua persistência. G4, G5-G7 e reauditoria final
  continuam em execução; OP-001/002/004/005 permanecem sem confirmação.

- 2026-07-10T09:53:05+01:00 — Fonte congelada; revisão independente encontrou e levou à
  correção de cascatas de salas, efeitos de quiz após delete, resourceLimits, metadata de
  ficheiros, boundary E2E e answer key no export RGPD.
- 2026-07-10T10:15:00+01:00 — Manifesto final reproduzido (716 ficheiros); API 125/626,
  web 32/144, Chromium 30/30 x3, Firefox/WebKit 10/10, smoke 200/200, audits/scanner/map PASS.
  Onze storages E2E antigos foram removidos pelo cleanup testado; contagem final zero.
  Gate integral permaneceu fail-closed e OP-001/OP-005/OBS-005 não foram simulados.
- 2026-07-10T10:23:37+01:00 — Revisão documental final corrigiu a contagem do gate para 19
  passos e ligou cada uma das oito observações à respetiva evidence; manifesto de real_dev
  permaneceu inalterado porque o ledger está fora da implementação.
- 2026-07-10T15:30:36+01:00 — Iniciada a correção documental integral. Registada a baseline
  completa das alterações preexistentes e o manifesto `b112da65…cdc02`; `SF-AUD-029` foi
  reaberto antes de qualquer alteração adicional e foram criados `SF-DOC-001..010`. OP-001,
  OP-005 e SF-OBS-005 permanecem bloqueadores e nenhuma confirmação manual foi simulada.
- 2026-07-10T16:57:58+01:00 — Sincronizados 107 BK com `estado=TODO|DONE` e
  `real_dev_status` independente; corrigidos 352 paths pedagógicos para `apps/...`, exemplos,
  cábulas, RF/RNF derivados, mapa de nove interfaces, inventário AST e 31 históricos. O
  manifesto corrente passou a `799990e7…4e538`; API 633/633, web 144/144, Chromium 30/30 x3,
  Firefox/WebKit 10/10, audits/budgets/scanner e smoke 200/200 com uma sessão passaram.
- 2026-07-10T17:26:50+01:00 — A reauditoria reabriu o solver canónico por seis violações
  ocultadas num output stale. O greedy recebeu repair local determinístico: três relocações,
  9 mudanças de owner, 17 de sprint, quatro reclassificações e zero violações; self-test prova
  determinismo e infeasible fail-closed. `docs:verify` passou a executar solver self-test/check.
- 2026-07-10T17:32:46+01:00 — Reauditoria documental independente final PASS: fechados
  `SF-DOC-001..010` e `SF-AUD-029`, sem alterar o estado global `BLOQUEADO_OPERADOR` nem
  simular OP-001, OP-005 ou SF-OBS-005.

## 11. Reauditoria final independente

A reauditoria read-only foi executada sobre o manifesto final e reproduziu o mesmo SHA-256.
Reviu criticamente IA, sessões/WS, privacidade all-model, upload/storage, testes oficiais, SSRF,
dependências, configuração local, jobs, frontend, E2E e cleanup. Durante a revisão, o export RGPD
foi identificado como canal lateral para a chave de respostas; a fonte foi reaberta, corrigida,
revalidada e novamente congelada antes do veredito.

Veredito independente:

- SF-AUD-001 continua BLOQUEADO_OPERADOR por rotação não confirmada.
- SF-AUD-002..009 estão FECHADOS, sendo SF-AUD-009 estritamente local.
- SF-AUD-010 e SF-AUD-012 estão MITIGADO_POR_ESCOPO.
- SF-AUD-016 e SF-AUD-017 continuam BLOQUEADO_OPERADOR.
- Os restantes findings estão FECHADOS nas condições de reabertura do ledger.
- A decisão global é BLOQUEADO_OPERADOR e não APTA_PARA_PAP_LOCAL_ENDURECIDA.

### 11.1 Reauditoria documental do manifesto `799990e7…4e538`

A revisão independente documental foi repetida depois de cada drift encontrado. O freeze final
reproduziu 720 ficheiros no manifesto, 107 BK com os dois estados separados, 11/11 fixtures,
31 históricos inequívocos, zero paths pedagógicos privados, zero issues semânticas/de
estado/referência/manifesto/secrets e os nove grupos de interfaces no mapa. O solver canónico
passou self-test e check com 107 BK, 164 unidades, três repairs genéricos e zero violações; o
output determinístico reproduziu SHA-256 `d4f96ecb…50dc`.

Veredito: `SF-DOC-001..010` e `SF-AUD-029` estão `FECHADO`. Este PASS é exclusivamente
documental e não remove `OP-001`, `OP-005` ou `SF-OBS-005`, não fecha a release local integral
e não autoriza qualquer declaração de produção.

## 12. Riscos residuais e follow-up

Riscos não bloqueantes aceites apenas para a instância local, sem equivaler a RISCO_ACEITE formal:

1. Consentimentos append-only ordenam apenas por createdAt; grant/revoke no mesmo milissegundo
   podem ficar indeterminados. Corrigir com sequência monotónica antes de produção.
2. Existe TOCTOU estreito entre revalidação de socket passivo e broadcast; exigir coordenação
   distribuída/fencing se houver multi-instância ou garantia absoluta para mensagens em voo.
3. privacy-data-exports.controller inicia cleanup temporário com void; uma rejeição rara de
   filesystem pode tornar-se unhandledRejection. Adicionar catch e log sanitizado num follow-up.
4. A aplicação não possui email verification/SSO, HSTS edge, object storage nem migrations
   de produção; todos reabrem quando o âmbito deixar de ser PAP local single-instance.

## 13. Decisão final do ledger

Estado: BLOQUEADO_OPERADOR.

A implementação automática e a reauditoria estão concluídas no manifesto final, mas o contrato
do plano proíbe declarar aptidão enquanto existir qualquer BLOQUEADO_OPERADOR. Para desbloquear:

1. executar OP-001 e preparar um .env exclusivamente local, sem expor valores;
2. executar OP-005 e um backup/restore real numa base local vazia;
3. remover, com autoridade do operador, real_dev/web/real_dev/web;
4. executar verify:local-release integral e registar PASS ligado ao mesmo manifesto;
5. repetir a reauditoria apenas se qualquer ficheiro de real_dev mudar.

## Anexo A — Import literal dos 32 findings

O bloco abaixo é copiado literalmente das secções 3–5 da auditoria de origem. Paths e números de
linha são evidência histórica de 2026-07-09 e não descrevem necessariamente a fonte remediada.

<details>
<summary>Mostrar import literal da auditoria</summary>

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


</details>
