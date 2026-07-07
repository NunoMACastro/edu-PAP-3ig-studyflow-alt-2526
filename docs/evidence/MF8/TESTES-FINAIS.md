# TESTES-FINAIS - MF8

## Decisão final

- PASS: a bateria obrigatória passou e a evidence está pronta para BK-MF8-17.
- RISCO: nenhum comando opcional ficou sem PASS.

## Evidence de entrada

- Ficheiro: docs/evidence/MF8/TESTES-EM-FALTA.md
- Estado: PASS
- Observed: A evidence do BK-MF8-15 permite iniciar a execução final.

## Comandos executados

| Obrigatório | Comando                   | Estado | Exit code | Linha executada                           |
| ----------- | ------------------------- | ------ | --------- | ----------------------------------------- |
| Sim         | Validação da planificação | PASS   | 0         | `bash scripts/validate-planificacao.sh`   |
| Sim         | Testes unitários da API   | PASS   | 0         | `npm --prefix real_dev/api run test:unit` |
| Sim         | Build da API              | PASS   | 0         | `npm --prefix real_dev/api run build`     |
| Sim         | Build da web              | PASS   | 0         | `npm --prefix real_dev/web run build`     |
| Não         | E2E Playwright da web     | PASS   | 0         | `npm --prefix real_dev/web run test:e2e`  |

## Outputs sanitizados

### Validação da planificação

- Expected: O validador termina com overall_pass true.
- Observed: Comando terminou com exit code 0.

#### Stdout

```txt
{
  "project": "studyflow",
  "counts": {
    "rf_docs": 57,
    "rnf_docs": 45,
    "matriz_bk": 107,
    "backlog_bk": 107,
    "guide_bk": 107
  },
  "coverage": {
    "missing_rf_matrix": [],
    "missing_rnf_matrix": [],
    "missing_rf_backlog": [],
    "missing_rnf_backlog": [],
    "invalid_refs": []
  },
  "consistency": {
    "missing_artifacts": [],
    "missing_in_backlog": [],
    "missing_in_matrix": [],
    "missing_in_guides": [],
    "extra_guides": [],
    "broken_links_docs": [],
    "scorecard_contract_issues": [],
    "scorecard_plan_load_issues": [],
    "sprint_label_issues": [],
    "gate_issues": [],
    "core_dual_contract_issues": [],
    "matrix_proximo_bk_issues": [],
    "declared_totals_issues": [],
    "rnf_index_anchor_issues": [],
    "drift_critical_count": 0,
    "drift_issues": []
  },
  "guides_quality": {
    "naming_issues": [],
    "guide_header_issues": [],
    "guide_content_issues": []
  },
  "governance": {
    "governance_issues": [],
    "adequacao_12o_issues": [],
    "score": {
      "weights": {
        "Cobertura/rastreabilidade": 25,
        "Coerencia documental": 20,
        "Pedagogia/guidance/step-by-step": 25,
        "Adequacao ao 12o": 20,
        "Governanca/avaliacao": 10
      },
      "breakdown": {
        "Cobertura/rastreabilidade": 25,
        "Coerencia documental": 20,
        "Pedagogia/guidance/step-by-step": 25,
        "Adequacao ao 12o": 20,
        "Governanca/avaliacao": 10
      },
      "total": 100
    }
  },
  "status": {
    "coverage_pass": true,
    "consistency_pass": true,
    "guides_pass": true,
    "governance_pass": true,
    "adequacao_12o_pass": true,
    "score_ge_97": true,
    "drift_critical_zero": true,
    "overall_pass": true
  }
}

```

#### Stderr

```txt
Sem stderr relevante.
```

### Testes unitários da API

- Expected: A suite Jest da API termina com exit code 0.
- Observed: Comando terminou com exit code 0.

#### Stdout

```txt

> @studyflow/api@0.1.0 test:unit
> npm test


> @studyflow/api@0.1.0 test
> jest --config ./jest.config.cjs --passWithNoTests


```

#### Stderr

```txt
PASS src/scripts/mf8-error-register.spec.ts
PASS src/common/health/health.controller.spec.ts
PASS src/modules/study-rooms/room-ai-sharing.service.spec.ts
PASS src/modules/notification-policies/notification-policies.service.spec.ts
PASS src/modules/material-versions/material-versions.service.spec.ts
PASS src/modules/curriculum-navigation/curriculum-navigation.service.spec.ts
PASS src/modules/mf3-http-contracts.spec.ts
PASS src/modules/study-group-ai/study-group-ai.service.spec.ts
PASS src/modules/study/solo-study.service.spec.ts
PASS src/modules/unified-search/unified-search.service.spec.ts
PASS src/modules/ai/ai-area-profile.service.spec.ts
PASS src/modules/teacher-ai/teacher-ai-voice.service.spec.ts
PASS src/modules/material-contexts/material-contexts.service.spec.ts
PASS src/modules/notification-preferences/notification-preferences.service.spec.ts
PASS src/modules/study-areas/study-areas.service.spec.ts
PASS src/modules/auth/auth.service.spec.ts
PASS src/modules/context-notifications/context-notifications.service.spec.ts
PASS src/modules/ai/quiz-generation-jobs.service.spec.ts
PASS src/modules/study-rooms/room-ai-history.spec.ts
PASS src/modules/study-rooms/room-ai.service.spec.ts
PASS src/modules/material-index/material-index-queue.service.spec.ts
PASS src/modules/adaptive-explanations/adaptive-explanations.service.spec.ts
PASS src/modules/ai/summaries.service.spec.ts
PASS src/modules/official-materials/official-materials.service.spec.ts
PASS src/modules/project-ai/project-ai.service.spec.ts
PASS src/modules/ai/study-tools.service.spec.ts
PASS src/modules/account-deletion/account-deletion.service.spec.ts
PASS src/modules/auth/password-hashing.service.spec.ts
PASS src/modules/ai-guardrails/ai-guardrails.service.spec.ts
PASS src/modules/class-progress/class-progress.service.spec.ts
PASS src/modules/ai/artifact-export.service.spec.ts
PASS src/modules/ai-quotas/ai-quotas.service.spec.ts
PASS src/modules/study-rooms/room-shares.service.spec.ts
PASS src/modules/materia
...[output truncado: inicio e fim preservados]...
nt.service.spec.ts
PASS src/common/runtime/runtime-instance.service.spec.ts
PASS src/common/guards/session.guard.spec.ts
PASS src/common/middleware/require-https.middleware.spec.ts
PASS src/modules/materials/validators/material-upload.validator.spec.ts
PASS src/modules/class-posts/dto/create-class-post.dto.spec.ts
PASS src/modules/study-alerts/dto/study-alerts-query.dto.spec.ts
PASS src/modules/ai/validators/ai-artifact.validator.spec.ts
PASS src/modules/material-index/document-processing-safety.service.spec.ts
PASS src/common/architecture/domain-boundary.spec.ts
PASS src/modules/auth/session.service.spec.ts
PASS src/common/middleware/csrf.middleware.spec.ts
PASS src/modules/auth/login-attempts.service.spec.ts
PASS src/modules/study-rooms/room-ai-pedagogy.spec.ts
PASS src/modules/official-tests/official-tests.service.spec.ts (5.327 s)
PASS src/modules/ai-safety/ai-safety-policy.spec.ts
PASS src/scripts/export-technical-map.spec.ts
PASS src/scripts/validate-deploy-readiness.spec.ts
PASS src/scripts/mf8-test-inventory.spec.ts
PASS src/common/text/pt-text-normalization.spec.ts
PASS src/common/reliability/retry-with-recovery.spec.ts
PASS src/modules/source-grounded-ai/citation-policy.spec.ts
PASS src/common/operations/availability-budget.spec.ts
PASS src/common/middleware/security-headers.middleware.spec.ts
PASS src/scripts/run-mf8-final-tests.spec.ts
PASS src/modules/external-knowledge-ai/external-ai-policy.spec.ts
PASS src/modules/ai/adaptive-learning.service.spec.ts (5.451 s)
PASS src/modules/class-ai/class-ai.service.spec.ts (5.502 s)
PASS src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts (5.522 s)
PASS src/modules/auth/auth.controller.spec.ts (5.616 s)
PASS src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts (5.672 s)
PASS src/modules/material-index/material-index.service.spec.ts (5.773 s)

Test Suites: 97 passed, 97 total
Tests:       412 passed, 412 total
Snapshots:   0 total
Time:        6.243 s, estimated 7 s
Ran all test suites.

```

### Build da API

- Expected: O build NestJS compila sem erros TypeScript.
- Observed: Comando terminou com exit code 0.

#### Stdout

```txt

> @studyflow/api@0.1.0 build
> nest build


```

#### Stderr

```txt
Sem stderr relevante.
```

### Build da web

- Expected: O build Vite/TypeScript compila sem erros.
- Observed: Comando terminou com exit code 0.

#### Stdout

```txt

> @studyflow/web@0.1.0 build
> tsc --noEmit && vite build

vite v7.3.5 building client environment for production...
transforming...
✓ 129 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.40 kB │ gzip:  0.27 kB
dist/assets/index-DKqZslVo.css   19.98 kB │ gzip:  4.27 kB
dist/assets/index-BKjKFlt9.js   357.31 kB │ gzip: 94.63 kB
✓ built in 829ms

```

#### Stderr

```txt
Sem stderr relevante.
```

### E2E Playwright da web

- Expected: As suites Playwright passam quando o ambiente E2E está preparado.
- Observed: Comando terminou com exit code 0.

#### Stdout

```txt

> @studyflow/web@0.1.0 test:e2e
> playwright test


Running 29 tests using 6 workers

  ✓   6 [chromium] › tests/e2e/mf5-form-validation.spec.ts:72:1 › MF5 valida criação de turma antes de chamar a API (2.3s)
  ✓   1 [chromium] › tests/e2e/mf3-smoke.spec.ts:22:1 › MF3 smoke: aluno abre comunidade e cria grupo com sessão real (2.5s)
  ✓   4 [chromium] › tests/e2e/mf5-action-feedback.spec.ts:47:1 › MF5 feedback: submissão de material mostra sucesso e aria-live (2.6s)
  ✓   5 [chromium] › tests/e2e/mf5-accessibility.spec.ts:76:1 › MF5 acessibilidade: formulários críticos têm labels e ajuda associada (3.2s)
  ✓   7 [chromium] › tests/e2e/mf5-form-validation.spec.ts:103:1 › MF5 valida submissão de material antes de chamar a API (1.7s)
  ✓  10 [chromium] › tests/e2e/mf5-notification-tray.spec.ts:23:1 › MF5 mostra notificações in-app usando o campo body (1.3s)
  ✓   9 [chromium] › tests/e2e/mf5-navigation.spec.ts:59:1 › MF5 navegação: links mudam por role e página atual fica marcada (2.7s)
  ✓  12 [chromium] › tests/e2e/mf5-notification-tray.spec.ts:54:1 › MF5 isola erro de notificações sem bloquear a shell (1.4s)
  ✓   2 [chromium] › tests/e2e/mf1-smoke.spec.ts:93:1 › MF1 smoke: professor e aluno percorrem os fluxos principais com sessao real (6.3s)
  ✓   8 [chromium] › tests/e2e/mf5-interface-smoke.spec.ts:77:1 › MF5 interface: aluno e professor veem paginas claras com uma acao principal (3.8s)
  ✓  16 [chromium] › tests/e2e/mf8-date-format.spec.ts:7:1 › MF8 datas: formata datas visíveis em dd/mm/aaaa (234ms)
  ✓  17 [chromium] › tests/e2e/mf8-flashcards.spec.ts:29:1 › MF8 flashcards: estado local esconde resposta e termina lista (1ms)
  ✓  18 [chromium] › tests/e2e/mf8-flashcards.spec.ts:41:1 › MF8 flashcards: modo revisão mantém resposta visível ao avançar (2ms)
  ✓  13 [chromium] › tests/e2e/mf5-responsive-layout.spec.ts:78:1 › MF5 responsive: materiais do aluno mantêm layout em mobile, tablet e desktop (1.8s)
  ✓  15 [chromium] › tests/e2e/mf7-async-state-block.spec
...[output truncado: inicio e fim preservados]...
› MF7 aluno mostra estado vazio quando não há artefactos (1.3s)
  ✓  11 [chromium] › tests/e2e/mf5-performance-budget.spec.ts:48:1 › MF5 avisa quando dashboard individual excede 2 segundos (3.8s)
  ✓  19 [chromium] › tests/e2e/mf8-flashcards.spec.ts:53:1 › MF8 flashcards: aluno revela resposta e conclui treino na UI (1.4s)
  ✓  23 [chromium] › tests/e2e/mf8-messages.spec.ts:14:5 › MF8 message catalog › resolve chaves conhecidas do catálogo (0ms)
  ✓  24 [chromium] › tests/e2e/mf8-messages.spec.ts:20:5 › MF8 message catalog › distingue chaves conhecidas e desconhecidas (1ms)
  ✓  25 [chromium] › tests/e2e/mf8-messages.spec.ts:25:5 › MF8 message catalog › usa fallback seguro para chave dinâmica desconhecida (0ms)
  ✓  26 [chromium] › tests/e2e/mf8-messages.spec.ts:30:5 › MF8 message catalog › mantém a decisão de catálogo local sem dependência i18n externa (0ms)
  ✓  20 [chromium] › tests/e2e/mf5-responsive-layout.spec.ts:94:1 › MF5 responsive: turmas do professor mantêm layout em mobile, tablet e desktop (1.5s)
  ✓   3 [chromium] › tests/e2e/mf2-smoke.spec.ts:90:1 › MF2 smoke: professor e aluno percorrem projectos, testes, indexacao e IA privada (8.9s)
  ✓  21 [chromium] › tests/e2e/mf7-async-state-block.spec.ts:99:1 › MF7 aluno mostra erro de carregamento sem bloquear ações (1.3s)
  ✓  14 [chromium] › tests/e2e/mf6-background-jobs.spec.ts:109:1 › MF6 smoke: indexacao e quiz em background usam HTTP autenticado real (3.4s)
  ✓  27 [chromium] › tests/e2e/mf8-mockup-alignment.spec.ts:42:1 › MF8 RNF38 mostra checklist de alinhamento ao mockup com rotas reais (1.2s)
  ✓  28 [chromium] › tests/e2e/mf7-async-state-block.spec.ts:116:1 › MF7 aluno mostra erro de geração sem perder listas (1.2s)
  ✓  22 [chromium] › tests/e2e/mf5-performance-budget.spec.ts:72:1 › MF5 avisa quando página de turmas excede 2 segundos (3.5s)
  ✓  29 [chromium] › tests/e2e/mf7-async-state-block.spec.ts:145:1 › MF7 professor mostra erro de listagem sem bloquear formulário (1.2s)

  29 passed (19.4s)

```

#### Stderr

```txt
[WebServer] (node:97072) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:97378) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:97423) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:97438) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:97537) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
(node:97575) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:97577) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:97574) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:97576) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:97585) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:97586) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:97575) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:97577) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:97574) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:97586) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:97576) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:97585) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)

```

- Gerado em: 2026-07-06T15:55:48.833Z
