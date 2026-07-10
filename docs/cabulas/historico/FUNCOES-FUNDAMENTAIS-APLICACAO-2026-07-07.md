---
status: SUPERSEDED
authoritative_for_release: false
superseded_by: docs/cabulas/FUNCOES-FUNDAMENTAIS-APLICACAO.md
---

# Funções Fundamentais Da Aplicação - StudyFlow

> Snapshot narrativo preservado. As assinaturas, contagens e contratos abaixo refletem
> 2026-07-07 e não devem ser usados como inventário atual nem evidence de release.

Data do levantamento: 2026-07-07
Base do levantamento: `real_dev/api/src` e `real_dev/web/src`

## Critérios

- A lista foi extraída por AST a partir do código real em `real_dev`.
- Inclui funções/métodos nomeados de runtime com JSDoc: controllers, services, componentes React, páginas, clientes HTTP, scripts e helpers nomeados.
- Inclui helpers privados quando fazem validação, autorização, transformação de dados, segurança, IA, persistência ou suporte operacional relevante.
- Exclui testes, callbacks anónimos inline, artefactos gerados, `node_modules`, `dist`, reports e construtores.
- Cada entrada mostra a assinatura curta, o tipo de símbolo, a descrição principal, as entradas documentadas e o valor devolvido.

## Resumo

- Backend: 726 funções/métodos em 177 ficheiros.
- Frontend: 370 funções/métodos em 101 ficheiros.
- Total: 1096 funções/métodos fundamentais listados.

## Backend

### `real_dev/api/src/common/architecture/domain-boundary.ts`

- `resolveBackendDomainFromModulePath(importPath)` (exportada; função) - Resolve o domínio backend a partir do caminho importado no AppModule. Entradas: `importPath`: Caminho relativo usado no import. Devolve: Domínio reconhecido ou `UNKNOWN` quando o caminho deve ser revisto.
- `resolveBackendDomainFromSourcePath(sourcePath)` (exportada; função) - Resolve o domínio backend a partir de caminhos reais dentro de `src/modules`. Entradas: `sourcePath`: Caminho absoluto, relativo ao projeto ou relativo ao `AppModule`. Devolve: Domínio reconhecido ou `UNKNOWN` quando o ficheiro ainda não tem owner arquitetural.
- `resolveDomainImportKind(importPath)` (exportada; função) - Classifica uma importação real para a política de fronteiras. Entradas: `importPath`: Caminho declarado no import TypeScript. Devolve: Tipo de importação usado por `assertAllowedDomainImport`.
- `assertAllowedDomainImport(request)` (exportada; função) - Confirma se um domínio pode consumir outro sem quebrar a arquitetura. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/api/src/common/config/load-env.ts`

- `loadEnvFile()` (top-level; função) - Carrega variáveis locais do `.env` do pacote API atual. O loader é intencionalmente pequeno para evitar uma dependência nova. Valores já definidos no ambiente do processo têm prioridade sobre o ficheiro. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `parseEnvValue(value)` (top-level; função) - Normaliza valores `.env` com ou sem aspas. Entradas: `value`: Valor textual lido do ficheiro. Devolve: Valor pronto para `process.env`.

### `real_dev/api/src/common/guards/session.guard.ts`

- `SessionGuard.canActivate(context)` (pública; método de classe) - Valida se o pedido atual tem sessão ativa. Entradas: `context`: Contexto NestJS do pedido HTTP. Devolve: `true` quando a sessão existe e foi anexada ao request.

### `real_dev/api/src/common/health/health.controller.ts`

- `HealthController.describe()` (pública; método de classe) - Devolve o estado publico da API. Entradas: sem entradas explícitas. Devolve: Metadados minimos para deploy, rollback e smoke HTTP.

### `real_dev/api/src/common/health/health.service.ts`

- `HealthService.describe()` (pública; método de classe) - Devolve metadados minimos para smoke tests de deploy e rollback. Entradas: sem entradas explícitas. Devolve: Estado tecnico seguro da API.
- `HealthService.getStatus()` (pública; método de classe) - Junta o estado de runtime com o orcamento mensal de disponibilidade. Entradas: sem entradas explícitas. Devolve: Estado publico da API, sem dados pessoais nem segredos.
- `readMonthlyDowntimeMinutes(rawValue)` (top-level; função) - Le o downtime mensal vindo do ambiente de execucao. Entradas: `rawValue`: Valor textual opcional com minutos mensais de downtime. Devolve: Minutos validos para `evaluateAvailabilityBudget(...)`.

### `real_dev/api/src/common/middleware/csrf.middleware.ts`

- `csrfMiddleware(request, response, next)` (exportada; função) - Aplica uma proteção CSRF mínima compatível com cookies HttpOnly. O BK-MF0-02 pede preparação de CSRF sem transformar este BK num módulo avançado de segurança. Por isso, em métodos de escrita aceitamos pedidos same-origin ou pedidos com cabeçalho `x-studyflow-csrf`, que o front... Entradas: `request`: Pedido HTTP recebido pelo Nest/Express.; `response`: Resposta HTTP usada para terminar pedidos bloqueados.; `next`: Função que passa o pedido para o próximo middleware. Devolve: Nada; termina a resposta quando o pedido falha a validação.
- `isSameOrigin(origin, host)` (top-level; função) - Compara o host recebido com o host parseado do Origin. Entradas: `origin`: Cabeçalho Origin enviado pelo browser.; `host`: Cabeçalho Host do pedido. Devolve: Verdadeiro apenas quando os hosts são exatamente iguais.

### `real_dev/api/src/common/middleware/require-https.middleware.ts`

- `RequireHttpsMiddleware.use(request, _response, next)` (pública; método de classe) - Recusa pedidos HTTP em produção e mantém desenvolvimento local viável. Entradas: `request`: Pedido Express recebido pela API.; `_response`: Resposta Express, mantida pelo contrato NestMiddleware.; `next`: Continua a cadeia quando o canal é aceitável. Devolve: Nada; lança exceção quando o canal é inseguro.

### `real_dev/api/src/common/middleware/security-headers.middleware.ts`

- `securityHeadersMiddleware(_request, response, next)` (exportada; função) - Reduz risco de XSS refletido, clickjacking, sniffing e exposição de APIs do browser. Entradas: `_request`: Pedido HTTP recebido pela API.; `response`: Resposta onde os cabeçalhos são definidos.; `next`: Continua a cadeia de middlewares. Devolve: Nada; apenas configura cabeçalhos seguros.

### `real_dev/api/src/common/observability/structured-event.service.ts`

- `StructuredEventService.record(input)` (pública; método de classe) - Converte um evento de domínio num objeto seguro para auditoria técnica. Entradas: `input`: Evento emitido por um módulo da API. Devolve: Evento normalizado sem valores sensíveis.
- `StructuredEventService.redactMetadata(metadata)` (privada; método de classe) - Remove metadados que podem conter sessão, material privado ou conteúdo de IA. Entradas: `metadata`: Metadados candidatos a observabilidade. Devolve: Metadados seguros para persistência ou evidence.

### `real_dev/api/src/common/operations/availability-budget.ts`

- `evaluateAvailabilityBudget(downtimeMinutes)` (exportada; função) - Avalia se os minutos de indisponibilidade continuam dentro do RNF24. Entradas: `downtimeMinutes`: Total mensal de minutos indisponíveis. Devolve: Estado operacional pronto para evidence ou health-check.

### `real_dev/api/src/common/reliability/retry-with-recovery.ts`

- `retryWithRecovery(operation, options)` (exportada; função) - Executa uma operação recuperável com limites explícitos de tentativas. Entradas: `operation`: Operação idempotente que pode ser repetida.; `options`: Configuração de limites, espera e decisão de retry. Devolve: Resultado da operação quando uma tentativa termina com sucesso.
- `validateRetryOptions(options)` (exportada; função) - Valida limites para impedir retry infinito ou configuração perigosa. Entradas: `options`: Configuração recebida pelo chamador. Devolve: Configuração com callbacks por defeito.
- `isTransientNetworkError(error)` (exportada; função) - Identifica erros temporários de rede que podem ser repetidos em leituras. Entradas: `error`: Erro capturado pela operação. Devolve: `true` apenas para falhas transitórias conhecidas.
- `toPublicErrorMessage(error)` (top-level; função) - Converte erros para mensagem curta, sem stack trace nem dados internos. Entradas: `error`: Erro original. Devolve: Mensagem segura para testes, eventos e evidence.
- `defaultSleep(delayMs)` (top-level; função) - Espera assíncrona usada quando o chamador não injeta sleep em teste. Entradas: `delayMs`: Milissegundos a aguardar antes da próxima tentativa. Devolve: Promise resolvida após a espera.

### `real_dev/api/src/common/runtime/runtime-instance.service.ts`

- `RuntimeInstanceService.describe()` (pública; método de classe) - Devolve metadados seguros para smoke tests e evidence de escala horizontal. Entradas: sem entradas explícitas. Devolve: Identificador da instância e stores partilhados usados pela API.

### `real_dev/api/src/common/runtime/runtime.controller.ts`

- `RuntimeController.instance()` (pública; método de classe) - Devolve o identificador da instância e stores partilhados. Entradas: sem entradas explícitas. Devolve: Metadados seguros para confirmar balanceamento horizontal.

### `real_dev/api/src/common/text/pt-text-normalization.ts`

- `normalizePortugueseStudyText(value)` (exportada; função) - Normaliza texto importado sem remover acentos, cedilhas ou quebras de parágrafo úteis. Entradas: `value`: Texto extraído de formulário, URL, PDF, DOCX ou material oficial. Devolve: Texto em NFC e indicação de conteúdo legível.

### `real_dev/api/src/common/utils/mongo-error.util.ts`

- `isMongoDuplicateKeyError(error)` (exportada; função) - Identifica erros de chave única lançados pelo MongoDB/Mongoose. Entradas: `error`: Erro desconhecido vindo da operação de persistência. Devolve: `true` quando o erro corresponde a duplicate key.

### `real_dev/api/src/common/validation/mf0-validation-exception.factory.ts`

- `mf0ValidationExceptionFactory(errors)` (exportada; função) - Converte erros de validação globais nos contratos públicos definidos pela MF0. Entradas: `errors`: Erros emitidos pelo `ValidationPipe`. Devolve: Exceção HTTP pública.
- `hasForbiddenProfileField(errors)` (top-level; função) - Verifica se o pipe rejeitou campos de perfil explicitamente proibidos. Entradas: `errors`: Erros de validação. Devolve: `true` quando o payload tentou enviar campo proibido.
- `flattenValidationMessages(errors)` (top-level; função) - Mantém resposta genérica para erros não especificados pelos guias MF0. Entradas: `errors`: Erros de validação. Devolve: Mensagens simples para o corpo padrão de `BadRequestException`.

### `real_dev/api/src/main.ts`

- `bootstrap()` (top-level; função) - Arranca a API StudyFlow com os contratos transversais usados pela MF0. O bootstrap configura cookies porque o BK-MF0-02 exige sessões HttpOnly. Também ativa CORS com credenciais para permitir que o frontend envie o cookie de sessão sem recorrer a localStorage. Entradas: sem entradas explícitas. Devolve: Promise resolvida quando o servidor HTTP estiver a escutar.

### `real_dev/api/src/modules/account-deletion/account-deletion.controller.ts`

- `AccountDeletionController.delete(request, _body)` (pública; método de classe) - Remove o pedido HTTP de eliminação de conta e delega no service a aplicação das regras de autenticação, validação e domínio. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `_body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/api/src/modules/account-deletion/account-deletion.service.ts`

- `AccountDeletionService.deleteMine(actor, sessionId)` (pública; método de classe) - Elimina dados pessoais próprios, anonimiza a conta e revoga a sessão. Entradas: `actor`: Utilizador autenticado.; `sessionId`: Sessão atual a destruir. Devolve: Contadores removidos.

### `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.controller.ts`

- `AdaptiveExplanationsController.ask(request, body)` (pública; método de classe) - Recebe o pedido autenticado e delega a decisão no service. Entradas: `request`: Pedido com utilizador resolvido pela sessão.; `body`: Payload validado pelo DTO. Devolve: Explicação adaptada.

### `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.service.ts`

- `AdaptiveExplanationsService.ask(actor, input)` (pública; método de classe) - Gera uma explicação adaptada para o aluno autenticado. Entradas: `actor`: Utilizador autenticado pela sessão.; `input`: Área privada e pergunta do aluno. Devolve: Explicação adaptada persistida pelo contrato de IA.

### `real_dev/api/src/modules/admin-users/admin-users.controller.ts`

- `AdminUsersController.list(request)` (pública; método de classe) - Obtém o pedido HTTP de administração de utilizadores e delega no service a aplicação das regras de autenticação, validação e domínio. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `AdminUsersController.changeRole(request, id, body)` (pública; método de classe) - Executa o pedido HTTP de administração de utilizadores e delega no service a aplicação das regras de autenticação, validação e domínio. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `id`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/api/src/modules/admin-users/admin-users.service.ts`

- `AdminUsersService.listUsers(actor)` (pública; método de classe) - Lista utilizadores sem expor passwordHash. Entradas: `actor`: Administrador autenticado. Devolve: Utilizadores públicos.
- `AdminUsersService.changeRole(actor, targetUserId, input)` (pública; método de classe) - Altera role real do utilizador e preserva histórico. Entradas: `actor`: Administrador autenticado.; `targetUserId`: Utilizador alvo.; `input`: Novo papel e motivo. Devolve: Utilizador atualizado e histórico criado.
- `AdminUsersService.assertAdmin(actor)` (privada; método de classe) - Valida a regra de administração de utilizadores e lança uma exceção explícita quando o utilizador ou recurso não cumpre o contrato. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AdminUsersService.assertNotLastAdmin(adminId)` (privada; método de classe) - Garante que a plataforma não fica sem administradores. Entradas: `adminId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AdminUsersService.notFound()` (privada; método de classe) - Executa not found no domínio de administração de utilizadores, aplicando validações, autorização e persistência de forma coesa. Entradas: sem entradas explícitas. Devolve: Exceção estruturada pronta a ser lançada pelo service ou controller.

### `real_dev/api/src/modules/ai-consents/ai-consents.controller.ts`

- `AiConsentsController.list(request)` (pública; método de classe) - Obtém o pedido HTTP de consentimentos de IA e delega no service a aplicação das regras de autenticação, validação e domínio. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `AiConsentsController.grant(request, purpose, body)` (pública; método de classe) - Regista o pedido HTTP de consentimentos de IA e delega no service a aplicação das regras de autenticação, validação e domínio. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `purpose`: Finalidade de IA usada para escolher política, consentimento ou quota aplicável.; `body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.
- `AiConsentsController.revoke(request, purpose)` (pública; método de classe) - Remove o pedido HTTP de consentimentos de IA e delega no service a aplicação das regras de autenticação, validação e domínio. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `purpose`: Finalidade de IA usada para escolher política, consentimento ou quota aplicável. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/api/src/modules/ai-consents/ai-consents.service.ts`

- `AiConsentsService.list(actor)` (pública; método de classe) - Lista último estado por finalidade. Entradas: `actor`: Utilizador autenticado. Devolve: Consentimentos efetivos.
- `AiConsentsService.grant(actor, purpose, input)` (pública; método de classe) - Concede consentimento para finalidade. Entradas: `actor`: Utilizador autenticado.; `purpose`: Finalidade IA.; `input`: Versão opcional. Devolve: Consentimento criado.
- `AiConsentsService.revoke(actor, purpose)` (pública; método de classe) - Revoga consentimento para finalidade. Entradas: `actor`: Utilizador autenticado.; `purpose`: Finalidade IA. Devolve: Consentimento criado em estado revogado.
- `AiConsentsService.assertGranted(userId, purpose)` (pública; método de classe) - Bloqueia chamadas IA sem consentimento ativo. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `userId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `purpose`: Finalidade de IA usada para escolher política, consentimento ou quota aplicável. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AiConsentsService.toView(consent)` (privada; método de classe) - Transforma o documento interno de consentimentos de IA num contrato público, removendo detalhes de persistência antes de responder à UI. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `consent`: Valor de consent usado pela função para executar to view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/ai-content-reviews/ai-content-reviews.controller.ts`

- `AiContentReviewsController.create(request, subjectId, body)` (pública; método de classe) - Recebe o pedido de criação de revisão docente de conteúdos IA e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de revisão docente de conteúdos IA criado no formato público esperado pela UI ou pelo teste.
- `AiContentReviewsController.list(request, subjectId)` (pública; método de classe) - Recebe o pedido de listagem de revisão docente de conteúdos IA e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de revisão docente de conteúdos IA visível para o contexto autorizado.
- `AiContentReviewsController.decide(request, reviewId, body)` (pública; método de classe) - Executa a operação decide no domínio de revisão docente de conteúdos IA com contrato explícito. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `reviewId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/api/src/modules/ai-content-reviews/ai-content-reviews.service.ts`

- `AiContentReviewsService.create(actor, subjectId, input)` (pública; método de classe) - Cria revisão docente de conteúdos IA depois de validar permissões, normalizar input e preparar o contrato público. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `subjectId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `AiContentReviewsService.listForSubject(actor, subjectId)` (pública; método de classe) - Lista revisão docente de conteúdos IA já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de revisão docente de conteúdos IA visível para o contexto autorizado.
- `AiContentReviewsService.decide(actor, reviewId, input)` (pública; método de classe) - Executa a operação decide no domínio de revisão docente de conteúdos IA com contrato explícito. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `reviewId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `AiContentReviewsService.countApprovedBySubjectIds(subjectIds)` (pública; método de classe) - Executa a operação count approved by disciplina ids no domínio de revisão docente de conteúdos IA com contrato explícito. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `subjectIds`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Número calculado para o chamador usar em contadores, limites ou ordenação.
- `AiContentReviewsService.assertTeacher(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AiContentReviewsService.notFound()` (privada; método de classe) - Constrói uma exceção de revisão docente de conteúdos IA com código previsível para API, UI e testes. Entradas: sem entradas explícitas. Devolve: Exceção padronizada com código estável para controllers e testes.
- `AiContentReviewsService.toView(review)` (privada; método de classe) - Mapeia o documento interno de revisão docente de conteúdos IA para uma forma pública estável e simples de consumir. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `review`: Valor de review usado pela função para executar to view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/ai-guardrails/ai-guardrails.controller.ts`

- `AiGuardrailsController.check(request, body)` (pública; método de classe) - Verifica se o contexto informado é seguro para uso de IA. Entradas: `request`: Pedido autenticado por cookie.; `body`: Dados validados pelo DTO. Devolve: Decisão de guardrail persistida.

### `real_dev/api/src/modules/ai-guardrails/ai-guardrails.service.ts`

- `AiGuardrailsService.check(actor, input)` (pública; método de classe) - Verifica se o pedido IA pode avançar sem misturar contextos nem aceitar conteúdo enviesado, perigoso ou sem finalidade pedagógica. Entradas: `actor`: Utilizador autenticado pela sessão.; `input`: Payload validado. Devolve: Decisão persistida e pronta para o frontend.
- `AiGuardrailsService.assertContextAccess(actor, input)` (privada; método de classe) - Confirma ownership ou membership do recurso indicado. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AiGuardrailsService.persistDecision(actor, input, allowed, reasonCode, reasonOverride)` (privada; método de classe) - Persiste a decisão sem guardar qualquer excerto do prompt. O prompt pode conter dados pessoais ou material privado; para auditoria técnica bastam o contexto validado, a decisão e a razão estável. Entradas: `actor`: Utilizador autenticado.; `input`: Pedido original validado.; `allowed`: Resultado do guardrail.; `reasonCode`: Código estável para UI e testes.; `reasonOverride`: Mensagem pública quando uma policy específica já decidiu a razão. Devolve: Decisão pública.
- `AiGuardrailsService.reasonFor(code)` (privada; método de classe) - Traduz códigos técnicos para mensagens PT-PT seguras. Entradas: `code`: Código interno da decisão. Devolve: Mensagem pública sem revelar dados de outro contexto.

### `real_dev/api/src/modules/ai-model-policies/ai-model-policies.controller.ts`

- `AiModelPoliciesController.list(request)` (pública; método de classe) - Obtém o pedido HTTP de políticas de modelos de IA e delega no service a aplicação das regras de autenticação, validação e domínio. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `AiModelPoliciesController.upsert(request, purpose, body)` (pública; método de classe) - Atualiza o pedido HTTP de políticas de modelos de IA e delega no service a aplicação das regras de autenticação, validação e domínio. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `purpose`: Finalidade de IA usada para escolher política, consentimento ou quota aplicável.; `body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/api/src/modules/ai-model-policies/ai-model-policies.service.ts`

- `assertPromptWithinLimit(prompt, policy)` (exportada; função) - Bloqueia prompts acima do limite administrativo antes de qualquer chamada externa. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `prompt`: Valor de prompt usado pela função para executar assert prompt within limit com dados explícitos.; `policy`: Política editada ou avaliada antes de persistir regras administrativas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AiModelPoliciesService.list(actor)` (pública; método de classe) - Obtém list no domínio de políticas de modelos de IA, aplicando validações, autorização e persistência de forma coesa. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `AiModelPoliciesService.upsert(actor, purpose, input)` (pública; método de classe) - Atualiza upsert no domínio de políticas de modelos de IA, aplicando validações, autorização e persistência de forma coesa. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `purpose`: Finalidade de IA usada para escolher política, consentimento ou quota aplicável.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Resultado da operação no formato esperado pelo chamador.
- `AiModelPoliciesService.resolveForUse(purpose)` (pública; método de classe) - Resolve política efetiva antes de chamar o provider. Entradas: `purpose`: Finalidade IA. Devolve: Política ou defaults seguros.
- `AiModelPoliciesService.assertAdmin(actor)` (privada; método de classe) - Valida a regra de políticas de modelos de IA e lança uma exceção explícita quando o utilizador ou recurso não cumpre o contrato. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AiModelPoliciesService.toResolvedPolicy(policy)` (privada; método de classe) - Transforma o documento interno de políticas de modelos de IA num contrato público, removendo detalhes de persistência antes de responder à UI. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `policy`: Política editada ou avaliada antes de persistir regras administrativas. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.
- `AiModelPoliciesService.resolvePositiveNumber(value, fallback)` (privada; método de classe) - Resolve resolve positive number no domínio de políticas de modelos de IA, aplicando validações, autorização e persistência de forma coesa. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `value`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.; `fallback`: Valor de fallback usado pela função para executar resolve positive number com dados explícitos. Devolve: Número calculado para o chamador usar em contadores, limites ou ordenação.

### `real_dev/api/src/modules/ai-quotas/ai-quotas.controller.ts`

- `AiQuotasController.listPolicies(request)` (pública; método de classe) - Obtém o pedido HTTP de quotas de IA e delega no service a aplicação das regras de autenticação, validação e domínio. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `AiQuotasController.upsertPolicy(request, body)` (pública; método de classe) - Atualiza o pedido HTTP de quotas de IA e delega no service a aplicação das regras de autenticação, validação e domínio. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.
- `AiQuotasController.listUsage(request)` (pública; método de classe) - Obtém o pedido HTTP de quotas de IA e delega no service a aplicação das regras de autenticação, validação e domínio. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.

### `real_dev/api/src/modules/ai-quotas/ai-quotas.service.ts`

- `AiQuotasService.listPolicies(actor)` (pública; método de classe) - Obtém list policies no domínio de quotas de IA, aplicando validações, autorização e persistência de forma coesa. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `AiQuotasService.listUsage(actor)` (pública; método de classe) - Obtém list usage no domínio de quotas de IA, aplicando validações, autorização e persistência de forma coesa. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `AiQuotasService.upsertPolicy(actor, input)` (pública; método de classe) - Atualiza upsert policy no domínio de quotas de IA, aplicando validações, autorização e persistência de forma coesa. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Resultado da operação no formato esperado pelo chamador.
- `AiQuotasService.reserveUsage(input)` (pública; método de classe) - Reserva unidades antes da chamada IA. Entradas: `input`: Reserva desejada. Devolve: Uso atualizado.
- `AiQuotasService.assertAdmin(actor)` (privada; método de classe) - Valida a regra de quotas de IA e lança uma exceção explícita quando o utilizador ou recurso não cumpre o contrato. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AiQuotasService.currentPeriod()` (privada; método de classe) - Executa current period no domínio de quotas de IA, aplicando validações, autorização e persistência de forma coesa. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: sem entradas explícitas. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `AiQuotasService.quotaExceeded()` (privada; método de classe) - Executa quota exceeded no domínio de quotas de IA, aplicando validações, autorização e persistência de forma coesa. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: sem entradas explícitas. Devolve: Exceção estruturada pronta a ser lançada pelo service ou controller.

### `real_dev/api/src/modules/ai-safety/ai-safety-policy.ts`

- `normalizeSafetyText(value)` (top-level; função) - Normaliza texto livre para comparações simples e previsíveis. Entradas: `value`: Texto recebido do DTO. Devolve: Texto em minúsculas, sem acentos e sem espaços duplicados.
- `evaluateAiSafetyInput(question)` (exportada; função) - Avalia uma pergunta antes de qualquer fluxo posterior de IA. Entradas: `question`: Pergunta do aluno já validada pelo DTO do endpoint. Devolve: Decisão segura para o service usar antes de autorizar o pedido.

### `real_dev/api/src/modules/ai/adaptive-learning.controller.ts`

- `AdaptiveLearningController.getProfile(request, studyAreaId)` (pública; método de classe) - Carrega artefactos de IA no formato necessário ao próximo passo do fluxo. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `studyAreaId`: Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno. Devolve: Entidade de artefactos de IA já filtrada pelo contexto recebido.
- `AdaptiveLearningController.updateProfile(request, studyAreaId, body)` (pública; método de classe) - Atualiza artefactos de IA sem alterar a semântica pública do endpoint ou componente. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `studyAreaId`: Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de artefactos de IA atualizado e normalizado para consumo externo.
- `AdaptiveLearningController.ask(request, studyAreaId, body)` (pública; método de classe) - Orquestra uma pergunta de IA em artefactos de IA, limitando contexto e validando a resposta antes de a devolver. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `studyAreaId`: Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Resposta validada, limitada às fontes e pronta para persistência ou apresentação.

### `real_dev/api/src/modules/ai/adaptive-learning.service.ts`

- `AdaptiveLearningService.getLearningProfile(userId, studyAreaId)` (pública; método de classe) - Obtém o perfil existente ou defaults seguros. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Área validada por ownership. Devolve: Perfil público.
- `AdaptiveLearningService.updateLearningProfile(userId, studyAreaId, input)` (pública; método de classe) - Atualiza ou cria o perfil da área do aluno. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Área validada por ownership.; `input`: Dados editáveis. Devolve: Perfil persistido.
- `AdaptiveLearningService.askAdaptiveExplanation(userId, studyAreaId, input)` (pública; método de classe) - Gera uma explicação adaptativa com fontes materiais autorizadas. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Área validada por ownership.; `input`: Pergunta do aluno. Devolve: Explicação guardada.
- `AdaptiveLearningService.getSources(userId, studyAreaId)` (privada; método de classe) - Obtém materiais prontos no contrato do provider. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Área validada por ownership. Devolve: Fontes autorizadas.
- `AdaptiveLearningService.validateResult(result, sources)` (privada; método de classe) - Valida runtime da IA antes de persistir. Entradas: `result`: Resultado devolvido por uma operação externa antes da validação final.; `sources`: Valor de sources usado pela função para executar validate result com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AdaptiveLearningService.toProfileView(profile)` (privada; método de classe) - Converte o documento interno no contrato público. Entradas: `profile`: Documento ou objeto lean. Devolve: Perfil público.
- `AdaptiveLearningService.cleanDifficulties(difficulties)` (privada; método de classe) - Normaliza dificuldades declaradas para o contrato público do BK-MF1-01. Entradas: `difficulties`: Lista recebida do cliente ou persistida. Devolve: Lista sem vazios, limitada ao contrato do DTO.
- `AdaptiveLearningService.legacyDifficultyNotes(difficultyNotes)` (privada; método de classe) - Converte dados antigos que ainda possam existir com difficultyNotes. Entradas: `difficultyNotes`: Campo legado anterior ao contrato canónico. Devolve: Lista compatível com difficulties.

### `real_dev/api/src/modules/ai/ai-area-profile.controller.ts`

- `AiAreaProfileController.prepare(request, id)` (pública; método de classe) - Prepara ou atualiza o perfil IA da área. Entradas: `request`: Pedido autenticado.; `id`: Identificador da área. Devolve: Estado do perfil IA.

### `real_dev/api/src/modules/ai/ai-area-profile.service.ts`

- `AiAreaProfileService.prepareProfile(userId, studyAreaId)` (pública; método de classe) - Calcula e persiste o estado IA de uma área do aluno. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área. Devolve: DTO público do perfil IA.
- `AiAreaProfileService.calculateStatus(sourceCount, processableCount)` (privada; método de classe) - Calcula estado do perfil IA a partir das fontes. Entradas: `sourceCount`: Número total de materiais.; `processableCount`: Número de fontes prontas para IA. Devolve: Estado canónico do perfil.
- `AiAreaProfileService.toDto(profile)` (privada; método de classe) - Converte documento Mongoose em DTO público. Entradas: `profile`: Documento de perfil IA. Devolve: DTO seguro.

### `real_dev/api/src/modules/ai/artifact-export.service.ts`

- `ArtifactExportService.exportArtifact(userId, studyAreaId, artifactId, formatInput)` (pública; método de classe) - Exporta um resumo ou quiz da área privada do aluno autenticado. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área privada.; `artifactId`: Identificador do artefacto IA.; `formatInput`: Formato pedido pela query. Devolve: Ficheiro textual pronto para resposta HTTP.
- `ArtifactExportService.artifactNotFound()` (privada; método de classe) - Cria erro público para artefacto ausente ou inacessível. Entradas: sem entradas explícitas. Devolve: Exceção uniforme para 404.
- `validateArtifactExportFormat(format)` (exportada; função) - Valida a query `format`. Entradas: `format`: Valor recebido por query string. Devolve: Formato suportado.
- `renderAiArtifactMarkdown(artifact)` (exportada; função) - Constrói Markdown seguro para um artefacto de estudo autorizado. Entradas: `artifact`: Artefacto já filtrado por userId e studyAreaId. Devolve: Documento Markdown pronto para download.
- `renderAiArtifactPrintHtml(markdown)` (exportada; função) - Constrói HTML de impressão a partir do Markdown já minimizado. Entradas: `markdown`: Documento Markdown exportado. Devolve: HTML pronto para o browser imprimir ou guardar como PDF.
- `buildArtifactExportContentDisposition(file)` (exportada; função) - Constrói o header Content-Disposition sem aceitar nomes perigosos. Entradas: `file`: Ficheiro exportado. Devolve: Valor seguro para o header HTTP.
- `toExportableArtifact(artifact)` (top-level; função) - Normaliza um documento Mongoose para o contrato mínimo do exportador. Entradas: `artifact`: Documento persistido. Devolve: Artefacto exportável.
- `isExportableArtifactType(type)` (top-level; função) - Confirma que o tipo pertence ao subconjunto exportável. Entradas: `type`: Tipo persistido no artefacto IA. Devolve: `true` para `SUMMARY` e `QUIZ`.
- `renderSummaryMarkdown(lines, content)` (top-level; função) - Renderiza um resumo sem despejar JSON bruto. Entradas: `lines`: Valor de lines usado pela função para executar render summary markdown com dados explícitos.; `content`: Valor de content usado pela função para executar render summary markdown com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `renderQuizMarkdown(lines, content)` (top-level; função) - Renderiza perguntas de quiz sem exportar respostas corretas por omissão. Entradas: `lines`: Valor de lines usado pela função para executar render quiz markdown com dados explícitos.; `content`: Valor de content usado pela função para executar render quiz markdown com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `renderSourcesMarkdown(lines, sources)` (top-level; função) - Renderiza fontes autorizadas com limite de quantidade e excerto. Entradas: `lines`: Valor de lines usado pela função para executar render sources markdown com dados explícitos.; `sources`: Valor de sources usado pela função para executar render sources markdown com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `normalizeSources(sources)` (top-level; função) - Reduz fontes ao contrato exportável. Entradas: `sources`: Fontes persistidas no artefacto. Devolve: Fontes sem texto privado completo.
- `buildExportBaseFileName(artifact)` (top-level; função) - Cria base de nome de ficheiro previsível. Entradas: `artifact`: Artefacto exportado. Devolve: Nome sem extensão.
- `sanitizeFilePart(value)` (top-level; função) - Remove caracteres problemáticos de uma parte do nome de ficheiro. Entradas: `value`: Texto a normalizar. Devolve: Texto seguro para ficheiro.
- `getString(value)` (top-level; função) - Lê uma string preenchida. Entradas: `value`: Valor desconhecido. Devolve: Texto limpo ou `undefined`.
- `isFilledString(value)` (top-level; função) - Confirma string preenchida para filtros de arrays. Entradas: `value`: Valor desconhecido. Devolve: `true` se for string preenchida.
- `isRecord(value)` (top-level; função) - Confirma objeto JSON simples. Entradas: `value`: Valor desconhecido. Devolve: `true` quando é objeto e não array.
- `cleanMarkdownText(value)` (top-level; função) - Limpa quebras de linha para não deformar o Markdown exportado. Entradas: `value`: Texto original. Devolve: Texto numa linha.
- `clipText(value)` (top-level; função) - Limita excertos para evidence e exportação. Entradas: `value`: Texto original. Devolve: Excerto limitado ou `undefined`.
- `escapeHtml(value)` (top-level; função) - Escapa texto antes de escrever HTML de impressão. Entradas: `value`: Texto Markdown. Devolve: Texto seguro para HTML.

### `real_dev/api/src/modules/ai/context/ai-context-policy.ts`

- `assertAiContextProfile(contextType, profileType)` (exportada; função) - Bloqueia mistura entre contexto de IA e perfil pedagógico. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `contextType`: Valor de contextType usado pela função para executar assert ai context profile com dados explícitos.; `profileType`: Valor de profileType usado pela função para executar assert ai context profile com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/api/src/modules/ai/dto/ai-artifact.dto.ts`

- `toAiArtifactDto(artifact)` (exportada; função) - Converte um artefacto IA no contrato público herdável da MF0. Entradas: `artifact`: Documento Mongoose ou objeto lean. Devolve: Artefacto sem `userId` nem campos internos Mongo.
- `normalizeDocument(value)` (top-level; função) - Usa `toObject` quando existe para lidar com documentos Mongoose. Entradas: `value`: Documento ou objeto já serializado. Devolve: Objeto serializável.

### `real_dev/api/src/modules/ai/dto/quiz-attempt.dto.ts`

- `toQuizAttemptResultDto(attempt)` (exportada; função) - Converte uma tentativa de quiz no contrato público da MF0. Entradas: `attempt`: Documento Mongoose ou objeto lean. Devolve: Tentativa sem `userId` nem campos internos Mongo.
- `normalizeDocument(value)` (top-level; função) - Usa `toObject` quando existe para lidar com documentos Mongoose. Entradas: `value`: Documento ou objeto já serializado. Devolve: Objeto serializável.

### `real_dev/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts`

- `buildAdaptiveExplanationPrompt(input)` (exportada; função) - Constrói o prompt para uma explicação adaptada ao perfil do aluno. Entradas: `input`: Contexto validado pelo backend. Devolve: Prompt com contrato JSON explícito.

### `real_dev/api/src/modules/ai/prompts/study-tools.prompt.ts`

- `buildStudyToolPrompt(input)` (exportada; função) - Constrói o prompt de ferramenta de estudo. Entradas: `input`: Dados pedagógicos, fontes e tipo pedido. Devolve: Prompt final com contrato JSON explícito.

### `real_dev/api/src/modules/ai/prompts/summary.prompt.ts`

- `buildSummaryPrompt(areaName, sources, voiceTone)` (exportada; função) - Constrói o prompt de resumo baseado apenas nas fontes da área. Entradas: `areaName`: Nome da área de estudo.; `sources`: Fontes textuais processáveis.; `voiceTone`: Tom pedagógico opcional configurado na área. Devolve: Prompt final para o provider IA.

### `real_dev/api/src/modules/ai/providers/ai-provider.ts`

- `OpenAiProvider.generateSummary(input)` (pública; método de classe) - Gera resumo em JSON. Entradas: `input`: Prompt final já construído pelo service. Devolve: Resumo parseado.
- `OpenAiProvider.generateStudyTool(input)` (pública; método de classe) - Gera ferramenta de estudo em JSON. Entradas: `input`: Prompt final e tipo pedido. Devolve: JSON parseado com a estrutura solicitada.
- `OpenAiProvider.generateAdaptiveExplanation(input)` (pública; método de classe) - Gera uma explicação adaptada ao perfil de aprendizagem do aluno. Entradas: `input`: Prompt final construído pelo domínio. Devolve: Explicação adaptativa em JSON.
- `OpenAiProvider.generateRoomAnswer(input)` (pública; método de classe) - Gera uma resposta IA para sala de estudo. Entradas: `input`: Prompt com fontes partilhadas autorizadas. Devolve: Resposta e IDs de partilhas usadas.
- `OpenAiProvider.generateClassAnswer(input)` (pública; método de classe) - Gera uma resposta IA limitada ao contexto de disciplina/turma. Entradas: `input`: Prompt com materiais oficiais autorizados. Devolve: Resposta e IDs de materiais oficiais usados.
- `OpenAiProvider.generateProjectPlan(input)` (pública; método de classe) - Gera plano gradual de projecto. Entradas: `input`: Prompt com enunciado oficial e objectivo do aluno. Devolve: Plano validável pelo domínio.
- `OpenAiProvider.generatePrivateAreaAnswer(input)` (pública; método de classe) - Gera resposta para IA privada de área de estudo. Entradas: `input`: Prompt com fontes privadas autorizadas. Devolve: Resposta e IDs dos materiais usados.
- `OpenAiProvider.createJsonResponse(prompt, options)` (privada; método de classe) - Chama a Responses API e valida que a resposta é JSON. Entradas: `prompt`: Prompt final.; `options`: Opções técnicas resolvidas por política administrativa. Devolve: JSON parseado no tipo pedido pelo chamador.
- `OpenAiProvider.createResponse(client, model, prompt)` (privada; método de classe) - Executa o pedido ao provider e mapeia timeouts para erro público. Entradas: `client`: Cliente OpenAI configurado.; `model`: Modelo configurado por ambiente.; `prompt`: Prompt final. Devolve: Resposta da Responses API.
- `OpenAiProvider.getTimeoutMs(overrideMs)` (privada; método de classe) - Obtém o timeout configurado para a chamada IA. Entradas: `overrideMs`: Timeout definido por política administrativa. Devolve: Timeout em milissegundos.
- `OpenAiProvider.isTimeoutError(error)` (privada; método de classe) - Deteta timeouts vindos do SDK/fetch sem depender de uma classe específica. Entradas: `error`: Erro desconhecido lançado pelo provider. Devolve: Verdadeiro quando representa timeout/cancelamento.
- `E2eFakeAiProvider.generateSummary(input)` (pública; método de classe) - Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `E2eFakeAiProvider.generateStudyTool(input)` (pública; método de classe) - Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `E2eFakeAiProvider.generateAdaptiveExplanation(input)` (pública; método de classe) - Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `E2eFakeAiProvider.generateRoomAnswer(input)` (pública; método de classe) - Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `E2eFakeAiProvider.generateClassAnswer(input)` (pública; método de classe) - Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `E2eFakeAiProvider.generateProjectPlan()` (pública; método de classe) - Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar. Entradas: sem entradas explícitas. Devolve: Resposta validada, limitada às fontes e pronta para persistência ou apresentação.
- `E2eFakeAiProvider.generatePrivateAreaAnswer(input)` (pública; método de classe) - Gera conteúdo de artefactos de IA através do provider configurado e valida o resultado antes de o aceitar. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `E2eFakeAiProvider.extractFirstId(prompt, pattern)` (privada; método de classe) - Executa a operação extract first id no domínio de artefactos de IA com contrato explícito. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `prompt`: Valor de prompt usado pela função para executar extract first id com dados explícitos.; `pattern`: Valor de pattern usado pela função para executar extract first id com dados explícitos. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `E2eFakeAiProvider.extractSourceMaterialIds(prompt)` (privada; método de classe) - Extrai fontes privadas dos prompts atuais e mantém compatibilidade com prompts antigos de smoke. Entradas: `prompt`: Texto final enviado ao provider fake. Devolve: Identificadores de materiais citáveis pelo artefacto E2E.
- `E2eFakeAiProvider.extractIds(prompt, pattern)` (privada; método de classe) - Executa a operação extract ids no domínio de artefactos de IA com contrato explícito. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `prompt`: Valor de prompt usado pela função para executar extract ids com dados explícitos.; `pattern`: Valor de pattern usado pela função para executar extract ids com dados explícitos. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `createAiProvider()` (exportada; função) - Escolhe o provider IA adequado ao ambiente atual. Entradas: sem entradas explícitas. Devolve: Provider real por defeito ou provider fake quando o smoke E2E o pede.

### `real_dev/api/src/modules/ai/quiz-generation-jobs.service.ts`

- `QuizGenerationJobsService.createQuizJob(userId, studyAreaId, input)` (pública; método de classe) - Cria um job QUEUED e inicia a geração real do quiz em background. Entradas: `userId`: Utilizador autenticado vindo da sessão.; `studyAreaId`: Área privada onde o quiz será criado.; `input`: Pedido validado pelo DTO. Devolve: Job inicial consultável pela UI.
- `QuizGenerationJobsService.findQuizJob(userId, studyAreaId, jobId)` (pública; método de classe) - Consulta um job que pertence ao aluno autenticado e à área indicada. Entradas: `userId`: Utilizador autenticado vindo da sessão.; `studyAreaId`: Área privada do aluno.; `jobId`: Job a consultar. Devolve: Estado público do job.
- `QuizGenerationJobsService.processQuizJob(userId, studyAreaId, jobId, input)` (privada; método de classe) - Gera o quiz usando o service canónico de ferramentas de estudo. Entradas: `userId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `studyAreaId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `jobId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `QuizGenerationJobsService.parseObjectId(value)` (privada; método de classe) - Valida ObjectId antes de construir queries MongoDB. Entradas: `value`: Valor recebido por rota ou sessão. Devolve: ObjectId seguro para query.
- `QuizGenerationJobsService.toView(job)` (privada; método de classe) - Converte o documento interno para contrato público de polling. Entradas: `job`: Documento persistido do job. Devolve: Vista sem dados privados nem conteúdo do quiz.
- `QuizGenerationJobsService.toPublicErrorMessage(error)` (privada; método de classe) - Garante que erros internos do provider não expõem prompts ou respostas privadas. Entradas: `error`: Erro recebido da geração. Devolve: Mensagem pública segura.
- `QuizGenerationJobsService.notFound()` (privada; método de classe) - Cria erro uniforme para jobs inexistentes ou fora do ownership do aluno. Entradas: sem entradas explícitas. Devolve: Nunca retorna; lança exceção.

### `real_dev/api/src/modules/ai/schemas/learning-profile.schema.ts`

- `LearningProfile.validator(values)` (pública; função em propriedade) - Executa validator para ai, mantendo o contrato de dados explícito para validação e documentação. Entradas: `values`: Valor de values usado pela função para executar validator com dados explícitos. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/api/src/modules/ai/study-tools.controller.ts`

- `StudyToolsController.list(request, id, type)` (pública; método de classe) - Lista ferramentas já geradas para a área. Entradas: `request`: Pedido autenticado.; `id`: Identificador da área.; `type`: Tipo opcional para filtrar. Devolve: Artefactos IA da área.
- `StudyToolsController.generate(request, id, body)` (pública; método de classe) - Gera uma explicação, flashcards ou quiz. Entradas: `request`: Pedido autenticado.; `id`: Identificador da área.; `body`: Pedido de geração. Devolve: Artefacto criado.
- `StudyToolsController.createQuizJob(request, id, body)` (pública; método de classe) - Inicia geração de quiz em background para uma área privada do aluno. Entradas: `request`: Pedido autenticado.; `id`: Área privada do aluno.; `body`: Pedido opcional com tópico. Devolve: Job inicial em estado QUEUED.
- `StudyToolsController.getQuizJob(request, id, jobId)` (pública; método de classe) - Consulta o estado de um job de quiz da área privada. Entradas: `request`: Pedido autenticado.; `id`: Área privada do aluno.; `jobId`: Job a consultar. Devolve: Estado público do job.
- `StudyToolsController.exportArtifact(request, id, artifactId, format, response)` (pública; método de classe) - Exporta resumo ou quiz autorizado em Markdown ou HTML de impressão. Entradas: `request`: Pedido autenticado.; `id`: Área privada do aluno.; `artifactId`: Artefacto IA a exportar.; `format`: Formato pedido pela query.; `response`: Resposta HTTP usada para headers de ficheiro. Devolve: Corpo textual do ficheiro.
- `StudyToolsController.submitQuizAttempt(request, id, artifactId, body)` (pública; método de classe) - Regista uma tentativa mínima de quiz para handoff MF1. Entradas: `request`: Pedido autenticado.; `id`: Identificador da área.; `artifactId`: Identificador do artefacto `QUIZ`.; `body`: Respostas escolhidas pelo aluno. Devolve: Resultado calculado da tentativa.

### `real_dev/api/src/modules/ai/study-tools.service.ts`

- `StudyToolsService.listTools(userId, studyAreaId, type)` (pública; método de classe) - Lista ferramentas de estudo já geradas. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área.; `type`: Tipo opcional para filtrar. Devolve: Artefactos IA da área.
- `StudyToolsService.generateStudyTool(userId, studyAreaId, input)` (pública; método de classe) - Gera uma ferramenta de estudo baseada nas fontes da área. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área.; `input`: Pedido de ferramenta. Devolve: Artefacto criado.
- `StudyToolsService.assertQuizGenerationReady(userId, studyAreaId)` (pública; método de classe) - Confirma que a área privada tem condições mínimas para iniciar um job de quiz. Entradas: `userId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `studyAreaId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `StudyToolsService.submitQuizAttempt(userId, studyAreaId, artifactId, input)` (pública; método de classe) - Regista respostas do aluno num quiz gerado pela IA. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área.; `artifactId`: Identificador do artefacto `QUIZ`.; `input`: Respostas escolhidas pelo aluno. Devolve: Resultado público da tentativa.
- `StudyToolsService.getProcessableSources(userId, studyAreaId)` (privada; método de classe) - Obtém fontes textuais prontas. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área. Devolve: Fontes no contrato do provider.
- `StudyToolsService.validateOptionalStudyToolType(type)` (privada; método de classe) - Valida o tipo canónico de ferramenta de estudo. Entradas: `type`: Tipo recebido por body ou query. Devolve: Tipo validado ou `undefined` quando não há filtro.
- `StudyToolsService.validateRequiredStudyToolType(type)` (privada; método de classe) - Valida o tipo obrigatório recebido na geração de ferramenta. Entradas: `type`: Tipo recebido no body. Devolve: Tipo canónico validado.
- `StudyToolsService.invalidStudyToolType()` (privada; método de classe) - Cria o erro público para tipo de ferramenta inválido. Entradas: sem entradas explícitas. Devolve: Nunca retorna; lança exceção.
- `StudyToolsService.getQuizQuestions(content)` (privada; método de classe) - Lê perguntas persistidas no artefacto de quiz. Entradas: `content`: Conteúdo JSON do artefacto. Devolve: Perguntas do quiz.
- `StudyToolsService.validateQuizAttemptAnswers(answers, expectedLength)` (privada; método de classe) - Valida respostas recebidas para a tentativa. Entradas: `answers`: Respostas escolhidas pelo aluno.; `expectedLength`: Número de perguntas do quiz. Devolve: Nada quando o payload é válido.
- `StudyToolsService.buildQuizAttemptResults(answers, questions)` (privada; método de classe) - Calcula o resultado por pergunta. Entradas: `answers`: Respostas escolhidas pelo aluno.; `questions`: Perguntas persistidas no artefacto. Devolve: Resultados individuais.
- `StudyToolsService.artifactNotFound()` (privada; método de classe) - Cria erro de artefacto inexistente ou inacessível. Entradas: sem entradas explícitas. Devolve: Exceção pública.

### `real_dev/api/src/modules/ai/summaries.controller.ts`

- `SummariesController.generate(request, id)` (pública; método de classe) - Gera um resumo baseado nas fontes prontas da área. Entradas: `request`: Pedido autenticado.; `id`: Identificador da área. Devolve: Artefacto de resumo criado.
- `SummariesController.list(request, id)` (pública; método de classe) - Lista os resumos já gerados para a área autenticada. Entradas: `request`: Pedido autenticado.; `id`: Identificador da área. Devolve: Artefactos `SUMMARY` da área.

### `real_dev/api/src/modules/ai/summaries.service.ts`

- `SummariesService.generateSummary(userId, studyAreaId)` (pública; método de classe) - Gera um resumo factual de uma área. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área. Devolve: Artefacto persistido com conteúdo e fontes.
- `SummariesService.getProcessableSources(userId, studyAreaId)` (privada; método de classe) - Obtém fontes prontas para IA. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área. Devolve: Fontes textuais processáveis.
- `SummariesService.listSummaries(userId, studyAreaId)` (pública; método de classe) - Lista resumos persistidos da área do aluno autenticado. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área. Devolve: Artefactos públicos de resumo.

### `real_dev/api/src/modules/ai/utils/with-ai-response-budget.ts`

- `resolveAiBudgetMs(policyTimeoutMs, rnBudgetMs)` (exportada; função) - Escolhe o budget efetivo para uma chamada IA. Entradas: `policyTimeoutMs`: Timeout configurado em política administrativa.; `rnBudgetMs`: Limite máximo definido pelo RNF09. Devolve: Menor timeout positivo entre política e RNF09.
- `withAiResponseBudget(operation, budgetMs)` (exportada; função) - Executa uma chamada IA dentro do budget público do StudyFlow. Entradas: `operation`: Promessa devolvida pelo provider depois das validações de domínio.; `budgetMs`: Tempo máximo de espera em milissegundos. Devolve: Resultado da operação quando termina dentro do limite.

### `real_dev/api/src/modules/ai/validators/ai-artifact.validator.ts`

- `validateSummaryArtifact(content, allowedSourceIds)` (exportada; função) - Valida um resumo devolvido pelo provider antes de o persistir. Entradas: `content`: Conteúdo JSON devolvido pela IA.; `allowedSourceIds`: Materiais processáveis usados no prompt. Devolve: Nada quando o resumo cumpre o contrato.
- `validateStudyToolArtifact(type, content, allowedSourceIds)` (exportada; função) - Valida ferramentas de estudo devolvidas pela IA. Entradas: `type`: Tipo pedido pelo aluno.; `content`: Conteúdo JSON devolvido pela IA.; `allowedSourceIds`: Materiais processáveis usados no prompt. Devolve: Nada quando a ferramenta cumpre o contrato.
- `validateExplanation(content, allowedSourceIds)` (top-level; função) - Valida uma explicação estruturada por secções. Entradas: `content`: Conteúdo JSON devolvido pela IA.; `allowedSourceIds`: Materiais processáveis usados no prompt. Devolve: Nada quando o contrato é válido.
- `validateFlashcards(content, allowedSourceIds)` (top-level; função) - Valida flashcards gerados pela IA. Entradas: `content`: Conteúdo JSON devolvido pela IA.; `allowedSourceIds`: Materiais processáveis usados no prompt. Devolve: Nada quando o contrato é válido.
- `requireRecord(value, code)` (top-level; função) - Garante que o valor é um objeto JSON. Entradas: `value`: Valor a validar.; `code`: Código de erro técnico. Devolve: Registo JSON.
- `requireNonEmptyString(value, code)` (top-level; função) - Garante que um campo textual vem preenchido. Entradas: `value`: Valor a validar.; `code`: Código de erro técnico. Devolve: Nada quando o valor é válido.
- `requireNonEmptyStringArray(value, code)` (top-level; função) - Garante que um array contém apenas strings preenchidas. Entradas: `value`: Valor a validar.; `code`: Código de erro técnico. Devolve: Nada quando o array é válido.
- `requireValidSourceIds(value, allowedSourceIds, missingCode, unknownCode)` (top-level; função) - Valida que as fontes existem e pertencem ao conjunto usado no prompt. Entradas: `value`: Lista de identificadores devolvida pela IA.; `allowedSourceIds`: Identificadores permitidos.; `missingCode`: Código para fonte em falta.; `unknownCode`: Código para fonte desconhecida. Devolve: Nada quando as fontes são válidas.
- `rejectInvalidArtifact(code)` (top-level; função) - Lança erro padronizado para outputs IA inválidos. Entradas: `code`: Código técnico do contrato quebrado. Devolve: Nunca retorna; lança exceção.

### `real_dev/api/src/modules/ai/validators/quiz.validator.ts`

- `validateQuizArtifact(content, allowedSourceIds)` (exportada; função) - Valida a estrutura de quiz devolvida pela IA. Entradas: `content`: Valor de content usado pela função para executar validate quiz artifact com dados explícitos.; `allowedSourceIds`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `rejectInvalidQuiz(code)` (top-level; função) - Lança erro padronizado para quizzes inválidos. Entradas: `code`: Código técnico do contrato quebrado. Devolve: Nunca retorna; lança exceção.

### `real_dev/api/src/modules/audit-log/audit-log.controller.ts`

- `AuditLogController.list(request, query)` (pública; método de classe) - Obtém o pedido HTTP de auditoria administrativa e delega no service a aplicação das regras de autenticação, validação e domínio. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `query`: Valor de query usado pela função para executar list com dados explícitos. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.

### `real_dev/api/src/modules/audit-log/audit-log.service.ts`

- `AuditLogService.record(input)` (pública; método de classe) - Regista um evento com metadata redigida. Entradas: `input`: Evento a persistir. Devolve: Evento público persistido.
- `AuditLogService.list(actor, query)` (pública; método de classe) - Lista eventos apenas para administradores. Entradas: `actor`: Utilizador autenticado.; `query`: Filtros opcionais. Devolve: Eventos recentes.
- `AuditLogService.redactMetadata(metadata)` (pública; método de classe) - Remove chaves sensíveis sem destruir contexto técnico útil. Entradas: `metadata`: Metadata candidata. Devolve: Metadata segura para persistência.
- `AuditLogService.assertAdmin(actor)` (privada; método de classe) - Valida a regra de auditoria administrativa e lança uma exceção explícita quando o utilizador ou recurso não cumpre o contrato. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AuditLogService.toView(event)` (privada; método de classe) - Transforma o documento interno de auditoria administrativa num contrato público, removendo detalhes de persistência antes de responder à UI. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/auth/auth.controller.ts`

- `AuthController.register(body)` (pública; método de classe) - Cria uma conta local de aluno. Entradas: `body`: Dados do formulário de registo. Devolve: Utilizador público recém-criado.
- `AuthController.login(request, body, response)` (pública; método de classe) - Valida credenciais e define o cookie HttpOnly. Entradas: `request`: Pedido Express usado para obter o IP.; `body`: Credenciais locais.; `response`: Resposta Express usada para configurar o cookie. Devolve: Utilizador público autenticado.
- `AuthController.me(request)` (pública; método de classe) - Devolve a sessão atual já validada pelo guard. Entradas: `request`: Pedido autenticado. Devolve: Utilizador da sessão.
- `AuthController.logout(request, response)` (pública; método de classe) - Invalida a sessão atual e limpa o cookie no browser. Entradas: `request`: Pedido que pode conter o cookie de sessão.; `response`: Resposta Express usada para limpar o cookie. Devolve: Estado simples de sucesso.
- `AuthController.setSessionCookie(response, sessionId)` (privada; método de classe) - Aplica o cookie de sessão com flags seguras. Entradas: `response`: Resposta Express.; `sessionId`: Identificador opaco da sessão. Devolve: Nada; apenas modifica os headers da resposta.
- `AuthController.getClientIp(request)` (privada; método de classe) - Resolve o IP usado no rate limit sem confiar em dados vindos do body. Entradas: `request`: Pedido Express. Devolve: IP observado ou marcador estável quando indisponível.

### `real_dev/api/src/modules/auth/auth.module.ts`

- `AuthModule.useFactory()` (pública; função em propriedade) - Cria o store usado pelas sessões. Entradas: sem entradas explícitas. Devolve: Instância `ioredis` ou store volátil exclusivo dos E2E.

### `real_dev/api/src/modules/auth/auth.service.ts`

- `AuthService.registerStudent(input)` (pública; método de classe) - Regista um aluno com email/password. Entradas: `input`: DTO de registo vindo do controller. Devolve: Utilizador público sem `passwordHash`.
- `AuthService.validateLogin(input)` (pública; método de classe) - Valida credenciais locais para login. Entradas: `input`: DTO de login com email e password. Devolve: Utilizador público autenticado.
- `AuthService.normalizeAndValidateEmail(email)` (privada; método de classe) - Normaliza e valida o email. Entradas: `email`: Valor recebido do frontend. Devolve: Email em minúsculas e sem espaços laterais.
- `AuthService.validatePasswordPair(password, confirmPassword)` (privada; método de classe) - Valida força mínima e confirmação da password. Entradas: `password`: Password principal recebida do aluno.; `confirmPassword`: Confirmação enviada pelo formulário. Devolve: Nada quando a password é aceite.
- `AuthService.invalidCredentials()` (privada; método de classe) - Cria um erro de credenciais inválidas sem revelar qual campo falhou. Entradas: sem entradas explícitas. Devolve: Exceção pronta a lançar.
- `AuthService.emailAlreadyRegistered()` (privada; método de classe) - Cria o erro público para email duplicado. Entradas: sem entradas explícitas. Devolve: Exceção `ConflictException`.

### `real_dev/api/src/modules/auth/login-attempts.service.ts`

- `LoginAttemptsService.assertCanAttempt(email, ip)` (pública; método de classe) - Bloqueia novas tentativas quando email ou IP excederam o limite MF0. Entradas: `email`: Email recebido no login.; `ip`: Endereço IP observado pelo servidor. Devolve: Promise resolvida quando a tentativa pode continuar.
- `LoginAttemptsService.recordFailedLogin(email, ip)` (pública; método de classe) - Regista uma tentativa falhada por email e por IP. Entradas: `email`: Email recebido no login.; `ip`: Endereço IP observado pelo servidor. Devolve: Promise resolvida depois de atualizar os contadores.
- `LoginAttemptsService.clearEmailFailures(email)` (pública; método de classe) - Limpa falhas associadas ao email depois de autenticação bem-sucedida. Entradas: `email`: Email autenticado. Devolve: Promise resolvida depois de remover o contador do email.
- `LoginAttemptsService.getCount(key)` (privada; método de classe) - Obtém o contador atual para uma chave. Entradas: `key`: Chave Redis interna. Devolve: Número de falhas registadas.
- `LoginAttemptsService.incrementWithTtl(key)` (privada; método de classe) - Incrementa um contador e aplica TTL quando a chave é criada. Entradas: `key`: Chave Redis interna. Devolve: Promise resolvida depois de atualizar a chave.
- `LoginAttemptsService.emailKey(email)` (privada; método de classe) - Cria chave Redis sem guardar o email em claro. Entradas: `email`: Email recebido no login. Devolve: Chave namespaced e anonimizada.
- `LoginAttemptsService.ipKey(ip)` (privada; método de classe) - Cria chave Redis sem guardar o IP em claro. Entradas: `ip`: Endereço IP recebido. Devolve: Chave namespaced e anonimizada.
- `LoginAttemptsService.hash(value)` (privada; método de classe) - Hash determinístico usado apenas para chaves técnicas de rate limit. Entradas: `value`: Valor sensível a anonimizar. Devolve: SHA-256 hexadecimal.

### `real_dev/api/src/modules/auth/password-hashing.service.ts`

- `PasswordHashingService.hash(password)` (pública; método de classe) - Gera um hash bcrypt para uma password recebida pelo backend. Entradas: `password`: Password em texto claro recebida apenas durante o pedido. Devolve: Hash seguro para guardar no campo `passwordHash`.
- `PasswordHashingService.compare(password, passwordHash)` (pública; método de classe) - Compara uma password de login com o hash guardado. Entradas: `password`: Password recebida no login.; `passwordHash`: Hash persistido no utilizador. Devolve: `true` quando a password corresponde ao hash.

### `real_dev/api/src/modules/auth/session-cookie.options.ts`

- `sessionCookieOptions()` (exportada; função) - Devolve as opções usadas para criar o cookie de sessão. Entradas: sem entradas explícitas. Devolve: Opções Express com flags alinhadas com RNF16.
- `clearSessionCookieOptions()` (exportada; função) - Devolve as opções usadas para limpar o cookie de sessão. Entradas: sem entradas explícitas. Devolve: Opções sem `maxAge`, mantendo nome/path/flags compatíveis.

### `real_dev/api/src/modules/auth/session-store.ts`

- `createInMemorySessionStore()` (exportada; função) - Cria um store de sessão volátil para testes E2E autocontidos. Este store implementa apenas os comandos Redis usados por autenticação e rate limiting. Não deve ser usado em produção porque perde estado ao reiniciar. Este fluxo trata sessão, expiração ou proteção de acesso de fo... Entradas: sem entradas explícitas. Devolve: Resultado da operação no formato esperado pelo chamador.
- `createInMemorySessionStore.deleteIfExpired(key)` (interna; função) - Remove autenticação apenas depois das validações de acesso aplicáveis. Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido. Entradas: `key`: Valor de key usado pela função para executar delete if expired com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `get(key)` (pública; método de objeto) - Carrega autenticação no formato necessário ao próximo passo do fluxo. Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido. Entradas: `key`: Valor de key usado pela função para executar get com dados explícitos. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `set(key, value, mode, seconds)` (pública; método de objeto) - Executa a operação set no domínio de autenticação com contrato explícito. Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido. Entradas: `key`: Valor de key usado pela função para executar set com dados explícitos.; `value`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.; `mode`: Valor de mode usado pela função para executar set com dados explícitos.; `seconds`: Valor temporal que controla expiração, retenção ou referência da operação. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `del(key)` (pública; método de objeto) - Executa a operação del no domínio de autenticação com contrato explícito. Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido. Entradas: `key`: Valor de key usado pela função para executar del com dados explícitos. Devolve: Número calculado para o chamador usar em contadores, limites ou ordenação.
- `incr(key)` (pública; método de objeto) - Executa a operação incr no domínio de autenticação com contrato explícito. Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido. Entradas: `key`: Valor de key usado pela função para executar incr com dados explícitos. Devolve: Número calculado para o chamador usar em contadores, limites ou ordenação.
- `expire(key, seconds)` (pública; método de objeto) - Executa a operação expire no domínio de autenticação com contrato explícito. Este fluxo trata sessão, expiração ou proteção de acesso de forma explícita para evitar contexto autenticado inválido. Entradas: `key`: Valor de key usado pela função para executar expire com dados explícitos.; `seconds`: Valor temporal que controla expiração, retenção ou referência da operação. Devolve: Número calculado para o chamador usar em contadores, limites ou ordenação.

### `real_dev/api/src/modules/auth/session.service.ts`

- `SessionService.createSession(user)` (pública; método de classe) - Cria uma nova sessão para o utilizador autenticado. Entradas: `user`: Utilizador público validado no login. Devolve: Identificador opaco a gravar no cookie HttpOnly.
- `SessionService.requireSession(sessionId)` (pública; método de classe) - Obtém uma sessão ativa ou falha com erro genérico. Entradas: `sessionId`: Identificador recebido do cookie. Devolve: Utilizador autenticado guardado em Redis.
- `SessionService.destroySession(sessionId)` (pública; método de classe) - Invalida uma sessão existente. Entradas: `sessionId`: Identificador recebido do cookie. Devolve: Promise resolvida depois de remover a chave de Redis.
- `SessionService.key(sessionId)` (privada; método de classe) - Constrói a chave Redis usada para uma sessão. Entradas: `sessionId`: Identificador opaco. Devolve: Chave namespaced para evitar colisões.

### `real_dev/api/src/modules/class-ai/class-ai.controller.ts`

- `ClassAiController.ask(request, subjectId, body)` (pública; método de classe) - Orquestra uma pergunta de IA em IA da disciplina, limitando contexto e validando a resposta antes de a devolver. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Resposta validada, limitada às fontes e pronta para persistência ou apresentação.

### `real_dev/api/src/modules/class-ai/class-ai.service.ts`

- `ClassAiService.askClassAi(actor, subjectId, input)` (pública; método de classe) - Orquestra uma pergunta de IA em IA da disciplina, limitando contexto e validando a resposta antes de a devolver. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `subjectId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Resultado da operação no formato esperado pelo chamador.
- `ClassAiService.estimateUsageUnits(prompt)` (privada; método de classe) - Executa estimate usage units no domínio de IA de turma, aplicando validações, autorização e persistência de forma coesa. Entradas: `prompt`: Valor de prompt usado pela função para executar estimate usage units com dados explícitos. Devolve: Número calculado para o chamador usar em contadores, limites ou ordenação.
- `ClassAiService.validateResult(result, materials)` (privada; método de classe) - Confirma que os dados de IA da disciplina cumprem o contrato antes de serem persistidos ou apresentados. Entradas: `result`: Resultado devolvido por uma operação externa antes da validação final.; `materials`: Valor de materials usado pela função para executar validate result com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/api/src/modules/class-ai/prompts/class-ai.prompt.ts`

- `buildClassAiPrompt(input)` (exportada; função) - Constrói prompt da IA limitada a materiais oficiais processados. Entradas: `input`: Contexto autorizado. Devolve: Prompt com contrato JSON.

### `real_dev/api/src/modules/class-posts/class-posts.controller.ts`

- `ClassPostsController.create(request, classId, body)` (pública; método de classe) - Recebe o pedido de criação de publicações da turma e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de publicações da turma criado no formato público esperado pela UI ou pelo teste.
- `ClassPostsController.listTeacher(request, classId)` (pública; método de classe) - Recebe o pedido de listagem de publicações da turma e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de publicações da turma visível para o contexto autorizado.
- `ClassPostsController.listStudent(request, classId)` (pública; método de classe) - Recebe o pedido de listagem de publicações da turma e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de publicações da turma visível para o contexto autorizado.

### `real_dev/api/src/modules/class-posts/class-posts.service.ts`

- `ClassPostsService.createPost(actor, classId, input)` (pública; método de classe) - Cria publicações da turma depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `classId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `ClassPostsService.listTeacherPosts(actor, classId)` (pública; método de classe) - Lista publicações da turma já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de publicações da turma visível para o contexto autorizado.
- `ClassPostsService.listStudentPosts(actor, classId)` (pública; método de classe) - Lista publicações da turma já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de publicações da turma visível para o contexto autorizado.
- `ClassPostsService.countByClassId(classId)` (pública; método de classe) - Conta publicações de uma turma já validada. Entradas: `classId`: Identificador da turma. Devolve: Número de publicações.
- `ClassPostsService.listByClass(classId)` (privada; método de classe) - Lista publicações da turma já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de publicações da turma visível para o contexto autorizado.
- `ClassPostsService.assertTeacher(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `ClassPostsService.assertStudent(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `ClassPostsService.toPostView(post)` (privada; método de classe) - Mapeia o documento interno de publicações da turma para uma forma pública estável e simples de consumir. Entradas: `post`: Valor de post usado pela função para executar to post view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/class-progress/class-progress.controller.ts`

- `ClassProgressController.get(request, classId)` (pública; método de classe) - Carrega progresso da turma no formato necessário ao próximo passo do fluxo. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Entidade de progresso da turma já filtrada pelo contexto recebido.
- `ClassProgressController.createNote(request, classId, input)` (pública; método de classe) - Recebe o pedido de criação de progresso da turma e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `classId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/api/src/modules/class-progress/class-progress.service.ts`

- `ClassProgressService.getClassProgress(actor, classId)` (pública; método de classe) - Carrega progresso da turma no formato necessário ao próximo passo do fluxo. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Entidade de progresso da turma já filtrada pelo contexto recebido.
- `ClassProgressService.createNote(actor, classId, input)` (pública; método de classe) - Cria progresso da turma depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `classId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `ClassProgressService.toNoteView(note)` (privada; método de classe) - Mapeia o documento interno de progresso da turma para uma forma pública estável e simples de consumir. Entradas: `note`: Valor de note usado pela função para executar to note view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/class-projects/class-projects.controller.ts`

- `ClassProjectsController.create(request, classId, body)` (pública; método de classe) - Recebe o pedido de criação de projetos da turma e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de projetos da turma criado no formato público esperado pela UI ou pelo teste.
- `ClassProjectsController.listTeacher(request, classId)` (pública; método de classe) - Recebe o pedido de listagem de projetos da turma e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de projetos da turma visível para o contexto autorizado.
- `ClassProjectsController.listStudent(request, classId)` (pública; método de classe) - Recebe o pedido de listagem de projetos da turma e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de projetos da turma visível para o contexto autorizado.

### `real_dev/api/src/modules/class-projects/class-projects.service.ts`

- `ClassProjectsService.create(actor, classId, input)` (pública; método de classe) - Cria projetos da turma depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `classId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `ClassProjectsService.listForTeacher(actor, classId)` (pública; método de classe) - Lista projetos da turma já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de projetos da turma visível para o contexto autorizado.
- `ClassProjectsService.listPublishedForStudent(actor, classId)` (pública; método de classe) - Lista projetos da turma já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de projetos da turma visível para o contexto autorizado.
- `ClassProjectsService.findPublishedForStudent(studentId, projectId)` (pública; método de classe) - Procura projetos da turma com filtros de ownership, membership ou estado para evitar leituras indevidas. Entradas: `studentId`: Identificador de student que delimita ownership, membership ou relação de domínio.; `projectId`: Identificador de project que delimita ownership, membership ou relação de domínio. Devolve: Entidade de projetos da turma já filtrada pelo contexto recebido.
- `ClassProjectsService.assertTeacher(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `ClassProjectsService.assertStudent(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `ClassProjectsService.notFound()` (privada; método de classe) - Constrói uma exceção de projetos da turma com código previsível para API, UI e testes. Entradas: sem entradas explícitas. Devolve: Exceção padronizada com código estável para controllers e testes.
- `ClassProjectsService.toView(project)` (privada; método de classe) - Mapeia o documento interno de projetos da turma para uma forma pública estável e simples de consumir. Entradas: `project`: Valor de project usado pela função para executar to view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/classes/classes.controller.ts`

- `ClassesController.create(request, body)` (pública; método de classe) - Recebe o pedido de criação de turmas e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de turmas criado no formato público esperado pela UI ou pelo teste.
- `ClassesController.listTeacher(request)` (pública; método de classe) - Recebe o pedido de listagem de turmas e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão. Devolve: Coleção de turmas visível para o contexto autorizado.
- `ClassesController.addStudent(request, classId, body)` (pública; método de classe) - Executa a operação add student no domínio de turmas com contrato explícito. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `classId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.
- `ClassesController.removeStudent(request, classId, studentId)` (pública; método de classe) - Remove a associação entre aluno e turma sem apagar a conta do aluno. Entradas: `request`: Pedido autenticado recebido pelo controller.; `classId`: Turma onde a associação existe.; `studentId`: Aluno a remover da turma. Devolve: Turma atualizada depois da remoção.
- `ClassesController.listStudent(request)` (pública; método de classe) - Recebe o pedido de listagem de turmas e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão. Devolve: Coleção de turmas visível para o contexto autorizado.

### `real_dev/api/src/modules/classes/classes.service.ts`

- `ClassesService.createClass(actor, input)` (pública; método de classe) - Cria turmas depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `ClassesService.listTeacherClasses(actor)` (pública; método de classe) - Lista turmas já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership. Devolve: Coleção de turmas visível para o contexto autorizado.
- `ClassesService.addStudent(actor, classId, input)` (pública; método de classe) - Executa a operação add student no domínio de turmas com contrato explícito. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `classId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `ClassesService.removeStudent(actor, classId, studentId)` (pública; método de classe) - Remove a inscrição de um aluno numa turma depois de validar professor dono, turma e aluno. Entradas: `actor`: Utilizador autenticado usado para validar permissões e ownership.; `classId`: Turma alvo.; `studentId`: Aluno a desassociar. Devolve: Turma pública atualizada.
- `ClassesService.listStudentClasses(actor)` (pública; método de classe) - Lista turmas já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership. Devolve: Coleção de turmas visível para o contexto autorizado.
- `ClassesService.findOwnedClass(teacherId, classId)` (pública; método de classe) - Obtém turma pertencente ao professor. Entradas: `teacherId`: Professor autenticado.; `classId`: Turma a validar. Devolve: Turma pública.
- `ClassesService.ensureStudentEnrollment(studentId, classId)` (pública; método de classe) - Confirma inscrição do aluno numa turma. Entradas: `studentId`: Aluno autenticado.; `classId`: Turma a validar. Devolve: Turma pública.
- `ClassesService.assertTeacher(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `ClassesService.assertStudent(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `ClassesService.classNotFound()` (privada; método de classe) - Executa a operação turma not found no domínio de turmas com contrato explícito. Entradas: sem entradas explícitas. Devolve: Exceção estruturada pronta a ser lançada pelo service ou controller.
- `ClassesService.duplicatedCode()` (privada; método de classe) - Constrói uma exceção de turmas com código previsível para API, UI e testes. Entradas: sem entradas explícitas. Devolve: Exceção padronizada com código estável para controllers e testes.
- `ClassesService.toClassView(schoolClass)` (privada; método de classe) - Mapeia o documento interno de turmas para uma forma pública estável e simples de consumir. Entradas: `schoolClass`: Valor de schoolClass usado pela função para executar to class view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/context-notifications/context-notifications.controller.ts`

- `ContextNotificationsController.create(request, body)` (pública; método de classe) - Cria o pedido HTTP de notificações contextuais e delega no service a aplicação das regras de autenticação, validação e domínio. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.
- `ContextNotificationsController.list(request)` (pública; método de classe) - Obtém o pedido HTTP de notificações contextuais e delega no service a aplicação das regras de autenticação, validação e domínio. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.

### `real_dev/api/src/modules/context-notifications/context-notifications.service.ts`

- `ContextNotificationsService.create(actor, input)` (pública; método de classe) - Cria uma notificação e calcula destinatários no backend. Entradas: `actor`: Utilizador autenticado.; `input`: Dados da notificação. Devolve: Notificação persistida.
- `ContextNotificationsService.createForRecipients(actor, input, recipientIds)` (pública; método de classe) - Cria uma notificação para destinatários já filtrados por um fluxo backend. Entradas: `actor`: Utilizador autenticado.; `input`: Dados da notificação.; `recipientIds`: Destinatários calculados por outro service, nunca vindos do cliente HTTP. Devolve: Notificação persistida.
- `ContextNotificationsService.createForResolvedRecipients(actor, input, recipientIds)` (privada; método de classe) - Cria create for resolved recipients no domínio de notificações contextuais, aplicando validações, autorização e persistência de forma coesa. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.; `recipientIds`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Resultado da operação no formato esperado pelo chamador.
- `ContextNotificationsService.list(actor)` (pública; método de classe) - Lista notificações visíveis ao utilizador autenticado. Entradas: `actor`: Utilizador autenticado. Devolve: Notificações recebidas ou criadas.
- `ContextNotificationsService.resolveRecipients(actor, input)` (privada; método de classe) - Resolve resolve recipients no domínio de notificações contextuais, aplicando validações, autorização e persistência de forma coesa. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `ContextNotificationsService.toView(notification)` (privada; método de classe) - Transforma o documento interno de notificações contextuais num contrato público, removendo detalhes de persistência antes de responder à UI. Entradas: `notification`: Valor de notification usado pela função para executar to view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.controller.ts`

- `CurriculumNavigationController.load(request, body)` (pública; método de classe) - Carrega tópicos e secções a partir de jobs autorizados. Entradas: `request`: Pedido autenticado.; `body`: Jobs alvo. Devolve: Navegação curricular.

### `real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.service.ts`

- `CurriculumNavigationService.load(actor, input)` (pública; método de classe) - Cria uma árvore simples de tópicos e secções autorizadas. Entradas: `actor`: Utilizador autenticado.; `input`: Jobs autorizados. Devolve: Navegação curricular.
- `CurriculumNavigationService.buildTopics(jobs)` (privada; método de classe) - Agrupa chunks por material para formar tópicos navegáveis. Entradas: `jobs`: Jobs autorizados. Devolve: Tópicos curriculares.
- `CurriculumNavigationService.topicTitle(job)` (privada; método de classe) - Define título estável sem depender de metadados inexistentes. Entradas: `job`: Job de indexação. Devolve: Título do tópico.

### `real_dev/api/src/modules/external-knowledge-ai/external-ai-policy.ts`

- `resolveExternalAiPolicy(input)` (exportada; função) - Decide se uma resposta StudyFlow pode receber contexto externo limitado. Entradas: `input`: Permissao explicita do aluno e quantidade de fontes internas autorizadas. Devolve: Decisao que o service usa antes de chamar o provider IA.

### `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.controller.ts`

- `ExternalKnowledgeAiController.ask(request, body)` (pública; método de classe) - Cria resposta com fontes internas e nota externa opcional. Entradas: `request`: Pedido autenticado.; `body`: Dados validados. Devolve: Resposta persistida.

### `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.ts`

- `ExternalKnowledgeAiService.ask(actor, input)` (pública; método de classe) - Cria resposta com citações internas e nota externa opcional. Entradas: `actor`: Aluno autenticado.; `input`: Área, pergunta e permissão externa. Devolve: Resposta persistida.
- `ExternalKnowledgeAiService.generateAnswer(areaName, question, citations, externalAllowed)` (privada; método de classe) - Chama o provider IA mantendo fontes internas e nota externa separadas. Entradas: `areaName`: Nome da área privada.; `question`: Pergunta do aluno.; `citations`: Citações internas autorizadas.; `externalAllowed`: Decisão final da policy para contexto externo. Devolve: Resposta validada.

### `real_dev/api/src/modules/external-material-imports/external-material-imports.controller.ts`

- `ExternalMaterialImportsController.create(request, body)` (pública; método de classe) - Importa um link externo para area privada ou disciplina oficial. Entradas: `request`: Pedido autenticado pelo `SessionGuard`.; `body`: Payload RF61 validado pelo `ValidationPipe`. Devolve: Material publico criado.

### `real_dev/api/src/modules/external-material-imports/external-material-imports.service.ts`

- `ExternalMaterialImportsService.importExternalMaterial(actor, dto)` (pública; método de classe) - Cria um material StudyFlow a partir de um link externo autorizado. Entradas: `actor`: Utilizador autenticado anexado pelo `SessionGuard`.; `dto`: Payload validado pelo DTO RF61. Devolve: Material publico criado pelo service de destino.
- `ExternalMaterialImportsService.assertProviderMatchesSourceUrl(provider, sourceUrl)` (privada; método de classe) - Garante que a URL representa realmente o provider declarado. Entradas: `provider`: Provider escolhido no formulário.; `sourceUrl`: URL externa recebida do utilizador. Devolve: URL normalizada pela API nativa `URL`.

### `real_dev/api/src/modules/follow-up-alerts/follow-up-alerts.controller.ts`

- `FollowUpAlertsController.list(request)` (pública; método de classe) - Obtém o pedido HTTP de alertas de acompanhamento e delega no service a aplicação das regras de autenticação, validação e domínio. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `FollowUpAlertsController.create(request, body)` (pública; método de classe) - Cria o pedido HTTP de alertas de acompanhamento e delega no service a aplicação das regras de autenticação, validação e domínio. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.
- `FollowUpAlertsController.run(request, id)` (pública; método de classe) - Executa o pedido HTTP de alertas de acompanhamento e delega no service a aplicação das regras de autenticação, validação e domínio. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `id`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/api/src/modules/follow-up-alerts/follow-up-alerts.service.ts`

- `FollowUpAlertsService.create(actor, input)` (pública; método de classe) - Cria regra pertencente a uma turma do professor. Entradas: `actor`: Professor autenticado.; `input`: Dados da regra. Devolve: Regra criada.
- `FollowUpAlertsService.list(actor)` (pública; método de classe) - Lista regras do professor. Entradas: `actor`: Professor autenticado. Devolve: Regras.
- `FollowUpAlertsService.run(actor, ruleId)` (pública; método de classe) - Executa regra manualmente e envia notificação se houver alunos inativos. Entradas: `actor`: Professor autenticado.; `ruleId`: Regra alvo. Devolve: Preview e notificação criada.
- `FollowUpAlertsService.findOwnedRule(teacherId, ruleId)` (privada; método de classe) - Obtém find owned rule no domínio de alertas de acompanhamento, aplicando validações, autorização e persistência de forma coesa. Entradas: `teacherId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `ruleId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Resultado da operação no formato esperado pelo chamador.
- `FollowUpAlertsService.findInactiveStudentIds(studentIds, inactiveDays)` (privada; método de classe) - Obtém find inactive student ids no domínio de alertas de acompanhamento, aplicando validações, autorização e persistência de forma coesa. Entradas: `studentIds`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `inactiveDays`: Valor temporal que controla expiração, retenção ou referência da operação. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `FollowUpAlertsService.assertTeacher(actor)` (privada; método de classe) - Valida a regra de alertas de acompanhamento e lança uma exceção explícita quando o utilizador ou recurso não cumpre o contrato. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `FollowUpAlertsService.notFound()` (privada; método de classe) - Executa not found no domínio de alertas de acompanhamento, aplicando validações, autorização e persistência de forma coesa. Entradas: sem entradas explícitas. Devolve: Exceção estruturada pronta a ser lançada pelo service ou controller.
- `FollowUpAlertsService.toRuleView(rule)` (privada; método de classe) - Transforma o documento interno de alertas de acompanhamento num contrato público, removendo detalhes de persistência antes de responder à UI. Entradas: `rule`: Valor de rule usado pela função para executar to rule view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/guided-study-rooms/guided-study-rooms.controller.ts`

- `GuidedStudyRoomsController.create(request, classId, body)` (pública; método de classe) - Recebe o pedido de criação de salas de estudo guiado e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de salas de estudo guiado criado no formato público esperado pela UI ou pelo teste.
- `GuidedStudyRoomsController.listTeacher(request, classId)` (pública; método de classe) - Recebe o pedido de listagem de salas de estudo guiado e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de salas de estudo guiado visível para o contexto autorizado.
- `GuidedStudyRoomsController.listStudent(request, classId)` (pública; método de classe) - Recebe o pedido de listagem de salas de estudo guiado e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de salas de estudo guiado visível para o contexto autorizado.

### `real_dev/api/src/modules/guided-study-rooms/guided-study-rooms.service.ts`

- `GuidedStudyRoomsService.create(actor, classId, input)` (pública; método de classe) - Cria salas de estudo guiado depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `classId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `GuidedStudyRoomsService.listForTeacher(actor, classId)` (pública; método de classe) - Lista salas de estudo guiado já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de salas de estudo guiado visível para o contexto autorizado.
- `GuidedStudyRoomsService.listForStudent(actor, classId)` (pública; método de classe) - Lista salas de estudo guiado já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de salas de estudo guiado visível para o contexto autorizado.
- `GuidedStudyRoomsService.assertTeacher(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `GuidedStudyRoomsService.assertStudent(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `GuidedStudyRoomsService.resolveOptionalSubjectId(teacherId, classId, subjectId)` (privada; método de classe) - Valida a disciplina opcional da sala e garante que pertence à mesma turma. Entradas: `teacherId`: Professor autenticado dono da turma.; `classId`: Turma onde a sala guiada será criada.; `subjectId`: Disciplina opcional escolhida pelo professor. Devolve: Identificador da disciplina validada ou `undefined`.
- `GuidedStudyRoomsService.toView(room)` (privada; método de classe) - Mapeia o documento interno de salas de estudo guiado para uma forma pública estável e simples de consumir. Entradas: `room`: Valor de room usado pela função para executar to view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/material-contexts/material-contexts.controller.ts`

- `MaterialContextsController.listPrivate(request, studyAreaId)` (pública; método de classe) - Recebe o pedido de listagem de contextos pedagógicos de materiais e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `studyAreaId`: Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno. Devolve: Coleção de contextos pedagógicos de materiais visível para o contexto autorizado.
- `MaterialContextsController.listOfficial(request, subjectId)` (pública; método de classe) - Recebe o pedido de listagem de contextos pedagógicos de materiais e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de contextos pedagógicos de materiais visível para o contexto autorizado.

### `real_dev/api/src/modules/material-contexts/material-contexts.service.ts`

- `MaterialContextsService.listPrivateArea(actor, studyAreaId)` (pública; método de classe) - Lista contextos pedagógicos de materiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `studyAreaId`: Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno. Devolve: Coleção de contextos pedagógicos de materiais visível para o contexto autorizado.
- `MaterialContextsService.listOfficialSubject(actor, subjectId)` (pública; método de classe) - Lista contextos pedagógicos de materiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de contextos pedagógicos de materiais visível para o contexto autorizado.
- `MaterialContextsService.upsertContext(input)` (privada; método de classe) - Executa a operação upsert context no domínio de contextos pedagógicos de materiais com contrato explícito. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `MaterialContextsService.toView(context)` (privada; método de classe) - Mapeia o documento interno de contextos pedagógicos de materiais para uma forma pública estável e simples de consumir. Entradas: `context`: Valor de context usado pela função para executar to view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/material-index/document-processing-safety.service.ts`

- `DocumentProcessingSafetyService.assertSafeStoredDocument(input)` (pública; método de classe) - Rejeita documentos incoerentes antes de qualquer parser externo ler bytes. Entradas: `input`: Metadados e tamanho do documento já carregado pelo backend. Devolve: Nada quando o documento é seguro para parsing.
- `DocumentProcessingSafetyService.runWithTimeout(input)` (pública; método de classe) - Executa o parser com limite temporal para impedir pedidos presos. Entradas: `input`: Operação de parsing e limite temporal opcional. Devolve: Resultado produzido pelo parser antes do timeout.

### `real_dev/api/src/modules/material-index/material-index-queue.service.ts`

- `MaterialIndexQueueService.enqueuePrivateMaterial(input)` (pública; método de classe) - Devolve um job QUEUED imediatamente e inicia o processamento em segundo plano. Entradas: `input`: Contexto autenticado e material escolhido pelo aluno. Devolve: Job persistido antes de a extração pesada começar.
- `MaterialIndexQueueService.runPrivateIndex(input, jobId)` (privada; método de classe) - Atualiza o job em background e evita rejeições não tratadas no processo Node. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.; `jobId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/api/src/modules/material-index/material-index.controller.ts`

- `MaterialIndexController.indexPrivate(request, studyAreaId, materialId)` (pública; método de classe) - Executa a operação index private no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `studyAreaId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `materialId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Resultado da operação no formato esperado pelo chamador.
- `MaterialIndexController.indexOfficial(request, materialId)` (pública; método de classe) - Executa a operação index official no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `materialId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Resultado da operação no formato esperado pelo chamador.
- `MaterialIndexController.findJob(request, jobId)` (pública; método de classe) - Procura indexação textual de materiais com filtros de ownership, membership ou estado para evitar leituras indevidas. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `jobId`: Identificador do job de indexação; controla que chunks podem ser lidos ou versionados. Devolve: Entidade de indexação textual de materiais já filtrada pelo contexto recebido.

### `real_dev/api/src/modules/material-index/material-index.service.ts`

- `materialIndexUrlSafety.resolveHost(host)` (pública; método de objeto) - Executa a operação resolve host no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `host`: Host resolvido para validar acesso de rede e reduzir riscos como DNS rebinding ou SSRF. Devolve: Resultado da operação no formato esperado pelo chamador.
- `materialIndexUrlSafety.requestText(url, resolvedHost)` (pública; método de objeto) - Executa a operação request text no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `url`: URL validado ou a validar antes de qualquer pedido de rede.; `resolvedHost`: Host resolvido para validar acesso de rede e reduzir riscos como DNS rebinding ou SSRF. Devolve: Resultado da operação no formato esperado pelo chamador.
- `requestPinnedText(value, resolvedHost)` (top-level; função) - Executa a operação request pinned text no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `value`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.; `resolvedHost`: Host resolvido para validar acesso de rede e reduzir riscos como DNS rebinding ou SSRF. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `request.lookup(_hostname, _options, callback)` (interna; função em propriedade) - Executa lookup no domínio de indexação segura de materiais, aplicando validações, autorização e persistência de forma coesa. Entradas: `_hostname`: Valor de hostname usado pela função para executar lookup com dados explícitos.; `_options`: Opções de execução que permitem configurar a operação sem depender de estado global.; `callback`: Callback chamado pela API externa para concluir a operação assíncrona simulada. Devolve: Resultado da operação no formato esperado pelo chamador.
- `MaterialIndexService.createQueuedPrivateJob(actor, studyAreaId, materialId)` (pública; método de classe) - Cria um job observável antes de iniciar a extração pesada do material privado. Entradas: `actor`: Utilizador autenticado vindo da sessão.; `studyAreaId`: Área privada do aluno.; `materialId`: Material a indexar. Devolve: Job persistido em estado QUEUED para a UI poder acompanhar.
- `MaterialIndexService.indexPrivateMaterial(actor, studyAreaId, materialId)` (pública; método de classe) - Executa a operação index private material no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `studyAreaId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `materialId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `MaterialIndexService.indexOfficialMaterial(actor, materialId)` (pública; método de classe) - Executa a operação index official material no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `materialId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `MaterialIndexService.findDoneJob(actor, jobId)` (pública; método de classe) - Procura indexação textual de materiais com filtros de ownership, membership ou estado para evitar leituras indevidas. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `jobId`: Identificador do job de indexação; controla que chunks podem ser lidos ou versionados. Devolve: Entidade de indexação textual de materiais já filtrada pelo contexto recebido.
- `MaterialIndexService.findOwnedJob(actor, jobId)` (pública; método de classe) - Consulta um job autorizado em qualquer estado para a UI poder fazer polling. Entradas: `actor`: Utilizador autenticado vindo da sessão.; `jobId`: Job de indexação a consultar. Devolve: Job autorizado, mesmo que ainda esteja QUEUED ou PROCESSING.
- `MaterialIndexService.processQueuedPrivateJob(actor, studyAreaId, materialId, jobId)` (pública; método de classe) - Processa um job previamente criado e atualiza o estado persistido. Entradas: `actor`: Utilizador autenticado preservado pelo controller.; `studyAreaId`: Área privada do aluno.; `materialId`: Material a indexar.; `jobId`: Job QUEUED criado antes da resposta HTTP. Devolve: Job atualizado para DONE ou FAILED.
- `MaterialIndexService.findReadableDoneJob(actor, jobId)` (pública; método de classe) - Obtém um job concluído para fluxos de leitura pedagógica. Materiais privados continuam limitados ao dono. Materiais oficiais podem ser lidos pelo professor dono ou por alunos inscritos na disciplina, preservando o contrato MF3 de pesquisa/citações sem abrir endpoints MF2 de ve... Entradas: `actor`: Utilizador autenticado.; `jobId`: Job de indexação. Devolve: Job concluído e autorizado para leitura.
- `MaterialIndexService.loadJobView(jobId)` (privada; método de classe) - Carrega indexação textual de materiais no formato necessário ao próximo passo do fluxo. Entradas: `jobId`: Identificador do job de indexação; controla que chunks podem ser lidos ou versionados. Devolve: Entidade de indexação textual de materiais já filtrada pelo contexto recebido.
- `MaterialIndexService.assertOwnedJob(actor, view)` (privada; método de classe) - Confirma uma regra obrigatória de indexação textual de materiais e interrompe o fluxo antes de dados indevidos serem expostos. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `view`: Valor de view usado pela função para executar assert owned job com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `MaterialIndexService.assertReadableJob(actor, view)` (privada; método de classe) - Confirma uma regra obrigatória de indexação textual de materiais e interrompe o fluxo antes de dados indevidos serem expostos. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `view`: Valor de view usado pela função para executar assert readable job com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `MaterialIndexService.assertDone(view)` (privada; método de classe) - Confirma uma regra obrigatória de indexação textual de materiais e interrompe o fluxo antes de dados indevidos serem expostos. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `view`: Valor de view usado pela função para executar assert done com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `MaterialIndexService.createJob(input)` (privada; método de classe) - Cria indexação textual de materiais depois de validar permissões, normalizar input e preparar o contrato público. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `MaterialIndexService.extractPrivateMaterial(userId, material)` (privada; método de classe) - Executa a operação extract private material no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `userId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `material`: Valor de material usado pela função para executar extract private material com dados explícitos. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `MaterialIndexService.operation()` (pública; função em propriedade) - Executa operation no domínio de indexação segura de materiais, aplicando validações, autorização e persistência de forma coesa. Entradas: sem entradas explícitas. Devolve: Resultado da operação no formato esperado pelo chamador.
- `MaterialIndexService.operation()` (pública; função em propriedade) - Executa operation no domínio de indexação segura de materiais, aplicando validações, autorização e persistência de forma coesa. Entradas: sem entradas explícitas. Devolve: Resultado da operação no formato esperado pelo chamador.
- `MaterialIndexService.extractOfficialMaterial(material)` (privada; método de classe) - Executa a operação extract official material no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `material`: Valor de material usado pela função para executar extract official material com dados explícitos. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `MaterialIndexService.toReadableExtraction(value)` (privada; método de classe) - Converte texto bruto em texto processável ou falha controlada para o job. Entradas: `value`: Texto bruto extraído de TOPIC, URL, PDF, DOCX ou material oficial. Devolve: Texto normalizado quando existe conteúdo legível.
- `MaterialIndexService.extractPdfText(buffer)` (privada; método de classe) - Executa a operação extract pdf text no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `buffer`: Valor de buffer usado pela função para executar extract pdf text com dados explícitos. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `MaterialIndexService.extractDocxText(buffer)` (privada; método de classe) - Executa a operação extract docx text no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `buffer`: Valor de buffer usado pela função para executar extract docx text com dados explícitos. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `MaterialIndexService.fetchTextFromUrl(value)` (privada; método de classe) - Executa a operação fetch text from url no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `value`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `MaterialIndexService.shouldRetry(error)` (pública; função em propriedade) - Avalia should retry no domínio de indexação segura de materiais, aplicando validações, autorização e persistência de forma coesa. Entradas: `error`: Erro capturado para ser convertido numa mensagem segura e compreensível. Devolve: Valor booleano que indica se a regra avaliada é verdadeira.
- `MaterialIndexService.isRecoverableUrlReadError(error)` (privada; método de classe) - Decide se uma leitura externa falhou por motivo temporário e recuperável. Entradas: `error`: Erro capturado pela camada de leitura URL. Devolve: `true` apenas para falhas transitórias conhecidas.
- `MaterialIndexService.isRedirect(status)` (privada; método de classe) - Executa a operação is redirect no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `status`: Estado funcional usado para decidir o próximo passo ou a resposta pública. Devolve: Valor booleano que indica se a regra avaliada é verdadeira.
- `MaterialIndexService.parseSafeHttpUrl(value)` (privada; método de classe) - Converte e valida valores de indexação textual de materiais, rejeitando entradas que poderiam quebrar segurança ou consistência. Entradas: `value`: Valor bruto recebido antes de normalização, parsing ou validação. Devolve: Valor normalizado e seguro para ser usado pelo restante fluxo.
- `MaterialIndexService.resolvePublicHost(value)` (privada; método de classe) - Executa a operação resolve public host no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `value`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `MaterialIndexService.isPrivateIp(host)` (privada; método de classe) - Executa a operação is private ip no domínio de indexação textual de materiais com contrato explícito. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `host`: Host resolvido para validar acesso de rede e reduzir riscos como DNS rebinding ou SSRF. Devolve: Valor booleano que indica se a regra avaliada é verdadeira.
- `MaterialIndexService.stripHtml(text)` (privada; método de classe) - Remove ruído ou conteúdo perigoso antes de usar o valor no fluxo de indexação textual de materiais. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `text`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `MaterialIndexService.getHeaderValue(header)` (privada; método de classe) - Carrega indexação textual de materiais no formato necessário ao próximo passo do fluxo. Entradas: `header`: Cabeçalhos HTTP usados para ler metadados sem depender do formato original. Devolve: Entidade de indexação textual de materiais já filtrada pelo contexto recebido.
- `MaterialIndexService.toExtractionError(error)` (privada; método de classe) - Mapeia o documento interno de indexação textual de materiais para uma forma pública estável e simples de consumir. Entradas: `error`: Erro capturado para ser convertido numa resposta controlada ou relançado com segurança. Devolve: Exceção padronizada com código estável para controllers e testes.
- `MaterialIndexService.createChunks(text, sourceLabel)` (privada; método de classe) - Cria indexação textual de materiais depois de validar permissões, normalizar input e preparar o contrato público. Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding. Entradas: `text`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.; `sourceLabel`: Valor de sourceLabel usado pela função para executar create chunks com dados explícitos. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `MaterialIndexService.notFound()` (privada; método de classe) - Constrói uma exceção de indexação textual de materiais com código previsível para API, UI e testes. Entradas: sem entradas explícitas. Devolve: Exceção padronizada com código estável para controllers e testes.
- `MaterialIndexService.accessDenied()` (privada; método de classe) - Constrói uma exceção de indexação textual de materiais com código previsível para API, UI e testes. Entradas: sem entradas explícitas. Devolve: Exceção padronizada com código estável para controllers e testes.
- `MaterialIndexService.toView(job)` (privada; método de classe) - Mapeia o documento interno de indexação textual de materiais para uma forma pública estável e simples de consumir. Entradas: `job`: Documento ou vista interna que será validada ou convertida para contrato público. Devolve: Contrato público sem campos internos de persistência.

### `real_dev/api/src/modules/material-structure/material-structure.controller.ts`

- `MaterialStructureController.create(request, jobId)` (pública; método de classe) - Recebe o pedido de criação de estrutura de materiais e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `jobId`: Identificador do job de indexação; controla que chunks podem ser lidos ou versionados. Devolve: Registo de estrutura de materiais criado no formato público esperado pela UI ou pelo teste.

### `real_dev/api/src/modules/material-structure/material-structure.service.ts`

- `MaterialStructureService.createFromJob(actor, jobId)` (pública; método de classe) - Cria estrutura de materiais depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `jobId`: Identificador do job de indexação; controla que chunks podem ser lidos ou versionados. Devolve: Registo de estrutura de materiais criado no formato público esperado pela UI ou pelo teste.
- `MaterialStructureService.deriveTitle(text, order)` (privada; método de classe) - Executa a operação derive title no domínio de estrutura de materiais com contrato explícito. Entradas: `text`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.; `order`: Valor de order usado pela função para executar derive title com dados explícitos. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.

### `real_dev/api/src/modules/material-versions/material-versions.controller.ts`

- `MaterialVersionsController.createFromJob(request, jobId, input)` (pública; método de classe) - Recebe o pedido de criação de versões de materiais e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `jobId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Resultado da operação no formato esperado pelo chamador.
- `MaterialVersionsController.listForJob(request, jobId)` (pública; método de classe) - Recebe o pedido de listagem de versões de materiais e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `jobId`: Identificador do job de indexação; controla que chunks podem ser lidos ou versionados. Devolve: Coleção de versões de materiais visível para o contexto autorizado.
- `MaterialVersionsController.restoreVersion(request, jobId, versionId)` (pública; método de classe) - Executa a operação restore version no domínio de versões de materiais com contrato explícito. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `jobId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `versionId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Resultado da operação no formato esperado pelo chamador.
- `MaterialVersionsController.createPrivate(request, studyAreaId, materialId)` (pública; método de classe) - Recebe o pedido de criação de versões de materiais e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `studyAreaId`: Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.; `materialId`: Identificador do material; confirma ownership ou pertença à disciplina antes da operação. Devolve: Registo de versões de materiais criado no formato público esperado pela UI ou pelo teste.
- `MaterialVersionsController.createOfficial(request, materialId)` (pública; método de classe) - Recebe o pedido de criação de versões de materiais e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `materialId`: Identificador do material; confirma ownership ou pertença à disciplina antes da operação. Devolve: Registo de versões de materiais criado no formato público esperado pela UI ou pelo teste.

### `real_dev/api/src/modules/material-versions/material-versions.service.ts`

- `MaterialVersionsService.createFromJob(actor, jobId, input)` (pública; método de classe) - Cria versões de materiais depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `jobId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `MaterialVersionsService.listForJob(actor, jobId)` (pública; método de classe) - Lista versões de materiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `jobId`: Identificador do job de indexação; controla que chunks podem ser lidos ou versionados. Devolve: Coleção de versões de materiais visível para o contexto autorizado.
- `MaterialVersionsService.restoreVersion(actor, jobId, versionId)` (pública; método de classe) - Executa a operação restore version no domínio de versões de materiais com contrato explícito. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `jobId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `versionId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `MaterialVersionsService.createPrivateVersion(actor, _studyAreaId, _materialId)` (pública; método de classe) - Cria versões de materiais depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `_studyAreaId`: Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.; `_materialId`: Identificador do material; confirma ownership ou pertença à disciplina antes da operação. Devolve: Registo de versões de materiais criado no formato público esperado pela UI ou pelo teste.
- `MaterialVersionsService.createOfficialVersion(actor, _materialId)` (pública; método de classe) - Cria versões de materiais depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `_materialId`: Identificador do material; confirma ownership ou pertença à disciplina antes da operação. Devolve: Registo de versões de materiais criado no formato público esperado pela UI ou pelo teste.
- `MaterialVersionsService.createVersionFromJob(job, input)` (privada; método de classe) - Cria versões de materiais depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `job`: Valor de job usado pela função para executar create version from job com dados explícitos.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `MaterialVersionsService.roleError(role)` (privada; método de classe) - Constrói uma exceção de versões de materiais com código previsível para API, UI e testes. Entradas: `role`: Papel funcional que define permissões e comportamento autorizado dentro da aplicação. Devolve: Exceção estruturada pronta a ser lançada pelo service ou controller.
- `MaterialVersionsService.notFound()` (privada; método de classe) - Constrói uma exceção de versões de materiais com código previsível para API, UI e testes. Entradas: sem entradas explícitas. Devolve: Exceção padronizada com código estável para controllers e testes.
- `MaterialVersionsService.toView(version)` (privada; método de classe) - Mapeia o documento interno de versões de materiais para uma forma pública estável e simples de consumir. Entradas: `version`: Valor de version usado pela função para executar to view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/materials/material-storage.service.ts`

- `MaterialStorageService.save(file)` (pública; método de classe) - Guarda o ficheiro no storage local. Entradas: `file`: Ficheiro PDF ou DOCX já validado. Devolve: Chave opaca persistida na base de dados.
- `MaterialStorageService.read(storageKey)` (pública; método de classe) - Lê um ficheiro previamente guardado pelo storage local. Entradas: `storageKey`: Chave opaca persistida no material. Devolve: Conteúdo binário do ficheiro.

### `real_dev/api/src/modules/materials/materials.controller.ts`

- `MaterialsController.list(request, studyAreaId)` (pública; método de classe) - Lista materiais de uma área do aluno. Entradas: `request`: Pedido autenticado.; `studyAreaId`: Identificador da área. Devolve: Materiais da área.
- `MaterialsController.uploadFile(request, studyAreaId, file, title)` (pública; método de classe) - Submete PDF ou DOCX via multipart. Entradas: `request`: Pedido autenticado.; `studyAreaId`: Identificador da área.; `file`: Ficheiro enviado no campo `file`.; `title`: Título opcional do material. Devolve: Material criado.
- `MaterialsController.submitText(request, studyAreaId, body)` (pública; método de classe) - Submete URL ou tópico via JSON. Entradas: `request`: Pedido autenticado.; `studyAreaId`: Identificador da área.; `body`: Dados do material textual. Devolve: Material criado.

### `real_dev/api/src/modules/materials/materials.service.ts`

- `MaterialsService.listByArea(userId, studyAreaId)` (pública; método de classe) - Lista materiais de uma área pertencente ao aluno. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área. Devolve: Materiais da área.
- `MaterialsService.countMine(userId)` (pública; método de classe) - Conta materiais do aluno para painéis agregados. Entradas: `userId`: Identificador vindo da sessão. Devolve: Número de materiais submetidos pelo aluno.
- `MaterialsService.listReadyTextSources(userId, studyAreaId)` (pública; método de classe) - Lista materiais prontos e processáveis para IA. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área. Devolve: Materiais `READY` com `contentText`.
- `MaterialsService.findOwnedTextMaterial(userId, studyAreaId, materialId)` (pública; método de classe) - Obtém um material textual do aluno dentro de uma área sua. Entradas: `userId`: Aluno autenticado.; `studyAreaId`: Área de estudo.; `materialId`: Material a validar. Devolve: Material interno com texto quando existir.
- `MaterialsService.findOwnedMaterialReference(userId, materialId)` (pública; método de classe) - Obtém um material privado do aluno para fluxos que precisam apenas de referência controlada. Entradas: `userId`: Identificador do aluno autenticado.; `materialId`: Material privado a validar. Devolve: Contrato público mínimo para outros domínios, sem expor detalhes Mongoose.
- `MaterialsService.readStoredFile(storageKey)` (pública; método de classe) - Lê o ficheiro binário associado a um material já validado. Entradas: `storageKey`: Chave guardada no material. Devolve: Conteúdo binário do ficheiro.
- `MaterialsService.markIndexedText(userId, materialId, contentText)` (pública; método de classe) - Marca um material como processado depois de indexação textual. Entradas: `userId`: Aluno autenticado.; `materialId`: Material privado.; `contentText`: Texto extraído. Devolve: Nada.
- `MaterialsService.submitFile(userId, studyAreaId, file, title)` (pública; método de classe) - Submete um PDF ou DOCX. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área.; `file`: Ficheiro multipart.; `title`: Título opcional definido pelo aluno. Devolve: Material criado em estado pendente.
- `MaterialsService.submitTextMaterial(userId, studyAreaId, input)` (pública; método de classe) - Submete URL ou tópico textual. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área.; `input`: Dados JSON do material. Devolve: Material criado.
- `MaterialsService.normalizeMaterialText(value)` (privada; método de classe) - Normaliza texto privado antes de o guardar como fonte processável. Entradas: `value`: Texto bruto recebido de formulário ou indexação. Devolve: Texto normalizado e legível.
- `MaterialsService.assertOwnArea(userId, studyAreaId)` (privada; método de classe) - Garante que a área pertence ao aluno autenticado. Entradas: `userId`: Identificador vindo da sessão.; `studyAreaId`: Identificador da área. Devolve: Nada quando a área é válida.
- `MaterialsService.parseSafeUrl(value)` (privada; método de classe) - Valida URLs aceitando apenas HTTP e HTTPS. Entradas: `value`: Valor recebido do DTO. Devolve: URL normalizado.
- `MaterialsService.toPublicMaterial(material)` (privada; método de classe) - Converte material interno no contrato público do BK-MF0-08. Entradas: `material`: Documento ou objeto lean vindo do Mongo. Devolve: Material sem campos internos/sensíveis.

### `real_dev/api/src/modules/materials/validators/material-upload.validator.ts`

- `MATERIAL_UPLOAD_OPTIONS.fileFilter(_request, file, callback)` (interna; função em propriedade) - Executa file filter para materiais de estudo, transformando regras de negócio em feedback previsível para o chamador. Entradas: `_request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `file`: Ficheiro recebido ou processado pela operação.; `callback`: Callback chamado pela API externa para concluir a operação assíncrona simulada. Devolve: Resultado da operação no formato esperado pelo chamador.
- `validateMaterialUpload(file)` (exportada; função) - Valida ficheiros submetidos no BK-MF0-08. Entradas: `file`: Ficheiro recebido via multipart. Devolve: Nada quando o ficheiro é aceite.
- `validateMaterialUploadMetadata(file)` (exportada; função) - Valida metadados do upload antes do ficheiro ser aceite pelo Multer. Entradas: `file`: Ficheiro recebido via multipart. Devolve: Nada quando os metadados são aceites.
- `materialTypeFromMime(mimeType)` (exportada; função) - Converte MIME validado para tipo canónico de material. Entradas: `mimeType`: MIME do ficheiro já validado. Devolve: Tipo `PDF` ou `DOCX`.
- `isAllowedMimeType(mimeType)` (top-level; função) - Confirma se o MIME pertence ao contrato MF0. Entradas: `mimeType`: MIME recebido no multipart. Devolve: `true` quando é PDF ou DOCX.
- `hasExpectedSignature(file)` (top-level; função) - Valida a assinatura binária mínima do ficheiro. Entradas: `file`: Ficheiro com buffer já carregado em memória. Devolve: `true` quando a assinatura corresponde ao MIME.

### `real_dev/api/src/modules/notification-policies/notification-policies.controller.ts`

- `NotificationPoliciesController.list(request)` (pública; método de classe) - Obtém o pedido HTTP de políticas de notificações e delega no service a aplicação das regras de autenticação, validação e domínio. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `NotificationPoliciesController.upsert(request, channel, body)` (pública; método de classe) - Atualiza o pedido HTTP de políticas de notificações e delega no service a aplicação das regras de autenticação, validação e domínio. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `channel`: Valor de channel usado pela função para executar upsert com dados explícitos.; `body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/api/src/modules/notification-policies/notification-policies.service.ts`

- `NotificationPoliciesService.list(actor)` (pública; método de classe) - Lista políticas apenas para admin. Entradas: `actor`: Utilizador autenticado. Devolve: Políticas efetivas.
- `NotificationPoliciesService.upsert(actor, channel, input)` (pública; método de classe) - Cria ou atualiza política de canal. Entradas: `actor`: Admin autenticado.; `channel`: Canal alvo.; `input`: Dados editáveis. Devolve: Política persistida.
- `NotificationPoliciesService.assertWithinQuota(recipientIds, contextId)` (pública; método de classe) - Valida quota in-app antes de criar notificação. Entradas: `recipientIds`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `contextId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `NotificationPoliciesService.assertAdmin(actor)` (privada; método de classe) - Valida a regra de políticas de notificações e lança uma exceção explícita quando o utilizador ou recurso não cumpre o contrato. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `NotificationPoliciesService.defaultPolicy(channel)` (privada; método de classe) - Executa default policy no domínio de políticas de notificações, aplicando validações, autorização e persistência de forma coesa. Entradas: `channel`: Valor de channel usado pela função para executar default policy com dados explícitos. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/api/src/modules/notification-preferences/notification-preferences.controller.ts`

- `NotificationPreferencesController.list(request)` (pública; método de classe) - Lista preferências efetivas do utilizador. Entradas: `request`: Pedido autenticado. Devolve: Preferências por contexto.
- `NotificationPreferencesController.update(request, body)` (pública; método de classe) - Atualiza uma preferência. Entradas: `request`: Pedido autenticado.; `body`: Contexto e canais. Devolve: Preferência persistida.

### `real_dev/api/src/modules/notification-preferences/notification-preferences.service.ts`

- `NotificationPreferencesService.listEffective(userId)` (pública; método de classe) - Lista preferências efetivas, preenchendo defaults dos contextos ausentes. Entradas: `userId`: Utilizador autenticado. Devolve: Preferências por contexto.
- `NotificationPreferencesService.upsert(userId, input)` (pública; método de classe) - Atualiza ou cria uma preferência do utilizador autenticado. Entradas: `userId`: Utilizador autenticado.; `input`: Canais por contexto. Devolve: Preferência persistida.
- `NotificationPreferencesService.isInAppEnabled(userId, context)` (pública; método de classe) - Indica se um alerta in-app deve ser mostrado para o contexto. Entradas: `userId`: Utilizador autenticado.; `context`: Contexto consultado. Devolve: `true` quando o canal app está ativo.
- `NotificationPreferencesService.toPreferenceView(preference)` (privada; método de classe) - Remove campos internos da preferência. Entradas: `preference`: Documento ou objeto lean. Devolve: Preferência pública.

### `real_dev/api/src/modules/official-materials/official-materials.controller.ts`

- `OfficialMaterialsController.create(request, subjectId, body)` (pública; método de classe) - Recebe o pedido de criação de materiais oficiais e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de materiais oficiais criado no formato público esperado pela UI ou pelo teste.
- `OfficialMaterialsController.list(request, subjectId)` (pública; método de classe) - Recebe o pedido de listagem de materiais oficiais e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de materiais oficiais visível para o contexto autorizado.

### `real_dev/api/src/modules/official-materials/official-materials.service.ts`

- `OfficialMaterialsService.createOfficialMaterial(actor, subjectId, input)` (pública; método de classe) - Cria materiais oficiais depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `subjectId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `OfficialMaterialsService.listTeacherSubjectMaterials(actor, subjectId)` (pública; método de classe) - Lista materiais oficiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de materiais oficiais visível para o contexto autorizado.
- `OfficialMaterialsService.listProcessedForSubject(subjectId)` (pública; método de classe) - Lista materiais oficiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de materiais oficiais visível para o contexto autorizado.
- `OfficialMaterialsService.findProcessedBySubject(subjectId)` (pública; método de classe) - Alias explícito para BKs MF2 que consomem materiais processados. Entradas: `subjectId`: Disciplina oficial. Devolve: Materiais oficiais com texto processável.
- `OfficialMaterialsService.findOwnedMaterial(teacherId, materialId)` (pública; método de classe) - Obtém um material oficial validando que pertence ao professor. Entradas: `teacherId`: Professor autenticado.; `materialId`: Material oficial. Devolve: Material oficial público.
- `OfficialMaterialsService.markIndexedText(teacherId, materialId, textContent)` (pública; método de classe) - Marca um material oficial como processado depois de indexação textual. Entradas: `teacherId`: Professor autenticado.; `materialId`: Material oficial.; `textContent`: Texto extraído. Devolve: Nada.
- `OfficialMaterialsService.parseSafeUrl(value)` (privada; método de classe) - Converte e valida valores de materiais oficiais, rejeitando entradas que poderiam quebrar segurança ou consistência. Entradas: `value`: Valor bruto recebido antes de normalização, parsing ou validação. Devolve: Valor normalizado e seguro para ser usado pelo restante fluxo.
- `OfficialMaterialsService.cleanTextContent(value)` (privada; método de classe) - Remove ruído ou conteúdo perigoso antes de usar o valor no fluxo de materiais oficiais. Entradas: `value`: Valor bruto recebido antes de normalização, parsing ou validação. Devolve: Valor normalizado e seguro para ser usado pelo restante fluxo.
- `OfficialMaterialsService.assertTeacher(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `OfficialMaterialsService.toMaterialView(material)` (privada; método de classe) - Mapeia o documento interno de materiais oficiais para uma forma pública estável e simples de consumir. Entradas: `material`: Valor de material usado pela função para executar to material view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/official-tests/official-test-attempt-scoring.ts`

- `scoreOfficialTestAttempt(questions, selectedOptionIndexes)` (exportada; função) - Compara respostas do aluno com a versão oficial criada pelo professor. Entradas: `questions`: Perguntas oficiais persistidas, incluindo índice correto.; `selectedOptionIndexes`: Índices escolhidos pelo aluno no formulário. Devolve: Pontuação agregada e resultado por pergunta.

### `real_dev/api/src/modules/official-tests/official-test-ranking.service.ts`

- `buildOfficialTestRanking(attempts)` (exportada; função) - Ordena tentativas oficiais e transforma-as em linhas seguras de ranking. Entradas: `attempts`: Tentativas já filtradas por professor, disciplina, turma e teste. Devolve: Linhas ordenadas sem respostas completas nem email do aluno.
- `OfficialTestRankingService.listForTeacher(actor, subjectId, testId)` (pública; método de classe) - Lista ranking de um mini-teste oficial para o professor dono da disciplina. Entradas: `actor`: Professor autenticado pela sessão.; `subjectId`: Disciplina oficial do professor.; `testId`: Mini-teste oficial a consultar. Devolve: Ranking com dados mínimos das tentativas.
- `OfficialTestRankingService.assertTeacher(actor)` (privada; método de classe) - Confirma que o utilizador autenticado é professor antes de qualquer leitura sensível. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `OfficialTestRankingService.officialTestNotFound()` (privada; método de classe) - Cria erro estável para mini-teste inacessível. Entradas: sem entradas explícitas. Devolve: Exceção HTTP 404 sem revelar existência fora da disciplina autorizada.

### `real_dev/api/src/modules/official-tests/official-tests.controller.ts`

- `OfficialTestsController.create(request, subjectId, body)` (pública; método de classe) - Recebe o pedido de criação de testes oficiais e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de testes oficiais criado no formato público esperado pela UI ou pelo teste.
- `OfficialTestsController.list(request, subjectId)` (pública; método de classe) - Recebe o pedido de listagem de testes oficiais e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de testes oficiais visível para o contexto autorizado.
- `OfficialTestsController.listRankingForTeacher(request, subjectId, testId)` (pública; método de classe) - Lista ranking de um mini-teste oficial para professor autorizado. Entradas: `request`: Pedido autenticado; a sessão fornece o professor real.; `subjectId`: Disciplina oficial do professor.; `testId`: Mini-teste oficial. Devolve: Ranking ordenado e minimizado.
- `OfficialTestsController.listForStudent(request, subjectId)` (pública; método de classe) - Lista ao aluno apenas mini-testes publicados da disciplina onde está inscrito. Entradas: `request`: Pedido HTTP autenticado; a sessão fornece o aluno real.; `subjectId`: Disciplina oficial pedida pelo aluno. Devolve: Testes publicados sem expor `correctOptionIndex`.
- `OfficialTestsController.submitAttempt(request, subjectId, testId, body)` (pública; método de classe) - Submete uma tentativa oficial e delega a correção no backend. Entradas: `request`: Pedido HTTP autenticado; a sessão fornece o aluno real.; `subjectId`: Disciplina oficial pedida pelo aluno.; `testId`: Teste oficial publicado.; `body`: Respostas escolhidas pelo aluno. Devolve: Resultado persistido e pontuado da tentativa.

### `real_dev/api/src/modules/official-tests/official-tests.service.ts`

- `OfficialTestsService.create(actor, subjectId, input)` (pública; método de classe) - Cria testes oficiais depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `subjectId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `OfficialTestsService.listForTeacher(actor, subjectId)` (pública; método de classe) - Lista testes oficiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de testes oficiais visível para o contexto autorizado.
- `OfficialTestsService.listPublishedForStudent(actor, subjectId)` (pública; método de classe) - Lista testes publicados para o aluno inscrito, ocultando respostas corretas. Entradas: `actor`: Utilizador autenticado vindo da sessão; nunca vem do body.; `subjectId`: Disciplina oficial pedida no URL. Devolve: Testes publicados acessíveis ao aluno autenticado.
- `OfficialTestsService.submitAttempt(actor, subjectId, testId, input)` (pública; método de classe) - Submete respostas de aluno e persiste uma tentativa separada da prova oficial. Entradas: `actor`: Utilizador autenticado; define o `studentId` real da tentativa.; `subjectId`: Disciplina oficial pedida no URL.; `testId`: Teste oficial publicado.; `input`: Respostas escolhidas no formulário. Devolve: Tentativa persistida com pontuação calculada no backend.
- `OfficialTestsService.countPublishedBySubjectIds(subjectIds)` (pública; método de classe) - Executa a operação count published by disciplina ids no domínio de testes oficiais com contrato explícito. Entradas: `subjectIds`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Número calculado para o chamador usar em contadores, limites ou ordenação.
- `OfficialTestsService.normalizeQuestion(question)` (privada; método de classe) - Normaliza dados de testes oficiais para que validações e comparações usem sempre o mesmo formato. Entradas: `question`: Pergunta do aluno; é aparada e usada para construir contexto pedagógico controlado. Devolve: Valor normalizado e seguro para ser usado pelo restante fluxo.
- `OfficialTestsService.assertTeacher(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `OfficialTestsService.assertStudent(actor)` (privada; método de classe) - Valida que o fluxo é usado por um aluno real autenticado. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `OfficialTestsService.testNotFound()` (privada; método de classe) - Constrói erro público para teste inexistente, rascunho ou fora do âmbito do aluno. Entradas: sem entradas explícitas. Devolve: Exceção padronizada sem revelar testes em rascunho.
- `OfficialTestsService.toView(test)` (privada; método de classe) - Mapeia o documento interno de testes oficiais para uma forma pública estável e simples de consumir. Entradas: `test`: Valor de test usado pela função para executar to view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.
- `OfficialTestsService.toStudentView(test)` (privada; método de classe) - Mapeia um teste publicado para a vista segura de aluno. Entradas: `test`: Documento interno de teste oficial. Devolve: Contrato público sem respostas corretas.
- `OfficialTestsService.toAttemptView(attempt)` (privada; método de classe) - Mapeia a tentativa persistida para o contrato consumido pela UI e pelo ranking futuro. Entradas: `attempt`: Documento interno de tentativa oficial. Devolve: Tentativa pública do aluno autenticado.

### `real_dev/api/src/modules/privacy-data-exports/privacy-data-exports.controller.ts`

- `PrivacyDataExportsController.create(request, _body)` (pública; método de classe) - Cria o pedido HTTP de exportação de dados pessoais e delega no service a aplicação das regras de autenticação, validação e domínio. Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `_body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.
- `PrivacyDataExportsController.list(request)` (pública; método de classe) - Obtém o pedido HTTP de exportação de dados pessoais e delega no service a aplicação das regras de autenticação, validação e domínio. Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `PrivacyDataExportsController.download(request, id)` (pública; método de classe) - Descarrega o pedido HTTP de exportação de dados pessoais e delega no service a aplicação das regras de autenticação, validação e domínio. Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `id`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.

### `real_dev/api/src/modules/privacy-data-exports/privacy-data-exports.service.ts`

- `PrivacyDataExportsService.requestExport(actor)` (pública; método de classe) - Cria um pedido de exportação para o próprio utilizador. Entradas: `actor`: Utilizador autenticado. Devolve: Pedido criado.
- `PrivacyDataExportsService.listMine(actor)` (pública; método de classe) - Lista pedidos próprios. Entradas: `actor`: Utilizador autenticado. Devolve: Pedidos recentes.
- `PrivacyDataExportsService.download(actor, requestId)` (pública; método de classe) - Gera bundle JSON sem persistir cópia adicional de dados pessoais. Entradas: `actor`: Utilizador autenticado.; `requestId`: Pedido de exportação próprio. Devolve: Bundle minimizado.
- `PrivacyDataExportsService.notFound()` (privada; método de classe) - Executa not found no domínio de exportação de dados pessoais, aplicando validações, autorização e persistência de forma coesa. Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário. Entradas: sem entradas explícitas. Devolve: Exceção estruturada pronta a ser lançada pelo service ou controller.
- `PrivacyDataExportsService.toRequestView(request)` (privada; método de classe) - Transforma o documento interno de exportação de dados pessoais num contrato público, removendo detalhes de persistência antes de responder à UI. Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/private-area-ai/private-area-ai.controller.ts`

- `PrivateAreaAiController.ask(request, studyAreaId, body)` (pública; método de classe) - Orquestra uma pergunta de IA em IA privada da área de estudo, limitando contexto e validando a resposta antes de a devolver. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `studyAreaId`: Identificador da área de estudo; mantém materiais e IA dentro do espaço privado do aluno.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Resposta validada, limitada às fontes e pronta para persistência ou apresentação.

### `real_dev/api/src/modules/private-area-ai/private-area-ai.service.ts`

- `PrivateAreaAiService.ask(actor, studyAreaId, input)` (pública; método de classe) - Orquestra uma pergunta de IA em IA privada da área de estudo, limitando contexto e validando a resposta antes de a devolver. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `studyAreaId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Resultado da operação no formato esperado pelo chamador.
- `PrivateAreaAiService.estimateUsageUnits(prompt)` (privada; método de classe) - Executa estimate usage units no domínio de IA da área privada, aplicando validações, autorização e persistência de forma coesa. Entradas: `prompt`: Valor de prompt usado pela função para executar estimate usage units com dados explícitos. Devolve: Número calculado para o chamador usar em contadores, limites ou ordenação.
- `PrivateAreaAiService.validateResult(result, allowedIds)` (privada; método de classe) - Confirma que os dados de IA privada da área de estudo cumprem o contrato antes de serem persistidos ou apresentados. Entradas: `result`: Resultado devolvido por uma operação externa antes da validação final.; `allowedIds`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/api/src/modules/private-area-ai/prompts/private-area-ai.prompt.ts`

- `buildPrivateAreaAiPrompt(input)` (exportada; função) - Constrói prompt restrito aos materiais privados do aluno. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.

### `real_dev/api/src/modules/project-ai/project-ai.controller.ts`

- `ProjectAiController.create(request, projectId, body)` (pública; método de classe) - Recebe o pedido de criação de planeamento de projetos com IA e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `projectId`: Identificador de project que delimita ownership, membership ou relação de domínio.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de planeamento de projetos com IA criado no formato público esperado pela UI ou pelo teste.

### `real_dev/api/src/modules/project-ai/project-ai.service.ts`

- `ProjectAiService.createPlan(actor, projectId, input)` (pública; método de classe) - Cria planeamento de projetos com IA depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `projectId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Resultado da operação no formato esperado pelo chamador.
- `ProjectAiService.estimateUsageUnits(prompt)` (privada; método de classe) - Executa estimate usage units no domínio de planeamento de projetos com IA, aplicando validações, autorização e persistência de forma coesa. Entradas: `prompt`: Valor de prompt usado pela função para executar estimate usage units com dados explícitos. Devolve: Número calculado para o chamador usar em contadores, limites ou ordenação.
- `ProjectAiService.validateResult(result)` (privada; método de classe) - Confirma que os dados de planeamento de projetos com IA cumprem o contrato antes de serem persistidos ou apresentados. Entradas: `result`: Resultado devolvido por uma operação externa antes da validação final. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/api/src/modules/project-ai/prompts/project-ai.prompt.ts`

- `buildProjectAiPrompt(input)` (exportada; função) - Constrói prompt restrito ao enunciado oficial do projecto. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.

### `real_dev/api/src/modules/source-grounded-ai/citation-policy.ts`

- `normalizePublicCitation(citation)` (exportada; função) - Normaliza citacoes publicas para respostas de IA com fontes. Entradas: `citation`: Citacao candidata criada depois de validar a fonte. Devolve: Citacao segura para persistencia e resposta publica.

### `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`

- `SourceGroundedAiController.ask(request, body)` (pública; método de classe) - Cria uma resposta limitada ao job de indexação autorizado. Entradas: `request`: Pedido autenticado.; `body`: Job e pergunta. Devolve: Resposta com citações.

### `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`

- `SourceGroundedAiService.ask(actor, input)` (pública; método de classe) - Responde com base exclusiva nos jobs de indexação autorizados. Entradas: `actor`: Utilizador autenticado.; `input`: Pergunta e jobs alvo. Devolve: Resposta persistida com citações.
- `SourceGroundedAiService.selectChunks(job, question)` (privada; método de classe) - Escolhe os chunks mais relevantes por correspondência textual simples. Entradas: `job`: Job autorizado e concluído.; `question`: Pergunta do utilizador. Devolve: Até três chunks para citar.
- `SourceGroundedAiService.toCitationOrNull(job, chunk)` (privada; método de classe) - Converte um chunk interno numa citação pública. Entradas: `job`: Job autorizado.; `chunk`: Chunk indexado. Devolve: Citação com origem legível e excerto limitado.
- `SourceGroundedAiService.buildPrompt(question, citations)` (privada; método de classe) - Constrói o prompt final com fontes já autorizadas e limitadas por política. Entradas: `question`: Pergunta original.; `citations`: Citações autorizadas. Devolve: Prompt final a validar antes da reserva de quota e chamada externa.
- `SourceGroundedAiService.estimateUsageUnits(prompt)` (privada; método de classe) - Executa estimate usage units no domínio de IA apoiada em fontes autorizadas, aplicando validações, autorização e persistência de forma coesa. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `prompt`: Valor de prompt usado pela função para executar estimate usage units com dados explícitos. Devolve: Número calculado para o chamador usar em contadores, limites ou ordenação.
- `SourceGroundedAiService.generateAnswer(prompt, policy)` (privada; método de classe) - Chama o provider IA com um prompt limitado aos excertos citados e governado por política. Entradas: `prompt`: Prompt final já validado por consentimento, política e quota.; `policy`: Política efetiva resolvida para a finalidade SOURCE_GROUNDED_AI. Devolve: Resposta validada.

### `real_dev/api/src/modules/students/student-profile.controller.ts`

- `StudentProfileController.getMyProfile(request)` (pública; método de classe) - Devolve o perfil do aluno autenticado. Entradas: `request`: Pedido já enriquecido pelo `SessionGuard`. Devolve: Perfil existente ou `null`.
- `StudentProfileController.updateMyProfile(request, body)` (pública; método de classe) - Atualiza o perfil do aluno autenticado. Entradas: `request`: Pedido já enriquecido pelo `SessionGuard`.; `body`: Campos editáveis do perfil. Devolve: Perfil atualizado.

### `real_dev/api/src/modules/students/student-profile.service.ts`

- `StudentProfileService.getMyProfile(userId)` (pública; método de classe) - Obtém o perfil do aluno autenticado. Entradas: `userId`: Identificador do utilizador vindo da sessão. Devolve: Perfil existente ou `null` quando ainda não foi preenchido.
- `StudentProfileService.updateMyProfile(userId, input)` (pública; método de classe) - Cria ou atualiza apenas os campos editáveis do perfil. Entradas: `userId`: Identificador do utilizador vindo da sessão.; `input`: Campos permitidos pelo DTO. Devolve: Perfil atualizado.
- `StudentProfileService.optionalText(value)` (privada; método de classe) - Normaliza texto opcional para evitar guardar strings vazias. Entradas: `value`: Valor recebido do formulário. Devolve: Texto limpo ou `null` quando está vazio.

### `real_dev/api/src/modules/study-alerts/study-alerts.controller.ts`

- `StudyAlertsController.list(request, query)` (pública; método de classe) - Lista alertas in-app derivados dos contratos existentes. Entradas: `request`: Pedido autenticado.; `query`: Filtro opcional. Devolve: Alertas visíveis.

### `real_dev/api/src/modules/study-alerts/study-alerts.service.ts`

- `StudyAlertsService.listAlerts(actor, query)` (pública; método de classe) - Lista alertas in-app respeitando preferências por contexto. Entradas: `actor`: Aluno autenticado.; `query`: Filtros opcionais. Devolve: Alertas internos.
- `StudyAlertsService.fromRoutine(routine)` (privada; método de classe) - Converte rotina num alerta interno. Entradas: `routine`: Rotina pessoal. Devolve: Alerta de rotina.
- `StudyAlertsService.fromGoal(goal)` (privada; método de classe) - Converte objetivo num alerta interno. Entradas: `goal`: Objetivo pessoal. Devolve: Alerta de objetivo.
- `StudyAlertsService.formatDate(value)` (privada; método de classe) - Formata data em PT-PT para resposta pública. Entradas: `value`: Data alvo. Devolve: Data formatada.
- `StudyAlertsService.formatDateTime(value)` (privada; método de classe) - Formata data/hora em PT-PT para alertas. Entradas: `value`: Data da sessão. Devolve: Data e hora formatadas.

### `real_dev/api/src/modules/study-areas/dto/public-study-area.dto.ts`

- `toPublicStudyArea(area)` (exportada; função) - Converte uma área de estudo no contrato público da MF0. Entradas: `area`: Valor de area usado pela função para executar to public study area com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.
- `normalizeDocument(value)` (top-level; função) - Usa `toObject` quando existe para lidar com documentos Mongoose. Entradas: `value`: Documento ou objeto já serializado. Devolve: Objeto serializável.

### `real_dev/api/src/modules/study-areas/study-area-voice.controller.ts`

- `StudyAreaVoiceController.update(request, id, body)` (pública; método de classe) - Atualiza tom, detalhe e notas pedagógicas da área. Entradas: `request`: Pedido autenticado.; `id`: Identificador da área.; `body`: Preferências de voz. Devolve: Área atualizada.

### `real_dev/api/src/modules/study-areas/study-area-voice.service.ts`

- `StudyAreaVoiceService.updateVoice(userId, areaId, input)` (pública; método de classe) - Atualiza o tom e nível de detalhe da área autenticada. Entradas: `userId`: Identificador vindo da sessão.; `areaId`: Identificador da área.; `input`: Preferências de voz. Devolve: Área atualizada com campos de voz.
- `StudyAreaVoiceService.validateVoice(input)` (privada; método de classe) - Valida enums de voz sem depender apenas de validação Mongoose. Entradas: `input`: Preferências enviadas pelo frontend. Devolve: Nada quando os valores são válidos.
- `StudyAreaVoiceService.sanitizeVoiceNotes(value)` (privada; método de classe) - Normaliza notas livres para texto simples antes de persistir. Entradas: `value`: Texto opcional recebido do frontend. Devolve: Texto limpo ou `undefined` quando fica vazio.

### `real_dev/api/src/modules/study-areas/study-areas.controller.ts`

- `StudyAreasController.list(request)` (pública; método de classe) - Lista as áreas do aluno autenticado. Entradas: `request`: Pedido autenticado. Devolve: Lista de áreas não arquivadas.
- `StudyAreasController.create(request, body)` (pública; método de classe) - Cria uma área de estudo pessoal. Entradas: `request`: Pedido autenticado.; `body`: Dados da nova área. Devolve: Área criada.
- `StudyAreasController.detail(request, id)` (pública; método de classe) - Obtém detalhe de uma área do aluno. Entradas: `request`: Pedido autenticado.; `id`: Identificador da área. Devolve: Área encontrada.
- `StudyAreasController.update(request, id, body)` (pública; método de classe) - Atualiza campos editáveis da área. Entradas: `request`: Pedido autenticado.; `id`: Identificador da área.; `body`: Campos a alterar. Devolve: Área atualizada.

### `real_dev/api/src/modules/study-areas/study-areas.service.ts`

- `StudyAreasService.listMyStudyAreas(userId)` (pública; método de classe) - Lista áreas ativas do aluno autenticado. Entradas: `userId`: Identificador vindo da sessão. Devolve: Áreas não arquivadas ordenadas por nome.
- `StudyAreasService.countMyStudyAreas(userId)` (pública; método de classe) - Conta áreas ativas do aluno. Entradas: `userId`: Identificador vindo da sessão. Devolve: Número de áreas ativas.
- `StudyAreasService.getMyStudyArea(userId, areaId)` (pública; método de classe) - Obtém uma área, validando ownership. Entradas: `userId`: Identificador vindo da sessão.; `areaId`: Identificador da área. Devolve: Área encontrada.
- `StudyAreasService.createStudyArea(userId, input)` (pública; método de classe) - Cria uma nova área de estudo para o aluno autenticado. Entradas: `userId`: Identificador vindo da sessão.; `input`: Dados da área. Devolve: Área criada.
- `StudyAreasService.updateStudyArea(userId, areaId, input)` (pública; método de classe) - Atualiza uma área de estudo do aluno autenticado. Entradas: `userId`: Identificador vindo da sessão.; `areaId`: Identificador da área.; `input`: Campos editáveis. Devolve: Área atualizada.
- `StudyAreasService.notFound()` (privada; método de classe) - Cria a exceção padronizada de área não encontrada. Entradas: sem entradas explícitas. Devolve: Exceção `NotFoundException`.
- `StudyAreasService.duplicatedAreaName()` (privada; método de classe) - Cria o erro público para nome de área duplicado. Entradas: sem entradas explícitas. Devolve: Exceção `ConflictException`.

### `real_dev/api/src/modules/study-group-ai/study-group-ai.controller.ts`

- `StudyGroupAiController.ask(request, groupId, body)` (pública; método de classe) - Responde com base nas fontes partilhadas do grupo. Entradas: `request`: Pedido autenticado.; `groupId`: Grupo alvo.; `body`: Pergunta e fontes opcionais. Devolve: Resposta coletiva.

### `real_dev/api/src/modules/study-group-ai/study-group-ai.service.ts`

- `StudyGroupAiService.ask(actor, groupId, input)` (pública; método de classe) - Responde a uma pergunta coletiva usando apenas partilhas processáveis. Entradas: `actor`: Aluno autenticado.; `groupId`: Grupo alvo.; `input`: Pergunta e fontes opcionais. Devolve: Resposta guardada com fontes.
- `StudyGroupAiService.generateAnswer(prompt, options)` (privada; método de classe) - Chama o provider IA com prompt já limitado e autorizado. Entradas: `prompt`: Prompt coletivo.; `options`: Opções técnicas vindas da política administrativa. Devolve: Resposta validada.
- `StudyGroupAiService.buildPrompt(question, sources)` (privada; método de classe) - Constrói build prompt no domínio de IA de grupos de estudo, aplicando validações, autorização e persistência de forma coesa. Entradas: `question`: Valor de question usado pela função para executar build prompt com dados explícitos.; `sources`: Valor de sources usado pela função para executar build prompt com dados explícitos. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `StudyGroupAiService.estimateUsageUnits(prompt)` (privada; método de classe) - Executa estimate usage units no domínio de IA de grupos de estudo, aplicando validações, autorização e persistência de forma coesa. Entradas: `prompt`: Valor de prompt usado pela função para executar estimate usage units com dados explícitos. Devolve: Número calculado para o chamador usar em contadores, limites ou ordenação.

### `real_dev/api/src/modules/study-group-messages/study-group-messages.controller.ts`

- `StudyGroupMessagesController.list(request, groupId)` (pública; método de classe) - Lista o histórico do grupo. Entradas: `request`: Pedido autenticado.; `groupId`: Grupo alvo. Devolve: Mensagens e notas.
- `StudyGroupMessagesController.create(request, groupId, body)` (pública; método de classe) - Cria mensagem ou nota. Entradas: `request`: Pedido autenticado.; `groupId`: Grupo alvo.; `body`: Conteúdo validado. Devolve: Mensagem criada.

### `real_dev/api/src/modules/study-group-messages/study-group-messages.service.ts`

- `StudyGroupMessagesService.createMessage(actor, groupId, input)` (pública; método de classe) - Cria uma mensagem ou nota após validar membership. Entradas: `actor`: Aluno autenticado.; `groupId`: Grupo alvo.; `input`: Conteúdo validado. Devolve: Mensagem pública.
- `StudyGroupMessagesService.listMessages(actor, groupId)` (pública; método de classe) - Lista histórico do grupo visível apenas a membros. Entradas: `actor`: Aluno autenticado.; `groupId`: Grupo alvo. Devolve: Mensagens ordenadas.
- `StudyGroupMessagesService.toMessageView(message)` (privada; método de classe) - Converte documento interno em contrato público. Entradas: `message`: Documento ou objeto lean. Devolve: Mensagem pública.

### `real_dev/api/src/modules/study-group-sessions/study-group-sessions.controller.ts`

- `StudyGroupSessionsController.list(request, groupId)` (pública; método de classe) - Lista sessões do grupo. Entradas: `request`: Pedido autenticado.; `groupId`: Grupo alvo. Devolve: Sessões acessíveis.
- `StudyGroupSessionsController.create(request, groupId, body)` (pública; método de classe) - Agenda uma sessão no grupo. Entradas: `request`: Pedido autenticado.; `groupId`: Grupo alvo.; `body`: Dados validados. Devolve: Sessão criada.

### `real_dev/api/src/modules/study-group-sessions/study-group-sessions.service.ts`

- `StudyGroupSessionsService.createSession(actor, groupId, input)` (pública; método de classe) - Agenda uma sessão para membros do grupo. Entradas: `actor`: Aluno autenticado.; `groupId`: Grupo alvo.; `input`: Dados da sessão. Devolve: Sessão criada.
- `StudyGroupSessionsService.listGroupSessions(actor, groupId)` (pública; método de classe) - Lista sessões de um grupo validando membership. Entradas: `actor`: Aluno autenticado.; `groupId`: Grupo alvo. Devolve: Sessões ordenadas por data.
- `StudyGroupSessionsService.listUpcomingForStudent(actor)` (pública; método de classe) - Lista próximas sessões de todos os grupos do aluno. Entradas: `actor`: Aluno autenticado. Devolve: Sessões futuras acessíveis ao aluno.
- `StudyGroupSessionsService.toSessionView(session)` (privada; método de classe) - Converte documento interno em contrato público. Entradas: `session`: Documento ou objeto lean. Devolve: Sessão pública.

### `real_dev/api/src/modules/study-groups/study-groups.controller.ts`

- `StudyGroupsController.list(request)` (pública; método de classe) - Lista grupos acessíveis ao aluno. Entradas: `request`: Pedido autenticado. Devolve: Grupos do aluno.
- `StudyGroupsController.create(request, body)` (pública; método de classe) - Cria um grupo de estudo. Entradas: `request`: Pedido autenticado.; `body`: Dados do grupo. Devolve: Grupo criado.

### `real_dev/api/src/modules/study-groups/study-groups.service.ts`

- `StudyGroupsService.createGroup(actor, input)` (pública; método de classe) - Cria um grupo e adiciona automaticamente o criador como membro. Entradas: `actor`: Aluno autenticado.; `input`: Dados do grupo. Devolve: Grupo público.
- `StudyGroupsService.listMyGroups(actor)` (pública; método de classe) - Lista os grupos onde o aluno autenticado é membro. Entradas: `actor`: Aluno autenticado. Devolve: Grupos acessíveis.
- `StudyGroupsService.ensureMember(studentId, groupId)` (pública; método de classe) - Confirma membership no grupo. Entradas: `studentId`: Aluno autenticado.; `groupId`: Grupo/sala. Devolve: Grupo validado.
- `StudyGroupsService.toGroupView(room)` (privada; método de classe) - Converte o contrato de sala no contrato público de grupos. Entradas: `room`: Valor de room usado pela função para executar to group view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts`

- `parseRoomAiShareMode(mode)` (exportada; função) - Normaliza o modo recebido antes de o service tocar na persistência. Entradas: `mode`: Valor recebido no body HTTP. Devolve: Modo validado e seguro para a operação.

### `real_dev/api/src/modules/study-rooms/prompts/room-ai.prompt.ts`

- `buildRoomAiPrompt(input)` (exportada; função) - Constrói prompt para a IA da sala com fontes já autorizadas. Entradas: `input`: Pergunta, fontes validadas por membership e contexto pedagogico do aluno que pergunta. Devolve: Prompt com contrato JSON.

### `real_dev/api/src/modules/study-rooms/room-ai-history.ts`

- `toPrivateRoomAiHistory(actor, roomId, rows)` (exportada; função) - Converte interações persistidas numa resposta privada para o aluno autenticado. Entradas: `actor`: Aluno autenticado vindo da sessão segura.; `roomId`: Identificador da sala validada pelo service.; `rows`: Documentos devolvidos pela query privada do histórico. Devolve: Lista pronta para expor no endpoint público.

### `real_dev/api/src/modules/study-rooms/room-ai-pedagogy.ts`

- `resolveRoomAiPedagogicalContext(year)` (exportada; função) - Converte o campo livre `year` do perfil do aluno num contexto pedagogico seguro. Entradas: `year`: Ano escolar escrito pelo aluno no perfil. Devolve: Contexto pedagogico normalizado para o prompt da IA da sala.
- `normalizeYear(year)` (top-level; função) - Normaliza texto livre sem tentar inferir idade a partir de numeros soltos fora do intervalo escolar. Entradas: `year`: Valor do campo ano. Devolve: Texto normalizado para matching.
- `extractSchoolYear(normalizedYear)` (top-level; função) - Extrai anos escolares portugueses usuais, aceitando "4 ano", "4o ano" ou apenas "4". Entradas: `normalizedYear`: Texto normalizado. Devolve: Ano entre 1 e 12 ou null quando nao ha ano escolar reconhecivel.
- `formatSchoolYear(yearNumber)` (top-level; função) - Formata o ano escolar de forma consistente para documentacao interna do prompt. Entradas: `yearNumber`: Ano numerico entre 1 e 12. Devolve: Label em portugues.
- `buildContext(stage, yearLabel)` (top-level; função) - Cria o objeto final usado pelo prompt, mantendo labels e instrucoes num ponto unico. Entradas: `stage`: Etapa pedagogica resolvida.; `yearLabel`: Ano escolar normalizado ou null. Devolve: Contexto pedagogico pronto para prompt.

### `real_dev/api/src/modules/study-rooms/room-ai-sharing.service.ts`

- `RoomAiSharingService.listSharedAnswers(actor, roomId)` (pública; método de classe) - Lista respostas marcadas como partilhadas na sala. Entradas: `actor`: Aluno autenticado vindo da sessão segura.; `roomId`: Identificador da sala. Devolve: Respostas partilhadas em modo read-only.
- `RoomAiSharingService.shareOrForkAnswer(actor, roomId, answerId, input)` (pública; método de classe) - Executa partilha read-only ou fork privado para uma resposta IA da sala. Entradas: `actor`: Aluno autenticado vindo da sessão segura.; `roomId`: Identificador da sala.; `answerId`: Identificador da resposta IA.; `input`: Modo da operação. Devolve: Resultado público da operação, sem campos internos de Mongoose.
- `RoomAiSharingService.shareOwnAnswer(roomObjectId, answerObjectId, actorObjectId)` (privada; método de classe) - Marca uma resposta própria como partilhada em read-only. Entradas: `roomObjectId`: Sala já validada.; `answerObjectId`: Resposta já validada.; `actorObjectId`: Aluno autenticado já validado. Devolve: Resultado público da partilha.
- `RoomAiSharingService.createPrivateFork(roomObjectId, answerObjectId, actorObjectId)` (privada; método de classe) - Cria uma cópia privada a partir de uma resposta já partilhada. Entradas: `roomObjectId`: Sala já validada.; `answerObjectId`: Resposta já validada.; `actorObjectId`: Aluno autenticado já validado. Devolve: Resultado público do fork privado.
- `RoomAiSharingService.toObjectId(value, code, message)` (privada; método de classe) - Converte string para ObjectId com erro HTTP explícito. Entradas: `value`: Valor recebido do pedido ou da sessão.; `code`: Código estável para a UI e testes.; `message`: Mensagem pública em PT-PT. Devolve: ObjectId validado.
- `RoomAiSharingService.parseMode(mode)` (privada; método de classe) - Converte o modo textual para o union type usado no domínio. Entradas: `mode`: Modo recebido no body. Devolve: Modo seguro para a operação.
- `RoomAiSharingService.toAnswerView(answer)` (privada; método de classe) - Mapeia o documento persistido para resposta pública. Entradas: `answer`: Interação persistida já autorizada pelo service. Devolve: Vista pública da resposta IA.
- `RoomAiSharingService.answerNotFound()` (privada; método de classe) - Evita revelar se a resposta existe fora da sala ou pertence a outro aluno. Entradas: sem entradas explícitas. Devolve: Exceção pública e estável.

### `real_dev/api/src/modules/study-rooms/room-ai.controller.ts`

- `RoomAiController.list(request, roomId, scope)` (pública; método de classe) - Lista respostas IA da sala dentro do scope pedido. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user`.; `roomId`: Identificador da sala; exige membership no service antes da leitura.; `scope`: Scope público: `mine` para histórico privado ou `shared` para respostas partilhadas. Devolve: Lista autorizada de respostas IA.
- `RoomAiController.ask(request, roomId, body)` (pública; método de classe) - Orquestra uma pergunta de IA em salas de estudo, limitando contexto e validando a resposta antes de a devolver. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `roomId`: Identificador da sala; exige membership antes de expor partilhas, mensagens ou respostas IA.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Resposta validada, limitada às fontes e pronta para persistência ou apresentação.
- `RoomAiController.share(request, roomId, answerId, body)` (pública; método de classe) - Partilha uma resposta própria ou cria uma cópia privada de resposta partilhada. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user`.; `roomId`: Identificador da sala; exige membership antes de ler ou escrever respostas.; `answerId`: Identificador da resposta IA alvo.; `body`: Modo de reutilização da resposta. Devolve: Resultado público da operação.

### `real_dev/api/src/modules/study-rooms/room-ai.service.ts`

- `RoomAiService.listMyRoomAiHistory(actor, roomId)` (pública; método de classe) - Lista apenas as interações IA da sala criadas pelo aluno autenticado. Entradas: `actor`: Utilizador autenticado vindo da sessão; define o dono do histórico.; `roomId`: Identificador da sala; exige membership antes de qualquer leitura. Devolve: Histórico privado ordenado da interação mais recente para a mais antiga.
- `RoomAiService.askRoomAi(actor, roomId, input)` (pública; método de classe) - Orquestra uma pergunta de IA em salas de estudo, limitando contexto e validando a resposta antes de a devolver. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `roomId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Resultado da operação no formato esperado pelo chamador.
- `RoomAiService.validateResult(result, sources)` (privada; método de classe) - Confirma que os dados de salas de estudo cumprem o contrato antes de serem persistidos ou apresentados. Entradas: `result`: Resultado devolvido por uma operação externa antes da validação final.; `sources`: Valor de sources usado pela função para executar validate result com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/api/src/modules/study-rooms/room-shares.controller.ts`

- `RoomSharesController.create(request, roomId, body)` (pública; método de classe) - Recebe o pedido de criação de salas de estudo e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `roomId`: Identificador da sala; exige membership antes de expor partilhas, mensagens ou respostas IA.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de salas de estudo criado no formato público esperado pela UI ou pelo teste.
- `RoomSharesController.list(request, roomId)` (pública; método de classe) - Recebe o pedido de listagem de salas de estudo e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `roomId`: Identificador da sala; exige membership antes de expor partilhas, mensagens ou respostas IA. Devolve: Coleção de salas de estudo visível para o contexto autorizado.

### `real_dev/api/src/modules/study-rooms/room-shares.service.ts`

- `RoomSharesService.createShare(actor, roomId, input)` (pública; método de classe) - Cria salas de estudo depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `roomId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `RoomSharesService.listRoomShares(actor, roomId)` (pública; método de classe) - Lista salas de estudo já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `roomId`: Identificador da sala; exige membership antes de expor partilhas, mensagens ou respostas IA. Devolve: Coleção de salas de estudo visível para o contexto autorizado.
- `RoomSharesService.findUsableSharesForRoom(studentId, roomId, sourceIds)` (pública; método de classe) - Lista fontes processáveis autorizadas para IA da sala. Entradas: `studentId`: Aluno autenticado.; `roomId`: Sala onde membership é obrigatória.; `sourceIds`: Filtro opcional enviado pelo aluno. Devolve: Fontes textuais da sala.
- `RoomSharesService.findOwnMaterial(studentId, materialId)` (privada; método de classe) - Procura salas de estudo com filtros de ownership, membership ou estado para evitar leituras indevidas. Entradas: `studentId`: Identificador de student que delimita ownership, membership ou relação de domínio.; `materialId`: Identificador do material; confirma ownership ou pertença à disciplina antes da operação. Devolve: Entidade de salas de estudo já filtrada pelo contexto recebido.
- `RoomSharesService.parseSafeUrl(value)` (privada; método de classe) - Converte e valida valores de salas de estudo, rejeitando entradas que poderiam quebrar segurança ou consistência. Entradas: `value`: Valor bruto recebido antes de normalização, parsing ou validação. Devolve: Valor normalizado e seguro para ser usado pelo restante fluxo.
- `RoomSharesService.invalidSharePayload()` (privada; método de classe) - Constrói uma exceção de salas de estudo com código previsível para API, UI e testes. Entradas: sem entradas explícitas. Devolve: Exceção padronizada com código estável para controllers e testes.
- `RoomSharesService.materialNotFound()` (privada; método de classe) - Constrói uma exceção de salas de estudo com código previsível para API, UI e testes. Entradas: sem entradas explícitas. Devolve: Exceção estruturada pronta a ser lançada pelo service ou controller.
- `RoomSharesService.toShareView(share)` (privada; método de classe) - Mapeia o documento interno de salas de estudo para uma forma pública estável e simples de consumir. Entradas: `share`: Valor de share usado pela função para executar to share view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/study-rooms/study-rooms.controller.ts`

- `StudyRoomsController.create(request, body)` (pública; método de classe) - Recebe o pedido de criação de salas de estudo e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de salas de estudo criado no formato público esperado pela UI ou pelo teste.
- `StudyRoomsController.list(request)` (pública; método de classe) - Recebe o pedido de listagem de salas de estudo e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão. Devolve: Coleção de salas de estudo visível para o contexto autorizado.
- `StudyRoomsController.addMember(request, roomId, body)` (pública; método de classe) - Executa a operação add member no domínio de salas de estudo com contrato explícito. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `roomId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/api/src/modules/study-rooms/study-rooms.service.ts`

- `StudyRoomsService.createRoom(actor, input)` (pública; método de classe) - Cria salas de estudo depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `StudyRoomsService.listMyRooms(actor)` (pública; método de classe) - Lista salas de estudo já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership. Devolve: Coleção de salas de estudo visível para o contexto autorizado.
- `StudyRoomsService.addMember(actor, roomId, input)` (pública; método de classe) - Executa a operação add member no domínio de salas de estudo com contrato explícito. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `roomId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `StudyRoomsService.ensureMember(studentId, roomId)` (pública; método de classe) - Confirma que um aluno pertence à sala. Entradas: `studentId`: Identificador vindo da sessão.; `roomId`: Identificador da sala. Devolve: Sala encontrada.
- `StudyRoomsService.assertStudent(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `StudyRoomsService.roomNotFound()` (privada; método de classe) - Constrói uma exceção de salas de estudo com código previsível para API, UI e testes. Entradas: sem entradas explícitas. Devolve: Exceção estruturada pronta a ser lançada pelo service ou controller.
- `StudyRoomsService.toRoomView(room)` (privada; método de classe) - Mapeia o documento interno de salas de estudo para uma forma pública estável e simples de consumir. Entradas: `room`: Valor de room usado pela função para executar to room view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/study/dto/public-study-plan.dto.ts`

- `toPublicStudyRoutine(routine)` (exportada; função) - Converte uma rotina persistida no contrato público da MF0. Entradas: `routine`: Documento Mongoose ou objeto lean. Devolve: Rotina sem `userId` nem campos internos Mongo.
- `toPublicStudyGoal(goal)` (exportada; função) - Converte um objetivo persistido no contrato público da MF0. Entradas: `goal`: Documento Mongoose ou objeto lean. Devolve: Objetivo sem `userId` nem campos internos Mongo.
- `normalizeDocument(value)` (top-level; função) - Usa `toObject` quando existe para lidar com documentos Mongoose. Entradas: `value`: Documento ou objeto já serializado. Devolve: Objeto serializável.

### `real_dev/api/src/modules/study/history.controller.ts`

- `HistoryController.list(request, query)` (pública; método de classe) - Lista os eventos do aluno autenticado. Entradas: `request`: Pedido autenticado.; `query`: Filtros opcionais de listagem. Devolve: Eventos recentes de estudo.

### `real_dev/api/src/modules/study/history.service.ts`

- `HistoryService.listMyEvents(userId, limit)` (pública; método de classe) - Lista os eventos do aluno autenticado por ordem cronológica inversa. Entradas: `userId`: Identificador vindo da sessão.; `limit`: Número máximo de eventos a devolver. Devolve: Lista de eventos formatados para a API.
- `HistoryService.recordEvent(userId, type, title, description)` (pública; método de classe) - Regista um evento de estudo para o aluno. Entradas: `userId`: Identificador vindo da sessão.; `type`: Tipo canónico do evento.; `title`: Título curto visível no histórico.; `description`: Descrição opcional para contexto. Devolve: Evento criado.

### `real_dev/api/src/modules/study/routines.controller.ts`

- `RoutinesController.list(request)` (pública; método de classe) - Lista rotinas e objetivos pessoais. Entradas: `request`: Pedido autenticado. Devolve: Rotinas e objetivos do aluno.
- `RoutinesController.listGoals(request)` (pública; método de classe) - Lista objetivos pessoais. Entradas: `request`: Pedido autenticado. Devolve: Objetivos ativos do aluno.
- `RoutinesController.createRoutine(request, body)` (pública; método de classe) - Cria uma rotina pessoal. Entradas: `request`: Pedido autenticado.; `body`: Dados da rotina. Devolve: Rotina criada.
- `RoutinesController.updateRoutine(request, id, body)` (pública; método de classe) - Atualiza uma rotina pessoal. Entradas: `request`: Pedido autenticado.; `id`: Identificador da rotina.; `body`: Campos editáveis. Devolve: Rotina atualizada.
- `RoutinesController.archiveRoutine(request, id)` (pública; método de classe) - Arquiva uma rotina pessoal. Entradas: `request`: Pedido autenticado.; `id`: Identificador da rotina. Devolve: Estado simples de sucesso.
- `RoutinesController.createGoal(request, body)` (pública; método de classe) - Cria um objetivo pessoal. Entradas: `request`: Pedido autenticado.; `body`: Dados do objetivo. Devolve: Objetivo criado.
- `RoutinesController.updateGoal(request, id, body)` (pública; método de classe) - Atualiza um objetivo pessoal. Entradas: `request`: Pedido autenticado.; `id`: Identificador do objetivo.; `body`: Campos editáveis. Devolve: Objetivo atualizado.
- `RoutinesController.archiveGoal(request, id)` (pública; método de classe) - Arquiva um objetivo pessoal. Entradas: `request`: Pedido autenticado.; `id`: Identificador do objetivo. Devolve: Estado simples de sucesso.

### `real_dev/api/src/modules/study/routines.service.ts`

- `RoutinesService.listMine(userId)` (pública; método de classe) - Lista rotinas e objetivos do aluno autenticado. Entradas: `userId`: Identificador vindo da sessão. Devolve: Objeto com arrays `routines` e `goals`.
- `RoutinesService.listGoals(userId)` (pública; método de classe) - Lista objetivos ativos do aluno autenticado. Entradas: `userId`: Identificador vindo da sessão. Devolve: Objetivos não arquivados do aluno.
- `RoutinesService.countRoutines(userId)` (pública; método de classe) - Conta rotinas do aluno para o dashboard individual. Entradas: `userId`: Identificador vindo da sessão. Devolve: Número de rotinas persistidas.
- `RoutinesService.createRoutine(userId, input)` (pública; método de classe) - Cria uma rotina de estudo. Entradas: `userId`: Identificador vindo da sessão.; `input`: Dados da rotina. Devolve: Rotina criada.
- `RoutinesService.updateRoutine(userId, routineId, input)` (pública; método de classe) - Atualiza uma rotina pertencente ao aluno autenticado. Entradas: `userId`: Identificador vindo da sessão.; `routineId`: Identificador da rotina.; `input`: Campos editáveis. Devolve: Rotina atualizada.
- `RoutinesService.archiveRoutine(userId, routineId)` (pública; método de classe) - Arquiva uma rotina sem apagar fisicamente. Entradas: `userId`: Identificador vindo da sessão.; `routineId`: Identificador da rotina. Devolve: Estado simples de sucesso.
- `RoutinesService.createGoal(userId, input)` (pública; método de classe) - Cria um objetivo de estudo. Entradas: `userId`: Identificador vindo da sessão.; `input`: Dados do objetivo. Devolve: Objetivo criado.
- `RoutinesService.updateGoal(userId, goalId, input)` (pública; método de classe) - Atualiza um objetivo pertencente ao aluno autenticado. Entradas: `userId`: Identificador vindo da sessão.; `goalId`: Identificador do objetivo.; `input`: Campos editáveis. Devolve: Objetivo atualizado.
- `RoutinesService.archiveGoal(userId, goalId)` (pública; método de classe) - Arquiva um objetivo sem apagar fisicamente. Entradas: `userId`: Identificador vindo da sessão.; `goalId`: Identificador do objetivo. Devolve: Estado simples de sucesso.
- `RoutinesService.parseOptionalDate(value)` (privada; método de classe) - Valida e converte datas opcionais. Entradas: `value`: Data ISO opcional vinda do frontend. Devolve: Date ou undefined.
- `RoutinesService.notFound(resource)` (privada; método de classe) - Cria erro de recurso pessoal não encontrado. Entradas: `resource`: Nome curto do recurso. Devolve: Exceção `NotFoundException`.

### `real_dev/api/src/modules/study/solo-study.controller.ts`

- `SoloStudyController.getSoloStudyState(request)` (pública; método de classe) - Devolve estado inicial do modo individual. Entradas: `request`: Pedido autenticado. Devolve: Estado do dashboard individual.

### `real_dev/api/src/modules/study/solo-study.service.ts`

- `SoloStudyService.getSoloStudyState(userId)` (pública; método de classe) - Constrói o estado base do dashboard individual. Entradas: `userId`: Identificador do aluno autenticado. Devolve: Estado seguro para alunos com ou sem turma.

### `real_dev/api/src/modules/subjects/subjects.controller.ts`

- `SubjectsController.create(request, classId, body)` (pública; método de classe) - Recebe o pedido de criação de disciplinas e entrega ao service mantendo o controller fino. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de disciplinas criado no formato público esperado pela UI ou pelo teste.
- `SubjectsController.list(request, classId)` (pública; método de classe) - Recebe o pedido de listagem de disciplinas e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de disciplinas visível para o contexto autorizado.
- `SubjectsController.listStudent(request, classId)` (pública; método de classe) - Recebe o pedido de listagem de disciplinas e usa a sessão para limitar o âmbito. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de disciplinas visível para o contexto autorizado.

### `real_dev/api/src/modules/subjects/subjects.service.ts`

- `SubjectsService.createSubject(actor, classId, input)` (pública; método de classe) - Cria disciplinas depois de validar permissões, normalizar input e preparar o contrato público. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `classId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `SubjectsService.listTeacherClassSubjects(actor, classId)` (pública; método de classe) - Lista disciplinas já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de disciplinas visível para o contexto autorizado.
- `SubjectsService.listStudentClassSubjects(actor, classId)` (pública; método de classe) - Lista disciplinas já filtrado pelo utilizador autenticado ou pela relação de turma ou sala. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `classId`: Identificador da turma; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Coleção de disciplinas visível para o contexto autorizado.
- `SubjectsService.findOwnedSubject(teacherId, subjectId)` (pública; método de classe) - Procura disciplinas com filtros de ownership, membership ou estado para evitar leituras indevidas. Entradas: `teacherId`: Identificador de teacher que delimita ownership, membership ou relação de domínio.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Entidade de disciplinas já filtrada pelo contexto recebido.
- `SubjectsService.findSubjectForStudent(studentId, subjectId)` (pública; método de classe) - Obtém uma disciplina se o aluno estiver inscrito na turma respetiva. Entradas: `studentId`: Aluno autenticado.; `subjectId`: Disciplina pedida. Devolve: Disciplina e turma associada.
- `SubjectsService.subjectNotFound()` (privada; método de classe) - Executa a operação disciplina not found no domínio de disciplinas com contrato explícito. Entradas: sem entradas explícitas. Devolve: Exceção estruturada pronta a ser lançada pelo service ou controller.
- `SubjectsService.assertTeacher(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `SubjectsService.assertStudent(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `SubjectsService.duplicatedName()` (privada; método de classe) - Constrói uma exceção de disciplinas com código previsível para API, UI e testes. Entradas: sem entradas explícitas. Devolve: Exceção padronizada com código estável para controllers e testes.
- `SubjectsService.toSubjectView(subject)` (privada; método de classe) - Mapeia o documento interno de disciplinas para uma forma pública estável e simples de consumir. Entradas: `subject`: Valor de subject usado pela função para executar to subject view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.

### `real_dev/api/src/modules/teacher-student-chat/teacher-student-chat.controller.ts`

- `TeacherStudentChatController.listStudentMessages(request, subjectId)` (pública; método de classe) - Lista o histórico persistido do chat de uma disciplina para aluno inscrito. Entradas: `request`: Pedido autenticado pelo `SessionGuard`.; `subjectId`: Identificador da disciplina. Devolve: Últimas mensagens autorizadas em ordem cronológica.
- `TeacherStudentChatController.listTeacherMessages(request, subjectId)` (pública; método de classe) - Lista o histórico persistido do chat de uma disciplina para o professor responsável. Entradas: `request`: Pedido autenticado pelo `SessionGuard`.; `subjectId`: Identificador da disciplina. Devolve: Últimas mensagens autorizadas em ordem cronológica.

### `real_dev/api/src/modules/teacher-student-chat/teacher-student-chat.gateway.ts`

- `TeacherStudentChatGateway.handleConnection(client)` (pública; método de classe) - Valida `Origin`, extrai o cookie `sf_sid` e anexa o utilizador autenticado à socket. Entradas: `client`: Socket ligada ao namespace `/subject-chat`. Devolve: Promise resolvida quando a sessão fica validada, ou erro público antes de desligar.
- `TeacherStudentChatGateway.handleJoin(client, payload)` (pública; método de classe) - Junta uma socket autorizada à room da disciplina. Entradas: `client`: Socket autenticada.; `payload`: Objeto com `subjectId`. Devolve: Não devolve payload; em caso de falha emite `subject-chat:error`.
- `TeacherStudentChatGateway.handleSend(client, payload)` (pública; método de classe) - Valida, persiste e emite uma mensagem para a room da disciplina. Entradas: `client`: Socket autenticada.; `payload`: Objeto com `subjectId` e `text`. Devolve: Não devolve payload; mensagens válidas são emitidas por `subject-chat:message`.

### `real_dev/api/src/modules/teacher-student-chat/teacher-student-chat.service.ts`

- `TeacherStudentChatService.listStudentMessages(actor, subjectId)` (pública; método de classe) - Carrega histórico do chat depois de confirmar que o aluno está inscrito na disciplina. Entradas: `actor`: Utilizador autenticado vindo da sessão.; `subjectId`: Disciplina alvo. Devolve: Mensagens públicas sem emails nem dados de sessão.
- `TeacherStudentChatService.listTeacherMessages(actor, subjectId)` (pública; método de classe) - Carrega histórico do chat depois de confirmar que o professor é responsável pela disciplina. Entradas: `actor`: Utilizador autenticado vindo da sessão.; `subjectId`: Disciplina alvo. Devolve: Mensagens públicas sem dados sensíveis.
- `TeacherStudentChatService.assertCanJoin(actor, subjectId)` (pública; método de classe) - Valida autorização para entrar no canal WebSocket da disciplina. Entradas: `actor`: Utilizador autenticado.; `subjectId`: Disciplina alvo. Devolve: Dados mínimos de acesso para calcular a room.
- `TeacherStudentChatService.sendMessage(actor, subjectId, text)` (pública; método de classe) - Valida papel, disciplina, texto e rate limit antes de persistir a mensagem. Entradas: `actor`: Utilizador autenticado.; `subjectId`: Disciplina alvo.; `text`: Texto submetido pela UI. Devolve: Mensagem pública já persistida.
- `TeacherStudentChatService.roomName(subjectId)` (pública; método de classe) - Calcula o nome estável da room Socket.IO por disciplina. Entradas: `subjectId`: Disciplina alvo. Devolve: String no formato `subject:<subjectId>`.

### `real_dev/api/src/modules/teacher-ai/teacher-ai-voice.controller.ts`

- `TeacherAiVoiceController.updateClassVoice(request, classId, body)` (pública; método de classe) - Atualiza voz da IA docente sem alterar a semântica pública do endpoint ou componente. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `request`: Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.; `classId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `body`: Payload validado recebido no pedido HTTP antes de ser entregue ao domínio. Devolve: Resultado da operação no formato esperado pelo chamador.
- `TeacherAiVoiceController.getClassVoice(request, classId)` (pública; método de classe) - Carrega voz base da IA docente para uma turma. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user`.; `classId`: Identificador da turma validado pelo service. Devolve: Entidade de voz da turma já filtrada pelo professor autenticado.
- `TeacherAiVoiceController.updateSubjectVoice(request, subjectId, body)` (pública; método de classe) - Atualiza o override de voz da IA docente de uma disciplina. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.; `body`: Payload validado pelo DTO do endpoint antes de chegar ao service. Devolve: Registo de voz da IA docente atualizado e normalizado para consumo externo.
- `TeacherAiVoiceController.getSubjectVoice(request, subjectId)` (pública; método de classe) - Carrega voz da IA docente no formato necessário ao próximo passo do fluxo. Entradas: `request`: Pedido HTTP já atravessado pelo guard, incluindo `request.user` quando o endpoint exige sessão.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Entidade de voz da IA docente já filtrada pelo contexto recebido.
- `TeacherAiVoiceController.deleteSubjectVoice(request, subjectId)` (pública; método de classe) - Remove o override de voz da disciplina e devolve a voz efetiva herdada. Entradas: `request`: Pedido HTTP autenticado.; `subjectId`: Identificador da disciplina. Devolve: Voz efetiva depois da remoção do override.

### `real_dev/api/src/modules/teacher-ai/teacher-ai-voice.service.ts`

- `TeacherAiVoiceService.getClassTeacherVoice(actor, classId)` (pública; método de classe) - Carrega voz base da IA docente para uma turma do professor. Entradas: `actor`: Utilizador autenticado vindo da sessão; valida role e ownership.; `classId`: Identificador da turma que define a voz base. Devolve: Voz da turma ou defaults quando ainda não existe configuração.
- `TeacherAiVoiceService.updateClassTeacherVoice(actor, classId, input)` (pública; método de classe) - Atualiza a voz base da IA docente de uma turma, incluindo tom, detalhe e orientações pedagógicas. Entradas: `actor`: Utilizador autenticado vindo da sessão; valida role e ownership.; `classId`: Identificador da turma que define a voz base.; `input`: Dados de voz normalizados pelo DTO. Devolve: Voz base da turma persistida.
- `TeacherAiVoiceService.getTeacherVoice(actor, subjectId)` (pública; método de classe) - Carrega a voz efetiva da disciplina: override próprio, voz da turma ou defaults. Entradas: `actor`: Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.; `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Entidade de voz da IA docente já filtrada pelo contexto recebido.
- `TeacherAiVoiceService.updateTeacherVoice(actor, subjectId, input)` (pública; método de classe) - Atualiza o override de voz da IA docente de uma disciplina. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.; `subjectId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `input`: Tom, detalhe e orientações pedagógicas, já alinhados com o DTO. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `TeacherAiVoiceService.deleteSubjectTeacherVoice(actor, subjectId)` (pública; método de classe) - Remove o override de voz da disciplina, fazendo-a voltar a herdar da turma. Entradas: `actor`: Utilizador autenticado vindo da sessão; valida role e ownership.; `subjectId`: Identificador da disciplina cujo override será removido. Devolve: Voz efetiva após remoção do override.
- `TeacherAiVoiceService.resolveTeacherVoice(input)` (pública; método de classe) - Resolve a voz efetiva para IA docente, respeitando a ordem override -> turma -> default. Entradas: `input`: Identificadores já validados pelo chamador. Devolve: Voz efetiva pronta para prompt ou UI.
- `TeacherAiVoiceService.findVoiceForSubject(subjectId)` (pública; método de classe) - Procura voz por disciplina no contrato antigo; preferir `resolveTeacherVoice` em novos fluxos. Entradas: `subjectId`: Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito. Devolve: Entidade de voz da IA docente já filtrada pelo contexto recebido.
- `TeacherAiVoiceService.defaultVoice(input)` (privada; método de classe) - Executa a operação default voice no domínio de voz da IA docente com contrato explícito. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Resultado da operação no formato esperado pelo chamador.
- `TeacherAiVoiceService.cleanRules(rules)` (privada; método de classe) - Normaliza as orientações da IA antes de as guardar: remove linhas vazias, apara espaços e limita a lista ao máximo suportado pelo DTO. Entradas: `rules`: Orientações pedagógicas recebidas no campo técnico `rules`. Devolve: Lista de orientações pronta para persistência e prompt.
- `TeacherAiVoiceService.assertTeacher(actor)` (privada; método de classe) - Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `actor`: Utilizador autenticado usado para validar permissões, ownership e âmbito da operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `TeacherAiVoiceService.toSubjectOverrideVoiceView(voice)` (privada; método de classe) - Mapeia o documento interno de voz de disciplina para uma forma pública estável. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `voice`: Valor de voice usado pela função para executar to subject override voice view com dados explícitos. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.
- `TeacherAiVoiceService.toClassBaseVoiceView(voice, context)` (privada; método de classe) - Mapeia o documento interno de voz base da turma para o contrato público. Entradas: `voice`: Documento persistido da voz base.; `context`: Contexto em que a voz está a ser lida. Devolve: Contrato público sem campos internos de persistência.

### `real_dev/api/src/modules/unified-search/unified-search.controller.ts`

- `UnifiedSearchController.search(request, body)` (pública; método de classe) - Pesquisa em jobs autorizados. Entradas: `request`: Pedido autenticado.; `body`: Query e jobs. Devolve: Resultados com origem.

### `real_dev/api/src/modules/unified-search/unified-search.service.ts`

- `UnifiedSearchService.search(actor, input)` (pública; método de classe) - Pesquisa em chunks autorizados e devolve origem de cada resultado. Entradas: `actor`: Utilizador autenticado.; `input`: Query e jobs alvo. Devolve: Resultados com excertos.
- `UnifiedSearchService.searchJob(job, query)` (privada; método de classe) - Pesquisa textual simples num job autorizado. Entradas: `job`: Job validado.; `query`: Texto pesquisado. Devolve: Resultados do job.
- `UnifiedSearchService.matches(chunk, query)` (privada; método de classe) - Valida se um chunk contém a pesquisa ou um dos seus termos úteis. Entradas: `chunk`: Chunk indexado.; `query`: Pesquisa normalizada. Devolve: `true` quando há correspondência.
- `UnifiedSearchService.excerpt(text, query)` (privada; método de classe) - Gera excerto curto em torno da primeira ocorrência encontrada. Entradas: `text`: Texto do chunk.; `query`: Pesquisa normalizada. Devolve: Excerto público.

### `real_dev/api/src/modules/users/users.service.ts`

- `UsersService.findByEmail(email)` (pública; método de classe) - Procura um utilizador pelo email normalizado. Entradas: `email`: Email recebido no registo ou login. Devolve: Documento Mongoose ou `null` quando não existe.
- `UsersService.findById(userId)` (pública; método de classe) - Procura um utilizador por identificador MongoDB. Entradas: `userId`: Identificador do utilizador autenticado. Devolve: Documento Mongoose ou `null` quando não existe.
- `UsersService.createStudent(email, passwordHash)` (pública; método de classe) - Cria uma conta local de aluno. Entradas: `email`: Email já validado e normalizado pelo `AuthService`.; `passwordHash`: Hash seguro da password, nunca a password original. Devolve: Documento criado.
- `UsersService.toPublicUser(user)` (pública; método de classe) - Converte um documento de utilizador numa resposta pública. Entradas: `user`: Documento Mongoose de utilizador. Devolve: DTO sem hash de password nem campos internos desnecessários.

### `real_dev/api/src/scripts/backup-database.ts`

- `normaliseBackupOptions(options)` (exportada; função) - Normaliza configuração antes de abrir ligação à base de dados. Entradas: `options`: Valores vindos do ambiente, CLI ou teste unitário. Devolve: Configuração segura para executar ou ensaiar o backup diário.
- `createDailyBackup(options)` (exportada; função) - Executa o backup diário e devolve apenas metadados seguros. Entradas: `options`: Configuração recebida do CLI, ambiente ou teste. Devolve: Resumo sem URI, credenciais nem documentos exportados.
- `createMongooseConnection(mongoUri)` (top-level; função) - Abre a ligação Mongoose usada pelo script real. Entradas: `mongoUri`: URI lida do ambiente e nunca impressa no output. Devolve: Ligação compatível com as funções de backup.
- `writeCollectionBackup(collection, filePath)` (top-level; função) - Escreve uma coleção como JSON por linha e comprime o ficheiro. Entradas: `collection`: Coleção MongoDB a exportar.; `filePath`: Caminho final do ficheiro comprimido. Devolve: Promise resolvida quando o ficheiro estiver escrito.
- `writeCollectionBackup.documentsAsLines()` (interna; função) - Executa documents as lines no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis. Entradas: sem entradas explícitas. Devolve: Resultado estruturado usado pelo script ou pela evidência técnica gerada.
- `writeManifest(outputDir, summary)` (top-level; função) - Escreve manifest sem incluir URI, documentos ou dados pessoais. Entradas: `outputDir`: Diretório do backup atual.; `summary`: Resumo seguro da execução. Devolve: Promise resolvida após escrita do manifest.
- `removeExpiredBackups(backupRoot, now, retentionDays)` (top-level; função) - Remove pastas antigas dentro da raiz de backup para cumprir retenção. Entradas: `backupRoot`: Pasta dedicada aos backups.; `now`: Data de referência da execução.; `retentionDays`: Número de dias a manter. Devolve: Promise resolvida após limpeza.
- `buildBackupId(now)` (top-level; função) - Cria identificador ordenável e seguro para diretório diário. Entradas: `now`: Data da execução. Devolve: Identificador sem caracteres problemáticos.
- `isInsidePath(target, root)` (top-level; função) - Verifica se um caminho fica dentro de uma raiz proibida. Entradas: `target`: Caminho final ja resolvido.; `root`: Raiz que nao pode conter backups reais. Devolve: `true` quando o target e a raiz ou um descendente direto/indireto.
- `runFromCli()` (top-level; função) - Executa o script por CLI e só imprime resumo seguro. Entradas: sem entradas explícitas. Devolve: Promise resolvida quando a execução terminar.

### `real_dev/api/src/scripts/export-technical-map.ts`

- `resolveAppModulePath()` (exportada; função) - Resolve o caminho do AppModule a partir da raiz do repo ou de real_dev/api. Entradas: sem entradas explícitas. Devolve: Caminho absoluto para `real_dev/api/src/app.module.ts` ou `src/app.module.ts`.
- `extractImportedModules(appModuleSource)` (exportada; função) - Extrai imports nomeados de modulos a partir do AppModule. Entradas: `appModuleSource`: Conteudo textual de `app.module.ts`. Devolve: Lista ordenada de modulos importados.
- `assertRequiredModules(importedModules, requiredModules)` (exportada; função) - Garante que os modulos criticos continuam presentes no AppModule. Entradas: `importedModules`: Valor de importedModules usado pela função para executar assert required modules com dados explícitos.; `requiredModules`: Valor de requiredModules usado pela função para executar assert required modules com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `tableRow(cells)` (exportada; função) - Cria uma linha de tabela Markdown com pipes escapados. Entradas: `cells`: Valores textuais da linha. Devolve: Linha Markdown segura.
- `buildTechnicalMapMarkdown(map)` (exportada; função) - Gera o Markdown do mapa tecnico minimo. Entradas: `map`: Contratos tecnicos documentados. Devolve: Documento Markdown completo.
- `exportTechnicalMap()` (exportada; função) - Valida o AppModule e devolve o Markdown do mapa tecnico. Entradas: sem entradas explícitas. Devolve: Documento Markdown depois de confirmar modulos criticos.
- `isTechnicalMapCli(argv)` (exportada; função) - Confirma se o ficheiro foi chamado como script compilado ou fonte direta. Entradas: `argv`: Argumentos do processo Node.js. Devolve: `true` quando o entrypoint e este exportador.

### `real_dev/api/src/scripts/mf8-error-register.ts`

- `canCloseMf8Error(record)` (exportada; função) - Confirma se um erro pode ser fechado na evidence final. Entradas: `record`: Registo de erro preenchido depois da correção. Devolve: Verdadeiro apenas quando a correção foi revalidada com dados mínimos.
- `extractFinalTestRows(markdown)` (exportada; função) - Extrai linhas de comandos observados a partir de uma tabela Markdown. Entradas: `markdown`: Conteúdo de `TESTES-FINAIS.md`. Devolve: Linhas com comando, estado e observação sanitizada.
- `buildCorrectionRegister(rows, now)` (exportada; função) - Constrói o registo inicial de correções a partir dos testes finais. Entradas: `rows`: Linhas extraídas da evidence final.; `now`: Data usada para tornar a saída previsível em testes. Devolve: Registo com erros abertos ou bloqueados.
- `renderCorrectionRegisterMarkdown(register)` (exportada; função) - Renderiza a evidence de correção sem expor dados privados. Entradas: `register`: Registo de erros e decisão final. Devolve: Markdown pronto para `CORRECAO-ERROS.md`.
- `runMf8ErrorRegister(options)` (exportada; função) - Executa o fluxo local do BK-MF8-17. Entradas: `options`: Raiz do repositório e data controlável para testes. Devolve: Registo criado a partir da evidence final.
- `splitMarkdownTableRow(line)` (top-level; função) - Divide split markdown table row no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis. Entradas: `line`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `stripMarkdown(value)` (top-level; função) - Limpa strip markdown no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis. Entradas: `value`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `toFinalTestRow(cells)` (top-level; função) - Transforma to final test row no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis. Entradas: `cells`: Dados de tabela ou célula usados para reconstruir a evidência de forma determinística. Devolve: Contrato público pronto para a UI, sem campos internos de persistência.
- `resolveCommandCell(cells, statusIndex)` (top-level; função) - Resolve resolve command cell no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis. Entradas: `cells`: Dados de tabela ou célula usados para reconstruir a evidência de forma determinística.; `statusIndex`: Posição usada para relacionar itens derivados com a sua origem. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `resolveObservedCell(cells, statusIndex)` (top-level; função) - Resolve resolve observed cell no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis. Entradas: `cells`: Dados de tabela ou célula usados para reconstruir a evidência de forma determinística.; `statusIndex`: Posição usada para relacionar itens derivados com a sua origem. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `isEvidenceStatus(value)` (top-level; função) - Avalia is evidence status no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis. Entradas: `value`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado. Devolve: Valor booleano que indica se a regra avaliada é verdadeira.
- `buildErrorRecord(row, index)` (top-level; função) - Constrói build error record no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis. Entradas: `row`: Dados de tabela ou célula usados para reconstruir a evidência de forma determinística.; `index`: Posição usada para relacionar itens derivados com a sua origem. Devolve: Exceção estruturada pronta a ser lançada pelo service ou controller.
- `classifySource(command)` (top-level; função) - Classifica classify source no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis. Entradas: `command`: Valor de command usado pela função para executar classify source com dados explícitos. Devolve: Resultado estruturado usado pelo script ou pela evidência técnica gerada.
- `sanitizeEvidenceText(value)` (top-level; função) - Sanitiza sanitize evidence text no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis. Entradas: `value`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `escapeMarkdownCell(value)` (top-level; função) - Escapa escape markdown cell no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis. Entradas: `value`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.

### `real_dev/api/src/scripts/mf8-test-inventory.ts`

- `toReportPath(path)` (exportada; função) - Converte caminhos para uma forma estavel em relatorios e testes. Entradas: `path`: Caminho devolvido pelo sistema operativo. Devolve: Caminho com separador `/`, igual em macOS, Linux e Windows.
- `collectProjectFiles(rootDir, repoRoot)` (exportada; função) - Le ficheiros de forma recursiva dentro de uma raiz controlada. Entradas: `rootDir`: Diretoria a ler.; `repoRoot`: Raiz do repositorio usada para gerar caminhos relativos. Devolve: Conjunto de caminhos relativos ao repositorio.
- `visit(currentDir)` (interna; arrow function) - Executa visit no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis. Entradas: `currentDir`: Valor de currentDir usado pela função para executar visit com dados explícitos. Devolve: Resultado estruturado usado pelo script ou pela evidência técnica gerada.
- `mergeFileSets(groups)` (exportada; função) - Junta conjuntos de ficheiros sem perder entradas duplicadas. Entradas: `groups`: Conjuntos recolhidos de API e web. Devolve: Conjunto unico de ficheiros do projeto.
- `checkTestCoverage(targets, existingFiles)` (exportada; função) - Classifica cada alvo critico como coberto, sem teste ou sem ficheiro base. Entradas: `targets`: Alvos criticos definidos para RNF41.; `existingFiles`: Ficheiros existentes na arvore de implementacao. Devolve: Lista ordenada de resultados por alvo.
- `findMissingCriticalTests(targets, existingFiles)` (exportada; função) - Devolve apenas alvos cujo ficheiro base existe, mas cuja spec esta em falta. Entradas: `targets`: Alvos criticos de qualidade.; `existingFiles`: Ficheiros existentes na arvore de implementacao. Devolve: Alvos com teste em falta e fonte existente.
- `createMf8TestInventory(repoRoot, generatedAt)` (exportada; função) - Cria um resumo completo para evidence e para o handoff do BK-MF8-16. Entradas: `repoRoot`: Raiz do repositorio StudyFlow.; `generatedAt`: Data textual da execucao. Devolve: Resumo com contadores e lista de alvos.
- `renderInventoryMarkdown(summary)` (exportada; função) - Renderiza evidence em Markdown para leitura humana. Entradas: `summary`: Resumo produzido pelo inventario. Devolve: Markdown pronto para gravar em `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- `runMf8TestInventoryCli()` (exportada; função) - Executa o inventario pela linha de comandos. Entradas: sem entradas explícitas. Devolve: Nada; escreve Markdown em stdout e assinala exit code 1 quando ha lacunas P0.

### `real_dev/api/src/scripts/run-mf8-final-tests.ts`

- `nodeCommandRunner(command, args, options)` (exportada; arrow function) - Runner real usado pela CLI para executar processos locais. Entradas: `command`: Comando base a executar.; `args`: Argumentos do comando.; `options`: Diretoria, encoding e timeout do processo filho. Devolve: Resultado bruto devolvido por `spawnSync`.
- `resolveRepoRoot(cwd)` (exportada; função) - Resolve a raiz do repositório a partir da pasta `real_dev/api`. Entradas: `cwd`: Diretoria atual usada pelo comando npm. Devolve: Caminho absoluto para a raiz do repositório StudyFlow.
- `buildMf8FinalTestPlan(repoRoot)` (exportada; função) - Cria a bateria final de comandos reais do `real_dev`. Entradas: `repoRoot`: Raiz do repositório StudyFlow. Devolve: Lista ordenada de comandos a executar para RNF42.
- `formatCommandLine(command, args)` (exportada; função) - Junta comando e argumentos numa linha legível para evidence. Entradas: `command`: Comando base.; `args`: Argumentos do comando. Devolve: Linha textual do comando executado.
- `sanitizeOutput(output, maxLength)` (exportada; função) - Remove informação sensível e limita o tamanho do output guardado. Entradas: `output`: Texto original escrito pelo comando.; `maxLength`: Número máximo de caracteres a guardar. Devolve: Output seguro para evidence.
- `sanitizeEvidencePath(value)` (exportada; função) - Converte paths absolutos locais para paths partilháveis dentro do repositório. Entradas: `value`: Path observado durante a execução local. Devolve: Path relativo seguro para evidence quando possível.
- `validateInventoryEvidence(repoRoot)` (exportada; função) - Confirma se a evidence criada no BK-MF8-15 permite avançar. Entradas: `repoRoot`: Raiz do repositório StudyFlow. Devolve: Estado da evidence de entrada do gate final.
- `runFinalTestCommand(testCommand, runner)` (exportada; função) - Executa um comando da bateria final. Entradas: `testCommand`: Comando declarado no plano final.; `runner`: Função usada para executar comandos, substituível nos testes. Devolve: Resultado normalizado para evidence.
- `runFinalTestPlan(plan, runner)` (exportada; função) - Executa a bateria final completa. Entradas: `plan`: Lista de comandos finais.; `runner`: Função de execução usada em produção ou nos testes. Devolve: Resultados de todos os comandos.
- `hasBlockingFailure(evidence)` (exportada; função) - Indica se a evidence final deve bloquear o avanço para BK-MF8-17. Entradas: `evidence`: Evidence final já calculada. Devolve: Verdadeiro se houver falha obrigatória ou evidence anterior bloqueada.
- `renderFinalEvidenceMarkdown(evidence)` (exportada; função) - Renderiza a evidence final em Markdown. Entradas: `evidence`: Resultados recolhidos pelo runner. Devolve: Markdown pronto a guardar em `docs/evidence/MF8/TESTES-FINAIS.md`.
- `createMf8FinalEvidence(repoRoot, generatedAt, runner)` (exportada; função) - Cria a evidence final e grava o ficheiro Markdown. Entradas: `repoRoot`: Raiz do repositório StudyFlow.; `generatedAt`: Data textual usada na evidence.; `runner`: Função de execução substituível em testes. Devolve: Evidence final.
- `runMf8FinalTestsCli()` (exportada; função) - Executa o gate final pela linha de comandos. Entradas: sem entradas explícitas. Devolve: Nada; escreve o caminho da evidence e sinaliza falhas obrigatórias via `process.exitCode`.

### `real_dev/api/src/scripts/seed-development-users.ts`

- `main()` (top-level; função) - Seed local de utilizadores de validação da MF1. Recusa produção e não promove papéis de contas existentes. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/api/src/scripts/smoke-200-users.mjs`

- `readPositiveInteger(name, fallback)` (top-level; função) - Reads a positive integer from the environment without silently accepting bad evidence. Entradas: `name`: Environment variable name.; `fallback`: Value used when the variable is not defined. Devolve: Positive integer used by the smoke run.
- `resolveSmokeCookie()` (top-level; função) - Resolves an authenticated smoke cookie without exposing it in process output. `STUDYFLOW_SMOKE_COOKIE` remains the most explicit option. Test/staging environments can instead provide seed credentials through `STUDYFLOW_SMOKE_EMAIL` and `STUDYFLOW_SMOKE_PASSWORD`; the script th... Entradas: sem entradas explícitas. Devolve: Cookie header value safe to send to the smoke target.
- `readSetCookieHeaders(headers)` (top-level; função) - Reads `Set-Cookie` values across Node versions without printing them. Entradas: `headers`: Response headers returned by `fetch`. Devolve: Cookie header values.
- `percentile(sortedValues, percentileRank)` (top-level; função) - Calculates a percentile from an already sorted list of durations. Entradas: `sortedValues`: Durations sorted from fastest to slowest.; `percentileRank`: Percentile between 0 and 100. Devolve: Observed value for the requested percentile.
- `runRequest(index)` (top-level; função) - Sends one authenticated request and keeps only technical evidence. Entradas: `index`: Concurrent request index for local debugging. Devolve: >} Safe request metadata.

### `real_dev/api/src/scripts/smoke-runtime-instances.mjs`

- `readPositiveInteger(name, fallback)` (top-level; função) - Reads a positive integer environment knob without accepting bad evidence. Entradas: `name`: Environment variable name.; `fallback`: Default value. Devolve: Parsed positive integer.
- `fetchRuntimeInstance(url)` (top-level; função) - Fetches one runtime endpoint and keeps only technical metadata. Entradas: `url`: Runtime endpoint URL. Devolve: >} Safe response metadata.
- `waitForRuntimeEndpoint(url)` (top-level; função) - Repeatedly polls a URL until the API instance is ready. Entradas: `url`: Runtime endpoint URL. Devolve: Resolves when the endpoint responds with valid JSON.
- `startLocalApi(mongoUri, port, instanceId)` (top-level; função) - Starts one real compiled API process with an isolated instance identifier. Entradas: `mongoUri`: MongoDB URI shared by both local smoke instances.; `port`: HTTP port for this API process.; `instanceId`: Stable instance identifier expected in the response. Devolve: Spawned API process.
- `startLocalInstances()` (top-level; função) - Runs the smoke against two local full API processes. Entradas: sem entradas explícitas. Devolve: Runtime endpoint URLs to validate.
- `resolveUrls()` (top-level; função) - Resolves target URLs for either local or external smoke mode. Entradas: sem entradas explícitas. Devolve: URLs to request.
- `buildRequestUrls(urls)` (top-level; função) - Builds the request list. A single proxy URL is requested several times so a load balancer can prove that at least two instance identifiers appear. Entradas: `urls`: Runtime endpoint URLs. Devolve: URLs expanded into concrete requests.
- `cleanup()` (top-level; função) - Stops child processes and the embedded MongoDB server. Entradas: sem entradas explícitas. Devolve: Resolves after best-effort cleanup.

### `real_dev/api/src/scripts/start-e2e-api.ts`

- `main()` (top-level; função) - Arranca a API em modo E2E com MongoDB embebido quando não existe MONGODB_URI. O processo faz seed dos utilizadores de desenvolvimento e mantém o servidor NestJS vivo até o Playwright terminar. Redis é substituído por memória apenas neste modo para evitar dependência de serviço... Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `resolveMongoUri()` (top-level; função) - Executa a operação resolve mongo uri no domínio de scripts operacionais com contrato explícito. Entradas: sem entradas explícitas. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `buildEnvironment(mongoUri)` (top-level; função) - Cria fixture ou estrutura auxiliar de scripts operacionais para manter testes e prompts legíveis. Entradas: `mongoUri`: Valor de mongoUri usado pela função para executar build environment com dados explícitos. Devolve: Resultado estruturado usado pelo script ou pela evidência técnica gerada.
- `runNodeScript(scriptPath, environment)` (top-level; função) - Executa a operação run node script no domínio de scripts operacionais com contrato explícito. Entradas: `scriptPath`: Caminho de ficheiro ou rota usado para localizar a origem ou destino da operação.; `environment`: Valor de environment usado pela função para executar run node script com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `cleanup()` (top-level; função) - Remove ruído ou conteúdo perigoso antes de usar o valor no fluxo de scripts operacionais. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `shutdown(signal)` (top-level; função) - Executa a operação shutdown no domínio de scripts operacionais com contrato explícito. Entradas: `signal`: Sinal usado para encerrar processos de forma previsível. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/api/src/scripts/validate-deploy-readiness.ts`

- `validateDeployReadiness(input)` (exportada; função) - Valida as condicoes operacionais minimas antes de fazer deploy do StudyFlow. Entradas: `input`: Versao da release e caminho opcional do documento de rollback. Devolve: Informacao estruturada de readiness para evidence de deploy.
- `assertDeployReadiness(input)` (exportada; função) - Bloqueia o processo de deploy quando falta uma condicao obrigatoria de readiness. Entradas: `input`: Versao da release e caminho opcional do documento de rollback. Devolve: Informacao de readiness quando todas as validacoes passam.

### `real_dev/api/src/scripts/verify-tls-evidence.mjs`

- `parseTarget(rawHost)` (top-level; função) - Parses the public API host used for RNF14 evidence. Entradas: `rawHost`: Public host without protocol. Devolve: } Sanitized target.
- `readPositiveInteger(name, fallback)` (top-level; função) - Reads a positive integer environment knob without accepting silent bad evidence. Entradas: `name`: Environment variable name.; `fallback`: Default value. Devolve: Parsed positive integer.
- `verifyTls()` (top-level; função) - Opens a TLS 1.2+ connection and records only protocol/cipher evidence. Entradas: sem entradas explícitas. Devolve: >} TLS metadata safe for reports.
- `checkPlainHttp()` (top-level; função) - Checks whether plain HTTP is still served as a normal successful channel. A closed port, redirect, 403 or 426 is acceptable evidence that HTTP is not the normal application channel. A 2xx response is treated as failure. Entradas: sem entradas explícitas. Devolve: >} HTTP metadata safe for reports.

## Frontend

### `real_dev/web/src/App.tsx`

- `App()` (exportada; função) - Componente raiz da aplicação. Entradas: sem entradas explícitas. Devolve: Árvore React correspondente à rota atual.

### `real_dev/web/src/components/ai/AiAreaProfilePanel.tsx`

- `AiAreaProfilePanel({ studyAreaId })` (exportada; função) - Painel que prepara o perfil IA de uma área. Entradas: `props`: Identificador da área. Devolve: Botão e resultado do perfil IA.
- `AiAreaProfilePanel.handlePrepare()` (interna; função) - Chama o backend para recalcular o perfil IA. Entradas: sem entradas explícitas. Devolve: Promise resolvida depois de preparar.

### `real_dev/web/src/components/ai/ArtifactSources.tsx`

- `ArtifactSources({ sources, sourceMaterialIds, })` (exportada; função) - Mostra as fontes materiais associadas a um artefacto IA. Entradas: `props`: Fontes persistidas no artefacto e filtro opcional. Devolve: Lista curta de fontes.

### `real_dev/web/src/components/ai/ExplanationPanel.tsx`

- `ExplanationPanel({ artifact })` (exportada; função) - Mostra uma explicação gerada pela IA. Entradas: `props`: Artefacto de explicação. Devolve: Painel de secções.

### `real_dev/web/src/components/ai/FlashcardsPanel.tsx`

- `readFlashcards(artifact)` (top-level; função) - Lê cartões de um artefacto IA sem confiar cegamente no formato dinâmico. Entradas: `artifact`: Artefacto autorizado recebido da API. Devolve: Lista de cartões válidos para renderizar.
- `FlashcardsPanel({ artifact })` (exportada; função) - Mostra flashcards gerados pela IA em modo exercício ou revisão. Entradas: `props`: Artefacto de flashcards autorizado para a área do aluno. Devolve: Painel interativo de estudo.
- `FlashcardsPanel.handleModeChange(mode)` (interna; função) - Troca o modo visual sem persistir dados privados. Entradas: `mode`: Valor de mode usado pela função para executar handle mode change com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/components/ai/QuizPanel.tsx`

- `QuizPanel({ artifact, studyAreaId })` (exportada; função) - Mostra um quiz gerado pela IA. Entradas: `props`: Artefacto de quiz. Devolve: Lista de perguntas com opções.
- `QuizPanel.handleSubmit(event)` (interna; função) - Submete respostas para cálculo seguro no backend. Entradas: `event`: Evento do formulário. Devolve: Promise resolvida depois de guardar resultado.

### `real_dev/web/src/components/ai/SummaryPanel.tsx`

- `SummaryPanel({ artifact })` (exportada; função) - Mostra o último resumo gerado. Entradas: `props`: Artefacto de resumo. Devolve: Painel de resumo.

### `real_dev/web/src/components/forms/FormField.tsx`

- `FormField({ id, label, helpText, error, children, })` (exportada; função) - Envolve um controlo de formulário com label, ajuda e erro associados. Entradas: `props`: Identificador, textos visíveis e controlo React. Devolve: Campo pronto para teclado e tecnologias de apoio.

### `real_dev/web/src/components/layout/AppShell.tsx`

- `AppShell({ user, children, onLogout })` (exportada; função) - Layout principal das páginas protegidas. Entradas: `props`: Utilizador autenticado, conteúdo e ação de logout. Devolve: Estrutura visual com navegação consistente.

### `real_dev/web/src/components/layout/navigation.ts`

- `getNavigationForRole(role)` (exportada; função) - Devolve a navegação visível para o role autenticado. Entradas: `role`: Role real devolvido pela sessão autenticada. Devolve: Links que devem aparecer na shell desse role.
- `isNavigationItemActive(item, pathname)` (exportada; função) - Indica se um item representa a página atual ou uma rota filha. Entradas: `item`: Link de navegação renderizado.; `pathname`: Caminho atual do browser. Devolve: Verdadeiro quando o link deve receber `aria-current`.

### `real_dev/web/src/components/layout/ResponsivePageFrame.tsx`

- `ResponsivePageFrame({ main, aside, asideLabel = "Acoes secundarias", })` (exportada; função) - Organiza uma pagina em uma coluna no mobile e duas zonas no desktop. Entradas: `props`: Conteudo principal, zona secundaria opcional e etiqueta acessivel. Devolve: Estrutura responsiva sem logica de dominio.

### `real_dev/web/src/components/materials/MaterialList.tsx`

- `MaterialList({ materials, studyAreaId })` (exportada; função) - Lista materiais submetidos numa área privada. Entradas: `props`: Materiais carregados da API e área autenticada do aluno. Devolve: Lista visual com estado de processamento e erros PT-PT.
- `MaterialList.handleIndex(materialId)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `materialId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`

- `MaterialSubmitForm({ studyAreaId, onSubmitted })` (exportada; função) - Formulário de submissão de materiais. Entradas: `props`: Área alvo e callback de refresh. Devolve: Controlos para tópico, URL e ficheiro.
- `MaterialSubmitForm.clearFieldError(field)` (interna; função) - Remove uma mensagem de validação assim que o aluno corrige o campo. Entradas: `field`: Campo alterado pelo utilizador. Devolve: Nada; apenas atualiza estado local.
- `MaterialSubmitForm.validateFields()` (interna; função) - Monta a lista de campos obrigatórios conforme o modo de material. Entradas: sem entradas explícitas. Devolve: Erros por campo a apresentar antes de qualquer pedido HTTP.
- `MaterialSubmitForm.handleSubmit(event)` (interna; função) - Submete o material conforme o modo escolhido. Entradas: `event`: Evento de submissão. Devolve: Promise resolvida depois de guardar.

### `real_dev/web/src/components/PageHeader.tsx`

- `PageHeader({ title, description, action })` (exportada; função) - Mostra titulo principal, descricao e acao opcional com uma hierarquia previsivel. Entradas: `props`: Conteudo visual do cabecalho. Devolve: Cabecalho reutilizavel com exatamente um `h1`.

### `real_dev/web/src/components/study/StudyAreaForm.tsx`

- `StudyAreaForm({ area, error, submitLabel, onCancel, onSubmit, })` (exportada; função) - Formulário partilhado para criar e editar áreas de estudo. Entradas: `props`: Área opcional e callbacks de gravação. Devolve: Formulário controlado de área.
- `StudyAreaForm.handleSubmit(event)` (interna; função) - Submete os valores atuais. Entradas: `event`: Evento de submissão. Devolve: Promise resolvida depois da gravação.

### `real_dev/web/src/components/study/StudyAreaVoiceForm.tsx`

- `StudyAreaVoiceForm({ area, onSaved })` (exportada; função) - Formulário de voz pedagógica da área. Entradas: `props`: Área atual e callback de atualização. Devolve: Formulário de tom, detalhe e notas.
- `StudyAreaVoiceForm.handleSubmit(event)` (interna; função) - Guarda preferências de voz. Entradas: `event`: Evento de submissão. Devolve: Promise resolvida depois de guardar.

### `real_dev/web/src/components/study/StudyHistoryList.tsx`

- `StudyHistoryList({ events })` (exportada; função) - Lista eventos de histórico de estudo. Entradas: `props`: Eventos carregados da API para o aluno autenticado. Devolve: Lista visual do histórico.

### `real_dev/web/src/components/ui/AsyncStateBlock.tsx`

- `AsyncStateBlock(props)` (exportada; função) - Componente visual para loading, erro, vazio e conteúdo com dados. Entradas: `props`: Estado assíncrono calculado pela página chamadora. Devolve: Bloco React acessível e reutilizável.

### `real_dev/web/src/features/adaptive-explanations/adaptive-explanation-panel.tsx`

- `AdaptiveExplanationPanel()` (exportada; função) - Formulário simples para pedir e apresentar uma explicação adaptada. Entradas: sem entradas explícitas. Devolve: Componente com estados de vazio, loading, erro e sucesso.
- `AdaptiveExplanationPanel.handleSubmit(event)` (interna; função) - Envia o pedido ao backend e atualiza apenas estado visual. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/adaptive-explanations/ask-adaptive-explanation.ts`

- `askMf3AdaptiveExplanation(input)` (exportada; função) - Pede uma explicação adaptada ao perfil pedagógico da área. Entradas: `input`: Área privada e pergunta do aluno. Devolve: Explicação adaptada.

### `real_dev/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`

- `AiGuardrailsPanel()` (exportada; função) - Painel manual para validar guardrails IA. Entradas: sem entradas explícitas. Devolve: Formulário e decisão do backend.
- `AiGuardrailsPanel.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/ai-guardrails/check-ai-guardrails.ts`

- `checkAiGuardrails(input)` (exportada; função) - Valida guardrails IA por contexto. Entradas: `input`: Contexto, recurso e prompt. Devolve: Decisão do backend.
- `isAiSafetyBlock(decision)` (exportada; função) - Indica se a decisão corresponde a um bloqueio ético da IA. Entradas: `decision`: Decisão devolvida pelo backend. Devolve: Verdadeiro quando o bloqueio vem da policy de segurança ética.

### `real_dev/web/src/features/curriculum-navigation/curriculum-navigation-panel.tsx`

- `CurriculumNavigationPanel()` (exportada; função) - Painel de navegação curricular. Entradas: sem entradas explícitas. Devolve: Formulário e tópicos.
- `CurriculumNavigationPanel.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/curriculum-navigation/load-curriculum-navigation.ts`

- `loadCurriculumNavigation(input)` (exportada; função) - Carrega tópicos curriculares a partir de jobs autorizados. Entradas: `input`: Jobs indexados. Devolve: Tópicos e secções.

### `real_dev/web/src/features/external-knowledge-ai/ask-external-knowledge-ai.ts`

- `askExternalKnowledgeAi(input)` (exportada; função) - Pede resposta com nota externa limitada. Entradas: `input`: Área, pergunta e permissão externa. Devolve: Resposta separando fontes internas e notas externas.

### `real_dev/web/src/features/external-knowledge-ai/external-knowledge-ai-panel.tsx`

- `ExternalKnowledgeAiPanel()` (exportada; função) - Painel de conhecimento externo limitado. Entradas: sem entradas explícitas. Devolve: Formulário e resposta separada por fontes internas/notas externas.
- `ExternalKnowledgeAiPanel.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/mf3/request-mf3-json.ts`

- `requestMf3Json(path, options)` (exportada; função) - Executa pedidos JSON dos painéis MF3 mantendo cookies HttpOnly. Entradas: `path`: Caminho relativo da API.; `options`: Opções fetch. Devolve: JSON parseado.

### `real_dev/web/src/features/mf4/admin-governance-panel.tsx`

- `AdminGovernancePanel()` (exportada; função) - Painel admin mínimo para validar contratos MF4. Entradas: sem entradas explícitas. Devolve: UI administrativa.
- `AdminGovernancePanel.refresh()` (interna; função) - Recarrega a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AdminGovernancePanel.updateRole(userId, role)` (interna; função) - Atualiza a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Entradas: `userId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `role`: Papel funcional que define permissões e comportamento autorizado dentro da aplicação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AdminGovernancePanel.persistNotificationPolicy(policy)` (interna; função) - Atualiza a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Entradas: `policy`: Política editada ou avaliada antes de persistir regras administrativas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AdminGovernancePanel.persistModelPolicy(policy)` (interna; função) - Atualiza a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Entradas: `policy`: Política editada ou avaliada antes de persistir regras administrativas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AdminGovernancePanel.persistQuotaPolicy(policy)` (interna; função) - Atualiza a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Entradas: `policy`: Política editada ou avaliada antes de persistir regras administrativas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/mf4/follow-up-alerts-panel.tsx`

- `FollowUpAlertsPanel()` (exportada; função) - UI docente para regras e notificações. Entradas: sem entradas explícitas. Devolve: Painel de acompanhamento.
- `FollowUpAlertsPanel.refresh()` (interna; função) - Recarrega a ação de interface ligada a alertas de acompanhamento, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `FollowUpAlertsPanel.createRule()` (interna; função) - Cria a ação de interface ligada a alertas de acompanhamento, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `FollowUpAlertsPanel.notifyTask()` (interna; função) - Notifica notify task para alertas de acompanhamento, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/mf4/mf4-client.ts`

- `listAdminUsers()` (exportada; função) - Obtém list admin users para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `changeUserRole(userId, role)` (exportada; função) - Executa change user role para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: `userId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `role`: Papel funcional que define permissões e comportamento autorizado dentro da aplicação. Devolve: Resultado da operação no formato esperado pelo chamador.
- `listAuditEvents()` (exportada; função) - Obtém list audit events para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `listNotificationPolicies()` (exportada; função) - Obtém list notification policies para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `listAiModelPolicies()` (exportada; função) - Obtém list ai model policies para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `listAiQuotas()` (exportada; função) - Obtém list ai quotas para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `listAiUsage()` (exportada; função) - Obtém list ai usage para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `saveNotificationPolicy(channel, input)` (exportada; função) - Atualiza save notification policy para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: `channel`: Valor de channel usado pela função para executar save notification policy com dados explícitos.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `saveAiModelPolicy(purpose, input)` (exportada; função) - Atualiza save ai model policy para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: `purpose`: Finalidade de IA usada para escolher política, consentimento ou quota aplicável.; `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `saveAiQuotaPolicy(input)` (exportada; função) - Atualiza save ai quota policy para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `createContextNotification(input)` (exportada; função) - Cria a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `listContextNotifications()` (exportada; função) - Obtém list context notifications para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `listFollowUpRules()` (exportada; função) - Obtém list follow up rules para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `createFollowUpRule(input)` (exportada; função) - Cria a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Entradas: `input`: Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `runFollowUpRule(ruleId)` (exportada; função) - Executa run follow up rule para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: `ruleId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Resultado da operação no formato esperado pelo chamador.
- `listDataExports()` (exportada; função) - Obtém list data exports para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `requestDataExport()` (exportada; função) - Executa request data export para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `downloadDataExport(requestId)` (exportada; função) - Descarrega download data export para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: `requestId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
- `deleteAccount(confirmation)` (exportada; função) - Remove delete account para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: `confirmation`: Valor de confirmation usado pela função para executar delete account com dados explícitos. Devolve: Resultado da operação no formato esperado pelo chamador.
- `listAiConsents()` (exportada; função) - Obtém list ai consents para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Lista de itens filtrada e ordenada de acordo com o contrato do domínio.
- `grantAiConsent(purpose)` (exportada; função) - Regista grant ai consent para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: `purpose`: Finalidade de IA usada para escolher política, consentimento ou quota aplicável. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
- `revokeAiConsent(purpose)` (exportada; função) - Remove revoke ai consent para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: `purpose`: Finalidade de IA usada para escolher política, consentimento ou quota aplicável. Devolve: Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.

### `real_dev/web/src/features/mf4/privacy-panel.tsx`

- `PrivacyPanel()` (exportada; função) - UI de exportação, eliminação e consentimentos. Entradas: sem entradas explícitas. Devolve: Painel de privacidade.
- `PrivacyPanel.refresh()` (interna; função) - Recarrega a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `PrivacyPanel.createExport()` (interna; função) - Cria a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `PrivacyPanel.download(id)` (interna; função) - Descarrega download para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário. Entradas: `id`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `PrivacyPanel.toggleConsent(purpose, granted)` (interna; função) - Transforma a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário. Entradas: `purpose`: Finalidade de IA usada para escolher política, consentimento ou quota aplicável.; `granted`: Valor de granted usado pela função para executar toggle consent com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `PrivacyPanel.removeAccount()` (interna; função) - Remove remove account para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface. Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/mf5/action-feedback.tsx`

- `ActionFeedbackProvider({ children })` (exportada; função) - Envolve rotas protegidas com uma regiao visual e acessivel de feedback. Entradas: `props`: Conteudo autenticado que pode emitir mensagens seguras. Devolve: Provider React com `aria-live` e toast visual.
- `value.notifyLoading(text)` (interna; função em propriedade) - Notifica notify loading para interface MF5, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: `text`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado. Devolve: Resultado da operação no formato esperado pelo chamador.
- `value.notifySuccess(text)` (interna; função em propriedade) - Notifica notify success para interface MF5, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: `text`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado. Devolve: Resultado da operação no formato esperado pelo chamador.
- `value.notifyError(text)` (interna; função em propriedade) - Notifica notify error para interface MF5, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: `text`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado. Devolve: Exceção estruturada pronta a ser lançada pelo service ou controller.
- `value.clearFeedback()` (interna; função em propriedade) - Remove clear feedback para interface MF5, escondendo os detalhes técnicos atrás de uma API simples para a interface. Entradas: sem entradas explícitas. Devolve: Resultado da operação no formato esperado pelo chamador.
- `useActionFeedback()` (exportada; função) - Lê o contrato de feedback imediato dentro das rotas protegidas. Entradas: sem entradas explícitas. Devolve: Funcoes para emitir loading, sucesso, erro e limpar feedback.

### `real_dev/web/src/features/mf5/external-material-import-panel.tsx`

- `ExternalMaterialImportPanel({ targetId, targetType, onImported, })` (exportada; função) - Formulario reutilizavel para destinos privados e oficiais. Entradas: `props`: Destino interno e callback de refresh. Devolve: Painel de importacao unidirecional de links externos.
- `ExternalMaterialImportPanel.handleSubmit(event)` (interna; função) - Submete o link sem expor userId, role ou ownership no browser. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/mf5/external-material-imports-client.ts`

- `importExternalMaterial(input)` (exportada; função) - Importa um link Google Drive ou OneDrive para o destino autorizado. Entradas: `input`: Dados visuais recolhidos pela UI; o backend usa a sessao real. Devolve: Material criado no contrato publico do destino.

### `real_dev/web/src/features/mf5/form-validation.ts`

- `requireFields(fields)` (exportada; função) - Cria mensagens de erro para campos obrigatórios vazios. Entradas: `fields`: Campos que devem ter valor antes da submissão. Devolve: Mapa de mensagens por nome de campo.
- `hasFieldErrors(errors)` (exportada; função) - Indica se ainda existe algum erro por campo. Entradas: `errors`: Mapa devolvido por `requireFields`. Devolve: `true` quando pelo menos um campo falhou a validação.

### `real_dev/web/src/features/mf5/notification-tray.tsx`

- `getContextLabel(notification)` (top-level; função) - Traduz o contexto técnico para uma etiqueta curta e segura para a UI. Entradas: `notification`: Notificação devolvida pela API. Devolve: Texto visível que enquadra o aviso.
- `NotificationTray()` (exportada; função) - Painel discreto de notificações contextualizadas do utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Botão e painel com estados de carregamento, erro, vazio e lista.

### `real_dev/web/src/features/mf5/performance-budget.ts`

- `startPerformanceBudget(name)` (exportada; função) - Inicia uma medição local para uma página ou fluxo visível. Entradas: `name`: Nome técnico da medição, sem dados pessoais, tokens ou conteúdo de estudo. Devolve: Medição opaca que deve ser terminada com `finishPerformanceBudget`.
- `finishPerformanceBudget(measurement, budgetMs)` (exportada; função) - Termina a medição e indica se o budget foi excedido. Entradas: `measurement`: Medição devolvida por `startPerformanceBudget`.; `budgetMs`: Limite máximo esperado em milissegundos. Devolve: Resultado seguro para apresentar na UI ou usar em evidence técnica.
- `formatPerformanceBudgetMessage(result)` (exportada; função) - Cria texto visível e seguro quando uma página excede o budget. Entradas: `result`: Resultado calculado no fim da medição. Devolve: Mensagem curta sem nomes, emails, IDs, cookies, prompts ou respostas IA.

### `real_dev/web/src/features/mf8/flashcard-practice.ts`

- `createFlashcardPracticeState(mode)` (exportada; função) - Cria o estado inicial do treino. Entradas: `mode`: Modo visual escolhido pelo aluno. Devolve: Estado inicial seguro para a UI.
- `revealFlashcardAnswer(state)` (exportada; função) - Revela a resposta do cartao atual sem mudar de cartao. Entradas: `state`: Estado atual do treino. Devolve: Novo estado com resposta visivel.
- `moveToNextFlashcard(state, totalCards)` (exportada; função) - Avanca para o cartao seguinte ou termina o treino. Entradas: `state`: Estado atual do treino.; `totalCards`: Numero de cartoes autorizados recebidos da API. Devolve: Novo estado, sempre limitado a lista recebida.
- `setFlashcardPracticeMode(state, mode)` (exportada; função) - Alterna entre modo exercicio e modo revisao. Entradas: `state`: Estado atual do treino.; `mode`: Novo modo escolhido pelo aluno. Devolve: Estado atualizado sem perder o cartao atual.
- `restartFlashcardPractice(mode)` (exportada; função) - Recomeca a sessao no cartao inicial. Entradas: `mode`: Modo visual escolhido para o recomeco. Devolve: Estado inicial do treino.

### `real_dev/web/src/features/mf8/mockup-alignment-panel.tsx`

- `getStatusClassName(status)` (top-level; função) - Devolve classes visuais para cada estado sem alterar o contrato funcional. Entradas: `status`: Estado de revisão visual do item. Devolve: Classes Tailwind usadas no badge do estado.
- `MockupAlignmentCard({ item })` (top-level; função) - Renderiza um item individual da checklist. Entradas: `props`: Dados do item visual. Devolve: Cartão com rota, foco de mockup e evidence esperada.
- `MockupAlignmentPanel()` (exportada; função) - Painel de fecho visual para RNF38. Entradas: sem entradas explícitas. Devolve: Checklist de aproximação ao mockup com rotas reais e validação local.

### `real_dev/web/src/features/mf8/mockup-alignment.ts`

- `buildMockupAlignmentChecklist()` (exportada; função) - Lista os ecrãs prioritários para aproximar a UI real ao mockup. Entradas: sem entradas explícitas. Devolve: Itens de revisão visual ligados a rotas reais da aplicação.
- `summarizeMockupAlignment(items)` (exportada; função) - Calcula totais da checklist sem guardar dados pessoais nem screenshots no código. Entradas: `items`: Itens de revisão visual. Devolve: Totais por estado para apresentar na UI e usar em defesa.
- `validateMockupAlignmentChecklist(items)` (exportada; função) - Valida a checklist antes de a UI apresentar itens de evidence. Entradas: `items`: Itens de revisão visual. Devolve: Lista de mensagens de erro; lista vazia significa contrato válido.

### `real_dev/web/src/features/notification-preferences/notification-preferences-panel.tsx`

- `NotificationPreferencesPanel()` (exportada; função) - Painel de preferências de notificação por contexto. Entradas: sem entradas explícitas. Devolve: Lista editável de preferências.
- `NotificationPreferencesPanel.refresh()` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `NotificationPreferencesPanel.toggle(preference, field)` (interna; função) - Mapeia o documento interno de preferências de notificação para uma forma pública estável e simples de consumir. Entradas: `preference`: Valor de preference usado pela função para executar toggle com dados explícitos.; `field`: Valor de field usado pela função para executar toggle com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/notification-preferences/update-notification-preferences.ts`

- `listNotificationPreferences()` (exportada; função) - Lista preferências efetivas. Entradas: sem entradas explícitas. Devolve: Preferências por contexto.
- `updateNotificationPreferences(input)` (exportada; função) - Atualiza preferência de notificação. Entradas: `input`: Contexto e canais. Devolve: Preferência persistida.

### `real_dev/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`

- `askSourceGroundedAi(input)` (exportada; função) - Pede resposta fundamentada em fontes indexadas. Entradas: `input`: Jobs autorizados e pergunta. Devolve: Resposta com citações.

### `real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`

- `SourceGroundedAiPanel()` (exportada; função) - Painel de resposta com citações obrigatórias. Entradas: sem entradas explícitas. Devolve: Formulário e resposta fundamentada.
- `SourceGroundedAiPanel.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/subject-chat/subject-chat-client.ts`

- `listSubjectChatMessages(role, subjectId)` (exportada; função) - Carrega por REST o histórico persistido do chat da disciplina para aluno ou professor. Entradas: `role`: Papel da página atual, `STUDENT` ou `TEACHER`.; `subjectId`: Disciplina alvo. Devolve: Últimas mensagens autorizadas.
- `createSubjectChatSocket()` (exportada; função) - Cria a socket tipada para o namespace `/subject-chat` com `withCredentials`. Entradas: sem entradas explícitas. Devolve: Socket desligada, pronta para registar handlers antes do `connect`.

### `real_dev/web/src/features/subject-chat/SubjectChatPanel.tsx`

- `SubjectChatPanel({ subjectId, role })` (exportada; função) - Painel reutilizável do chat da disciplina com histórico REST, ligação WebSocket, estados online/offline, vazio, erro e envio conservador. Entradas: `props`: Disciplina e papel da página atual. Devolve: Interface de chat pronta a renderizar.
- `SubjectChatPanel.startChat()` (interna; função) - Carrega histórico, cria socket, faz `join` no canal da disciplina e escuta mensagens em tempo real. Entradas: sem entradas explícitas, usa `subjectId` e `role` do componente. Devolve: Promise resolvida quando o painel fica pronto ou erro visível.
- `SubjectChatPanel.handleSubmit(event)` (interna; função) - Envia a mensagem por `subject-chat:send`, sem optimistic UI, para que só mensagens confirmadas pelo servidor apareçam no histórico. Entradas: `event`: Evento do formulário. Devolve: Promise resolvida depois de entregar à socket local.

### `real_dev/web/src/features/study-alerts/load-study-alerts.ts`

- `loadStudyAlerts(onlyUpcoming)` (exportada; função) - Carrega alertas internos de estudo. Entradas: `onlyUpcoming`: Filtra alertas futuros. Devolve: Alertas visíveis.

### `real_dev/web/src/features/study-alerts/study-alerts-panel.tsx`

- `StudyAlertsPanel()` (exportada; função) - Painel de alertas internos de estudo. Entradas: sem entradas explícitas. Devolve: Lista de alertas.
- `StudyAlertsPanel.refresh()` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/study-group-ai/ask-study-group-ai.ts`

- `askStudyGroupAi(groupId, input)` (exportada; função) - Pede resposta coletiva baseada em fontes partilhadas. Entradas: `groupId`: Grupo alvo.; `input`: Pergunta e fontes opcionais. Devolve: Resposta da IA coletiva.

### `real_dev/web/src/features/study-group-ai/study-group-ai-panel.tsx`

- `StudyGroupAiPanel({ initialGroupId })` (exportada; função) - Painel de IA coletiva. Entradas: `props`: Grupo selecionado pela página agregadora. Devolve: Formulário e resposta.
- `StudyGroupAiPanel.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/study-group-messages/create-study-group-message.ts`

- `listStudyGroupMessages(groupId)` (exportada; função) - Lista mensagens e notas do grupo. Entradas: `groupId`: Grupo alvo. Devolve: Histórico colaborativo.
- `createStudyGroupMessage(groupId, input)` (exportada; função) - Cria mensagem ou nota coletiva. Entradas: `groupId`: Grupo alvo.; `input`: Tipo e conteúdo. Devolve: Mensagem criada.

### `real_dev/web/src/features/study-group-messages/study-group-messages-panel.tsx`

- `StudyGroupMessagesPanel({ initialGroupId })` (exportada; função) - Painel de mensagens e notas coletivas. Entradas: `props`: Grupo selecionado pela página agregadora. Devolve: Formulário e histórico.
- `StudyGroupMessagesPanel.refresh(targetGroupId)` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: `targetGroupId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `StudyGroupMessagesPanel.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/study-group-sessions/create-study-group-session.ts`

- `listStudyGroupSessions(groupId)` (exportada; função) - Lista sessões de um grupo. Entradas: `groupId`: Grupo alvo. Devolve: Sessões agendadas.
- `createStudyGroupSession(groupId, input)` (exportada; função) - Agenda uma sessão coletiva. Entradas: `groupId`: Grupo alvo.; `input`: Dados da sessão. Devolve: Sessão criada.

### `real_dev/web/src/features/study-group-sessions/study-group-sessions-panel.tsx`

- `StudyGroupSessionsPanel({ initialGroupId })` (exportada; função) - Painel de sessões coletivas. Entradas: `props`: Grupo selecionado pela página agregadora. Devolve: Formulário e lista de sessões.
- `StudyGroupSessionsPanel.refresh(targetGroupId)` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: `targetGroupId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `StudyGroupSessionsPanel.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/study-groups/create-study-group.ts`

- `listStudyGroups()` (exportada; função) - Lista grupos do aluno. Entradas: sem entradas explícitas. Devolve: Grupos acessíveis.
- `createStudyGroup(input)` (exportada; função) - Cria um grupo de estudo. Entradas: `input`: Dados do grupo. Devolve: Grupo criado.

### `real_dev/web/src/features/study-groups/study-groups-panel.tsx`

- `StudyGroupsPanel()` (exportada; função) - Painel de criação e listagem de grupos de estudo. Entradas: sem entradas explícitas. Devolve: UI de grupos.
- `StudyGroupsPanel.refresh()` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `StudyGroupsPanel.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/features/unified-search/run-unified-search.ts`

- `runUnifiedSearch(input)` (exportada; função) - Pesquisa em jobs de indexação autorizados. Entradas: `input`: Query e jobs. Devolve: Resultados com origem.

### `real_dev/web/src/features/unified-search/unified-search-panel.tsx`

- `UnifiedSearchPanel()` (exportada; função) - Painel de pesquisa unificada. Entradas: sem entradas explícitas. Devolve: Formulário e resultados.
- `UnifiedSearchPanel.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/hooks/useSession.ts`

- `useSession()` (exportada; função) - Hook que mantém o estado de sessão do frontend. A sessão real está no cookie HttpOnly; este hook guarda apenas o utilizador público devolvido por `/api/auth/me`. Entradas: sem entradas explícitas. Devolve: Estado da sessão e ações de refresh/logout.
- `useSession.refresh()` (interna; função) - Recarrega a sessão a partir da API. Entradas: sem entradas explícitas. Devolve: Promise resolvida depois de atualizar estado local.
- `useSession.signOut()` (interna; função) - Termina sessão e limpa o utilizador público do frontend. Entradas: sem entradas explícitas. Devolve: Promise resolvida depois do logout.

### `real_dev/web/src/lib/apiClient.ts`

- `requestJson(path, options)` (top-level; função) - Executa um pedido JSON para a API mantendo cookies HttpOnly. Entradas: `path`: Caminho relativo começado por `/api`.; `options`: Opções fetch adicionais. Devolve: JSON parseado no tipo pedido pelo chamador.
- `registerStudent(input)` (exportada; função) - Regista um aluno por email/password. Entradas: `input`: Dados do formulário de registo. Devolve: Utilizador público criado.
- `login(input)` (exportada; função) - Inicia sessão com email/password. Entradas: `input`: Credenciais do aluno. Devolve: Utilizador autenticado.
- `logout()` (exportada; função) - Termina a sessão atual. Entradas: sem entradas explícitas. Devolve: Estado de sucesso.
- `getCurrentUser()` (exportada; função) - Obtém o utilizador autenticado. Entradas: sem entradas explícitas. Devolve: Utilizador ou lança erro quando não há sessão.
- `getProfile()` (exportada; função) - Obtém o perfil do aluno autenticado. Entradas: sem entradas explícitas. Devolve: Perfil existente ou `null`.
- `updateProfile(input)` (exportada; função) - Atualiza o perfil do aluno. Entradas: `input`: Campos editáveis. Devolve: Perfil atualizado.
- `getSoloStudyState()` (exportada; função) - Obtém estado do dashboard individual. Entradas: sem entradas explícitas. Devolve: Estado do modo individual.
- `listRoutines()` (exportada; função) - Lista rotinas e objetivos do aluno. Entradas: sem entradas explícitas. Devolve: Dados de organização pessoal.
- `listGoals()` (exportada; função) - Lista objetivos do aluno através do endpoint dedicado. Entradas: sem entradas explícitas. Devolve: Objetivos ativos.
- `createRoutine(input)` (exportada; função) - Cria uma rotina de estudo. Entradas: `input`: Dados da rotina. Devolve: Rotina criada.
- `updateRoutine(routineId, input)` (exportada; função) - Atualiza uma rotina de estudo. Entradas: `routineId`: Identificador da rotina.; `input`: Campos editáveis. Devolve: Rotina atualizada.
- `archiveRoutine(routineId)` (exportada; função) - Arquiva uma rotina sem apagar fisicamente. Entradas: `routineId`: Identificador da rotina. Devolve: Estado de sucesso.
- `createGoal(input)` (exportada; função) - Cria um objetivo de estudo. Entradas: `input`: Dados do objetivo. Devolve: Objetivo criado.
- `updateGoal(goalId, input)` (exportada; função) - Atualiza um objetivo de estudo. Entradas: `goalId`: Identificador do objetivo.; `input`: Campos editáveis. Devolve: Objetivo atualizado.
- `archiveGoal(goalId)` (exportada; função) - Arquiva um objetivo sem apagar fisicamente. Entradas: `goalId`: Identificador do objetivo. Devolve: Estado de sucesso.
- `listStudyHistory()` (exportada; função) - Lista eventos recentes de estudo do aluno autenticado. Entradas: sem entradas explícitas. Devolve: Histórico privado do aluno com datas ISO serializadas.
- `listStudyAreas()` (exportada; função) - Lista áreas de estudo pessoais. Entradas: sem entradas explícitas. Devolve: Áreas ativas.
- `getStudyArea(studyAreaId)` (exportada; função) - Obtém uma área de estudo. Entradas: `studyAreaId`: Identificador da área. Devolve: Área encontrada.
- `createStudyArea(input)` (exportada; função) - Cria uma área de estudo. Entradas: `input`: Dados da área. Devolve: Área criada.
- `updateStudyArea(studyAreaId, input)` (exportada; função) - Atualiza campos editáveis de uma área de estudo. Entradas: `studyAreaId`: Identificador da área.; `input`: Campos editáveis. Devolve: Área atualizada.
- `archiveStudyArea(studyAreaId)` (exportada; função) - Arquiva uma área de estudo sem apagar fisicamente. Entradas: `studyAreaId`: Identificador da área. Devolve: Área arquivada.
- `updateStudyAreaVoice(studyAreaId, input)` (exportada; função) - Atualiza a voz pedagógica da área. Entradas: `studyAreaId`: Identificador da área.; `input`: Preferências de voz. Devolve: Área atualizada.
- `listMaterials(studyAreaId)` (exportada; função) - Lista materiais de uma área. Entradas: `studyAreaId`: Identificador da área. Devolve: Materiais submetidos.
- `submitTextMaterial(studyAreaId, input)` (exportada; função) - Submete URL ou tópico textual. Entradas: `studyAreaId`: Identificador da área.; `input`: Dados do material. Devolve: Material criado.
- `submitFileMaterial(studyAreaId, file, title)` (exportada; função) - Submete PDF ou DOCX via multipart. Entradas: `studyAreaId`: Identificador da área.; `file`: Ficheiro escolhido pelo aluno.; `title`: Título opcional. Devolve: Material criado.
- `prepareAiProfile(studyAreaId)` (exportada; função) - Prepara o perfil IA de uma área. Entradas: `studyAreaId`: Identificador da área. Devolve: Estado do perfil IA.
- `generateSummary(studyAreaId)` (exportada; função) - Gera resumo IA para uma área. Entradas: `studyAreaId`: Identificador da área. Devolve: Artefacto de resumo.
- `listSummaries(studyAreaId)` (exportada; função) - Lista resumos IA já gerados para uma área. Entradas: `studyAreaId`: Identificador da área. Devolve: Resumos persistidos.
- `listStudyTools(studyAreaId, type)` (exportada; função) - Lista ferramentas de estudo já geradas. Entradas: `studyAreaId`: Identificador da área.; `type`: Tipo opcional. Devolve: Artefactos IA.
- `generateStudyTool(studyAreaId, input)` (exportada; função) - Gera explicação, flashcards ou quiz. Entradas: `studyAreaId`: Identificador da área.; `input`: Pedido de geração. Devolve: Artefacto criado.
- `createQuizGenerationJob(studyAreaId, input)` (exportada; função) - Inicia geração de quiz em background. Entradas: `studyAreaId`: Área privada do aluno autenticado.; `input`: Tópico opcional; o backend escolhe fontes processáveis da área. Devolve: Job inicial para polling.
- `getQuizGenerationJob(studyAreaId, jobId)` (exportada; função) - Consulta estado de geração de quiz. Entradas: `studyAreaId`: Área privada do aluno autenticado.; `jobId`: Job devolvido pela criação. Devolve: Estado público do job.
- `submitQuizAttempt(studyAreaId, artifactId, answers)` (exportada; função) - Submete respostas de um quiz gerado pela IA. Entradas: `studyAreaId`: Identificador da área.; `artifactId`: Identificador do artefacto de quiz.; `answers`: Índices das opções escolhidas. Devolve: Resultado calculado pelo backend.
- `exportStudyToolArtifact(studyAreaId, artifactId, format)` (exportada; função) - Exporta resumo ou quiz de uma área privada. Entradas: `studyAreaId`: Área privada do aluno autenticado.; `artifactId`: Artefacto IA selecionado.; `format`: Formato pedido pela UI. Devolve: Ficheiro textual devolvido pelo backend.
- `readFileNameFromDisposition(disposition)` (top-level; função) - Lê filename do header Content-Disposition. Entradas: `disposition`: Header recebido da API. Devolve: Nome de ficheiro ou `undefined`.
- `fallbackArtifactExportFileName(format)` (top-level; função) - Define fallback de nome caso o proxy remova headers. Entradas: `format`: Formato pedido. Devolve: Nome de ficheiro local.
- `getLearningProfile(studyAreaId)` (exportada; função) - Obtém o perfil de aprendizagem de uma área para ajustar ritmo, nível e estilo da IA. Entradas: `studyAreaId`: Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno. Devolve: Perfil pedagógico atual da área.
- `updateLearningProfile(studyAreaId, input)` (exportada; função) - Atualiza o perfil de aprendizagem que orienta futuras explicações adaptativas. Entradas: `studyAreaId`: Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Perfil pedagógico persistido depois da validação backend.
- `askAdaptiveExplanation(studyAreaId, question)` (exportada; função) - Pede uma explicação adaptativa para uma pergunta do aluno dentro da área escolhida. Entradas: `studyAreaId`: Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.; `question`: Pergunta escrita pelo aluno e enviada ao backend para contexto IA controlado. Devolve: Explicação guardada com resposta e próximos passos sugeridos.
- `listStudyRooms()` (exportada; função) - Lista as salas de estudo em que o aluno autenticado participa. Entradas: sem entradas explícitas. Devolve: Salas visíveis para o aluno atual.
- `createStudyRoom(input)` (exportada; função) - Cria uma sala de estudo livre ou associada a disciplina para colaboração entre alunos. Entradas: `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Sala criada com o aluno atual como membro inicial.
- `addStudyRoomMember(roomId, email)` (exportada; função) - Adiciona um aluno a uma sala de estudo através do email. Entradas: `roomId`: Identificador da sala; o backend valida membership antes de expor dados.; `email`: Email do aluno usado pelo backend para encontrar a conta certa. Devolve: Sala atualizada com o novo membro, quando o backend autoriza.
- `listRoomShares(roomId)` (exportada; função) - Lista notas, URLs e referências de materiais partilhadas numa sala. Entradas: `roomId`: Identificador da sala; o backend valida membership antes de expor dados. Devolve: Partilhas acessíveis aos membros da sala.
- `createRoomShare(roomId, input)` (exportada; função) - Cria uma partilha numa sala e marca se pode alimentar a IA coletiva. Entradas: `roomId`: Identificador da sala; o backend valida membership antes de expor dados.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Partilha criada com metadados de uso pela IA.
- `askRoomAi(roomId, input)` (exportada; função) - Pergunta à IA da sala usando apenas partilhas autorizadas como contexto. Entradas: `roomId`: Identificador da sala; o backend valida membership antes de expor dados.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Resposta da IA da sala com fontes usadas.
- `listMyRoomAiHistory(roomId)` (exportada; função) - Lista o histórico privado da IA da sala para o aluno autenticado. Entradas: `roomId`: Identificador da sala; o backend valida membership e dono do histórico. Devolve: Interações privadas ordenadas da mais recente para a mais antiga.
- `listSharedRoomAiAnswers(roomId)` (exportada; função) - Lista respostas IA partilhadas em read-only na sala. Entradas: `roomId`: Identificador da sala; o backend valida membership antes da leitura. Devolve: Respostas partilhadas visíveis para membros da sala.
- `shareRoomAiAnswer(roomId, answerId, input)` (exportada; função) - Partilha uma resposta própria ou cria uma cópia privada de uma resposta partilhada. Entradas: `roomId`: Identificador da sala; o backend valida membership antes da operação.; `answerId`: Identificador da resposta IA; ownership/visibilidade são validados no backend.; `input`: Modo da operação. Devolve: Resultado público devolvido pela API.
- `listTeacherClasses()` (exportada; função) - Lista as turmas oficiais criadas pelo professor autenticado. Entradas: sem entradas explícitas. Devolve: Turmas geridas pelo professor atual.
- `createTeacherClass(input)` (exportada; função) - Cria uma turma oficial que depois pode receber alunos, disciplinas e materiais. Entradas: `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Turma criada com código normalizado pelo backend.
- `addClassStudent(classId, email)` (exportada; função) - Inscreve um aluno numa turma oficial usando o email. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito.; `email`: Email do aluno usado pelo backend para encontrar a conta certa. Devolve: Turma atualizada com o aluno inscrito.
- `removeClassStudent(classId, studentId)` (exportada; função) - Remove a associação de um aluno a uma turma oficial sem apagar a conta. Entradas: `classId`: Identificador da turma; o backend valida ownership pelo professor autenticado.; `studentId`: Aluno a remover da turma. Devolve: Turma atualizada após a remoção.
- `listStudentClasses()` (exportada; função) - Lista as turmas oficiais onde o aluno autenticado está inscrito. Entradas: sem entradas explícitas. Devolve: Turmas visíveis para o aluno atual.
- `listSubjects(classId)` (exportada; função) - Lista disciplinas de uma turma para o professor dono. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito. Devolve: Disciplinas configuradas na turma.
- `listStudentSubjects(classId)` (exportada; função) - Lista disciplinas de uma turma acessíveis ao aluno inscrito. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito. Devolve: Disciplinas visíveis para o aluno.
- `createSubject(classId, input)` (exportada; função) - Cria uma disciplina dentro de uma turma do professor autenticado. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Disciplina criada e associada à turma.
- `listOfficialMaterials(subjectId)` (exportada; função) - Lista materiais oficiais de uma disciplina para gestão docente. Entradas: `subjectId`: Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto. Devolve: Materiais oficiais da disciplina.
- `createOfficialMaterial(subjectId, input)` (exportada; função) - Cria material oficial textual ou URL para uma disciplina. Entradas: `subjectId`: Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Material oficial criado e pronto para processamento ou referência.
- `getClassTeacherAiVoice(classId)` (exportada; função) - Obtém a voz pedagógica base configurada pelo professor para a turma. Entradas: `classId`: Identificador da turma; o backend valida professor dono. Devolve: Configuração atual da voz base da turma.
- `updateClassTeacherAiVoice(classId, input)` (exportada; função) - Atualiza tom, detalhe e orientações da IA que guiam a voz docente da turma. Entradas: `classId`: Identificador da turma; o backend valida professor dono.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Voz docente persistida para a turma.
- `getTeacherAiVoice(subjectId)` (exportada; função) - Obtém a voz pedagógica efetiva da disciplina. Entradas: `subjectId`: Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto. Devolve: Override da disciplina, voz herdada da turma ou defaults.
- `updateTeacherAiVoice(subjectId, input)` (exportada; função) - Atualiza tom, detalhe e orientações da IA que sobrepõem a voz herdada na disciplina. Entradas: `subjectId`: Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Override da disciplina persistido.
- `deleteTeacherAiVoiceOverride(subjectId)` (exportada; função) - Remove o override de voz da disciplina e volta a herdar da turma. Entradas: `subjectId`: Identificador da disciplina; o backend valida professor dono. Devolve: Voz efetiva depois de remover o override.
- `askClassAi(subjectId, question)` (exportada; função) - Pergunta à IA da disciplina usando materiais oficiais e voz docente. Entradas: `subjectId`: Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.; `question`: Pergunta escrita pelo aluno e enviada ao backend para contexto IA controlado. Devolve: Resposta da IA com fontes oficiais citáveis.
- `listTeacherClassPosts(classId)` (exportada; função) - Lista publicações de uma turma para o professor. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito. Devolve: Avisos e posts da turma.
- `listStudentClassPosts(classId)` (exportada; função) - Lista publicações visíveis ao aluno numa turma inscrita. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito. Devolve: Avisos e posts disponíveis para o aluno.
- `createClassPost(classId, input)` (exportada; função) - Cria aviso ou publicação para alunos de uma turma. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Publicação criada pelo professor.
- `listTeacherGuidedStudyRooms(classId)` (exportada; função) - Lista salas de estudo guiado criadas pelo professor para uma turma. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito. Devolve: Salas guiadas da turma.
- `listStudentGuidedStudyRooms(classId)` (exportada; função) - Lista salas de estudo guiado visíveis ao aluno inscrito numa turma. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito. Devolve: Salas guiadas acessíveis ao aluno.
- `createGuidedStudyRoom(classId, input)` (exportada; função) - Cria uma sala guiada com objetivos e instruções docentes. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Sala guiada criada para a turma.
- `listTeacherClassProjects(classId)` (exportada; função) - Lista projetos de uma turma para gestão do professor. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito. Devolve: Projetos existentes na turma.
- `listStudentClassProjects(classId)` (exportada; função) - Lista projetos publicados para o aluno numa turma. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito. Devolve: Projetos disponíveis para o aluno.
- `createClassProject(classId, input)` (exportada; função) - Cria projeto de turma com estado rascunho ou publicado. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Projeto criado no contexto da turma.
- `createProjectAiPlan(projectId, input)` (exportada; função) - Pede à IA um plano gradual para apoiar um projeto de turma. Entradas: `projectId`: Valor tipado usado para construir o pedido à API.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Plano estruturado com passos e checkpoints.
- `listOfficialTests(subjectId)` (exportada; função) - Lista testes oficiais associados a uma disciplina. Entradas: `subjectId`: Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto. Devolve: Testes ou mini-testes oficiais da disciplina.
- `getOfficialTestRanking(subjectId, testId)` (exportada; função) - Obtém ranking docente de um mini-teste oficial. Entradas: `subjectId`: Disciplina do professor autenticado.; `testId`: Mini-teste oficial. Devolve: Ranking minimizado e autorizado pelo backend.
- `listStudentOfficialTests(subjectId)` (exportada; função) - Lista mini-testes oficiais publicados para o aluno autenticado. Entradas: `subjectId`: Disciplina oficial; o backend valida inscrição pela sessão. Devolve: Mini-testes sem `correctOptionIndex` antes da submissão.
- `submitOfficialTestAttempt(subjectId, testId, input)` (exportada; função) - Submete respostas de um aluno para um mini-teste oficial publicado. Entradas: `subjectId`: Disciplina oficial; a sessão define o aluno real.; `testId`: Mini-teste publicado.; `input`: Índices escolhidos pelo aluno. Devolve: Tentativa pontuada e persistida pelo backend.
- `createOfficialTest(subjectId, input)` (exportada; função) - Cria teste oficial com perguntas de escolha múltipla. Entradas: `subjectId`: Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Teste oficial criado pelo professor.
- `listAiContentReviews(subjectId)` (exportada; função) - Lista conteúdos IA pendentes ou decididos para revisão docente. Entradas: `subjectId`: Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto. Devolve: Revisões de conteúdo IA da disciplina.
- `createAiContentReview(subjectId, input)` (exportada; função) - Regista conteúdo gerado por IA para aprovação ou rejeição do professor. Entradas: `subjectId`: Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Revisão criada em estado controlado.
- `decideAiContentReview(reviewId, input)` (exportada; função) - Aprova ou rejeita uma revisão de conteúdo IA com comentário docente. Entradas: `reviewId`: Identificador da revisão de conteúdo IA a decidir.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Revisão atualizada com decisão auditável.
- `getClassProgress(classId)` (exportada; função) - Obtém métricas agregadas de progresso de uma turma para o professor. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito. Devolve: Resumo de progresso e notas da turma.
- `createClassProgressNote(classId, input)` (exportada; função) - Cria nota docente sobre progresso, dificuldade ou acompanhamento da turma. Entradas: `classId`: Identificador da turma; o backend valida professor dono ou aluno inscrito.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Nota registada no painel de progresso.
- `indexPrivateMaterial(studyAreaId, materialId)` (exportada; função) - Inicia indexação textual de material privado do aluno. Entradas: `studyAreaId`: Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.; `materialId`: Identificador do material; o backend valida ownership ou ligação oficial antes de agir. Devolve: Job de indexação privado com estado e chunks quando disponíveis.
- `getMaterialIndexJob(jobId)` (exportada; função) - Consulta o estado de um job de indexação autorizado. Entradas: `jobId`: Job devolvido pelo pedido inicial; o backend valida ownership. Devolve: Job com estado atualizado para a UI.
- `indexOfficialMaterial(materialId)` (exportada; função) - Inicia indexação textual de material oficial da disciplina. Entradas: `materialId`: Identificador do material; o backend valida ownership ou ligação oficial antes de agir. Devolve: Job de indexação oficial com estado e chunks quando disponíveis.
- `createPrivateMaterialVersion(studyAreaId, materialId)` (exportada; função) - Cria nova versão de material privado a partir de conteúdo submetido pelo aluno. Entradas: `studyAreaId`: Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.; `materialId`: Identificador do material; o backend valida ownership ou ligação oficial antes de agir. Devolve: Versão privada criada e associada ao material.
- `createOfficialMaterialVersion(materialId)` (exportada; função) - Cria nova versão de material oficial para histórico docente. Entradas: `materialId`: Identificador do material; o backend valida ownership ou ligação oficial antes de agir. Devolve: Versão oficial criada e associada ao material.
- `createMaterialVersionFromJob(jobId, input)` (exportada; função) - Cria versão a partir de um job de indexação concluído. Entradas: `jobId`: Identificador do job de indexação usado para versões, contexto ou leitura de chunks.; `input`: Payload tipado enviado para a API; validação final continua no backend. Devolve: Versão ligada ao job que originou o texto.
- `listMaterialVersions(jobId)` (exportada; função) - Lista histórico de versões criado para um job de indexação. Entradas: `jobId`: Identificador do job de indexação usado para versões, contexto ou leitura de chunks. Devolve: Versões disponíveis para consulta ou restauro.
- `restoreMaterialVersion(jobId, versionId)` (exportada; função) - Restaura uma versão anterior de material. Entradas: `jobId`: Identificador do job de indexação usado para versões, contexto ou leitura de chunks.; `versionId`: Identificador da versão a restaurar no histórico do material. Devolve: Versão restaurada segundo as regras do backend.
- `listPrivateMaterialContext(studyAreaId)` (exportada; função) - Lista contexto pedagógico de material privado numa área de estudo. Entradas: `studyAreaId`: Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno. Devolve: Contextos privados autorizados para o aluno.
- `listSubjectMaterialContext(subjectId)` (exportada; função) - Lista contexto pedagógico de material oficial numa disciplina. Entradas: `subjectId`: Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto. Devolve: Contextos oficiais disponíveis para professor ou aluno inscrito.
- `askPrivateAreaAi(studyAreaId, question)` (exportada; função) - Pergunta à IA privada da área usando apenas materiais do aluno. Entradas: `studyAreaId`: Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.; `question`: Pergunta escrita pelo aluno e enviada ao backend para contexto IA controlado. Devolve: Resposta da IA privada com fontes autorizadas.

### `real_dev/web/src/lib/format-date-pt.ts`

- `formatDatePt(value)` (exportada; função) - Formata uma data técnica para apresentação curta em português de Portugal. Entradas: `value`: Data ISO, `Date` ou valor vazio vindo de um contrato já autorizado. Devolve: Data em `dd/mm/aaaa`, `Data indisponível` ou `Data inválida`.

### `real_dev/web/src/lib/messages.ts`

- `isMessageKey(key)` (exportada; função) - Confirma se uma string corresponde a uma chave conhecida do catálogo local. Entradas: `key`: Chave recebida de código dinâmico. Devolve: Verdadeiro quando a chave existe em `messageKeys`.
- `t(key)` (exportada; função) - Resolve uma mensagem cuja chave é conhecida em tempo de desenvolvimento. Entradas: `key`: Chave tipada do catálogo. Devolve: Mensagem visível em português de Portugal.
- `tOrDefault(key)` (exportada; função) - Resolve uma chave dinâmica com fallback seguro para a interface. Entradas: `key`: Chave potencialmente desconhecida. Devolve: Mensagem conhecida ou fallback genérico.

### `real_dev/web/src/pages/admin/AdminGovernancePage.tsx`

- `AdminGovernancePage()` (exportada; função) - Página admin para gestão de utilizadores, auditoria e limites. Entradas: sem entradas explícitas. Devolve: Página de governança.

### `real_dev/web/src/pages/auth/LoginPage.tsx`

- `LoginPage({ onLoggedIn })` (exportada; função) - Página de login com email/password. Entradas: `props`: Callback que recarrega a sessão depois do login. Devolve: Formulário de autenticação alinhado com BK-MF0-02.
- `LoginPage.handleSubmit(event)` (interna; função) - Submete credenciais à API. Entradas: `event`: Evento de submissão do formulário. Devolve: Promise resolvida quando a sessão for recarregada.

### `real_dev/web/src/pages/auth/RegisterPage.tsx`

- `RegisterPage()` (exportada; função) - Página de registo de aluno. Entradas: sem entradas explícitas. Devolve: Formulário do BK-MF0-01 com validação básica no frontend.
- `RegisterPage.handleSubmit(event)` (interna; função) - Submete o registo à API. Entradas: `event`: Evento de formulário. Devolve: Promise resolvida depois da resposta do backend.

### `real_dev/web/src/pages/shared/MaterialContextsPage.tsx`

- `MaterialContextsPage({ contextType, contextId, })` (exportada; função) - Página de consulta dos contexts autorizados de materiais para IA. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `MaterialContextsPage.loadContexts()` (interna; função) - Carrega shared no formato necessário ao próximo passo do fluxo. Entradas: sem entradas explícitas. Devolve: Entidade de shared já filtrada pelo contexto recebido.

### `real_dev/web/src/pages/shared/MaterialVersionsPage.tsx`

- `MaterialVersionsPage({ jobId })` (exportada; função) - Página de gestão de versões produzidas por jobs de indexação concluídos. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `MaterialVersionsPage.loadVersions()` (interna; função) - Carrega shared no formato necessário ao próximo passo do fluxo. Entradas: sem entradas explícitas. Devolve: Entidade de shared já filtrada pelo contexto recebido.
- `MaterialVersionsPage.handleCreate(event)` (interna; função) - Trata a interação do utilizador em shared, sincronizando formulário, estado e pedido à API. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Resultado da operação no formato esperado pelo chamador.
- `MaterialVersionsPage.handleRestore(versionId)` (interna; função) - Trata a interação do utilizador em shared, sincronizando formulário, estado e pedido à API. Entradas: `versionId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/web/src/pages/student/AdaptiveLearningPage.tsx`

- `AdaptiveLearningPage({ studyAreaId })` (exportada; função) - Página de aprendizagem adaptativa por área de estudo. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `AdaptiveLearningPage.load()` (interna; função) - Carrega student no formato necessário ao próximo passo do fluxo. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AdaptiveLearningPage.handleProfileSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `AdaptiveLearningPage.handleQuestionSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/student/Mf3CommunityPage.tsx`

- `Mf3CommunityPage()` (exportada; função) - Página agregadora dos fluxos MF3. Entradas: sem entradas explícitas. Devolve: Painéis de comunidade, guardrails, pesquisa e notificações.

### `real_dev/web/src/pages/student/OfficialTestAttemptPage.tsx`

- `OfficialTestAttemptPage({ subjectId })` (exportada; função) - Página onde o aluno realiza mini-testes publicados por professores. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `OfficialTestAttemptPage.loadTests()` (interna; função) - Obtém a ação de interface ligada a páginas React, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `OfficialTestAttemptPage.updateAnswer(testId, questionIndex, optionIndex)` (interna; função) - Guarda localmente uma opção escolhida sem calcular pontuação no browser. Entradas: `testId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `questionIndex`: Posição usada para relacionar itens derivados com a sua origem.; `optionIndex`: Posição usada para relacionar itens derivados com a sua origem. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `OfficialTestAttemptPage.getCompleteAnswers(test)` (interna; função) - Extrai respostas completas antes de permitir submissão. Entradas: `test`: Mini-teste publicado. Devolve: Lista completa de respostas ou `null` quando falta alguma.
- `OfficialTestAttemptPage.handleSubmit(event, test)` (interna; função) - Envia respostas ao backend para validação, pontuação e persistência. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.; `test`: Valor de test usado pela função para executar handle submit com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/student/PrivacyPage.tsx`

- `PrivacyPage()` (exportada; função) - Página de privacidade, exportação, eliminação e consentimentos. Entradas: sem entradas explícitas. Devolve: Página de privacidade.

### `real_dev/web/src/pages/student/PrivateAreaAiPage.tsx`

- `PrivateAreaAiPage({ studyAreaId })` (exportada; função) - Página do assistente IA privado por área. Entradas: `props`: Identificador da area privada. Devolve: Formulario de pergunta e resposta IA autorizada.
- `PrivateAreaAiPage.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/student/ProfilePage.tsx`

- `ProfilePage()` (exportada; função) - Página de edição do perfil do aluno. Entradas: sem entradas explícitas. Devolve: Formulário protegido de perfil.
- `ProfilePage.updateField(field, value)` (interna; função) - Atualiza um campo simples do formulário. Entradas: `field`: Valor de field usado pela função para executar update field com dados explícitos.; `value`: Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `ProfilePage.handleSubmit(event)` (interna; função) - Guarda o perfil no backend. Entradas: `event`: Evento de submissão. Devolve: Promise resolvida depois da resposta da API.

### `real_dev/web/src/pages/student/ProjectAiPlanPage.tsx`

- `ProjectAiPlanPage({ projectId })` (exportada; função) - Página para gerar plano gradual de projecto. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `ProjectAiPlanPage.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/student/RoomAiPage.tsx`

- `RoomAiPage({ roomId })` (exportada; função) - Página da IA partilhada da sala. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `RoomAiPage.handleSubmit(event)` (interna; função) - Trata a ação do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `RoomAiPage.handleShareCurrentAnswer()` (interna; função) - Partilha a resposta própria mais recente em modo read-only. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `RoomAiPage.handleCreatePrivateFork(sharedAnswer)` (interna; função) - Guarda uma cópia privada de uma resposta partilhada. Entradas: `sharedAnswer`: Valor de sharedAnswer usado pela função para executar handle create private fork com dados explícitos. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/student/RoomSharesPage.tsx`

- `RoomSharesPage({ roomId })` (exportada; função) - Página de partilhas de uma sala. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `RoomSharesPage.refresh()` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `RoomSharesPage.handleShareSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `RoomSharesPage.handleMemberSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/student/RoutinesPage.tsx`

- `RoutinesPage()` (exportada; função) - Página de rotinas e objetivos. Entradas: sem entradas explícitas. Devolve: Formulários e listagem de organização pessoal.
- `RoutinesPage.refresh()` (interna; função) - Recarrega rotinas e objetivos. Entradas: sem entradas explícitas. Devolve: Promise resolvida depois de atualizar estado.
- `RoutinesPage.handleRoutine(event)` (interna; função) - Cria ou atualiza uma rotina com os campos reais do contrato. Entradas: `event`: Evento de submissão. Devolve: Promise resolvida depois da gravação.
- `RoutinesPage.handleGoal(event)` (interna; função) - Cria ou atualiza um objetivo com os campos reais do contrato. Entradas: `event`: Evento de submissão. Devolve: Promise resolvida depois da gravação.
- `RoutinesPage.toggleWeekday(weekday)` (interna; função) - Alterna um dia da semana no formulário de rotina. Entradas: `weekday`: Dia escolhido. Devolve: Nada; atualiza estado local.
- `RoutinesPage.beginEditRoutine(routine)` (interna; função) - Coloca uma rotina existente em edição. Entradas: `routine`: Rotina escolhida. Devolve: Nada; atualiza estado local.
- `RoutinesPage.beginEditGoal(goal)` (interna; função) - Coloca um objetivo existente em edição. Entradas: `goal`: Objetivo escolhido. Devolve: Nada; atualiza estado local.
- `RoutinesPage.handleArchiveRoutine(routineId)` (interna; função) - Arquiva uma rotina do aluno autenticado. Entradas: `routineId`: Identificador da rotina. Devolve: Promise resolvida depois do refresh.
- `RoutinesPage.handleToggleGoal(goal)` (interna; função) - Alterna o estado concluído de um objetivo. Entradas: `goal`: Objetivo escolhido. Devolve: Promise resolvida depois do refresh.
- `RoutinesPage.handleArchiveGoal(goalId)` (interna; função) - Arquiva um objetivo do aluno autenticado. Entradas: `goalId`: Identificador do objetivo. Devolve: Promise resolvida depois do refresh.
- `RoutinesPage.resetRoutineForm()` (interna; função) - Limpa o formulário de rotina. Entradas: sem entradas explícitas. Devolve: Nada; atualiza estado local.
- `RoutinesPage.resetGoalForm()` (interna; função) - Limpa o formulário de objetivo. Entradas: sem entradas explícitas. Devolve: Nada; atualiza estado local.
- `toDateInputValue(value)` (top-level; função) - Converte uma data persistida para o formato de input HTML. Entradas: `value`: Data serializada. Devolve: Data `YYYY-MM-DD` ou string vazia.

### `real_dev/web/src/pages/student/SoloStudyDashboard.tsx`

- `SoloStudyDashboard()` (exportada; função) - Dashboard do modo individual sem turma obrigatória. Entradas: sem entradas explícitas. Devolve: Painel inicial do aluno.
- `SoloStudyDashboard.load()` (interna; função) - Obtém a ação de interface ligada a páginas React, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/student/StudentClassAiPage.tsx`

- `StudentClassAiPage({ subjectId })` (exportada; função) - Página da IA limitada da disciplina. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `StudentClassAiPage.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/student/StudentClassesPage.tsx`

- `StudentClassesPage()` (exportada; função) - Página de turmas onde o aluno está inscrito. Entradas: sem entradas explícitas. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.

### `real_dev/web/src/pages/student/StudentClassPostsPage.tsx`

- `StudentClassPostsPage({ classId })` (exportada; função) - Página de publicações oficiais visíveis ao aluno inscrito. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.

### `real_dev/web/src/pages/student/StudentClassProjectsPage.tsx`

- `StudentClassProjectsPage({ classId })` (exportada; função) - Página do aluno para projectos publicados da turma. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.

### `real_dev/web/src/pages/student/StudentClassSubjectsPage.tsx`

- `StudentClassSubjectsPage({ classId })` (exportada; função) - Página de disciplinas disponíveis para o aluno numa turma onde está inscrito. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.

### `real_dev/web/src/pages/student/StudentSubjectChatPage.tsx`

- `StudentSubjectChatPage({ subjectId })` (exportada; função) - Página do aluno para chat contextual da disciplina. Entradas: `props`: Identificador da disciplina vindo da rota `/app/disciplinas/:subjectId/chat`. Devolve: `SubjectChatPanel` em modo `STUDENT`.

### `real_dev/web/src/pages/student/StudentGuidedStudyRoomsPage.tsx`

- `StudentGuidedStudyRoomsPage({ classId })` (exportada; função) - Página do aluno para consultar salas guiadas da turma. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.

### `real_dev/web/src/pages/student/StudyAreaDetailPage.tsx`

- `StudyAreaDetailPage({ studyAreaId })` (exportada; função) - Página de detalhe de uma área. Entradas: `props`: Identificador da área. Devolve: Detalhe, atalhos, voz e perfil IA.
- `StudyAreaDetailPage.handleUpdate(input)` (interna; função) - Atualiza nome e descrição da área. Entradas: `input`: Campos editáveis do formulário. Devolve: Verdadeiro quando a gravação conclui.
- `StudyAreaDetailPage.handleArchive()` (interna; função) - Arquiva a área atual e regressa à listagem. Entradas: sem entradas explícitas. Devolve: Promise resolvida depois do arquivo.

### `real_dev/web/src/pages/student/StudyAreaMaterialsPage.tsx`

- `StudyAreaMaterialsPage({ studyAreaId })` (exportada; função) - Página de materiais de uma área. Entradas: `props`: Identificador da área. Devolve: Submissão e lista de materiais.
- `StudyAreaMaterialsPage.refresh()` (interna; função) - Recarrega os materiais da área autenticada. Entradas: sem entradas explícitas. Devolve: Promise resolvida depois de atualizar a lista visivel.

### `real_dev/web/src/pages/student/StudyAreasPage.tsx`

- `StudyAreasPage()` (exportada; função) - Página de criação e listagem de áreas de estudo. Entradas: sem entradas explícitas. Devolve: Gestão simples de áreas pessoais.
- `StudyAreasPage.refresh()` (interna; função) - Recarrega áreas da API. Entradas: sem entradas explícitas. Devolve: Promise resolvida depois de atualizar estado.
- `StudyAreasPage.handleSubmit(input)` (interna; função) - Cria uma nova área. Entradas: `input`: Dados editáveis da área. Devolve: Verdadeiro quando a criação conclui.

### `real_dev/web/src/pages/student/StudyHistoryPage.tsx`

- `StudyHistoryPage()` (exportada; função) - Página do histórico de estudo. Entradas: sem entradas explícitas. Devolve: Histórico pessoal do aluno autenticado.
- `StudyHistoryPage.loadHistory()` (interna; função) - Obtém a ação de interface ligada a páginas React, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/student/StudyRoomsPage.tsx`

- `StudyRoomsPage()` (exportada; função) - Página de salas de estudo do aluno. Entradas: sem entradas explícitas. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `StudyRoomsPage.refresh()` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `StudyRoomsPage.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/student/StudyToolsPage.tsx`

- `StudyToolsPage({ studyAreaId })` (exportada; função) - Página de resumos e ferramentas IA da área. Entradas: `props`: Identificador da área. Devolve: Controlos de geração e resultado.
- `StudyToolsPage.refreshArtifacts(preferredArtifactId)` (interna; função) - Recarrega artefactos IA já persistidos para a área. Entradas: `preferredArtifactId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `StudyToolsPage.handleSummary()` (interna; função) - Gera um resumo para a área. Entradas: sem entradas explícitas. Devolve: Promise resolvida depois de guardar resultado.
- `StudyToolsPage.handleTool(event)` (interna; função) - Gera a ferramenta de estudo escolhida. Entradas: `event`: Evento de submissão. Devolve: Promise resolvida depois de guardar resultado.
- `ArtifactExportPanel({ artifact, studyAreaId, })` (top-level; função) - Mostra ações de exportação para resumos e quizzes autorizados. Entradas: `props`: Artefacto selecionado e área privada. Devolve: Painel com ações e estados de exportação.
- `ArtifactExportPanel.handleExport(format)` (interna; função) - Executa exportação segura através do backend. Entradas: `format`: Formato pedido pelo aluno. Devolve: Promise resolvida depois da ação local.
- `downloadArtifactFile(file)` (top-level; função) - Descarrega ficheiro textual devolvido pelo backend. Entradas: `file`: Ficheiro recebido ou processado pela operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `openPrintableArtifact(file)` (top-level; função) - Abre documento de impressão preparado pela API. Entradas: `file`: Ficheiro recebido ou processado pela operação. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `ArtifactList({ artifacts, emptyText, onSelect, selectedId, title, })` (top-level; função) - Lista artefactos já persistidos da área. Entradas: `props`: Artefactos, seleção e texto vazio. Devolve: Lista compacta de artefactos.
- `artifactLabel(artifact)` (top-level; função) - Obtém uma etiqueta curta para um artefacto. Entradas: `artifact`: Artefacto IA. Devolve: Texto visível na lista.

### `real_dev/web/src/pages/teacher/OfficialTestRankingPage.tsx`

- `OfficialTestRankingPage({ subjectId, testId, })` (exportada; função) - Página docente de ranking de mini-testes oficiais. Entradas: `props`: Identificadores da disciplina e do teste vindos da URL. Devolve: Tabela de ranking ou estados controlados.
- `OfficialTestRankingPage.loadRanking()` (interna; função) - Carrega o ranking sem tentar decidir permissões no browser. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/teacher/TeacherAiContentReviewsPage.tsx`

- `TeacherAiContentReviewsPage({ subjectId })` (exportada; função) - Página docente para rever conteúdo gerado por IA. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `TeacherAiContentReviewsPage.refresh()` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `TeacherAiContentReviewsPage.handleCreate(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `TeacherAiContentReviewsPage.decide(reviewId, status)` (interna; função) - Executa a operação decide no domínio de teacher com contrato explícito. Entradas: `reviewId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.; `status`: Estado funcional usado para decidir o próximo passo ou a resposta pública. Devolve: Resultado da operação no formato esperado pelo chamador.

### `real_dev/web/src/pages/teacher/TeacherAiVoicePage.tsx`

- `splitRulesForEditor(rules)` (top-level; função) - Separa orientações conhecidas das orientações livres para preencher os controlos guiados da voz da IA. Entradas: `rules`: Orientações efetivas carregadas da API. Devolve: Seleções dos grupos pedagógicos e texto livre restante.
- `buildVoiceRules(selections, customRulesText)` (top-level; função) - Compõe as opções guiadas e as orientações livres no campo técnico `rules`. Entradas: `selections`: Escolhas dos grupos Estratégia, Feedback, Exemplos e Limites.; `customRulesText`: Orientações livres, uma por linha. Devolve: Lista normalizada de orientações a enviar para a API.
- `validateVoiceRules(rules)` (top-level; função) - Valida localmente os limites da voz docente antes de guardar. Entradas: `rules`: Orientações já compostas. Devolve: Mensagem de erro ou `null`; aplica máximo de 12 orientações e 180 caracteres por orientação.
- `VoiceGuidanceTooltip({ tooltipId })` (top-level; função) - Mostra a tooltip do ícone `i` junto ao campo "Orientações da IA". Entradas: `tooltipId`: Identificador acessível da tooltip. Devolve: Botão compacto com explicação contextual.
- `TeacherClassAiVoiceDialog({ classId, className, onClose })` (exportada; função) - Modal contextual para editar a voz base da turma sem sair da página de turmas. Entradas: `classId`: Turma cuja voz será editada.; `className`: Nome visível da turma.; `onClose`: Callback usado ao fechar ou guardar com sucesso. Devolve: Dialog acessível com o editor de voz.
- `TeacherClassAiVoiceEditor({ classId, className, surface, onClose })` (interna; função) - Carrega, edita e guarda a voz base da turma numa página ou modal. Entradas: `classId`: Turma alvo.; `className`: Nome opcional da turma.; `surface`: Contexto visual `page` ou `dialog`.; `onClose`: Callback opcional de fecho. Devolve: Formulário de voz da IA docente.
- `TeacherAiVoicePage({ subjectId })` (exportada; função) - Página de configuração do override textual docente numa disciplina. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `TeacherAiVoicePage.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `TeacherAiVoicePage.handleDeleteOverride()` (interna; função) - Remove o override da disciplina e repõe a voz herdada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `TeacherVoiceForm({ title, subtitle, voice, rulesText, ruleSelections, error, success, isSubjectOverride, onVoiceChange, onRulesChange, onRuleSelectionChange, onSubmit, onDeleteOverride, onClose, surface })` (top-level; função) - Renderiza os controlos partilhados da voz docente: tom, detalhe, comportamento pedagógico e Orientações da IA. Entradas: `props`: Estado da voz, seleções guiadas, texto livre, estados de erro/sucesso e callbacks de ação. Devolve: Formulário reutilizável para modal de turma ou página de override da disciplina.

### `real_dev/web/src/pages/teacher/TeacherClassesPage.tsx`

- `TeacherClassesPage()` (exportada; função) - Página de turmas oficiais do professor. Entradas: sem entradas explícitas. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `normalizeSearchText(value)` (top-level; função) - Normaliza texto de pesquisa para filtrar turmas por nome, código ou ano letivo sem depender de maiúsculas, minúsculas ou espaços laterais. Entradas: `value`: Texto digitado ou campo de turma usado na pesquisa local. Devolve: Texto normalizado para comparação.
- `formatStudentCount(count)` (top-level; função) - Formata a contagem de alunos com singular/plural correto. Entradas: `count`: Número de alunos associados à turma. Devolve: Texto legível para o card e o acordeão.
- `formatClassCount(count)` (top-level; função) - Formata a contagem total de turmas do professor. Entradas: `count`: Número de turmas carregadas. Devolve: Texto legível para a toolbar.
- `formatVisibleClassCount(visibleCount, totalCount)` (top-level; função) - Formata a contagem contextual quando há pesquisa ativa. Entradas: `visibleCount`: Turmas visíveis após filtro.; `totalCount`: Total de turmas carregadas. Devolve: Texto no formato `X de Y turmas visíveis`.
- `getSchoolYearStart(schoolYear)` (top-level; função) - Extrai o primeiro ano de um ano letivo para ordenação local. Entradas: `schoolYear`: Texto como `2025/2026`. Devolve: Ano numérico ou fallback seguro.
- `getCreatedAtTimestamp(createdAt)` (top-level; função) - Converte `createdAt` opcional em timestamp para ordenar turmas recentes. Entradas: `createdAt`: Data ISO opcional devolvida pela API. Devolve: Timestamp ou `0`.
- `getStudentSectionClassIdFromHash()` (top-level; função) - Lê o hash `#students-:classId` para abrir diretamente o painel de alunos de uma turma. Entradas: sem entradas explícitas; usa `window.location.hash`. Devolve: Identificador da turma ou `null`.
- `validateTeacherClassFields(input)` (top-level; função) - Valida localmente criação de turma alinhada com o DTO backend. Entradas: `input`: Campos `name`, `code` e `schoolYear` já aparados. Devolve: Mapa de erros por campo para a UI.
- `TeacherClassesPage.loadInitialClasses(active)` (interna; função) - Carrega as turmas iniciais respeitando unmounts durante a chamada assíncrona. Entradas: `active`: Função que indica se o componente ainda pode receber estado. Devolve: Promise resolvida depois de carregar ou falhar de forma controlada.
- `TeacherClassesPage.upsertClass(nextClass)` (interna; função) - Aplica no estado local a turma criada ou atualizada devolvida pela API. Entradas: `nextClass`: Payload confirmado por `createTeacherClass`, `addClassStudent` ou `removeClassStudent`. Devolve: Nada; apenas sincroniza a lista local.
- `TeacherClassesPage.clearClassFieldError(field)` (interna; função) - Remove uma mensagem de validação quando o professor começa a corrigir o campo. Entradas: `field`: Campo do formulário de criação de turma. Devolve: Nada; apenas atualiza estado local.
- `TeacherClassesPage.clearStudentFieldError(classId)` (interna; função) - Remove o erro do email de aluno dentro da turma indicada. Entradas: `classId`: Turma onde o professor está a escrever. Devolve: Nada; apenas atualiza estado local.
- `TeacherClassesPage.toggleStudentSection(classId)` (interna; função) - Alterna o acordeão de alunos de uma turma sem alterar a rota. Entradas: `classId`: Turma cujo painel deve abrir ou fechar. Devolve: Nada; apenas atualiza estado local.
- `TeacherClassesPage.openStudentSection(classId)` (interna; função) - Abre diretamente o painel de alunos de uma turma. Entradas: `classId`: Turma cujo painel deve ficar visível. Devolve: Nada; apenas atualiza estado local.
- `TeacherClassesPage.handleCreate(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface que dispara a acao. Devolve: Promise resolvida depois de criar ou reportar erro.
- `TeacherClassesPage.handleAddStudent(classId)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `classId`: Identificador usado para limitar a operação a turma. Devolve: Promise resolvida depois de associar aluno ou reportar erro.
- `TeacherClassesPage.handleRemoveStudent(classId, className, studentId, studentEmail)` (interna; função) - Remove a associação de um aluno após confirmação explícita do professor. Entradas: `classId`: Turma onde o aluno está inscrito.; `className`: Nome da turma para contexto visual.; `studentId`: Aluno a desassociar.; `studentEmail`: Email visível do aluno. Devolve: Promise resolvida depois de remover ou reportar erro.

### `real_dev/web/src/pages/teacher/TeacherClassPostsPage.tsx`

- `TeacherClassPostsPage({ classId })` (exportada; função) - Página de publicações do professor. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `TeacherClassPostsPage.refresh()` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `TeacherClassPostsPage.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `PostList({ posts })` (top-level; função) - Executa a operação post list no domínio de teacher com contrato explícito. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.

### `real_dev/web/src/pages/teacher/TeacherClassProgressPage.tsx`

- `TeacherClassProgressPage({ classId })` (exportada; função) - Página docente com métricas agregadas da turma. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `TeacherClassProgressPage.loadProgress()` (interna; função) - Carrega teacher no formato necessário ao próximo passo do fluxo. Entradas: sem entradas explícitas. Devolve: Entidade de teacher já filtrada pelo contexto recebido.
- `TeacherClassProgressPage.handleSubmit(event)` (interna; função) - Trata a interação do utilizador em teacher, sincronizando formulário, estado e pedido à API. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Resultado da operação no formato esperado pelo chamador.
- `Metric({ label, value })` (top-level; função) - Executa a operação metric no domínio de teacher com contrato explícito. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.

### `real_dev/web/src/pages/teacher/TeacherClassProjectsPage.tsx`

- `TeacherClassProjectsPage({ classId })` (exportada; função) - Página docente de projectos da turma. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `TeacherClassProjectsPage.refresh()` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `TeacherClassProjectsPage.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/teacher/TeacherFollowUpAlertsPage.tsx`

- `TeacherFollowUpAlertsPage()` (exportada; função) - Página docente para regras de acompanhamento e notificações de turma. Entradas: sem entradas explícitas. Devolve: Página de acompanhamento docente.

### `real_dev/web/src/pages/teacher/TeacherGuidedStudyRoomsPage.tsx`

- `TeacherGuidedStudyRoomsPage({ classId })` (exportada; função) - Página docente de salas de estudo guiado. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `TeacherGuidedStudyRoomsPage.refresh()` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `TeacherGuidedStudyRoomsPage.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx`

- `TeacherOfficialMaterialsPage({ subjectId })` (exportada; função) - Página de materiais oficiais da disciplina. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `TeacherOfficialMaterialsPage.refresh()` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `TeacherOfficialMaterialsPage.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `TeacherOfficialMaterialsPage.handleIndex(materialId)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `materialId`: Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/teacher/TeacherOfficialTestsPage.tsx`

- `TeacherOfficialTestsPage({ subjectId })` (exportada; função) - Página docente de mini-testes oficiais. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `TeacherOfficialTestsPage.refresh()` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `TeacherOfficialTestsPage.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/teacher/TeacherSubjectsPage.tsx`

- `TeacherSubjectsPage({ classId })` (exportada; função) - Página de disciplinas de uma turma. Entradas: `props`: Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI. Devolve: Elemento React pronto a ser renderizado pela página ou rota atual.
- `TeacherSubjectsPage.refresh()` (interna; função) - Recarrega dados remotos para manter a interface atualizada. Entradas: sem entradas explícitas. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
- `TeacherSubjectsPage.handleSubmit(event)` (interna; função) - Trata a acao do utilizador e sincroniza o estado da interface. Entradas: `event`: Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário. Devolve: Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.

### `real_dev/web/src/pages/teacher/TeacherSubjectChatPage.tsx`

- `TeacherSubjectChatPage({ subjectId })` (exportada; função) - Página do professor para chat contextual da disciplina. Entradas: `props`: Identificador da disciplina vindo da rota `/app/professor/disciplinas/:subjectId/chat`. Devolve: `SubjectChatPanel` em modo `TEACHER`.

### `real_dev/web/src/routes/protectedRoutes.tsx`

- `resolveProtectedPage(pathname)` (top-level; função) - Resolve a página protegida a partir do `window.location.pathname`. Entradas: `pathname`: Caminho atual do browser. Devolve: Elemento React da página correspondente.
- `ProtectedRoutes({ user, onLogout })` (exportada; função) - Renderiza páginas protegidas dentro da shell comum. Entradas: `props`: Utilizador autenticado e logout. Devolve: Página protegida atual.
