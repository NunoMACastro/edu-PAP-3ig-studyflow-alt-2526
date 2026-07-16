# StudyFlow — release e rollback local executável

Estado: procedimento operativo, não evidence de execução. Não declara PASS nem
aptidão para produção.

## Fronteira

Procedimento exclusivo de `PAP_LOCAL_ENDURECIDA`, loopback e single-instance. Parar API/web
antes de criar a baseline ou executar rollback. O snapshot cobre implementação; os dados
exigem o backup cifrado descrito em [LOCAL-PAP-RUNBOOK.md](LOCAL-PAP-RUNBOOK.md). O estado,
os blockers e o hash atual ficam no ledger externo; este ficheiro entra no manifesto e não
deve conter um SHA literal.

## Criar baseline

Em `real_dev/api`, configurar uma raiz privada fora de `real_dev/` e uma chave exclusiva de
32 bytes no ambiente seguro da sessão:

```bash
STUDYFLOW_RELEASE_SNAPSHOT_ROOT=/caminho/studyflow-release-snapshots \
npm run release:snapshot
```

O output seguro contém `snapshotId`, número de ficheiros e SHA-256 agregado. `.env`,
`node_modules`, builds, coverage, Playwright e storage ficam excluídos. O manifesto tem HMAC
e todos os payloads são novamente validados antes de rollback.

## Executar rollback

1. Parar API e web e entrar em `real_dev/api`.
2. Confirmar que o backup de dados necessário existe.
3. Copiar literalmente o `snapshotId` aprovado para a confirmação:

```bash
STUDYFLOW_ALLOW_RELEASE_ROLLBACK=true \
STUDYFLOW_RELEASE_ROLLBACK_SNAPSHOT=/caminho/studyflow-release-snapshots/release-AAAA... \
STUDYFLOW_RELEASE_ROLLBACK_CONFIRMATION=release-AAAA... \
npm run release:rollback
```

O script valida HMAC/checksums, prepara uma árvore sibling completa, preserva `api/.env` e
`web/.env`, move a implementação atual para `.studyflow-rollback-previous-*` e promove a
baseline por `rename`. Se a promoção falhar, repõe automaticamente a árvore anterior. A
árvore anterior não é eliminada pelo script.

4. Na nova `real_dev/api` e `real_dev/web`, executar `npm ci`.
5. Se os dados também recuarem, restaurar para uma DB e storage novos; nunca sobrepor os
   destinos falhados.
6. Executar build, suites críticas, readiness e smokes antes de reabrir a PAP.
7. Reabrir no ledger findings cuja evidence não corresponda ao manifesto reposto.

## Evidence permitida

Guardar apenas IDs, hashes, versões, comandos, exit codes, contagens e timestamps. Nunca
guardar chaves, cookies, URIs com userinfo, `.env`, conteúdo pessoal, prompts ou respostas IA.
