# CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF3

## Resultado geral

- Projeto: `StudyFlow`
- MF alvo: `MF3`
- Modo executado: `corrigir_auditoria`
- Relatorio de auditoria usado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF3.md`
- Data: `2026-06-16`
- Resultado: `CORRIGIDO`
- Commits: nenhum.

Foram corrigidos os findings ativos confirmados da auditoria MF3 dentro do scope permitido. A correcao ficou restrita a `real_dev` e a este relatorio de correcao; nao foram alterados guias BK canonicos nem backlog.

## Findings tratados

| Finding | Severidade | Estado inicial | Estado final |
| --- | --- | --- | --- |
| `AUD-MF3-008` | `P1` | Ativo | `CORRIGIDO` |
| `AUD-MF3-009` | `P2` | Ativo | `CORRIGIDO` |

Nao foram identificados findings P0 ativos na auditoria fonte.

## AUD-MF3-008 - Services IA MF3 nao chamavam `AI_PROVIDER`

- Estado final: `CORRIGIDO`
- Severidade: `P1`
- BKs afetados: `BK-MF3-02`, `BK-MF3-03`, `BK-MF3-08`
- RFs afetados: `RF38`, `RF39`, `RF44`

Correcoes aplicadas:

- `SourceGroundedAiService` passou a injetar `AI_PROVIDER` e a chamar `generateStudyTool({ prompt, type: "EXPLANATION" })`.
- `ExternalKnowledgeAiService` passou a injetar `AI_PROVIDER` e a chamar `generateStudyTool({ prompt, type: "EXPLANATION" })`.
- `StudyGroupAiService` passou a injetar `AI_PROVIDER` e a chamar `generateStudyTool({ prompt, type: "EXPLANATION" })`.
- Os tres services constroem prompts restritos aos dados previamente autorizados pelo backend.
- Respostas vazias ou sem `answer` textual sao rejeitadas com `ServiceUnavailableException`.
- Falhas do provider sao mapeadas para `ServiceUnavailableException` com codigo `AI_PROVIDER_UNAVAILABLE`.
- Os modulos correspondentes passaram a importar `AiModule`, para disponibilizar o provider via DI.
- Os testes unitarios dos tres services passaram a usar mocks explicitos de `aiProvider.generateStudyTool`, comprovando que o provider e chamado.

Ficheiros alterados:

- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.module.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.spec.ts`
- `real_dev/api/src/modules/study-group-ai/study-group-ai.module.ts`
- `real_dev/api/src/modules/study-group-ai/study-group-ai.service.ts`
- `real_dev/api/src/modules/study-group-ai/study-group-ai.service.spec.ts`

## AUD-MF3-009 - Payloads reais divergiam dos guias

- Estado final: `CORRIGIDO`
- Severidade: `P2`
- BKs afetados: `BK-MF3-02`, `BK-MF3-06`, `BK-MF3-08`
- RFs afetados: `RF38`, `RF42`, `RF44`

Correcoes aplicadas:

- `BK-MF3-02`: o DTO, schema, service, testes HTTP e cliente web passaram de `jobId` para `sourceJobIds: string[]`.
- `BK-MF3-02`: as citacoes persistidas e devolvidas passaram a expor `sourceJobId`.
- `BK-MF3-06`: o DTO, schema, service, testes HTTP e cliente web passaram de `content` para `text`.
- `BK-MF3-08`: o DTO, service, testes HTTP e cliente web passaram de `sourceIds` para `sourceShareIds?: string[]`.
- O spec `mf3-http-contracts.spec.ts` foi atualizado para validar os contratos novos na pipeline HTTP real com `ValidationPipe`.
- Os paineis React MF3 passaram a enviar os payloads canonicos dos guias.

Ficheiros alterados:

- `real_dev/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`
- `real_dev/api/src/modules/source-grounded-ai/schemas/source-grounded-ai-answer.schema.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- `real_dev/api/src/modules/study-group-messages/dto/create-study-group-message.dto.ts`
- `real_dev/api/src/modules/study-group-messages/schemas/study-group-message.schema.ts`
- `real_dev/api/src/modules/study-group-messages/study-group-messages.service.ts`
- `real_dev/api/src/modules/study-group-messages/study-group-messages.service.spec.ts`
- `real_dev/api/src/modules/study-group-ai/dto/ask-study-group-ai.dto.ts`
- `real_dev/api/src/modules/study-group-ai/study-group-ai.service.ts`
- `real_dev/api/src/modules/study-group-ai/study-group-ai.service.spec.ts`
- `real_dev/api/src/modules/mf3-http-contracts.spec.ts`
- `real_dev/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
- `real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- `real_dev/web/src/features/study-group-messages/create-study-group-message.ts`
- `real_dev/web/src/features/study-group-messages/study-group-messages-panel.tsx`
- `real_dev/web/src/features/study-group-ai/ask-study-group-ai.ts`
- `real_dev/web/src/features/study-group-ai/study-group-ai-panel.tsx`

## Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm run test:unit` em `real_dev/api` | `PASS` - 54 suites, 198 testes |
| `npm run build` em `real_dev/api` | `PASS` - `nest build` |
| `npm run build` em `real_dev/web` | `PASS` - `tsc --noEmit && vite build` |
| `npm run test:e2e -- --grep "MF3 smoke"` em `real_dev/web` | `PASS` fora da sandbox - 1 teste Chromium |
| `git diff --check` | `PASS` - sem output |

Observacao: o smoke E2E MF3 falhou primeiro dentro da sandbox com `MongoMemoryServer: listen EPERM: operation not permitted 0.0.0.0`. O mesmo comando passou quando autorizado fora da sandbox.

## Evidencia de regressao coberta

- Os unit tests confirmam que `SourceGroundedAiService`, `ExternalKnowledgeAiService` e `StudyGroupAiService` chamam `aiProvider.generateStudyTool`.
- O contrato HTTP rejeita `sourceJobIds` invalidos em `POST /api/ai/source-grounded-answers`.
- O contrato HTTP aceita `text` em `POST /api/study-groups/:groupId/messages`.
- O contrato HTTP aceita `sourceShareIds` e rejeita `sourceShareIds` invalidos em `POST /api/study-groups/:groupId/group-ai/questions`.
- O build web confirma que os clientes React compilam com os nomes canonicos.
- O smoke E2E MF3 confirma que a pagina de comunidade continua operacional apos as alteracoes.

## Fora de scope

- Nao foram alterados guias BK canonicos.
- Nao foram alterados endpoints que continuam legitimamente a usar `jobId` ou `jobIds`, como pesquisa unificada, navegacao curricular, versoes de material e estrutura de material.
- Nao foram feitos commits, conforme `PERMITIR_COMMITS: nao`.

## Conclusao

- Findings P0 corrigidos nesta execucao: `0`
- Findings P1 corrigidos nesta execucao: `1`
- Findings P2 corrigidos nesta execucao: `1`
- Findings P3 corrigidos nesta execucao: `0`
- Findings ativos conhecidos da auditoria MF3 apos esta correcao: `0`
- Estado recomendado da MF3 apos esta correcao: `PASS`
