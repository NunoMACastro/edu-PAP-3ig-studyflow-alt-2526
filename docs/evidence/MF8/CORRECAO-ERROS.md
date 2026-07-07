# CORRECAO-ERROS - MF8

## Origem
- Evidence de entrada: `docs/evidence/MF8/TESTES-FINAIS.md`
- Gerado em: `2026-07-06T15:56:40.210Z`

## Decisão final
- PASS: todos os erros registados estão revalidados ou não há comandos finais em falha.

## Registos

- Nenhum comando obrigatório ou opcional ficou em `FAIL` ou `BLOQUEADO` na evidence final atual.

## Correções revalidadas nesta execução

| ID | Origem | Causa observada | Correção aplicada | Revalidação | Privacidade |
| --- | --- | --- | --- | --- | --- |
| MF8-ERR-01 | evidence | `TESTES-FINAIS.md` guardava path absoluto local no campo `Ficheiro`. | `run-mf8-final-tests` passou a renderizar paths de evidence como caminhos relativos ao repositório e ganhou teste de regressão. | `npm --prefix real_dev/api test -- mf8-error-register.spec.ts run-mf8-final-tests.spec.ts --runInBand`; `npm --prefix real_dev/api run mf8:final-tests`; `rg -n "FAIL|BLOQUEADO|/Users/|path-local|token=|cookie=|password=|secret=" docs/evidence/MF8/TESTES-FINAIS.md` sem ocorrências. | A evidence final já não expõe username, diretoria local, tokens, cookies, passwords ou secrets. |
| MF8-ERR-02 | web-e2e | O smoke MF1 usava seletores globais ambíguos para links de navegação e para o texto da IA da sala, colidindo com navegação/histórico privado. | O teste passou a limitar a navegação a `Navegação principal` e a validar a resposta atual dentro do artigo `Resposta`. | `npm --prefix real_dev/web run test:e2e -- mf1-smoke.spec.ts` passou fora do sandbox; runner final registou Playwright completo com `29 passed`. | A correção fica apenas no teste E2E; não grava prompts, respostas completas privadas nem dados pessoais. |
| MF8-ERR-03 | web-e2e | A suite MF7 exigia variáveis `STUDYFLOW_E2E_*` mesmo quando o servidor E2E já semeia utilizadores de desenvolvimento. | O teste passou a usar variáveis de ambiente quando existem e fallback para as credenciais de desenvolvimento semeadas pelo `start:e2e`. | `npm --prefix real_dev/web run test:e2e -- mf1-smoke.spec.ts mf7-async-state-block.spec.ts` passou fora do sandbox; runner final registou Playwright completo com `29 passed`. | As credenciais são as contas locais de smoke já existentes no projeto e não são tokens, cookies ou dados reais de alunos/professores. |
