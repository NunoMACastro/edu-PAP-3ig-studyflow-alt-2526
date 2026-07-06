# TESTES-FINAIS - MF8

## Decisão final

- PASS: a bateria obrigatória passou e a evidence está pronta para BK-MF8-17.

## Evidence de entrada

- Ficheiro: /caminho/do/projeto/docs/evidence/MF8/TESTES-EM-FALTA.md
- Estado: PASS
- Observed: A evidence do BK-MF8-15 permite iniciar a execução final.

## Comandos executados

| Obrigatório | Comando | Estado | Exit code | Linha executada |
| --- | --- | --- | --- | --- |
| Sim | Validação da planificação | PASS | 0 | `bash scripts/validate-planificacao.sh` |
| Sim | Testes unitários da API | PASS | 0 | `npm --prefix apps/api run test:unit` |
| Sim | Build da API | PASS | 0 | `npm --prefix apps/api run build` |
| Sim | Build da web | PASS | 0 | `npm --prefix apps/web run build` |
| Não | E2E Playwright da web | BLOQUEADO | - | `npm --prefix apps/web run test:e2e` |