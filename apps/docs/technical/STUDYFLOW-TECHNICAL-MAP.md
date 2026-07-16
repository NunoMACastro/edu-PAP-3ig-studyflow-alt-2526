# StudyFlow - mapa tecnico canonico

## Objetivo

Este documento liga modulos, rotas, nove grupos de interfaces finais, modelos, fluxos e controlos operacionais criticos da implementacao real em `real_dev`.
E gerado exclusivamente por `real_dev/api/src/scripts/export-technical-map.ts`; o artefacto nao deve ser editado manualmente.
O alvo e `PAP_LOCAL_ENDURECIDA`, loopback e single-instance. Este mapa nao declara aptidao nem prontidao para producao; o estado atual pertence a `docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md`.

## Modulos backend criticos

| Modulo | Dominio | Responsabilidade | Seguranca documentada |
| --- | --- | --- | --- |
| `AuthModule` | Autenticacao | Registo, login e sessao v2 com revogacao por estado e versao. | Redis guarda apenas userId/sessionVersion; cada pedido rele role, accountStatus e sessionVersion no MongoDB. |
| `HealthModule` | Operacao local | Liveness e readiness fail-closed das dependencias reais. | A readiness devolve 503 quando MongoDB, Redis, storage ou runners nao estao prontos. |
| `RuntimeModule` | Runtime local | Identidade e fronteira da instancia PAP local. | Aceita apenas local-pap, bind 127.0.0.1, origem loopback e trust proxy desligado. |
| `PersistenceIntegrityModule` | Integridade MongoDB | Bootstrap de indices e invariantes persistentes. | Replica set e indices parciais protegem transacoes, versoes e jobs ativos unicos. |
| `MaterialsModule` | Materiais privados | Materiais privados TOPIC, URL, PDF, DOCX e MARKDOWN; Markdown vive em MongoDB com revisao otimista e os binarios mantem storage local atomico. | Ownership vem da sessao; Markdown rejeita HTML raw e URLs inseguras, enquanto metadata e quota binaria sao validadas antes de staging e promocao por rename. |
| `MaterialIndexModule` | Indexacao recuperavel | Jobs MongoDB com lease, heartbeat, retry, fencing e reidratacao por material. | Ownership e estado sao revalidados; existe no maximo um job ativo por material. |
| `StudentsModule` | Perfil do aluno | Perfil editavel com nome, ano escolar e curso; turmas oficiais vivem apenas em memberships. | O perfil e lido pelo backend via sessao e nao aceita `className`; o frontend nao envia ano para a IA da sala. |
| `StudentExperienceModule` | Experiencia do aluno | Agrega Hoje, continuidade, overview de disciplina e pesquisa contextual. | A sessao define o aluno; targetPath e jobs sao resolvidos no backend e cada contexto revalida ownership ou membership. |
| `StudentAiAssistantModule` | Assistente de estudo | Organiza conversas, forks consentidos e materiais privados transversais por contexto. | Ownership vem sempre da sessao; contexto, fontes, ultimos seis turnos e destino organizacional sao derivados e revalidados no backend. |
| `ClassesModule` | Turmas oficiais | Cria, edita, arquiva/restaura e lista multiplas turmas por memberships auditaveis. | Ownership/membership sao revalidados; lifecycleFenceVersion serializa mutacoes filhas com archive, que fecha salas/testes sem apagar historico. |
| `SubjectsModule` | Disciplinas oficiais | Cria, edita, arquiva/restaura e lista disciplinas no ciclo de vida da turma. | A disciplina pertence a uma turma autorizada; fences turma->disciplina bloqueiam corridas com archive, que fecha dependencias sem as reabrir no restore. |
| `StudyRoomsModule` | Salas de estudo | Salas, partilhas, snapshots Markdown privados e IA partilhada da sala. | Membership e fontes autorizadas sao validadas; Markdown privado entra apenas por snapshot explicito e nunca acompanha edicoes posteriores. |
| `StudyGroupMessagesModule` | Chat dos grupos de estudo | Conversa aluno-aluno em tempo real, notas REST e cursores pessoais de leitura dentro de grupos baseados em StudyRoom. | Apenas STUDENT membros entram; sessao e membership sao revalidadas em join, send e antes de cada broadcast, com idempotencia e rate limit persistidos. |
| `AiModule` | Execucao IA governada | Fachada unica de autorizacao, consentimento, policy, quota, provider, validacao e audit. | Apenas GovernedAiExecutionService pode injetar AI_PROVIDER; ROOM_AI inicia desativada e sem consentimento automatico. |
| `AiConsentsModule` | Consentimentos IA | Grant/revoke append-only por finalidade, incluindo ROOM_AI. | A chamada ao provider e bloqueada sem consentimento atual e policy ativa. |
| `OfficialMaterialsModule` | Materiais oficiais | Materiais TEXT, URL, PDF, DOCX e MARKDOWN associados a disciplina; Markdown usa rascunho, publicacao e revisao otimista. | Professor, disciplina e membership sao validados; rascunhos Markdown nunca chegam a alunos ou IA e downloads permanecem protegidos. |
| `OfficialTestsModule` | Mini-testes oficiais | Ciclo DRAFT/PUBLISHED/CLOSED, tres tentativas atomicas e ranking BEST_ATTEMPT. | So DRAFT e editavel; solucoes completas so apos terceira tentativa ou fecho. |
| `TeacherDashboardModule` | Dashboard docente | Agrega turmas, materiais, testes, revisoes IA e acompanhamento operacional. | Usa o professor da sessao e devolve apenas contagens agregadas por turma. |
| `FollowUpAlertsModule` | Centro de acompanhamento | FollowUpCentre consolida atividade oficial, participacao, resultados minimizados, alertas e notificacoes internas. | Inatividade usa apenas atividade de turma e baseline `joinedAt`; estudo privado nunca entra no centro. |
| `ClassLearningActivityModule` | Atividade pedagogica oficial | Mantem eventos minimizados e a projecao da ultima atividade por aluno/turma. | Aceita apenas fontes oficiais idempotentes; evento e projecao confirmam na mesma transaction e nao copiam perguntas, respostas, mensagens nem `StudyEvent` privado. |
| `SourceGroundedAiModule` | IA com fontes | Respostas baseadas em excertos citaveis. | Bloqueia resposta quando nao ha fontes processaveis. |
| `TeacherAiModule` | Voz IA docente | Voz base por turma e override opcional por disciplina. | Ownership por professor, resolucao `SUBJECT_OVERRIDE -> CLASS_BASE -> DEFAULT`. |
| `ClassAiModule` | IA da disciplina | Assistente da turma ou disciplina com voz docente herdada. | Valida membership da disciplina, materiais oficiais e voz efetiva resolvida. |
| `TeacherStudentChatModule` | Chat da disciplina | Chat persistido entre alunos inscritos e professor responsavel. | Sessao `sf_sid`, ownership/membership da disciplina e WebSocket autenticado. |
| `GuidedStudyRoomsModule` | Salas guiadas | Salas docentes por turma com disciplina opcional e referencias vivas a materiais oficiais publicados. | Valida turma/professor/aluno; apenas materiais publicados e selecionados da disciplina alimentam a IA guiada. |
| `AiModelPoliciesModule` | Governanca IA | Politicas de modelo e limites por contexto. | Nao expoe chaves, prompts privados nem respostas completas. |
| `AiQuotasModule` | Quotas IA | Reserva e consumo de quotas por aluno, turma ou grupo, com defaults internos para a demo. | Politica especifica prevalece; defaults nunca agregam consumo e todos os limites sao aplicados antes do provider. |
| `AuditLogModule` | Auditoria | Eventos tecnicos e sensiveis para defesa e rastreabilidade. | Logs minimizados, sem materiais privados nem credenciais. |
| `PersonalDataModule` | Registry de dados pessoais | Classifica todos os models como DELETE, PULL_MEMBERSHIP, ANONYMIZE_90D ou RETAIN_NONPERSONAL. | O teste arquitetural falha perante model sem politica; export e delete usam a mesma registry. |
| `PrivacyDataExportsModule` | Exportacao RGPD | Exporta todas as categorias proprias num attachment JSON. | Exclui hashes, secrets, chaves de respostas, regras/tom da voz docente e dados de terceiros; resposta e private/no-store. |
| `AccountDeletionModule` | Eliminacao RGPD | Elimina/anonimiza dados numa transaction, revoga sessoes e agenda ficheiros na outbox. | O recibo usa referencia aleatoria sem userId e expira apos 90 dias. |
| `AdminUsersModule` | Administracao de papeis | Mudanca transacional de role e revogacao de sessoes. | Sentinel atomico impede remover o ultimo administrador ativo. |
| `ContextNotificationsModule` | Inbox de notificacoes | Entrega inbox paginada por destinatario com unread count, leitura, read-all, arquivo e vista sent. | Estado individual e filtrado pela sessao; DTO publico nao devolve recipientIds nem suppressedRecipientIds. |
| `NotificationOutboxModule` | Outbox de notificacoes | Publica eventos de dominio idempotentes e cria envelopes/recipients com retry e lease. | Snapshots sao revalidados no delivery; remocao atrasada e descartada apos reinscricao, e quotas manuais nunca eliminam eventos automaticos. |
| `NotificationPoliciesModule` | Politicas de notificacao | Aplica preferencias e quotas antes da persistencia. | Destinatarios sao resolvidos no backend e nunca aceites do cliente. |

## Rotas frontend criticas

| Rota | Pagina | Perfil | Regra de seguranca |
| --- | --- | --- | --- |
| `/app/hoje` | `StudentTodayPage` | Aluno | A API agrega prioridades e continuidade autorizada sem aceitar targetPath do cliente. |
| `/app/estudar` | `StudentStudyHubPage` | Aluno | Turmas e areas privadas continuam separadas por membership e ownership no backend. |
| `/app/estudar/materiais/:artifactId?` | `StudentStudyMaterialsPage + StudentStudyMaterialDetailPage` | Aluno | O arquivo filtra sempre por userId; disciplina, turma e area sao apenas organizacao e o estado arquivado bloqueia novas tentativas. |
| `/app/em-grupo` | `StudentGroupHubPage` | Aluno | Salas guiadas, grupos e salas partilhadas preservam os services e validacoes de membership existentes. |
| `/app/plano` | `StudentPlanPage` | Aluno | Agenda, objetivos e historico usam exclusivamente o aluno da sessao. |
| `/app/assistente/:conversationId?` | `StudentAssistantPage + StudentAssistantLauncher` | Aluno | A API constroi labels e rotas, revalida ownership/membership e mantem cada conversa num contexto imutavel. |
| `/app/perfil` | `ProfilePage` | Aluno | A API guarda nome, ano e curso no perfil autenticado; turmas sao derivadas de ClassMembership. |
| `/app/turmas/:classId/disciplinas` | `StudentClassSubjectsPage` | Aluno | A API valida membership atual ou historica e aplica o filtro de lifecycle pedido. |
| `/app/disciplinas/:subjectId/materiais` | `StudentOfficialMaterialsPage` | Aluno | O catalogo e detalhe omitem identidade docente e exigem membership na disciplina. |
| `/app/turmas/:classId/projectos` | `StudentClassProjectsPage` | Aluno | Apenas projetos PUBLISHED da turma inscrita ficam disponiveis ao aluno. |
| `/app/projectos/:projectId/plano-ia` | `ProjectAiPlanPage` | Aluno | A API revalida projeto publicado, membership e consentimento antes de criar/listar planos proprios. |
| `/app/areas/:studyAreaId/ferramentas` | `StudyToolsPage` | Aluno | A API filtra artefactos por area e utilizador autenticado. |
| `/app/salas/:roomId/ia` | `LegacyRedirect -> StudentAssistantPage` | Aluno | A pergunta nao envia ano; a API valida membership, fontes e perfil do aluno autenticado. |
| `/app/grupos/:groupId/:tab?` | `StudentGroupWorkspacePage` | Aluno | A rota fornece o contexto, mas a API revalida membership em mensagens e sessoes; o Assistente usa o launcher global. |
| `/app/professor/turmas/:classId/voz` | `TeacherClassesPage + TeacherClassAiVoiceDialog` | Professor | Deep link abre modal contextual; a API valida ownership da turma antes de ler ou gravar voz base. |
| `/app/professor/disciplinas/:subjectId/materiais` | `TeacherOfficialMaterialsPage` | Professor | A API valida professor, disciplina e materiais oficiais. |
| `/app/professor/disciplinas/:subjectId/voz` | `TeacherAiVoicePage` | Professor | A API valida ownership da disciplina e trata a configuracao como override. |
| `/app/professor/disciplinas/:subjectId/chat` | `TeacherSubjectChatPage` | Professor | A API valida ownership da disciplina antes de carregar ou enviar mensagens. |
| `/app/professor/turmas/:classId/salas-guiadas` | `TeacherGuidedStudyRoomsPage` | Professor | A API valida ownership da turma e disciplina opcional da mesma turma. |
| `/app/professor` | `TeacherDashboardPage` | Professor | Dashboard agregado; nao expoe nomes/emails de alunos inativos. |
| `/app/professor/acompanhamento` | `TeacherFollowUpAlertsPage` | Professor | Lista alunos das turmas autorizadas, reutiliza previews de inatividade e carrega BEST_ATTEMPT sem respostas ou solucoes. |
| `/app/disciplinas/:subjectId/ia` | `LegacyRedirect -> StudentAssistantPage` | Aluno | A API valida inscricao na disciplina antes de responder. |
| `/app/disciplinas/:subjectId/chat` | `StudentSubjectChatPage` | Aluno | A API valida inscricao na disciplina antes de carregar ou enviar mensagens. |
| `/app/turmas/:classId/salas-guiadas` | `StudentGuidedStudyRoomsPage` | Aluno | A API valida inscricao na turma e nao expoe controlos de voz docente. |
| `/app/admin/governanca` | `AdminGovernancePage` | Admin | A API valida role de administracao no backend. |
| `/app/privacidade` | `PrivacyPage` | Aluno, professor e admin | ProtectedLayout e RoleGuard montam a pagina apenas com sessao valida; export gera download JSON e delete revoga a sessao. |
| `/app/disciplinas/:subjectId/testes` | `OfficialTestAttemptPage` | Aluno | A API valida inscricao, publica apenas testes PUBLISHED e aplica tres tentativas. |
| `/app/professor/disciplinas/:subjectId/testes` | `TeacherOfficialTestsPage` | Professor | RoleGuard impede mount/pedidos de outros papeis e a API valida ownership da disciplina. |
| `/app/professor/disciplinas/:subjectId/testes/:testId/ranking` | `OfficialTestRankingPage` | Professor | Mostra uma linha BEST_ATTEMPT por aluno sem respostas completas nem email. |
| `/app/material-index-jobs/:jobId/versoes` | `MaterialVersionsPage` | Aluno ou professor | A API revalida ownership/membership do job antes de listar ou restaurar versoes. |
| `/app/*` | `ProtectedLayout + RoleGuard + NotFoundPage` | Autenticado | Rotas sao lazy; papel e parametros sao validados antes de mount; rota desconhecida devolve 404 explicito. |

## Endpoints criticos

| Grupo final | Metodo | Endpoint | Entrada principal | Resposta esperada | Regra de seguranca |
| --- | --- | --- | --- | --- | --- |
| `TRANSVERSAL` | `GET/POST/PATCH/DELETE` | `/api/student/assistant/contexts\|conversations\|messages` | contexto canonico, conversa propria e pergunta sem IDs de fontes | contextos seguros, conversas e turnos normalizados com citacoes | A fachada revalida o aluno e o contexto em cada mutacao, delega no executor governado e omite links quando o acesso terminou. |
| `AI` | `GET/POST` | `/api/student/assistant/conversations/:id/artifact-setup\|artifact-targets\|artifacts\|artifact-jobs` | tipo, topico opcional e destino apenas quando o contexto colaborativo o exige | preview minimizado, destinos ativos, material privado ou job recuperavel | O browser nunca escolhe fontes, turnos ou ownership; o servidor congela ate seis turnos e fontes atuais antes do executor governado. |
| `AI` | `GET/POST/DELETE` | `/api/student/study-materials/:artifactId?\|:artifactId/export\|:artifactId/quiz-attempts` | filtros organizacionais, formato de exportacao ou respostas do quiz | arquivo privado, detalhe, ficheiro persistido ou resultado da tentativa | userId da sessao e a fronteira; export nao chama provider, delete e transacional e contextos terminados ficam read-only. |
| `TRANSVERSAL` | `POST` | `/api/auth/login` | email e password | sessao HttpOnly e utilizador publico | Nao devolve passwordHash nem tokens de sessao ao frontend. |
| `SESSION` | `GET` | `/api/auth/me` | cookie de sessao | utilizador autenticado | Rele role/accountStatus/sessionVersion no MongoDB; ausencia ou divergencia devolve 401 SESSION_REVOKED. |
| `AI` | `PUT/DELETE` | `/api/ai-consents/:purpose` | finalidade e policyVersion | consentimento atual minimizado | ROOM_AI nao e concedida automaticamente; sem consentimento/policy/quota o provider nao e chamado. |
| `AI` | `GET` | `/api/ai-consents/capabilities` | sessao autenticada | finalidades, policyVersion exigida e consentimento efetivo | O consent gate usa apenas capacidades do proprio utilizador e nunca assume grant no frontend. |
| `TRANSVERSAL` | `GET` | `/api/students/me/profile` | cookie de sessao | nome, ano escolar e curso do aluno | O userId vem da sessao; turma/className nao pertence ao perfil e e resolvida por membership. |
| `TRANSVERSAL` | `GET` | `/api/student/today` | cookie de sessao | continuar, prioridades e contextos recentes | O backend agrega apenas recursos autorizados, ordena prioridades e constroi todos os targetPath. |
| `TRANSVERSAL` | `PUT` | `/api/students/me/recent-context` | kind canonico e contextId | acao segura do contexto | Ownership ou membership e revalidado; titulo, rota e metadata nunca sao aceites do cliente. |
| `TRANSVERSAL` | `GET` | `/api/student/subjects/:subjectId/overview` | disciplina da rota | identidade segura, contagens, material recente e proximo teste | Exige membership e omite teacherId, solucoes e metadata interna de indexacao. |
| `TRANSVERSAL` | `POST` | `/api/student/search` | query e scope SUBJECT, STUDY_AREA ou ALL_STUDIES | ate 20 excertos com targetPath seguro | Jobs DONE sao resolvidos no servidor, limitados a 50 e revalidados por ownership ou membership. |
| `TRANSVERSAL` | `POST/GET` | `/api/teacher/classes` | dados da turma ou filtro de lifecycle | turma criada ou turmas ativas/historicas do professor | Apenas professor; teacherId vem da sessao e codigos permanecem unicos por professor. |
| `TRANSVERSAL` | `PATCH` | `/api/teacher/classes/:classId` | nome, ano ou codigo | turma ativa atualizada | Ownership e estado ACTIVE sao validados antes de alterar dados identificativos. |
| `TRANSVERSAL` | `PATCH` | `/api/teacher/classes/:classId/status` | ACTIVE ou ARCHIVED | turma com lifecycle atualizado | Ownership e transicao efetiva sao validados; arquivar fecha salas e testes ativos sem destruir historico. |
| `TRANSVERSAL` | `POST` | `/api/teacher/classes/:classId/students` | aluno a inscrever | membership oficial ativa | Apenas professor dono; a relacao e dual-written e idempotente, sem confiar em turma enviada pelo aluno. |
| `TRANSVERSAL` | `DELETE` | `/api/teacher/classes/:classId/students/:studentId` | aluno a remover | membership marcada REMOVED | Apenas professor dono; preserva datas e autoria da remocao para historico auditavel. |
| `TRANSVERSAL` | `GET` | `/api/student/classes?status=ACTIVE\|ARCHIVED` | sessao e filtro de lifecycle | todas as turmas oficiais do aluno | Consulta ClassMembership e compatibilidade legacy; nao devolve listas de colegas. |
| `TRANSVERSAL` | `POST/GET` | `/api/teacher/classes/:classId/subjects` | disciplina da turma ou listagem | disciplina criada ou disciplinas do professor | A turma pertence ao professor e tem de estar ACTIVE para criar novas disciplinas. |
| `TRANSVERSAL` | `PATCH` | `/api/teacher/classes/:classId/subjects/:subjectId` | nome, codigo ou descricao | disciplina ativa atualizada | Turma e disciplina pertencem ao professor; apenas recursos ACTIVE aceitam mutacao de conteudo. |
| `TRANSVERSAL` | `PATCH` | `/api/teacher/classes/:classId/subjects/:subjectId/status` | ACTIVE ou ARCHIVED | disciplina com lifecycle atualizado | Arquivo fecha dependencias ativas e restauro nao reabre salas/testes automaticamente. |
| `TRANSVERSAL` | `GET` | `/api/student/classes/:classId/subjects?status=ACTIVE\|ARCHIVED` | turma oficial e filtro de lifecycle | disciplinas autorizadas da turma | Membership atual ou historica e validada antes de listar; arquivo fica read-only. |
| `TRANSVERSAL` | `POST` | `/api/study-areas/:studyAreaId/materials` | material privado do aluno | material criado | O userId vem da sessao; valida metadata, 10 MiB, quota de 250 MiB e rate limit 20/h antes da promocao atomica. |
| `TRANSVERSAL` | `POST` | `/api/student/study-areas/:studyAreaId/materials/:materialId/index-jobs` | material privado autorizado | 202 com job novo ou ativo reutilizado | Ownership e indice parcial impedem jobs ativos duplicados; processamento pesado corre em worker terminavel. |
| `JOBS` | `GET` | `/api/student/study-areas/:studyAreaId/material-index-jobs?latestByMaterial=true` | area privada e query obrigatoria | ultimo job por material | Lista apenas jobs do aluno/area para reidratar estados monotonicos apos reload. |
| `TRANSVERSAL` | `POST` | `/api/teacher/subjects/:subjectId/materials/file` | multipart com title e ficheiro PDF ou DOCX | material oficial PENDING_PROCESSING com metadados publicos | Sessao docente, ownership, 10 MiB, assinatura, MIME, quota partilhada, staging e promocao atomica sao validados sem aceitar ownership do cliente. |
| `JOBS` | `POST` | `/api/teacher/official-materials/:materialId/index-jobs` | material oficial pendente autorizado | 202 com job QUEUED novo ou ativo reutilizado | Worker rele role, ownership, lifecycle e integridade antes do parser; activeKey, lease, heartbeat e fencing controlam concorrencia e retry. |
| `JOBS` | `GET` | `/api/teacher/subjects/:subjectId/material-index-jobs?latestByMaterial=true` | disciplina oficial e query obrigatoria | ultimo job publico por material, sem chunks oficiais | Apenas o professor proprietario reidrata jobs da disciplina; chunks extraidos nao sao projetados por HTTP. |
| `TRANSVERSAL` | `GET` | `/api/official-materials/:materialId/content\|download` | material PDF ou DOCX autorizado | stream com MIME canonico, nome seguro e no-store | Professor proprietario ou aluno com membership atual/historica; recursos inexistentes ou fora do contexto devolvem 404. |
| `TRANSVERSAL` | `GET` | `/api/study-areas/:id/summaries` | area de estudo | resumos da area | Ownership da area e validado no backend. |
| `TRANSVERSAL` | `POST` | `/api/ai/source-grounded-answers` | job de indexacao e pergunta | resposta IA com citacoes | Bloqueia resposta quando nao ha fontes processaveis autorizadas. |
| `TRANSVERSAL` | `POST` | `/api/study-rooms/:roomId/ai/answers` | pergunta e fontes opcionais da sala | resposta IA com fontes da sala | Membership e fontes sao obrigatorias; o ano escolar vem do perfil autenticado e so adapta linguagem. |
| `TRANSVERSAL` | `GET` | `/api/teacher/classes/:classId/ai-voice` | turma docente | voz base da turma ou default | Valida ownership da turma. |
| `TRANSVERSAL` | `PUT` | `/api/teacher/classes/:classId/ai-voice` | tom, detalhe e regras | voz base da turma | Apenas professor dono da turma. |
| `TRANSVERSAL` | `GET` | `/api/teacher/subjects/:subjectId/ai-voice` | disciplina docente | voz efetiva da disciplina | Valida ownership da disciplina e inclui metadata de heranca. |
| `TRANSVERSAL` | `PUT` | `/api/teacher/subjects/:subjectId/ai-voice` | tom, detalhe e regras | override da disciplina | Apenas professor dono da disciplina. |
| `TRANSVERSAL` | `DELETE` | `/api/teacher/subjects/:subjectId/ai-voice` | disciplina docente | voz efetiva herdada | Remove override sem apagar voz base da turma. |
| `TRANSVERSAL` | `POST` | `/api/teacher/classes/:classId/guided-study-rooms` | sala guiada e `subjectId` opcional | sala guiada criada | `subjectId`, quando existe, tem de pertencer a turma e ao professor. |
| `TRANSVERSAL` | `GET` | `/api/teacher/classes/:classId/guided-study-rooms` | turma docente | salas guiadas da turma | Valida ownership da turma. |
| `TRANSVERSAL` | `GET` | `/api/teacher/dashboard` | cookie de sessao | dashboard docente agregado | Apenas professor; nao aceita `teacherId` do frontend e minimiza dados por aluno. |
| `TRANSVERSAL` | `GET` | `/api/follow-up-alerts` | cookie de sessao | regras do professor | Apenas professor; lista so regras do proprio professor. |
| `TRANSVERSAL` | `POST` | `/api/follow-up-alerts` | turma, dias, titulo e mensagem | regra criada | Valida ownership da turma antes de criar. |
| `TRANSVERSAL` | `GET` | `/api/follow-up-alerts/summary` | cookie de sessao | regras com preview de alunos inativos | Apenas area de acompanhamento; nao envia notificacoes e filtra por turmas do professor. |
| `TRANSVERSAL` | `POST` | `/api/follow-up-alerts/:id/run` | regra docente | notificacao criada ou preview vazio | Executa apenas regra do professor e destinatarios calculados no backend. |
| `TRANSVERSAL` | `GET` | `/api/follow-up-alerts/classes/:classId/students/:studentId/official-tests` | turma e aluno do professor autenticado | testes publicados/encerrados com BEST_ATTEMPT ou sem tentativa | Valida ownership e inscricao; nao devolve respostas, solucoes, prompts ou dados privados. |
| `TRANSVERSAL` | `GET` | `/api/follow-up-centre/classes/:classId/students/:studentId` | turma e aluno do professor autenticado | overview factual com membership, ultima atividade oficial, salas e resultados minimizados | Valida ownership/membership e usa ClassLearningActivity; estudo privado, respostas, prompts e dados de colegas ficam excluidos. |
| `TRANSVERSAL` | `POST` | `/api/follow-up-alerts/classes/:classId/students/:studentId/notify` | turma, aluno, titulo e mensagem | notificacao FOLLOW_UP com contagens de entrega e supressao | Destinatario unico validado no backend; respeita preferencias e quotas existentes. |
| `TRANSVERSAL` | `GET` | `/api/student/classes/:classId/guided-study-rooms` | turma do aluno e status OPEN/CLOSED | salas guiadas com participacao propria | Valida inscricao na turma e nao devolve controlos de voz. |
| `TRANSVERSAL` | `GET` | `/api/student/guided-study-rooms` | status, cursor, limit e classId opcional | agregador paginado de salas de todas as turmas oficiais | Classes sao resolvidas por membership e classId filtra antes do cursor; item omite teacherId e inclui apenas `myParticipation` proprio. |
| `AI` | `POST/GET` | `/api/student/classes/:classId/guided-study-rooms/:roomId/ai/answers` | pergunta ou cursor do historico proprio | resposta supervisionada ou pagina de interacoes proprias | POST exige sala/membership ACTIVE, consentimento e fontes; GET autoriza historico e omite teacherId, studentId/email e regras de voz. |
| `TRANSVERSAL` | `GET` | `/api/teacher/classes/:classId/guided-study-rooms/:roomId/ai/interactions` | cursor, limit e studentId opcional | historico supervisionavel identificado e paginado | Apenas professor dono; studentId fica limitado a participantes atuais ou historicos da sala. |
| `AI` | `POST/GET` | `/api/student/subjects/:subjectId/ai/answers` | pergunta ou cursor do historico proprio | resposta IA citada ou pagina de respostas proprias | Membership, consentimento e fontes oficiais sao obrigatorios; contrato publico so sinaliza voz docente ativa. |
| `AI` | `POST/GET` | `/api/student/projects/:projectId/ai-plans` | objetivo/dificuldades ou cursor do historico proprio | plano gradual ou pagina de planos proprios | Projeto tem de estar PUBLISHED e pertencer a turma do aluno; voz herdada nao expoe tom, detalhe ou regras. |
| `TRANSVERSAL` | `POST/GET` | `/api/teacher/classes/:classId/projects` | rascunho com disciplina/prazo opcionais ou listagem | projeto DRAFT criado ou projetos do professor | Apenas professor dono e turma ACTIVE; subjectId opcional tem de pertencer a turma. |
| `TRANSVERSAL` | `PATCH` | `/api/teacher/classes/:classId/projects/:projectId` | alteracoes ao rascunho | projeto DRAFT atualizado | Ownership e estado DRAFT sao obrigatorios; disciplina opcional continua limitada a turma. |
| `TRANSVERSAL` | `POST` | `/api/teacher/classes/:classId/projects/:projectId/publish` | projeto DRAFT | projeto PUBLISHED com publishedAt | Transicao explicita e idempotente; projeto publicado deixa de aceitar edicao. |
| `TRANSVERSAL` | `GET` | `/api/student/classes/:classId/projects` | turma oficial | projetos PUBLISHED com disciplina e prazo | Membership e validada e rascunhos nunca sao devolvidos ao aluno. |
| `TRANSVERSAL` | `GET` | `/api/student/subjects/:subjectId/materials` | cursor e limit | catalogo paginado de materiais oficiais seguros | Valida membership e omite teacherId, metadata de indexacao e conteudo de terceiros. |
| `TRANSVERSAL` | `GET` | `/api/student/subjects/:subjectId/materials/:materialId` | disciplina e material | detalhe oficial seguro e disponibilidade para IA | Material tem de pertencer a disciplina autorizada; resposta usa DTO discente minimizado. |
| `TESTS` | `POST/GET` | `/api/student/subjects/:subjectId/approved-ai-content/:reviewId/quiz-attempts` | respostas do quiz aprovado ou pedido de historico | tentativa corrigida ou historico proprio sem solucoes | Conteudo continua APPROVED, membership e validada e tentativas de terceiros/answer key nao sao expostas. |
| `TRANSVERSAL` | `GET` | `/api/student/subjects/:subjectId/chat/messages` | disciplina do aluno | ultimas 100 mensagens cronologicas | Valida inscricao na turma da disciplina e nao expoe emails nem sessao. |
| `TRANSVERSAL` | `GET` | `/api/teacher/subjects/:subjectId/chat/messages` | disciplina do professor | ultimas 100 mensagens cronologicas | Valida professor responsavel pela disciplina. |
| `PRIVACY` | `POST/GET` | `/api/privacy/data-exports` | sessao autenticada | pedidos proprios de exportacao | PersonalDataRegistry cobre todos os models e exclui hashes, secrets, answer keys e dados de terceiros. |
| `TRANSVERSAL` | `GET` | `/api/privacy/data-exports/:id/download` | export proprio concluido | attachment JSON private/no-store | Ownership e nome seguro sao validados; o ficheiro temporario e removido apos stream/abort. |
| `TRANSVERSAL` | `POST` | `/api/privacy/account-deletion` | sessao autenticada | referencia aleatoria nao associavel | Transaction revoga sessoes e remove/anonimiza dados; outbox preserva deletes fisicos apos commit. |
| `TRANSVERSAL` | `PATCH` | `/api/admin/users/:id/role` | novo papel | utilizador publico atualizado | Apenas admin; transaction, sentinel do ultimo admin e incremento de sessionVersion. |
| `TESTS` | `POST` | `/api/teacher/subjects/:subjectId/tests/:testId/publish` | teste DRAFT do professor | teste PUBLISHED | Transicao atomica sem saltos/reabertura; ownership da disciplina e validado. |
| `TRANSVERSAL` | `POST` | `/api/teacher/subjects/:subjectId/tests/:testId/close` | teste PUBLISHED do professor | teste CLOSED | Fecho atomico desbloqueia solucoes completas sem permitir reabertura. |
| `TRANSVERSAL` | `POST` | `/api/student/subjects/:subjectId/tests/:testId/attempts` | attemptKey e escolha por pergunta | tentativa numerada e pontuada | Idempotencia e contador atomico limitam a tres; answer key so apos terceira ou fecho. |
| `TRANSVERSAL` | `GET` | `/api/student/subjects/:subjectId/tests/:testId/attempts/me` | aluno da sessao | apenas tentativas proprias | Aplica a mesma politica temporal de solucoes e nunca expoe tentativas de terceiros. |
| `RANKING` | `GET` | `/api/teacher/subjects/:subjectId/tests/:testId/ranking` | professor e teste oficial | uma linha por aluno com attemptCount, bestPercentage e bestAnsweredAt | BEST_ATTEMPT; empate pela melhor tentativa mais antiga e ID estavel; sem respostas/email. |
| `NOTIFICATIONS` | `POST` | `/api/context-notifications` | notificacao manual de turma ou grupo | envelope com contagens agregadas | Allowlist manual NEW_MATERIAL\|FEEDBACK\|TASK; eventos de lifecycle/publicacao so podem nascer nos services de dominio/outbox. |
| `NOTIFICATIONS` | `GET` | `/api/context-notifications/inbox` | cursor, limit e unreadOnly | pagina propria, nextCursor e unreadCount | Cada linha exige ContextNotificationRecipient do utilizador e omite destinatarios/supressoes do envelope. |
| `TRANSVERSAL` | `PATCH` | `/api/context-notifications/:id/read` | notificacao da inbox propria | item marcado como lido | Atualiza apenas o recipient da sessao; IDs de envelopes de terceiros devolvem not found. |
| `TRANSVERSAL` | `POST` | `/api/context-notifications/read-all` | sessao autenticada | numero de notificacoes proprias marcadas como lidas | Bulk update fica limitado a recipients DELIVERED e nao arquivados do utilizador. |
| `TRANSVERSAL` | `PATCH` | `/api/context-notifications/:id/archive` | notificacao da inbox propria | item arquivado apenas para o destinatario | Nao elimina o envelope nem altera a inbox de outros destinatarios. |
| `TRANSVERSAL` | `GET` | `/api/context-notifications/sent` | autor autenticado | eventos enviados com contagens operacionais | Filtra por actorId da sessao e nunca devolve arrays de destinatarios. |
| `CHAT` | `GET/POST` | `/api/study-groups/:groupId/messages` | grupo e, no POST, kind MESSAGE/NOTE com texto ate 4000 caracteres | 100 mensagens/notas mais recentes ou mensagem criada | SessionGuard e membership protegem leitura e compatibilidade REST; o frontend novo usa POST apenas para notas. |
| `CHAT` | `GET/PUT` | `/api/student/study-group-chat/unread e /api/study-groups/:groupId/messages/read` | sessao STUDENT e grupo autorizado | contadores bulk ou cursor de leitura avancado | Unread conta apenas MESSAGE de outros membros, posteriores ao cursor e nao tombstoned; leitura exige membership atual. |
| `CHAT` | `POST` | `/api/study-groups/:groupId/members` | email de uma conta STUDENT | grupo atualizado de forma idempotente | Apenas o owner autenticado pode adicionar; collaborationKind e politica owner-only nunca chegam do cliente. |
| `CHAT` | `WS` | `/study-group-chat` | `study-group-chat:join` e `study-group-chat:send` com UUID v4 | acks tipados e `study-group-chat:message` | Cookie `sf_sid`, Origin, role e membership sao revalidados; persiste antes de emitir e expulsa sockets passivas revogadas. |
| `CHAT` | `WS` | `/subject-chat` | `subject-chat:join` e `subject-chat:send` | acks tipados e `subject-chat:message` | Handshake usa cookie `sf_sid`, valida `Origin`, revalida a sessao em join/send e antes de broadcasts. |
| `TRANSVERSAL` | `GET` | `/api/health/live` | nenhuma | liveness do processo | Nao consulta dependencias nem devolve configuracao sensivel. |
| `HEALTH` | `GET` | `/api/health/ready` | nenhuma | readiness ou 503 | Falha fechado perante MongoDB, Redis, storage ou runners indisponiveis. |
| `TRANSVERSAL` | `GET` | `/api/health` | nenhuma | alias compativel da readiness | Mantem exatamente a semantica fail-closed de /ready. |

## Modelos principais

| Modelo/schema | Dominio | Dados sensiveis | Regra de protecao |
| --- | --- | --- | --- |
| `User` | Identidade | email, password hash, role, accountStatus e sessionVersion | Hash nunca e devolvido; role/delete incrementam sessionVersion e DELETED bloqueia HTTP/WS. |
| `StudentProfile` | Perfil do aluno | nome, ano escolar e curso | Lido por userId da sessao; nao guarda `className` nem outra fonte paralela de membership. |
| `StudentRecentContext` | Continuidade do aluno | userId, tipo de contexto, contextId e lastOpenedAt | Maximo de cinco referencias distintas; registry inclui export e eliminacao, e acessos revogados sao removidos ao resolver Hoje. |
| `SchoolClass` | Turmas oficiais | professor, codigo, ano, lifecycleFenceVersion e array legacy de alunos durante dual-write | Ownership docente e lifecycle governam mutacoes; aluno recebe apenas resumo da propria membership. |
| `Subject` | Disciplinas oficiais | turma, professor, descricao e lifecycleFenceVersion | Acesso deriva da turma e archive/restore preserva historico sem reabrir dependencias. |
| `ClassMembership` | Inscricao oficial | classId, studentId, estado, datas e autoria de adesao/remocao | Par unico turma/aluno, transicoes idempotentes e joinedAt usado como baseline de inatividade. |
| `StudyArea` | Estudo individual | relacao com aluno | Ownership por sessao autenticada. |
| `AiArtifact` | Materiais de estudo gerados | conteudo estruturado, fontes privadas, ownership, destino organizacional e proveniencia minimizada do snapshot | userId autoriza; targetKind/targetId apenas organizam e sao revalidados para pratica, sem conceder acesso a professor ou colegas. |
| `StudentAiArtifactGenerationSnapshot` | Geracao IA assincrona | fontes e ate seis pares pergunta/resposta congelados para um quiz | Criado com o job na mesma transacao, filtrado por userId/conversationId, removido por TTL e incluido no registry RGPD. |
| `StudentAiConversation` | Assistente de estudo | contexto, titulo, estado, atividade e leases efemeras de execucao | Ownership e contexto sao revalidados em cada operacao; artefactos usam contexto imutavel e lease independente. |
| `StudyRoom` | Salas de estudo | membros e contexto colaborativo | Membership validada antes de listar partilhas ou chamar IA. |
| `StudyGroupMessage` | Chat dos grupos de estudo | texto, tipo e identificador do aluno autor | Apenas STUDENT membros listam/criam; nomes sao resolvidos dinamicamente sem email; a eliminacao remove autor/texto e preserva tombstone. |
| `StudentStudyGroupChatReadState` | Chat dos grupos de estudo | cursor de leitura por aluno e grupo | Indice unico por aluno/grupo, visivel apenas ao proprio fluxo e eliminado com a conta ou com um grupo exclusivo. |
| `Material` | Materiais privados | storageKey UUID, SHA-256, tamanho, titulo e ownership | Visivel apenas ao aluno dono; ficheiro 0600 sob raiz 0700, promovido atomicamente e eliminado por outbox. |
| `MaterialIndexJob` | Indexacao | material, owner, estado, lease e tentativas | Lease/heartbeat/fencing e indice parcial garantem recovery; writes derivados revalidam role, ownership e lifecycle atuais. |
| `MaterialContext` | Contextos de materiais | contexto privado pode conter studentId; contexto oficial e uma projecao sem identidade discente | GET oficial nao escreve estado partilhado; a vista do aluno omite studentId e teacherId. |
| `QuizGenerationJob` | Geracao IA assincrona | aluno, destino privado, snapshot efemero, estado, lease e erro publico | Processador idempotente; snapshot e job nascem transacionalmente, tres tentativas, backoff e erro sem prompt/resposta do provider. |
| `OfficialMaterial` | Disciplina e turma | material criado por professor, ficheiro oficial, storageKey, SHA-256, texto extraido, activeVersionId e contentRevision | Catalogo discente valida membership; PDF/DOCX omitem teacherId, storageKey, hash e texto extraido, e o stream revalida acesso e integridade. |
| `TeacherClassAiVoice` | Voz IA docente | regras pedagogicas da turma | Visivel/editavel apenas pelo professor dono da turma. |
| `TeacherAiVoice` | Voz IA docente | override pedagogico da disciplina | Visivel/editavel apenas pelo professor dono da disciplina. |
| `TeacherStudentChatThread` | Chat da disciplina | relacao disciplina/turma/professor | Um thread por disciplina, criado apenas apos autorizacao. |
| `TeacherStudentChatMessage` | Chat da disciplina | texto da mensagem e autor | Autor vem da sessao; a resposta inclui authorUserId, mas nao email, cookie ou metadata de sessao. |
| `GuidedStudyRoom` | Salas guiadas | agenda, objetivo e disciplina opcional | Professor gere por turma; aluno le apenas salas abertas da turma inscrita. |
| `ClassLearningActivity` | Atividade oficial de turma | classId, studentId, subjectId opcional, tipo, data e chave tecnica | Append-only idempotente e minimizado; nao guarda conteudo, respostas, scores, prompts ou StudyEvent privado. |
| `StudentClassActivityState` | Centro de acompanhamento | primeira/ultima atividade, tipo mais recente e contagem por aluno/turma | Projecao derivada atomicamente com ClassLearningActivity; leitura apenas por professor dono da turma. |
| `FollowUpAlertRule` | Acompanhamento docente | turma, prazo de inatividade e mensagem | Regras lidas por professor da sessao; preview detalhado so em `/app/professor/acompanhamento`. |
| `SourceGroundedAiAnswer` | IA com fontes | pergunta, resposta e citacoes | Sem resposta quando faltam fontes processaveis. |
| `RoomAiInteraction` | IA da sala | pergunta, resposta e fontes da sala | Nao guarda ano escolar; guarda apenas a interacao e IDs de fontes autorizadas. |
| `AuditEvent` | Auditoria | ator/recurso pseudonimizados e metadata tecnica | Sem conteudos privados; eventos relacionados com delete sao anonimizados e expiram por TTL aos 90 dias. |
| `AiConsent` | Consentimento IA | userId, finalidade, estado e policyVersion | Eventos append-only; ROOM_AI inicia sem grant e export/delete seguem a registry. |
| `AiQuotaDefaultPolicy` | Quota IA | scope, finalidade, limite e origem tecnica da seed | Nao contem targetId nem dados pessoais; serve apenas de fallback e nao acumula consumo. |
| `AiQuotaUsage` | Quota IA | scope, target e unidades reservadas | Reserva atomica antes do provider; resposta publica nao expoe dados de terceiros. |
| `OfficialTest` | Mini-testes oficiais | perguntas, opcoes, correta e estado | Exatamente quatro opcoes distintas; correctOptionIndex fica oculto ate terceira tentativa ou CLOSED. |
| `OfficialTestAttempt` | Tentativas e ranking | aluno, respostas, percentagem, numero e answeredAt | Maximo tres por aluno/teste; ranking agrega BEST_ATTEMPT e minimiza identidade/conteudo. |
| `ApprovedAiQuizAttempt` | Conteudo IA aprovado | aluno, review, escolhas, score, numero da tentativa e answeredAt | Historico limitado ao proprio aluno e nao duplica nem devolve a solucao correta do conteudo governado. |
| `ContextNotification` | Notificacoes in-app | ator, contexto, titulo, corpo e snapshots legacy de destinatarios | Envelope nao e devolvido cru; vistas publicas omitem recipientIds e suppressedRecipientIds. |
| `ContextNotificationRecipient` | Inbox in-app | destinatario, entrega, leitura, arquivo, supressao e marker de migracao | Indice unico envelope/destinatario e todas as mutacoes filtradas pelo recipientId da sessao. |
| `NotificationOutboxEvent` | Outbox de notificacoes | ator, contexto, titulo/corpo, snapshot de destinatarios, lease e tentativas | Chave idempotente, lease/retry, revalidacao de membership e errorCode minimizado; outbox nunca e resposta publica. |
| `PersonalDataRetention` | Retencao RGPD | referencia aleatoria e expiracao | Nao guarda userId; TTL remove o recibo anonimizado apos 90 dias. |
| `AccountDeletionRequest` | Eliminacao RGPD | estado tecnico e geracao de recovery | Nao e resposta publica; recovery completa/reativa sem perder a outbox de ficheiros. |
| `StorageOutbox` | Filesystem local | operacao, storageKey e fase sem conteudo do ficheiro | JSON 0600 sob raiz privada; reconciliacao idempotente promove ou elimina orfaos apos crash. |

## Fluxos criticos

| Fluxo | Origem | Destino | Falha controlada obrigatoria |
| --- | --- | --- | --- |
| Login seguro | `POST /api/auth/login` | shell autenticada | 401 para credenciais invalidas. |
| Revogacao global de sessao | `role/delete/sessionVersion` | HTTP e WebSocket | 401 SESSION_REVOKED e remocao do socket antes de join/send/broadcast quando estado ou versao divergem. |
| Execucao IA governada | `fluxo IA autorizado` | provider e output validado | consentimento, finalidade, policy, quota, guardrail ou timeout bloqueiam antes/ao redor do provider com audit seguro. |
| Resumo IA privado | `materiais da area` | artefacto IA com fontes | bloqueio quando nao ha fontes processaveis. |
| Material privado do Assistente | `ultimos seis turnos e fontes atuais de qualquer contexto suportado` | copia privada organizada por area, disciplina ou turma | sem turnos, destino revogado, snapshot excessivo, consentimento, policy, quota ou provider falham de forma controlada sem persistencia parcial. |
| Material oficial | `professor e disciplina` | material oficial indexavel | 403 quando o professor nao tem acesso. |
| Lifecycle academico | `turma/disciplina ACTIVE ou ARCHIVED` | catalogos atuais e historico read-only coerentes para professor/aluno | ownership/membership bloqueiam acesso; arquivo fecha salas/testes ativos e restauro nunca os reabre implicitamente. |
| Atividade oficial no centro de acompanhamento | `testes, IA oficial, salas guiadas e chat da disciplina` | ClassLearningActivity + StudentClassActivityState | sourceEventKey evita duplicados; falha best-effort nao copia conteudo e StudyEvent privado nunca e consultado. |
| Outbox para inbox in-app | `evento de dominio academico idempotente` | envelope e estado individual de cada destinatario | lease/retry preserva entrega; depois do limite fica FAILED/auditado sem inventar email ou push. |
| Heranca de voz docente | `turma e disciplina opcional` | voz efetiva com `source` e `hasOverride` | default seguro quando nao ha configuracao e 403/404 fora do ownership. |
| Chat da disciplina | `aluno/professor autorizado` | historico REST e entrega WebSocket | 401/403 sem sessao, inscricao ou ownership; envio preservado ate ack positivo. |
| Chat do grupo de estudo | `membro autenticado e groupId` | historico REST assincrono de mensagens e notas | 400 para payload invalido, 401 sem sessao e 403 sem membership; sem entrega em tempo real. |
| Sala guiada docente | `turma do professor` | sala com disciplina opcional | 400/403 quando `subjectId` nao pertence a turma/professor. |
| Dashboard docente operacional | `professor autenticado` | totais e linhas agregadas por turma | 403 para nao professores e sem nomes/emails de alunos no dashboard. |
| Preview de acompanhamento | `regras do professor` | alunos inativos na pagina de acompanhamento | 403 para nao professores, zero notificacoes durante preview e filtro por ownership. |
| Detalhe factual de acompanhamento | `turma, aluno, mini-testes oficiais e tentativas autorizadas` | centro docente com BEST_ATTEMPT e notificacao individual | 404 fora da turma; respostas e solucoes omitidas; preferencias e quotas aplicadas no envio. |
| IA com fontes obrigatorias | `POST /api/ai/source-grounded-answers` | resposta citada | erro controlado quando nao ha fontes autorizadas. |
| IA da sala adaptada ao ano escolar | `aluno membro pergunta na sala` | resposta com fontes da sala e linguagem adaptada | 403 sem membership, 422 sem fontes e fallback neutro quando o ano escolar nao existe. |
| IA da disciplina | `aluno inscrito` | resposta com citacoes e voz efetiva | 403 sem membership e erro controlado sem fontes. |
| Upload atomico e reconciliavel | `multipart autenticado` | Material + ficheiro promovido | metadata/quota/rate limit falham antes da escrita; crash deixa staging/outbox recuperavel sem ficheiro comprometido orfao. |
| Parsing isolado | `PDF/DOCX autorizado` | texto limitado | timeout termina o worker; resourceLimits/stack e concorrencia 2 impedem exaustao do processo principal. |
| Recovery de jobs | `lease expirada no MongoDB` | retry idempotente ou FAILED | heartbeat/fencing impedem writer obsoleto; tres tentativas com backoff 1/5/30 segundos. |
| Eliminacao integral de conta | `POST /api/privacy/account-deletion` | MongoDB anonimizado + storage eliminado + sessoes revogadas | transaction/recovery e outbox compensam crash; recibo publico e aleatorio e sem userId. |
| Exportacao integral RGPD | `PersonalDataRegistry` | attachment JSON proprio | model sem politica falha teste; export exclui secrets, hashes, answer keys e dados de terceiros. |
| Publicacao e tentativas oficiais | `DRAFT -> PUBLISHED -> CLOSED` | tentativas e solucoes do aluno | edicao fora de DRAFT, quarta tentativa, salto/reabertura ou answer key antecipado sao rejeitados. |
| Ranking BEST_ATTEMPT | `tentativas oficiais` | uma linha minimizada por aluno | empate usa melhor tentativa mais antiga e ID estavel; nunca devolve respostas completas/email. |
| Readiness fail-closed | `GET /api/health/ready ou /api/health` | estado de MongoDB, Redis, storage e runners | 503 perante qualquer dependencia indisponivel. |
| Release local ligada ao manifesto | `verify:local-release` | snapshot autenticado PAP_LOCAL_ENDURECIDA | config, gate manual, teste ou hash divergente termina com exit code nao-zero e nao declara aptidao. |

## Controlos operacionais e limites de escopo

| Area | Contrato | Validacao | Limite/condicao de reabertura |
| --- | --- | --- | --- |
| Runtime e configuracao | Node 24.11.1, npm 11.6.2, API/web em loopback, MongoDB Atlas autenticado por SRV ou replica set local, e trust proxy false. | loader tipado, config specs, secrets scan e verify:local-release | Uma instancia da API; exposicao publica reabre TLS, proxy e HSTS. |
| Storage de materiais | Raiz fora do checkout 0700, ficheiros 0600, UUID/SHA-256, 10 MiB por ficheiro e 250 MiB por utilizador. | tests de staging/promocao/delete/outbox/reconcile/quota e readiness | Storage local single-instance; hosting efemero ou escala horizontal reabre. |
| Parsing e SSRF | ipaddr.js bloqueia ranges internos/mapped antes/depois de ligar/redirect; PDF/DOCX corre em worker terminavel com concorrencia 2. | security negatives IPv4/IPv6/redirect e worker timeout/resourceLimits | Sem fetch/parser alternativo fora destes adaptadores. |
| Jobs MongoDB | Lease 30 s, heartbeat/fencing, concorrencia 2, tres tentativas e backoff 1/5/30 s; recovery no arranque. | integracao Mongo real com lease expirada de index e quiz | Runner local; multi-instancia reabre coordenacao distribuida. |
| Transacoes e invariantes | Role, ultimo admin, delete e versoes usam transactions; indices parciais protegem versao/job ativo. | concorrencia e rollback em Mongo replica set real | Reset de dados atuais permitido; sem migrations de producao neste alvo. |
| Privacidade e retencao | Todos os models classificados; DELETE/PULL_MEMBERSHIP/ANONYMIZE_90D/RETAIN_NONPERSONAL; audit/recibos expiram em 90 dias. | integracao all-model export/delete/storage/sessoes/TTL | Evidence nunca guarda PII, cookies, prompts, respostas IA ou URIs com credenciais. |
| Frontend robusto | Rotas lazy com ProtectedLayout/RoleGuard/403/404/error boundary; ApiError/AbortSignal; sessao checking/authenticated/anonymous/unavailable. | Vitest/RTL/axe, coverage, E2E de 401/403/404/5xx e browser 320/360/375/390 px | Backend continua autoridade; returnTo aceita apenas paths internos. |
| Async, chat e bundle | useAsyncAction em mutacoes, polling single-flight monotono, chat com ack/dedupe; socket apenas no chunk chat. | component tests, Playwright Chrome/Firefox/WebKit e budgets gzip 90 KiB entry, 160 KiB primeira rota, 25 KiB por chunk e 190 KiB por percurso de papel | Mudanca de chunk ou handler sem ack reabre a validacao. |
| Backup, release e rollback | Backup offline gzip + AES-256-GCM + SHA-256/HMAC; restore so para destinos locais vazios; gate fail-closed com 21 provas e snapshot autenticado. | roundtrip sintetico, restore real manual, hash antes/depois, readiness negativa e smoke autenticado | RPO 24 h/RTO 60 min locais; off-site e producao fora do ambito. |

## Como validar

1. Confirmar que todos os modulos criticos declarados nesta fonte sao alcancaveis a partir de `real_dev/api/src/app.module.ts`.
2. Executar `npm --prefix real_dev/api test -- export-technical-map.spec.ts --runInBand`.
3. Executar `npm --prefix real_dev/api run build`.
4. Atualizar este artefacto com `npm --prefix real_dev/api run technical-map:write`.
5. Confirmar equivalencia byte a byte com `npm --prefix real_dev/api run technical-map:check`; o gate local executa a mesma verificacao fail-closed.
6. Executar `npm --prefix real_dev/api run manifest:hash` e associar a evidence apenas ao hash da implementacao efetivamente validada.
