# AUDITORIA-HIDRATACAO-MF0

## Header
- `doc_id`: `AUDITORIA-HIDRATACAO-MF0`
- `macro`: `MF0`
- `status`: `draft-pos-hidratacao`
- `last_updated`: `2026-05-29`
- `auditoria`: hidratação pedagógica/técnica dos guias BK

## Objetivo
Auditar os guias BK da `MF0` para perceber se são tutoriais executáveis por alunos do 12.º ano, com código completo, localização exata, validação, cenários negativos, expected results, evidence e handoff.

Esta auditoria não altera RF, RNF, IDs BK, owners, prioridades, dependências, sprints, estado ou escopo funcional. A análise compara os guias com a documentação canónica e com o critério de “BK hidratado” definido para esta revisão.

## Fontes consultadas
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF0/*.md`

## Resumo executivo
Foram analisados 12 guias BK da `MF0`.

Resultado inicial:
- `OK`: 0
- `PARCIAL`: 7
- `CRÍTICO`: 5

Na auditoria inicial, nenhum BK cumpria todos os 16 pontos do critério de hidratação. Os guias tinham boa estrutura documental: objetivo, scope/scope-out, dependências, validação, negativos, critérios de aceite, evidence e handoff apareciam de forma consistente. O problema principal era que ainda não eram tutoriais executáveis: a maioria dos blocos técnicos eram snippets de referência, contratos ou pseudo-código, sem código completo final para controller/service/module/DTO/teste/UI, sem comentários didáticos suficientes e sem explicação após cada bloco de código.

## Atualização pós-hidratação (2026-05-29)

Foram hidratados os 12 guias BK identificados como `PARCIAL` ou `CRÍTICO` na auditoria inicial. A hidratação acrescentou secções executáveis com ficheiros `CRIAR`/`EDITAR`/`REVER`, paths completos, localização de código, blocos copiáveis, comentários didáticos, explicações pós-código, requests/responses, cenários negativos, evidence e handoff.

Como o repositório ainda não tem scaffold real de `apps/api`/`apps/web`, os guias indicam explicitamente que os caminhos representam a estrutura final prevista, baseada nos documentos canónicos: React/TypeScript/Tailwind, NestJS, MongoDB/Mongoose, Redis/cookies HttpOnly e OpenAI API atrás de provider isolado.

| BK | Classificação inicial | Estado pós-hidratação | Nota |
| --- | --- | --- | --- |
| BK-MF0-01 | `CRÍTICO` | `HIDRATADO` | Registo, hashing, DTO, service/controller/module, UI e testes documentados. |
| BK-MF0-02 | `CRÍTICO` | `HIDRATADO` | Login, sessão Redis, cookie HttpOnly, guard, logout/me, UI e testes documentados. |
| BK-MF0-03 | `PARCIAL` | `HIDRATADO` | Perfil protegido, mass assignment guard, controller/service/DTO/UI e negativos documentados. |
| BK-MF0-04 | `PARCIAL` | `HIDRATADO` | Estudo sem turma com estado individual, dashboard e fluxo protegido documentados. |
| BK-MF0-05 | `PARCIAL` | `HIDRATADO` | Rotinas/objetivos com ownership, validação, arquivamento e UI documentados. |
| BK-MF0-06 | `PARCIAL` | `HIDRATADO` | Histórico com eventos tipados, paginação, controller e timeline documentados. |
| BK-MF0-07 | `PARCIAL` | `HIDRATADO` | Áreas de estudo com CRUD, duplicados, ownership e handoff para materiais documentados. |
| BK-MF0-08 | `CRÍTICO` | `HIDRATADO` | Materiais PDF/DOCX/URL/TOPIC, storage local dev, validação e módulo exportável documentados. |
| BK-MF0-09 | `PARCIAL` | `HIDRATADO` | Voz como estilo pedagógico, sanitização, DTO/service/controller/UI documentados. |
| BK-MF0-10 | `PARCIAL` | `HIDRATADO` | Perfil IA idempotente, materiais submetidos vs fontes processáveis e painel documentados. |
| BK-MF0-11 | `CRÍTICO` | `HIDRATADO` | Resumos IA com provider isolado, fontes obrigatórias, artefactos e bloqueio sem fontes documentados. |
| BK-MF0-12 | `CRÍTICO` | `HIDRATADO` | Explicações/cards/quizzes com JSON, validador de quiz, provider e UI documentados. |

### Validação pós-edição

Comando executado:

```bash
bash scripts/validate-planificacao.sh
```

Resultado: `FALHOU` antes de validar a planificação, porque o wrapper procura `../scripts/validate_planificacao_canonica.py` e esse ficheiro não existe no caminho esperado a partir deste repositório.

Erro observado:

```text
can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/studyflow/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

Este bloqueio parece ser de infraestrutura do validador, não drift documental dos BKs MF0. Não foi corrigido nesta tarefa para respeitar a instrução de editar apenas os guias BK hidratados e este relatório.

## Drift documental
Não foi encontrado drift canónico nos campos da `MF0` entre `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e os headers dos guias: IDs, macro, owner, apoio, prioridade, estado, esforço, dependências, RF/RNF, fase, sprint, core/reforço, próximo BK e paths estão alinhados para os 12 BKs analisados.

Foi encontrado drift de hidratação pedagógica/técnica: `MF-VIEWS.md` define pronto pedagógico como “guia canónico completo e snippet técnico aplicável”, mas os guias MF0 ficam frequentemente em “snippet de referência” e dependem de scaffold/código ainda inexistente. Isto não é drift de contrato BK, mas é um desvio relevante face ao objetivo de guias executáveis por alunos.

## Problemas transversais iniciais
- Código insuficiente: há muitos `Snippet de referência`, comentários de endpoint e tipos TypeScript isolados, mas faltam ficheiros completos finais.
- Localização insuficiente para edição: alguns passos dizem o ficheiro alvo, mas não indicam “no topo”, “dentro da função X”, “antes/depois do bloco Y” ou “substituir a função Y”.
- Integração incompleta: faltam módulos NestJS, imports completos, providers injetados, guards aplicados no código final, tratamento de erros HTTP e wiring React/API.
- Comentários didáticos insuficientes: os snippets quase nunca têm comentários orientados a alunos do 12.º ano.
- Explicação pós-código insuficiente: depois dos blocos aparece “O que verificar”, mas raramente há uma explicação simples do que o código faz e porquê.
- Testes descritos mas não fornecidos: os guias dizem que testes devem existir, mas não entregam ficheiros de teste completos e copiáveis.
- Dependência de scaffold: muitos guias indicam que os paths devem ser confirmados após scaffold, o que impede execução autónoma.
- Evidence está bem prevista, mas fica como `A preencher`, sem exemplos concretos de outputs esperados reais.

## Classificação inicial por BK

| BK | Guia | Classificação | Motivo curto |
| --- | --- | --- | --- |
| BK-MF0-01 | `docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-do-aluno-email-password-ou-sso-escolar.md` | `CRÍTICO` | Registo e hashing são segurança crítica, mas o service não traz implementação real de hashing, validação NestJS, erros HTTP, módulo e testes completos. |
| BK-MF0-02 | `docs/planificacao/guias-bk/MF0/BK-MF0-02-login-seguro-com-cookies-httponly.md` | `CRÍTICO` | Login, sessão, cookies, Redis/CSRF e guard são críticos; há snippets soltos e não uma implementação segura final. |
| BK-MF0-03 | `docs/planificacao/guias-bk/MF0/BK-MF0-03-perfil-editavel-nome-ano-curso-turma.md` | `PARCIAL` | Boa estrutura e bom modelo, mas faltam controller/service/DTO/testes/UI completos e localização exata de edição. |
| BK-MF0-04 | `docs/planificacao/guias-bk/MF0/BK-MF0-04-o-aluno-pode-estudar-sem-turma.md` | `PARCIAL` | O comportamento está claro, mas faltam endpoint, service, rota protegida e dashboard completos. |
| BK-MF0-05 | `docs/planificacao/guias-bk/MF0/BK-MF0-05-o-aluno-pode-criar-rotinas-e-objetivos-de-estudo.md` | `PARCIAL` | Modelos bem encaminhados, mas CRUD, validação, ownership e UI ainda estão em snippets. |
| BK-MF0-06 | `docs/planificacao/guias-bk/MF0/BK-MF0-06-o-aluno-pode-consultar-historico-de-estudo.md` | `PARCIAL` | Event log bem descrito, mas faltam service, paginação, controller, UI e testes completos. |
| BK-MF0-07 | `docs/planificacao/guias-bk/MF0/BK-MF0-07-criar-areas-de-estudo-auto-disciplina-independente.md` | `PARCIAL` | Conceito e schema claros, mas faltam CRUD completo, tratamento de duplicados, UI e integração com histórico/dashboard. |
| BK-MF0-08 | `docs/planificacao/guias-bk/MF0/BK-MF0-08-submeter-materiais-pdf-docx-urls-topicos.md` | `CRÍTICO` | Uploads, storage e validação de ficheiros/URLs são superfície de risco; o guia não fornece código completo seguro. |
| BK-MF0-09 | `docs/planificacao/guias-bk/MF0/BK-MF0-09-associar-estilo-tom-das-aulas-voz-da-ia.md` | `PARCIAL` | Scope é prudente e pedagógico, mas falta implementação completa de DTO/service/controller, sanitização e UI. |
| BK-MF0-10 | `docs/planificacao/guias-bk/MF0/BK-MF0-10-criar-perfil-ia-da-area-de-estudo.md` | `PARCIAL` | Bons estados e separação sem provider IA, mas faltam código completo de construção idempotente, ownership, logging e painel. |
| BK-MF0-11 | `docs/planificacao/guias-bk/MF0/BK-MF0-11-obter-resumos-ia-baseados-nos-materiais-enviados.md` | `CRÍTICO` | Primeiro fluxo de IA visível; falta provider real/stub controlado, prompt completo, service seguro, erros HTTP e testes anti-alucinação completos. |
| BK-MF0-12 | `docs/planificacao/guias-bk/MF0/BK-MF0-12-obter-explicacoes-cards-e-quizzes-personalizados.md` | `CRÍTICO` | Geração IA estruturada e validação de quiz exigem código completo; o guia ainda não entrega provider, prompts, validador e UI finais. |

## Detalhe inicial dos BKs corrigidos

### BK-MF0-01 - `CRÍTICO`
- Ficheiro do guia: `docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-do-aluno-email-password-ou-sso-escolar.md`
- Problema principal: registo seguro não está implementável só com o guia.
- Exemplos de secções vagas:
  - Passo 2 mostra apenas `export type RegisterStudentDto`, sem validação real NestJS/class-validator.
  - Passo 3 mostra `registerStudent` sem hashing real, sem injeção de model, sem tratamento `409`, sem persistência e sem resposta sanitizada final.
  - TODOs indicam scaffold, biblioteca de hashing e caminhos reais ainda por confirmar.
- O que falta hidratar:
  - Código completo de `user.schema.ts`, `register-student.dto.ts`, `auth.module.ts`, `auth.controller.ts`, `auth.service.ts`, `users.service.ts`, `RegisterPage.tsx`, `apiClient.ts` e testes.
  - Comentários didáticos no código sobre hashing, email único e sanitização de resposta.
  - Explicação simples depois de cada bloco.
  - Expected bodies completos para `201`, `400` e `409`.
- Risco pedagógico: o aluno pode guardar passwords de forma insegura ou implementar uma API que parece funcionar mas viola RNF15/RNF17.
- Prioridade de correção: Muito alta.

### BK-MF0-02 - `CRÍTICO`
- Ficheiro do guia: `docs/planificacao/guias-bk/MF0/BK-MF0-02-login-seguro-com-cookies-httponly.md`
- Problema principal: autenticação por cookie HttpOnly fica descrita, mas não implementada de ponta a ponta.
- Exemplos de secções vagas:
  - Passo 3 mostra apenas `response.cookie(...)`, sem controller completo, sessão persistida, assinatura/rotação, expiração ou logout.
  - Passo 5 mostra apenas `if (!session) throw new UnauthorizedException(...)`, sem `SessionGuard` completo.
  - TODO de Redis e duração oficial de sessão deixa a implementação real em aberto.
- O que falta hidratar:
  - Código completo de login/logout/me, session service, session schema/store, guard, configuração de cookie e middleware CSRF mínimo.
  - Testes e2e completos com `Set-Cookie`, `HttpOnly`, `SameSite`, `Secure` em produção e sessão inválida.
  - Explicação didática sobre cookies, CSRF, sessão opaca e por que `localStorage` fica excluído.
- Risco pedagógico: alto risco de sessão insegura, token exposto no frontend ou autenticação que falha em cenários reais.
- Prioridade de correção: Muito alta.

### BK-MF0-03 - `PARCIAL`
- Ficheiro do guia: `docs/planificacao/guias-bk/MF0/BK-MF0-03-perfil-editavel-nome-ano-curso-turma.md`
- Problema principal: modelo e contrato existem, mas CRUD protegido não está copiável.
- Exemplos de secções vagas:
  - Passo 2 não mostra validação concreta nem política para campos extra.
  - Passo 3 usa `profileRepository.updateByUserId(...)`, mas esse repository não existe nem é criado.
  - Passo 5 reduz a UI a dois inputs.
- O que falta hidratar:
  - Controller/service/DTO completos, com `SessionGuard`, validação, rejeição de mass assignment e resposta esperada.
  - Página React completa com carregamento inicial, submit, erro e sucesso.
  - Testes completos para sem sessão, `role: "ADMIN"` e alteração válida.
- Risco pedagógico: o aluno pode aceitar `userId`/`role` vindos do body ou não perceber como ligar `request.user` ao perfil.
- Prioridade de correção: Alta.

### BK-MF0-04 - `PARCIAL`
- Ficheiro do guia: `docs/planificacao/guias-bk/MF0/BK-MF0-04-o-aluno-pode-estudar-sem-turma.md`
- Problema principal: regra “sem turma” está clara, mas a implementação do dashboard/API é só esboçada.
- Exemplos de secções vagas:
  - Passo 2 mostra `return { studentName: profile.name, hasClass: Boolean(profile.className) };`, sem service completo nem tratamento de perfil inexistente.
  - Passo 5 mostra uma rota JSX genérica sem `ProtectedRoute` implementado.
  - Não há código final de `AppShell` nem dashboard.
- O que falta hidratar:
  - `SoloStudyStateDto`, controller, service, rota protegida, hook de sessão e dashboard completos.
  - Expected JSON de `GET /api/study/solo`.
  - Explicação de como contadores a zero são calculados sem depender de turmas.
- Risco pedagógico: o aluno pode criar dependência acidental de `turmaId`, quebrando RF04.
- Prioridade de correção: Alta.

### BK-MF0-05 - `PARCIAL`
- Ficheiro do guia: `docs/planificacao/guias-bk/MF0/BK-MF0-05-o-aluno-pode-criar-rotinas-e-objetivos-de-estudo.md`
- Problema principal: schemas existem parcialmente, mas o CRUD real de rotinas/objetivos não está completo.
- Exemplos de secções vagas:
  - Passo 2 define só `CreateRoutineDto`; falta `CreateGoalDto`, update DTO e validações reais.
  - Passo 3 usa `this.routineModel.create(...)` fora de uma classe NestJS completa.
  - Passo 5 mostra apenas um botão.
- O que falta hidratar:
  - Service/controller completos para routines e goals, com ownership em todas as queries.
  - Política clara de delete/archive.
  - UI completa para criar/listar/editar estado/remover.
  - Testes para duração inválida, outro aluno e criação válida.
- Risco pedagógico: o aluno pode implementar CRUD que funciona localmente mas permite IDOR ou dados inválidos.
- Prioridade de correção: Média-alta.

### BK-MF0-06 - `PARCIAL`
- Ficheiro do guia: `docs/planificacao/guias-bk/MF0/BK-MF0-06-o-aluno-pode-consultar-historico-de-estudo.md`
- Problema principal: padrão de eventos está bem definido, mas a integração com módulos anteriores/futuros fica abstrata.
- Exemplos de secções vagas:
  - Passo 0 define tipos como string solta; falta enum/const exportável completo.
  - Passo 2 usa `this.studyEventModel.find(...)` sem classe, injeção, filtros ou paginação.
  - Passo 4 diz para chamar `recordStudyEvent`, mas não mostra integração final no service de rotinas.
- O que falta hidratar:
  - `StudyEvent` completo com tipo controlado, DTOs, service, controller e paginação.
  - UI de timeline completa.
  - Exemplo de integração real com BK-MF0-05 ou fallback documentado.
- Risco pedagógico: histórico pode virar lista solta sem ownership robusto nem contrato reutilizável.
- Prioridade de correção: Média.

### BK-MF0-07 - `PARCIAL`
- Ficheiro do guia: `docs/planificacao/guias-bk/MF0/BK-MF0-07-criar-areas-de-estudo-auto-disciplina-independente.md`
- Problema principal: área de estudo está bem conceptualizada, mas falta CRUD completo e regra de duplicados.
- Exemplos de secções vagas:
  - Passo 2 define `CreateStudyAreaDto` sem validação concreta.
  - Passo 3 mostra `findOne({ _id: areaId, userId })`, mas não mostra criação, edição, arquivamento nem erros.
  - TODO mantém regra de nomes duplicados por decidir.
- O que falta hidratar:
  - Service/controller completos com create/list/detail/update/archive.
  - Validação de `ObjectId`, nome vazio, duplicado e área alheia.
  - Páginas React completas de lista e detalhe.
  - Handoff com exemplo real de `studyAreaId`.
- Risco pedagógico: BK-MF0-08 pode receber `studyAreaId` frágil ou áreas sem ownership robusto.
- Prioridade de correção: Alta.

### BK-MF0-08 - `CRÍTICO`
- Ficheiro do guia: `docs/planificacao/guias-bk/MF0/BK-MF0-08-submeter-materiais-pdf-docx-urls-topicos.md`
- Problema principal: submissão de materiais é funcionalidade central e superfície de ataque, mas o guia não traz implementação segura completa.
- Exemplos de secções vagas:
  - Passo 0 define MIME types como array solto, sem validador completo.
  - Passo 3 diz “guardar ficheiro em storage local/dev ou storage definido no scaffold”, deixando storage e segurança em aberto.
  - Passo 4 define DTO parcial para URL/TOPIC, sem validação de `javascript:`, tamanho e texto.
  - Passo 5 usa comentários de endpoint em vez de controller real.
- O que falta hidratar:
  - Código completo de upload multipart, validação MIME/extensão/tamanho, storage seguro, DTOs e service.
  - Regras exatas para limite de upload, path/storageKey, resposta sem path absoluto e ownership.
  - UI completa com file/url/topic, progresso, erros e lista.
  - Testes e2e para `.exe`, tamanho excedido, URL inválida e área alheia.
- Risco pedagógico: risco de upload inseguro, path leakage, bypass de MIME, DoS por tamanho ou materiais em área alheia.
- Prioridade de correção: Muito alta.

### BK-MF0-09 - `PARCIAL`
- Ficheiro do guia: `docs/planificacao/guias-bk/MF0/BK-MF0-09-associar-estilo-tom-das-aulas-voz-da-ia.md`
- Problema principal: bom enquadramento pedagógico, mas implementação de preferências e sanitização não está completa.
- Exemplos de secções vagas:
  - Passo 1 diz para adicionar campos ao schema existente, mas não indica localização exata dentro do ficheiro.
  - Passo 3 diz “sanitizar notas”, sem função concreta.
  - Passo 5 mostra um `<select>` mínimo, sem componente final.
- O que falta hidratar:
  - Alteração completa ao `StudyAreaSchema`, DTO com enum/limites, service/controller e sanitização.
  - UI completa com presets, notas, estados e erro.
  - Testes para preset inválido, texto longo e área alheia.
- Risco pedagógico: aluno pode tratar “voz” como texto livre perigoso ou confundir com áudio/TTS.
- Prioridade de correção: Média.

### BK-MF0-10 - `PARCIAL`
- Ficheiro do guia: `docs/planificacao/guias-bk/MF0/BK-MF0-10-criar-perfil-ia-da-area-de-estudo.md`
- Problema principal: estados do perfil IA estão claros, mas o código de construção/idempotência não está completo.
- Exemplos de secções vagas:
  - Passo 2 mostra lógica de status, mas não mostra service completo, queries, idempotência nem erros.
  - Passo 4 usa `// 200/201: AiAreaProfileDto`, sem controller real.
  - Passo 6 mostra log genérico sem integração com logger configurado.
- O que falta hidratar:
  - Código completo de `AiAreaProfileModule`, schema, DTO, service idempotente, controller e painel.
  - Verificação explícita de materiais `READY` vs `PENDING_PROCESSING`.
  - Testes para sem materiais, pendentes, área alheia e criação repetida.
- Risco pedagógico: aluno pode marcar perfil como pronto com materiais pendentes, desbloqueando IA sem fontes.
- Prioridade de correção: Alta.

### BK-MF0-11 - `CRÍTICO`
- Ficheiro do guia: `docs/planificacao/guias-bk/MF0/BK-MF0-11-obter-resumos-ia-baseados-nos-materiais-enviados.md`
- Problema principal: geração de resumos IA precisa de guardrails e código completo; o guia ainda fica no nível de interfaces e snippets.
- Exemplos de secções vagas:
  - Passo 2 cria apenas interface `AiProvider`, sem implementação concreta, stub de teste completo ou wiring.
  - Passo 3 mostra prompt de uma linha, insuficiente para contrato final.
  - Passo 4 mostra chamada `aiProvider.generateSummary(...)`, sem validação completa de fontes, área, perfil, erros e persistência.
  - TODO mantém provider/modelo por confirmar.
- O que falta hidratar:
  - Provider real configurável e stub de testes, prompt builder completo, service, controller, DTOs e artifact persistence.
  - Guardrail de “sem fontes => sem chamada ao provider” com código e testes.
  - Tratamento de `503`, mensagens PT-PT e logs sem secrets.
  - UI completa com fontes, erro sem fontes e resumo guardado.
- Risco pedagógico: alto risco de IA inventar conteúdo, chamar provider sem fontes, expor secrets ou criar uma experiência falsa de RAG.
- Prioridade de correção: Muito alta.

### BK-MF0-12 - `CRÍTICO`
- Ficheiro do guia: `docs/planificacao/guias-bk/MF0/BK-MF0-12-obter-explicacoes-cards-e-quizzes-personalizados.md`
- Problema principal: outputs estruturados de IA e quizzes exigem validação forte, mas há apenas snippets.
- Exemplos de secções vagas:
  - Passo 2 tem prompt curto, sem contrato JSON completo.
  - Passo 4 chama `aiProvider.generateStudyTool(...)`, mas o provider não foi hidratado.
  - Passo 5 mostra só `question.options.length !== 4`, sem validar resposta correta única, fontes, schema completo ou mensagens.
  - Passo 8 deixa feedback do aluno como TODO.
- O que falta hidratar:
  - DTO completo para tipos, prompt builder por tipo, provider, service, controller e validator de quiz.
  - Schema/contrato JSON dos artefactos de explicação, flashcards e quiz.
  - UI completa para os três tipos, com loading/error/sources/result.
  - Testes para quiz inválido, sem fontes, provider indisponível e área alheia.
- Risco pedagógico: aluno pode gerar quizzes inválidos, conteúdo sem fontes ou confundir ferramenta de estudo com avaliação oficial.
- Prioridade de correção: Muito alta.

## Lista ordenada inicial de BKs a hidratar primeiro
1. BK-MF0-01 - Registo do aluno.
2. BK-MF0-02 - Login seguro com cookies HttpOnly.
3. BK-MF0-08 - Submeter materiais.
4. BK-MF0-11 - Resumos IA baseados em materiais.
5. BK-MF0-12 - Explicações, cards e quizzes.
6. BK-MF0-07 - Áreas de Estudo.
7. BK-MF0-10 - Perfil IA da Área de Estudo.
8. BK-MF0-03 - Perfil editável.
9. BK-MF0-04 - Estudo sem turma.
10. BK-MF0-05 - Rotinas e objetivos.
11. BK-MF0-06 - Histórico de estudo.
12. BK-MF0-09 - Voz/tom da IA.
