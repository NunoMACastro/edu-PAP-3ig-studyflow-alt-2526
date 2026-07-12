# Relatório de implementação — materiais oficiais PDF/DOCX

```yaml
doc_id: SF-IMPL-OFFICIAL-MATERIALS-PDF-DOCX-2026-07-11
implementation_root: real_dev
implementation_manifest_sha256: 3e2a162b59e2d23c5276df21a10b439519df71c3b9cee67d04c709ec818dfd5c
result: PASS_COM_RISCOS
date: 2026-07-11
commits_created: false
dependencies_added: false
```

## 1. Resultado

Foi implementado em `real_dev/` o fluxo oficial `TEXT | URL | PDF | DOCX`, incluindo
upload multipart compensável, quota partilhada, indexação assíncrona explícita em fila
MongoDB recuperável, leitura/download protegidos, integração com IA e salas guiadas,
polling no frontend e projeções públicas sem dados internos de storage.

O resultado é `PASS_COM_RISCOS`: código, suites completas, builds, documentação, E2E real
PDF/DOCX em Chromium e testes críticos Firefox/WebKit passaram. Permanecem como riscos de
evidence a ausência de uma sessão exploratória manual separada e a não repetição do fluxo
binário completo com uma segunda conta docente e um aluno externo no browser. Esses casos
de autorização estão cobertos nos services/testes automatizados; o E2E confirmou também
`401` sem sessão e acesso positivo do aluno inscrito.

## 2. Implementação realizada

### Backend e storage

- `OfficialMaterial` aceita quatro tipos e os estados `PROCESSED`, `REFERENCE_ONLY` e
  `PENDING_PROCESSING`, mantendo os documentos legados compatíveis.
- O upload oficial recebe apenas `title` e `file`; professor, turma, disciplina e estado são
  derivados/revalidados no backend.
- PDF/DOCX reutilizam o validador canónico de 10 MiB, assinatura, MIME, extensão e nome,
  bem como staging, quota, outbox, fence académico e promoção atómica do material privado.
- A reconciliação considera `storageKey` das coleções privada e oficial.
- Falha de persistência aborta staging; falha de promoção compensa o documento; falhas
  secundárias de audit/notificação não tornam um upload comprometido repetível.
- Leitura binária usa MIME canónico, tamanho e SHA-256 revalidados, `Content-Length`,
  `Cache-Control: private, no-store` e `Content-Disposition` com fallback ASCII e
  `filename*=UTF-8`.

### Fila, parser, IA e salas

- A fila MongoDB suporta `PRIVATE_AREA` e `OFFICIAL_SUBJECT`, com `activeKey`, lease,
  heartbeat, fencing, retry e limites de concorrência já existentes.
- O pedido oficial devolve `202 QUEUED`; um job ativo é reutilizado e um job terminal pode
  ser repetido.
- O worker relê o utilizador, exige papel docente atual, revalida ownership/lifecycle e
  integridade do ficheiro antes de executar os parsers PDF/DOCX isolados.
- Sucesso marca material `PROCESSED`; falha mantém o ficheiro submetido e termina o job em
  `FAILED`.
- Audit logs registam submissão, pedido, conclusão e falha sem conteúdo, buffers ou paths.
- IA oficial usa apenas material processado com texto. A IA privada continua limitada às
  fontes privadas.
- Salas guiadas mostram e aceitam apenas fontes processadas do contexto; o backend repete
  a validação e a IA recebe exclusivamente os IDs selecionados.

### Contratos HTTP e frontend

- Implementados upload oficial, listagem dos jobs mais recentes, polling comum e endpoints
  protegidos de conteúdo/download.
- Projeções públicas de PDF/DOCX omitem sempre `textContent`, `storageKey`, SHA-256 e paths.
- O professor dispõe de quatro tipos, metadados, envio, estados de fila/processamento,
  retry, abertura/download e proteção contra cliques concorrentes.
- O aluno vê metadados e ações PDF/DOCX sem controlos docentes.
- Detalhes de salas e histórico de fontes apresentam ações binárias protegidas.

## 3. Ficheiros principais

### API

- `real_dev/api/src/common/http/content-disposition.ts`
- `real_dev/api/src/modules/official-materials/dto/create-official-file-material.dto.ts`
- `real_dev/api/src/modules/official-materials/schemas/official-material.schema.ts`
- `real_dev/api/src/modules/official-materials/official-materials.controller.ts`
- `real_dev/api/src/modules/official-materials/official-materials.module.ts`
- `real_dev/api/src/modules/official-materials/official-materials.service.ts`
- `real_dev/api/src/modules/material-index/material-index.controller.ts`
- `real_dev/api/src/modules/material-index/material-index.module.ts`
- `real_dev/api/src/modules/material-index/material-index-queue.service.ts`
- `real_dev/api/src/modules/material-index/material-index.service.ts`
- `real_dev/api/src/modules/materials/material-storage-reconciliation.service.ts`
- `real_dev/api/src/modules/materials/materials.module.ts`
- `real_dev/api/src/modules/guided-study-rooms/guided-study-rooms.service.ts`
- `real_dev/api/src/modules/ai-content-reviews/ai-content-reviews.service.ts`

### Web e E2E

- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/components/materials/OfficialMaterialFileActions.tsx`
- `real_dev/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx`
- `real_dev/web/src/pages/student/StudentOfficialMaterialsPage.tsx`
- `real_dev/web/src/pages/teacher/TeacherGuidedStudyRoomsPage.tsx`
- `real_dev/web/src/pages/teacher/TeacherGuidedStudyRoomDetailPage.tsx`
- `real_dev/web/src/pages/student/StudentGuidedStudyRoomDetailPage.tsx`
- `real_dev/web/tests/e2e/mf2-smoke.spec.ts`

### Testes e artefactos técnicos

- `real_dev/api/src/common/http/content-disposition.spec.ts`
- `real_dev/api/src/modules/official-materials/official-materials.service.spec.ts`
- `real_dev/api/src/modules/material-index/material-index.service.spec.ts`
- `real_dev/api/src/modules/material-index/material-index-queue.service.spec.ts`
- `real_dev/web/src/lib/apiClient.test.ts`
- `real_dev/web/src/pages/teacher/TeacherOfficialMaterialsPage.test.tsx`
- `real_dev/web/src/pages/teacher/TeacherGuidedStudyRoomsPage.test.tsx`
- `real_dev/api/src/scripts/export-technical-map.ts`
- `real_dev/docs/technical/STUDYFLOW-TECHNICAL-MAP.md`
- `real_dev/docs/technical/STUDYFLOW-FUNCTION-INVENTORY.md`

## 4. Segurança verificada

- Sessão ausente devolve `401`; recursos inexistentes ou fora do âmbito usam `404`.
- Professor proprietário e membership discente atual/histórica são revalidados no service.
- O cliente não controla ownership, `classId`, estado nem chaves de storage.
- Nome, MIME, extensão, assinatura, tamanho, quota, hash e metadados são verificados no
  backend; o nome original nunca forma a chave de storage.
- Chunks oficiais não integram a projeção HTTP de polling.
- Nenhuma projeção pública de ficheiro devolve texto extraído ou identificadores internos.
- `docs:verify` incluiu o scanner de secrets e terminou sem padrões sensíveis.

## 5. Validação executada

| Validação | Resultado |
| --- | --- |
| API completa — `npm test` | PASS — 140 suites, 759 testes |
| Web completa — `npm test` | PASS — 43 ficheiros, 201 testes |
| Build API — `npm run build` | PASS |
| Build web — `npm run build` | PASS |
| E2E MF2 Chromium, PDF/DOCX reais | PASS — 1 fluxo completo em 1,0 min |
| Firefox/WebKit críticos | PASS — 10 testes em 1,4 min |
| Viewports | PASS — 320×720, 375×812, 768×1024, 1440×900; a suite inclui ainda 360×780 e 390×844 |
| Axe | PASS — zero findings `serious`/`critical` nas páginas representativas testadas |
| Mapa técnico e inventário | PASS — regenerados e verificados |
| `docs:verify` | PASS — score 100, zero drift/issues/secrets |
| `git diff --check` | PASS |
| trailing whitespace em `real_dev` alterado | PASS |
| manifesto | PASS — 790 ficheiros, SHA-256 acima |

O primeiro arranque E2E dentro do sandbox falhou com `listen EPERM`. A repetição fora do
sandbox expôs um drift preexistente do runner quando não recebe portas: servidor e workers
derivavam portas de PIDs diferentes. A execução autoritativa usou portas loopback estáveis
e passou. O E2E atualizado cria um PDF válido e um DOCX OpenXML/ZIP válido, faz upload,
processa ambos no worker real, valida headers, bloqueio anónimo, acesso do aluno e seleção
explícita da fonte PDF numa sala; no mesmo cenário, a área privada permanece isolada.

## 6. Documentação

- `docs/RF.md`: RF21/RF31 e critérios de materiais/indexação.
- `docs/planificacao/guias-bk/MF1/BK-MF1-09-submeter-materiais-da-disciplina-versao-oficial.md`.
- `docs/planificacao/guias-bk/MF2/BK-MF2-07-indexacao-automatica-de-pdfs-docx-e-urls.md`.
- `docs/planificacao/guias-bk/MF2/BK-MF2-01-professores-podem-criar-salas-de-estudo-guiado.md`.
- Bridges técnicos, referência `real_dev` e ledger receberam apenas o novo hash exigido
  pelo manifesto; alterações preexistentes foram preservadas.

## 7. Riscos residuais

1. Não foi feita uma passagem visual exploratória humana separada; a evidence visual é
   automatizada por Playwright em Chromium, Firefox e WebKit.
2. O fluxo PDF/DOCX completo no browser não foi repetido com uma segunda conta docente e
   um aluno externo. IDOR/ownership, papel e membership têm cobertura de service/unit; o
   browser confirmou o caso anónimo e o aluno inscrito.
3. A suite Chromium integral de 30 testes não foi repetida depois do drift de portas do
   runner; foram executadas as suites completas unitárias, o E2E MF2 relevante atualizado
   e toda a seleção crítica Firefox/WebKit.

## 8. Conformidade UI obrigatória

```text
UI_GUIDELINES_READ: sim
UI_GUIDELINES_PATH: real_dev/docs/FRONTEND-UI-GUIDELINES.md
UI_COMPLIANCE: PASS
UI_DEVIATIONS: nenhuma
UI_VALIDATION: Vitest 43/43 e 201/201; build Vite/TypeScript; Playwright Chromium com fluxo PDF/DOCX real; Firefox/WebKit críticos 10/10; viewports 320x720, 375x812, 768x1024 e 1440x900; Axe sem findings serious/critical
```

