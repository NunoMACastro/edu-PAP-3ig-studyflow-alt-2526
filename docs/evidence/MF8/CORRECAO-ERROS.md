# CORRECAO-ERROS - MF8

## Origem
- Evidence de entrada: `docs/evidence/MF8/TESTES-FINAIS.md`
- Gerado em: `2026-07-02T10:00:00.000Z`

## Decisão final
- BLOQUEADO: existem erros abertos, bloqueados ou sem revalidação.

## Registos

| id | origem | estado | comando | causa | correção | validação | privacidade |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MF8-ERR-01 | web | OPEN | cd apps/web && npm run build | Falha observada no comando: TypeScript encontrou erro em componente. | Registar a correção aplicada antes da revalidação. | Reexecutar o comando afetado e registar o observed result. | A evidence guarda apenas comando, estado e resumo sanitizado, sem dados sensíveis. |