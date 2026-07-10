import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

/**
 * Modulo backend incluido no mapa tecnico minimo de StudyFlow.
 */
export type TechnicalMapModule = {
    name: string;
    domain: string;
    responsibility: string;
    securityRule: string;
    critical: boolean;
};

/**
 * Endpoint critico documentado para rastrear entrada, resposta e regra de seguranca.
 */
export type TechnicalMapEndpoint = {
    method: string;
    path: string;
    input: string;
    output: string;
    securityRule: string;
    interfaceGroup?: FinalInterfaceGroup;
};

export type FinalInterfaceGroup =
    | "SESSION"
    | "AI"
    | "JOBS"
    | "PRIVACY"
    | "TESTS"
    | "RANKING"
    | "NOTIFICATIONS"
    | "CHAT"
    | "HEALTH";

export const REQUIRED_INTERFACE_GROUPS: readonly FinalInterfaceGroup[] = [
    "SESSION",
    "AI",
    "JOBS",
    "PRIVACY",
    "TESTS",
    "RANKING",
    "NOTIFICATIONS",
    "CHAT",
    "HEALTH",
];

/**
 * Modelo persistido ou schema usado em fluxos criticos.
 */
export type TechnicalMapModel = {
    name: string;
    domain: string;
    sensitiveData: string;
    protectionRule: string;
};

/**
 * Fluxo funcional critico que deve ter falha controlada documentada.
 */
export type TechnicalMapFlow = {
    name: string;
    source: string;
    target: string;
    controlledFailure: string;
};

/**
 * Controlo transversal que nao corresponde a um unico endpoint ou schema.
 */
export type TechnicalMapOperationalControl = {
    area: string;
    contract: string;
    validation: string;
    scopeLimit: string;
};

/**
 * Contrato completo exportado pelo mapa tecnico minimo.
 */
export type TechnicalMap = {
    modules: TechnicalMapModule[];
    routes: {
        path: string;
        page: string;
        profile: string;
        securityRule: string;
    }[];
    endpoints: TechnicalMapEndpoint[];
    models: TechnicalMapModel[];
    flows: TechnicalMapFlow[];
    operationalControls: TechnicalMapOperationalControl[];
};

export const TECHNICAL_MAP: TechnicalMap = {
    modules: [
        {
            name: "AuthModule",
            domain: "Autenticacao",
            responsibility:
                "Registo, login e sessao v2 com revogacao por estado e versao.",
            securityRule:
                "Redis guarda apenas userId/sessionVersion; cada pedido rele role, accountStatus e sessionVersion no MongoDB.",
            critical: true,
        },
        {
            name: "HealthModule",
            domain: "Operacao local",
            responsibility: "Liveness e readiness fail-closed das dependencias reais.",
            securityRule:
                "A readiness devolve 503 quando MongoDB, Redis, storage ou runners nao estao prontos.",
            critical: true,
        },
        {
            name: "RuntimeModule",
            domain: "Runtime local",
            responsibility: "Identidade e fronteira da instancia PAP local.",
            securityRule:
                "Aceita apenas local-pap, bind 127.0.0.1, origem loopback e trust proxy desligado.",
            critical: true,
        },
        {
            name: "PersistenceIntegrityModule",
            domain: "Integridade MongoDB",
            responsibility: "Bootstrap de indices e invariantes persistentes.",
            securityRule:
                "Replica set e indices parciais protegem transacoes, versoes e jobs ativos unicos.",
            critical: true,
        },
        {
            name: "MaterialsModule",
            domain: "Materiais privados",
            responsibility:
                "Upload, storage local atomico, quota, outbox e reconciliacao de materiais privados.",
            securityRule:
                "Ownership vem da sessao; metadata e quota sao validadas antes de staging e promocao por rename.",
            critical: true,
        },
        {
            name: "MaterialIndexModule",
            domain: "Indexacao recuperavel",
            responsibility:
                "Jobs MongoDB com lease, heartbeat, retry, fencing e reidratacao por material.",
            securityRule:
                "Ownership e estado sao revalidados; existe no maximo um job ativo por material.",
            critical: true,
        },
        {
            name: "StudentsModule",
            domain: "Perfil do aluno",
            responsibility: "Perfil editavel com ano escolar, curso e turma.",
            securityRule:
                "O perfil e lido pelo backend via sessao; o frontend nao envia ano para a IA da sala.",
            critical: true,
        },
        {
            name: "StudyRoomsModule",
            domain: "Salas de estudo",
            responsibility: "Salas, partilhas e IA partilhada da sala.",
            securityRule:
                "Membership e fontes autorizadas sao validadas antes do perfil pedagogico entrar no prompt.",
            critical: true,
        },
        {
            name: "AiModule",
            domain: "Execucao IA governada",
            responsibility:
                "Fachada unica de autorizacao, consentimento, policy, quota, provider, validacao e audit.",
            securityRule:
                "Apenas GovernedAiExecutionService pode injetar AI_PROVIDER; ROOM_AI inicia desativada e sem consentimento automatico.",
            critical: true,
        },
        {
            name: "AiConsentsModule",
            domain: "Consentimentos IA",
            responsibility: "Grant/revoke append-only por finalidade, incluindo ROOM_AI.",
            securityRule:
                "A chamada ao provider e bloqueada sem consentimento atual e policy ativa.",
            critical: true,
        },
        {
            name: "OfficialMaterialsModule",
            domain: "Materiais oficiais",
            responsibility: "Materiais de professor associados a disciplina ou turma.",
            securityRule: "Professor e disciplina sao validados no backend.",
            critical: true,
        },
        {
            name: "OfficialTestsModule",
            domain: "Mini-testes oficiais",
            responsibility:
                "Ciclo DRAFT/PUBLISHED/CLOSED, tres tentativas atomicas e ranking BEST_ATTEMPT.",
            securityRule:
                "So DRAFT e editavel; solucoes completas so apos terceira tentativa ou fecho.",
            critical: true,
        },
        {
            name: "TeacherDashboardModule",
            domain: "Dashboard docente",
            responsibility:
                "Agrega turmas, materiais, testes, revisoes IA e acompanhamento operacional.",
            securityRule:
                "Usa o professor da sessao e devolve apenas contagens agregadas por turma.",
            critical: true,
        },
        {
            name: "FollowUpAlertsModule",
            domain: "Acompanhamento docente",
            responsibility:
                "Regras de inatividade, preview e execucao manual de alertas.",
            securityRule:
                "Preview nao envia notificacoes; detalhes por aluno ficam fora do dashboard.",
            critical: true,
        },
        {
            name: "SourceGroundedAiModule",
            domain: "IA com fontes",
            responsibility: "Respostas baseadas em excertos citaveis.",
            securityRule: "Bloqueia resposta quando nao ha fontes processaveis.",
            critical: true,
        },
        {
            name: "TeacherAiModule",
            domain: "Voz IA docente",
            responsibility: "Voz base por turma e override opcional por disciplina.",
            securityRule:
                "Ownership por professor, resolucao `SUBJECT_OVERRIDE -> CLASS_BASE -> DEFAULT`.",
            critical: true,
        },
        {
            name: "ClassAiModule",
            domain: "IA da disciplina",
            responsibility: "Assistente da turma ou disciplina com voz docente herdada.",
            securityRule:
                "Valida membership da disciplina, materiais oficiais e voz efetiva resolvida.",
            critical: true,
        },
        {
            name: "TeacherStudentChatModule",
            domain: "Chat da disciplina",
            responsibility:
                "Chat persistido entre alunos inscritos e professor responsavel.",
            securityRule:
                "Sessao `sf_sid`, ownership/membership da disciplina e WebSocket autenticado.",
            critical: true,
        },
        {
            name: "GuidedStudyRoomsModule",
            domain: "Salas guiadas",
            responsibility: "Salas docentes por turma com disciplina opcional.",
            securityRule:
                "Valida turma/professor/aluno; `subjectId` so e aceite se pertencer a turma.",
            critical: true,
        },
        {
            name: "AiModelPoliciesModule",
            domain: "Governanca IA",
            responsibility: "Politicas de modelo e limites por contexto.",
            securityRule: "Nao expoe chaves, prompts privados nem respostas completas.",
            critical: true,
        },
        {
            name: "AiQuotasModule",
            domain: "Quotas IA",
            responsibility: "Reserva e consumo de quotas por aluno, turma ou grupo.",
            securityRule: "Limites aplicados no backend antes da chamada ao provider.",
            critical: true,
        },
        {
            name: "AuditLogModule",
            domain: "Auditoria",
            responsibility: "Eventos tecnicos e sensiveis para defesa e rastreabilidade.",
            securityRule: "Logs minimizados, sem materiais privados nem credenciais.",
            critical: true,
        },
        {
            name: "PersonalDataModule",
            domain: "Registry de dados pessoais",
            responsibility:
                "Classifica todos os models como DELETE, PULL_MEMBERSHIP, ANONYMIZE_90D ou RETAIN_NONPERSONAL.",
            securityRule:
                "O teste arquitetural falha perante model sem politica; export e delete usam a mesma registry.",
            critical: true,
        },
        {
            name: "PrivacyDataExportsModule",
            domain: "Exportacao RGPD",
            responsibility: "Exporta todas as categorias proprias num attachment JSON.",
            securityRule:
                "Exclui hashes, secrets, chaves de respostas e dados de terceiros; resposta e private/no-store.",
            critical: true,
        },
        {
            name: "AccountDeletionModule",
            domain: "Eliminacao RGPD",
            responsibility:
                "Elimina/anonimiza dados numa transaction, revoga sessoes e agenda ficheiros na outbox.",
            securityRule:
                "O recibo usa referencia aleatoria sem userId e expira apos 90 dias.",
            critical: true,
        },
        {
            name: "AdminUsersModule",
            domain: "Administracao de papeis",
            responsibility: "Mudanca transacional de role e revogacao de sessoes.",
            securityRule:
                "Sentinel atomico impede remover o ultimo administrador ativo.",
            critical: true,
        },
        {
            name: "ContextNotificationsModule",
            domain: "Notificacoes",
            responsibility: "Cria e lista notificacoes minimizadas para o destinatario.",
            securityRule:
                "DTO publico nao devolve recipientIds nem suppressedRecipientIds; administracao usa contagens.",
            critical: true,
        },
        {
            name: "NotificationPoliciesModule",
            domain: "Politicas de notificacao",
            responsibility: "Aplica preferencias e quotas antes da persistencia.",
            securityRule: "Destinatarios sao resolvidos no backend e nunca aceites do cliente.",
            critical: true,
        },
    ],
    routes: [
        {
            path: "/app/perfil",
            page: "ProfilePage",
            profile: "Aluno",
            securityRule:
                "A API guarda o ano escolar no perfil autenticado e a IA da sala le esse dado apenas no backend.",
        },
        {
            path: "/app/areas/:studyAreaId/ferramentas",
            page: "StudyToolsPage",
            profile: "Aluno",
            securityRule:
                "A API filtra artefactos por area e utilizador autenticado.",
        },
        {
            path: "/app/salas/:roomId/ia",
            page: "RoomAiPage",
            profile: "Aluno",
            securityRule:
                "A pergunta nao envia ano; a API valida membership, fontes e perfil do aluno autenticado.",
        },
        {
            path: "/app/professor/turmas/:classId/voz",
            page: "TeacherClassesPage + TeacherClassAiVoiceDialog",
            profile: "Professor",
            securityRule:
                "Deep link abre modal contextual; a API valida ownership da turma antes de ler ou gravar voz base.",
        },
        {
            path: "/app/professor/disciplinas/:subjectId/materiais",
            page: "TeacherOfficialMaterialsPage",
            profile: "Professor",
            securityRule:
                "A API valida professor, disciplina e materiais oficiais.",
        },
        {
            path: "/app/professor/disciplinas/:subjectId/voz",
            page: "TeacherAiVoicePage",
            profile: "Professor",
            securityRule:
                "A API valida ownership da disciplina e trata a configuracao como override.",
        },
        {
            path: "/app/professor/disciplinas/:subjectId/chat",
            page: "TeacherSubjectChatPage",
            profile: "Professor",
            securityRule:
                "A API valida ownership da disciplina antes de carregar ou enviar mensagens.",
        },
        {
            path: "/app/professor/turmas/:classId/salas-guiadas",
            page: "TeacherGuidedStudyRoomsPage",
            profile: "Professor",
            securityRule:
                "A API valida ownership da turma e disciplina opcional da mesma turma.",
        },
        {
            path: "/app/professor",
            page: "TeacherDashboardPage",
            profile: "Professor",
            securityRule:
                "Dashboard agregado; nao expoe nomes/emails de alunos inativos.",
        },
        {
            path: "/app/professor/acompanhamento",
            page: "TeacherFollowUpAlertsPage",
            profile: "Professor",
            securityRule:
                "Area propria para regras e preview legivel de alunos inativos das turmas do professor.",
        },
        {
            path: "/app/disciplinas/:subjectId/ia",
            page: "StudentClassAiPage",
            profile: "Aluno",
            securityRule: "A API valida inscricao na disciplina antes de responder.",
        },
        {
            path: "/app/disciplinas/:subjectId/chat",
            page: "StudentSubjectChatPage",
            profile: "Aluno",
            securityRule:
                "A API valida inscricao na disciplina antes de carregar ou enviar mensagens.",
        },
        {
            path: "/app/turmas/:classId/salas-guiadas",
            page: "StudentGuidedStudyRoomsPage",
            profile: "Aluno",
            securityRule:
                "A API valida inscricao na turma e nao expoe controlos de voz docente.",
        },
        {
            path: "/app/admin/governanca",
            page: "AdminGovernancePage",
            profile: "Admin",
            securityRule: "A API valida role de administracao no backend.",
        },
        {
            path: "/app/privacidade",
            page: "PrivacyPage",
            profile: "Aluno, professor e admin",
            securityRule:
                "ProtectedLayout e RoleGuard montam a pagina apenas com sessao valida; export gera download JSON e delete revoga a sessao.",
        },
        {
            path: "/app/disciplinas/:subjectId/testes",
            page: "OfficialTestAttemptPage",
            profile: "Aluno",
            securityRule:
                "A API valida inscricao, publica apenas testes PUBLISHED e aplica tres tentativas.",
        },
        {
            path: "/app/professor/disciplinas/:subjectId/testes",
            page: "TeacherOfficialTestsPage",
            profile: "Professor",
            securityRule:
                "RoleGuard impede mount/pedidos de outros papeis e a API valida ownership da disciplina.",
        },
        {
            path: "/app/professor/disciplinas/:subjectId/testes/:testId/ranking",
            page: "OfficialTestRankingPage",
            profile: "Professor",
            securityRule:
                "Mostra uma linha BEST_ATTEMPT por aluno sem respostas completas nem email.",
        },
        {
            path: "/app/material-index-jobs/:jobId/versoes",
            page: "MaterialVersionsPage",
            profile: "Aluno ou professor",
            securityRule:
                "A API revalida ownership/membership do job antes de listar ou restaurar versoes.",
        },
        {
            path: "/app/*",
            page: "ProtectedLayout + RoleGuard + NotFoundPage",
            profile: "Autenticado",
            securityRule:
                "Rotas sao lazy; papel e parametros sao validados antes de mount; rota desconhecida devolve 404 explicito.",
        },
    ],
    endpoints: [
        {
            method: "POST",
            path: "/api/auth/login",
            input: "email e password",
            output: "sessao HttpOnly e utilizador publico",
            securityRule:
                "Nao devolve passwordHash nem tokens de sessao ao frontend.",
        },
        {
            method: "GET",
            path: "/api/auth/me",
            input: "cookie de sessao",
            output: "utilizador autenticado",
            securityRule:
                "Rele role/accountStatus/sessionVersion no MongoDB; ausencia ou divergencia devolve 401 SESSION_REVOKED.",
            interfaceGroup: "SESSION",
        },
        {
            method: "PUT/DELETE",
            path: "/api/ai-consents/:purpose",
            input: "finalidade e policyVersion",
            output: "consentimento atual minimizado",
            securityRule:
                "ROOM_AI nao e concedida automaticamente; sem consentimento/policy/quota o provider nao e chamado.",
            interfaceGroup: "AI",
        },
        {
            method: "GET",
            path: "/api/students/me/profile",
            input: "cookie de sessao",
            output: "perfil escolar do aluno",
            securityRule:
                "O userId vem da sessao; o frontend nao escolhe que perfil ler.",
        },
        {
            method: "POST",
            path: "/api/study-areas/:studyAreaId/materials",
            input: "material privado do aluno",
            output: "material criado",
            securityRule:
                "O userId vem da sessao; valida metadata, 10 MiB, quota de 250 MiB e rate limit 20/h antes da promocao atomica.",
        },
        {
            method: "POST",
            path: "/api/student/study-areas/:studyAreaId/materials/:materialId/index-jobs",
            input: "material privado autorizado",
            output: "202 com job novo ou ativo reutilizado",
            securityRule:
                "Ownership e indice parcial impedem jobs ativos duplicados; processamento pesado corre em worker terminavel.",
        },
        {
            method: "GET",
            path: "/api/student/study-areas/:studyAreaId/material-index-jobs?latestByMaterial=true",
            input: "area privada e query obrigatoria",
            output: "ultimo job por material",
            securityRule:
                "Lista apenas jobs do aluno/area para reidratar estados monotonicos apos reload.",
            interfaceGroup: "JOBS",
        },
        {
            method: "GET",
            path: "/api/study-areas/:id/summaries",
            input: "area de estudo",
            output: "resumos da area",
            securityRule: "Ownership da area e validado no backend.",
        },
        {
            method: "POST",
            path: "/api/ai/source-grounded-answers",
            input: "job de indexacao e pergunta",
            output: "resposta IA com citacoes",
            securityRule:
                "Bloqueia resposta quando nao ha fontes processaveis autorizadas.",
        },
        {
            method: "POST",
            path: "/api/study-rooms/:roomId/ai/answers",
            input: "pergunta e fontes opcionais da sala",
            output: "resposta IA com fontes da sala",
            securityRule:
                "Membership e fontes sao obrigatorias; o ano escolar vem do perfil autenticado e so adapta linguagem.",
        },
        {
            method: "GET",
            path: "/api/teacher/classes/:classId/ai-voice",
            input: "turma docente",
            output: "voz base da turma ou default",
            securityRule: "Valida ownership da turma.",
        },
        {
            method: "PUT",
            path: "/api/teacher/classes/:classId/ai-voice",
            input: "tom, detalhe e regras",
            output: "voz base da turma",
            securityRule: "Apenas professor dono da turma.",
        },
        {
            method: "GET",
            path: "/api/teacher/subjects/:subjectId/ai-voice",
            input: "disciplina docente",
            output: "voz efetiva da disciplina",
            securityRule:
                "Valida ownership da disciplina e inclui metadata de heranca.",
        },
        {
            method: "PUT",
            path: "/api/teacher/subjects/:subjectId/ai-voice",
            input: "tom, detalhe e regras",
            output: "override da disciplina",
            securityRule: "Apenas professor dono da disciplina.",
        },
        {
            method: "DELETE",
            path: "/api/teacher/subjects/:subjectId/ai-voice",
            input: "disciplina docente",
            output: "voz efetiva herdada",
            securityRule: "Remove override sem apagar voz base da turma.",
        },
        {
            method: "POST",
            path: "/api/teacher/classes/:classId/guided-study-rooms",
            input: "sala guiada e `subjectId` opcional",
            output: "sala guiada criada",
            securityRule:
                "`subjectId`, quando existe, tem de pertencer a turma e ao professor.",
        },
        {
            method: "GET",
            path: "/api/teacher/classes/:classId/guided-study-rooms",
            input: "turma docente",
            output: "salas guiadas da turma",
            securityRule: "Valida ownership da turma.",
        },
        {
            method: "GET",
            path: "/api/teacher/dashboard",
            input: "cookie de sessao",
            output: "dashboard docente agregado",
            securityRule:
                "Apenas professor; nao aceita `teacherId` do frontend e minimiza dados por aluno.",
        },
        {
            method: "GET",
            path: "/api/follow-up-alerts",
            input: "cookie de sessao",
            output: "regras do professor",
            securityRule:
                "Apenas professor; lista so regras do proprio professor.",
        },
        {
            method: "POST",
            path: "/api/follow-up-alerts",
            input: "turma, dias, titulo e mensagem",
            output: "regra criada",
            securityRule: "Valida ownership da turma antes de criar.",
        },
        {
            method: "GET",
            path: "/api/follow-up-alerts/summary",
            input: "cookie de sessao",
            output: "regras com preview de alunos inativos",
            securityRule:
                "Apenas area de acompanhamento; nao envia notificacoes e filtra por turmas do professor.",
        },
        {
            method: "POST",
            path: "/api/follow-up-alerts/:id/run",
            input: "regra docente",
            output: "notificacao criada ou preview vazio",
            securityRule:
                "Executa apenas regra do professor e destinatarios calculados no backend.",
        },
        {
            method: "GET",
            path: "/api/student/classes/:classId/guided-study-rooms",
            input: "turma do aluno",
            output: "salas guiadas abertas",
            securityRule:
                "Valida inscricao na turma e nao devolve controlos de voz.",
        },
        {
            method: "POST",
            path: "/api/student/subjects/:subjectId/ai/answers",
            input: "pergunta do aluno",
            output: "resposta IA citada",
            securityRule: "Membership da disciplina e fontes oficiais sao obrigatorias.",
        },
        {
            method: "GET",
            path: "/api/student/subjects/:subjectId/chat/messages",
            input: "disciplina do aluno",
            output: "ultimas 100 mensagens cronologicas",
            securityRule:
                "Valida inscricao na turma da disciplina e nao expoe emails nem sessao.",
        },
        {
            method: "GET",
            path: "/api/teacher/subjects/:subjectId/chat/messages",
            input: "disciplina do professor",
            output: "ultimas 100 mensagens cronologicas",
            securityRule: "Valida professor responsavel pela disciplina.",
        },
        {
            method: "POST/GET",
            path: "/api/privacy/data-exports",
            input: "sessao autenticada",
            output: "pedidos proprios de exportacao",
            securityRule:
                "PersonalDataRegistry cobre todos os models e exclui hashes, secrets, answer keys e dados de terceiros.",
            interfaceGroup: "PRIVACY",
        },
        {
            method: "GET",
            path: "/api/privacy/data-exports/:id/download",
            input: "export proprio concluido",
            output: "attachment JSON private/no-store",
            securityRule:
                "Ownership e nome seguro sao validados; o ficheiro temporario e removido apos stream/abort.",
        },
        {
            method: "POST",
            path: "/api/privacy/account-deletion",
            input: "sessao autenticada",
            output: "referencia aleatoria nao associavel",
            securityRule:
                "Transaction revoga sessoes e remove/anonimiza dados; outbox preserva deletes fisicos apos commit.",
        },
        {
            method: "PATCH",
            path: "/api/admin/users/:id/role",
            input: "novo papel",
            output: "utilizador publico atualizado",
            securityRule:
                "Apenas admin; transaction, sentinel do ultimo admin e incremento de sessionVersion.",
        },
        {
            method: "POST",
            path: "/api/teacher/subjects/:subjectId/tests/:testId/publish",
            input: "teste DRAFT do professor",
            output: "teste PUBLISHED",
            securityRule:
                "Transicao atomica sem saltos/reabertura; ownership da disciplina e validado.",
            interfaceGroup: "TESTS",
        },
        {
            method: "POST",
            path: "/api/teacher/subjects/:subjectId/tests/:testId/close",
            input: "teste PUBLISHED do professor",
            output: "teste CLOSED",
            securityRule:
                "Fecho atomico desbloqueia solucoes completas sem permitir reabertura.",
        },
        {
            method: "POST",
            path: "/api/student/subjects/:subjectId/tests/:testId/attempts",
            input: "attemptKey e escolha por pergunta",
            output: "tentativa numerada e pontuada",
            securityRule:
                "Idempotencia e contador atomico limitam a tres; answer key so apos terceira ou fecho.",
        },
        {
            method: "GET",
            path: "/api/student/subjects/:subjectId/tests/:testId/attempts/me",
            input: "aluno da sessao",
            output: "apenas tentativas proprias",
            securityRule:
                "Aplica a mesma politica temporal de solucoes e nunca expoe tentativas de terceiros.",
        },
        {
            method: "GET",
            path: "/api/teacher/subjects/:subjectId/tests/:testId/ranking",
            input: "professor e teste oficial",
            output: "uma linha por aluno com attemptCount, bestPercentage e bestAnsweredAt",
            securityRule:
                "BEST_ATTEMPT; empate pela melhor tentativa mais antiga e ID estavel; sem respostas/email.",
            interfaceGroup: "RANKING",
        },
        {
            method: "GET",
            path: "/api/context-notifications",
            input: "destinatario autenticado",
            output: "notificacoes proprias minimizadas",
            securityRule:
                "Nao devolve recipientIds nem suppressedRecipientIds; vistas administrativas usam contagens.",
            interfaceGroup: "NOTIFICATIONS",
        },
        {
            method: "WS",
            path: "/subject-chat",
            input: "`subject-chat:join` e `subject-chat:send`",
            output: "acks tipados e `subject-chat:message`",
            securityRule:
                "Handshake usa cookie `sf_sid`, valida `Origin`, revalida a sessao em join/send e antes de broadcasts.",
            interfaceGroup: "CHAT",
        },
        {
            method: "GET",
            path: "/api/health/live",
            input: "nenhuma",
            output: "liveness do processo",
            securityRule: "Nao consulta dependencias nem devolve configuracao sensivel.",
        },
        {
            method: "GET",
            path: "/api/health/ready",
            input: "nenhuma",
            output: "readiness ou 503",
            securityRule:
                "Falha fechado perante MongoDB, Redis, storage ou runners indisponiveis.",
            interfaceGroup: "HEALTH",
        },
        {
            method: "GET",
            path: "/api/health",
            input: "nenhuma",
            output: "alias compativel da readiness",
            securityRule: "Mantem exatamente a semantica fail-closed de /ready.",
        },
    ],
    models: [
        {
            name: "User",
            domain: "Identidade",
            sensitiveData:
                "email, password hash, role, accountStatus e sessionVersion",
            protectionRule:
                "Hash nunca e devolvido; role/delete incrementam sessionVersion e DELETED bloqueia HTTP/WS.",
        },
        {
            name: "StudentProfile",
            domain: "Perfil do aluno",
            sensitiveData: "nome, ano escolar, curso e turma",
            protectionRule:
                "Lido por userId da sessao; o ano escolar adapta apenas a forma da resposta IA.",
        },
        {
            name: "StudyArea",
            domain: "Estudo individual",
            sensitiveData: "relacao com aluno",
            protectionRule: "Ownership por sessao autenticada.",
        },
        {
            name: "StudyRoom",
            domain: "Salas de estudo",
            sensitiveData: "membros e contexto colaborativo",
            protectionRule: "Membership validada antes de listar partilhas ou chamar IA.",
        },
        {
            name: "Material",
            domain: "Materiais privados",
            sensitiveData: "storageKey UUID, SHA-256, tamanho, titulo e ownership",
            protectionRule:
                "Visivel apenas ao aluno dono; ficheiro 0600 sob raiz 0700, promovido atomicamente e eliminado por outbox.",
        },
        {
            name: "MaterialIndexJob",
            domain: "Indexacao",
            sensitiveData: "material, owner, estado, lease e tentativas",
            protectionRule:
                "Lease/heartbeat/fencing e indice parcial garantem recovery e um job ativo por material.",
        },
        {
            name: "QuizGenerationJob",
            domain: "Geracao IA assincrona",
            sensitiveData: "area, aluno, estado, lease e erro publico",
            protectionRule:
                "Processador idempotente; tres tentativas, backoff e erro sem prompt/resposta do provider.",
        },
        {
            name: "OfficialMaterial",
            domain: "Disciplina e turma",
            sensitiveData: "material criado por professor",
            protectionRule: "Acesso limitado por professor, turma e disciplina.",
        },
        {
            name: "TeacherClassAiVoice",
            domain: "Voz IA docente",
            sensitiveData: "regras pedagogicas da turma",
            protectionRule: "Visivel/editavel apenas pelo professor dono da turma.",
        },
        {
            name: "TeacherAiVoice",
            domain: "Voz IA docente",
            sensitiveData: "override pedagogico da disciplina",
            protectionRule:
                "Visivel/editavel apenas pelo professor dono da disciplina.",
        },
        {
            name: "TeacherStudentChatThread",
            domain: "Chat da disciplina",
            sensitiveData: "relacao disciplina/turma/professor",
            protectionRule:
                "Um thread por disciplina, criado apenas apos autorizacao.",
        },
        {
            name: "TeacherStudentChatMessage",
            domain: "Chat da disciplina",
            sensitiveData: "texto da mensagem e autor",
            protectionRule:
                "Autor vem da sessao; resposta publica nao inclui email, cookie ou dados sensiveis.",
        },
        {
            name: "GuidedStudyRoom",
            domain: "Salas guiadas",
            sensitiveData: "agenda, objetivo e disciplina opcional",
            protectionRule:
                "Professor gere por turma; aluno le apenas salas abertas da turma inscrita.",
        },
        {
            name: "FollowUpAlertRule",
            domain: "Acompanhamento docente",
            sensitiveData: "turma, prazo de inatividade e mensagem",
            protectionRule:
                "Regras lidas por professor da sessao; preview detalhado so em `/app/professor/acompanhamento`.",
        },
        {
            name: "SourceGroundedAiAnswer",
            domain: "IA com fontes",
            sensitiveData: "pergunta, resposta e citacoes",
            protectionRule: "Sem resposta quando faltam fontes processaveis.",
        },
        {
            name: "RoomAiInteraction",
            domain: "IA da sala",
            sensitiveData: "pergunta, resposta e fontes da sala",
            protectionRule:
                "Nao guarda ano escolar; guarda apenas a interacao e IDs de fontes autorizadas.",
        },
        {
            name: "AuditEvent",
            domain: "Auditoria",
            sensitiveData: "ator/recurso pseudonimizados e metadata tecnica",
            protectionRule:
                "Sem conteudos privados; eventos relacionados com delete sao anonimizados e expiram por TTL aos 90 dias.",
        },
        {
            name: "AiConsent",
            domain: "Consentimento IA",
            sensitiveData: "userId, finalidade, estado e policyVersion",
            protectionRule:
                "Eventos append-only; ROOM_AI inicia sem grant e export/delete seguem a registry.",
        },
        {
            name: "AiQuotaUsage",
            domain: "Quota IA",
            sensitiveData: "scope, target e unidades reservadas",
            protectionRule:
                "Reserva atomica antes do provider; resposta publica nao expoe dados de terceiros.",
        },
        {
            name: "OfficialTest",
            domain: "Mini-testes oficiais",
            sensitiveData: "perguntas, opcoes, correta e estado",
            protectionRule:
                "Exatamente quatro opcoes distintas; correctOptionIndex fica oculto ate terceira tentativa ou CLOSED.",
        },
        {
            name: "OfficialTestAttempt",
            domain: "Tentativas e ranking",
            sensitiveData: "aluno, respostas, percentagem, numero e answeredAt",
            protectionRule:
                "Maximo tres por aluno/teste; ranking agrega BEST_ATTEMPT e minimiza identidade/conteudo.",
        },
        {
            name: "PersonalDataRetention",
            domain: "Retencao RGPD",
            sensitiveData: "referencia aleatoria e expiracao",
            protectionRule:
                "Nao guarda userId; TTL remove o recibo anonimizado apos 90 dias.",
        },
        {
            name: "AccountDeletionRequest",
            domain: "Eliminacao RGPD",
            sensitiveData: "estado tecnico e geracao de recovery",
            protectionRule:
                "Nao e resposta publica; recovery completa/reativa sem perder a outbox de ficheiros.",
        },
        {
            name: "StorageOutbox",
            domain: "Filesystem local",
            sensitiveData: "operacao, storageKey e fase sem conteudo do ficheiro",
            protectionRule:
                "JSON 0600 sob raiz privada; reconciliacao idempotente promove ou elimina orfaos apos crash.",
        },
    ],
    flows: [
        {
            name: "Login seguro",
            source: "POST /api/auth/login",
            target: "shell autenticada",
            controlledFailure: "401 para credenciais invalidas.",
        },
        {
            name: "Revogacao global de sessao",
            source: "role/delete/sessionVersion",
            target: "HTTP e WebSocket",
            controlledFailure:
                "401 SESSION_REVOKED e remocao do socket antes de join/send/broadcast quando estado ou versao divergem.",
        },
        {
            name: "Execucao IA governada",
            source: "fluxo IA autorizado",
            target: "provider e output validado",
            controlledFailure:
                "consentimento, finalidade, policy, quota, guardrail ou timeout bloqueiam antes/ao redor do provider com audit seguro.",
        },
        {
            name: "Resumo IA privado",
            source: "materiais da area",
            target: "artefacto IA com fontes",
            controlledFailure: "bloqueio quando nao ha fontes processaveis.",
        },
        {
            name: "Material oficial",
            source: "professor e disciplina",
            target: "material oficial indexavel",
            controlledFailure: "403 quando o professor nao tem acesso.",
        },
        {
            name: "Heranca de voz docente",
            source: "turma e disciplina opcional",
            target: "voz efetiva com `source` e `hasOverride`",
            controlledFailure:
                "default seguro quando nao ha configuracao e 403/404 fora do ownership.",
        },
        {
            name: "Chat da disciplina",
            source: "aluno/professor autorizado",
            target: "historico REST e entrega WebSocket",
            controlledFailure:
                "401/403 sem sessao, inscricao ou ownership; envio preservado ate ack positivo.",
        },
        {
            name: "Sala guiada docente",
            source: "turma do professor",
            target: "sala com disciplina opcional",
            controlledFailure:
                "400/403 quando `subjectId` nao pertence a turma/professor.",
        },
        {
            name: "Dashboard docente operacional",
            source: "professor autenticado",
            target: "totais e linhas agregadas por turma",
            controlledFailure:
                "403 para nao professores e sem nomes/emails de alunos no dashboard.",
        },
        {
            name: "Preview de acompanhamento",
            source: "regras do professor",
            target: "alunos inativos na pagina de acompanhamento",
            controlledFailure:
                "403 para nao professores, zero notificacoes durante preview e filtro por ownership.",
        },
        {
            name: "IA com fontes obrigatorias",
            source: "POST /api/ai/source-grounded-answers",
            target: "resposta citada",
            controlledFailure: "erro controlado quando nao ha fontes autorizadas.",
        },
        {
            name: "IA da sala adaptada ao ano escolar",
            source: "aluno membro pergunta na sala",
            target: "resposta com fontes da sala e linguagem adaptada",
            controlledFailure:
                "403 sem membership, 422 sem fontes e fallback neutro quando o ano escolar nao existe.",
        },
        {
            name: "IA da disciplina",
            source: "aluno inscrito",
            target: "resposta com citacoes e voz efetiva",
            controlledFailure: "403 sem membership e erro controlado sem fontes.",
        },
        {
            name: "Upload atomico e reconciliavel",
            source: "multipart autenticado",
            target: "Material + ficheiro promovido",
            controlledFailure:
                "metadata/quota/rate limit falham antes da escrita; crash deixa staging/outbox recuperavel sem ficheiro comprometido orfao.",
        },
        {
            name: "Parsing isolado",
            source: "PDF/DOCX autorizado",
            target: "texto limitado",
            controlledFailure:
                "timeout termina o worker; resourceLimits/stack e concorrencia 2 impedem exaustao do processo principal.",
        },
        {
            name: "Recovery de jobs",
            source: "lease expirada no MongoDB",
            target: "retry idempotente ou FAILED",
            controlledFailure:
                "heartbeat/fencing impedem writer obsoleto; tres tentativas com backoff 1/5/30 segundos.",
        },
        {
            name: "Eliminacao integral de conta",
            source: "POST /api/privacy/account-deletion",
            target: "MongoDB anonimizado + storage eliminado + sessoes revogadas",
            controlledFailure:
                "transaction/recovery e outbox compensam crash; recibo publico e aleatorio e sem userId.",
        },
        {
            name: "Exportacao integral RGPD",
            source: "PersonalDataRegistry",
            target: "attachment JSON proprio",
            controlledFailure:
                "model sem politica falha teste; export exclui secrets, hashes, answer keys e dados de terceiros.",
        },
        {
            name: "Publicacao e tentativas oficiais",
            source: "DRAFT -> PUBLISHED -> CLOSED",
            target: "tentativas e solucoes do aluno",
            controlledFailure:
                "edicao fora de DRAFT, quarta tentativa, salto/reabertura ou answer key antecipado sao rejeitados.",
        },
        {
            name: "Ranking BEST_ATTEMPT",
            source: "tentativas oficiais",
            target: "uma linha minimizada por aluno",
            controlledFailure:
                "empate usa melhor tentativa mais antiga e ID estavel; nunca devolve respostas completas/email.",
        },
        {
            name: "Readiness fail-closed",
            source: "GET /api/health/ready ou /api/health",
            target: "estado de MongoDB, Redis, storage e runners",
            controlledFailure: "503 perante qualquer dependencia indisponivel.",
        },
        {
            name: "Release local ligada ao manifesto",
            source: "verify:local-release",
            target: "snapshot autenticado PAP_LOCAL_ENDURECIDA",
            controlledFailure:
                "config, gate manual, teste ou hash divergente termina com exit code nao-zero e nao declara aptidao.",
        },
    ],
    operationalControls: [
        {
            area: "Runtime e configuracao",
            contract:
                "Node 24.11.1, npm 11.6.2, scope local-pap, HOST 127.0.0.1, WEB_ORIGIN loopback e trust proxy false.",
            validation: "loader tipado, config specs, secrets scan e verify:local-release",
            scopeLimit: "Uma instancia local; exposicao publica reabre TLS, proxy e HSTS.",
        },
        {
            area: "Storage de materiais",
            contract:
                "Raiz fora do checkout 0700, ficheiros 0600, UUID/SHA-256, 10 MiB por ficheiro e 250 MiB por utilizador.",
            validation: "tests de staging/promocao/delete/outbox/reconcile/quota e readiness",
            scopeLimit: "Storage local single-instance; hosting efemero ou escala horizontal reabre.",
        },
        {
            area: "Parsing e SSRF",
            contract:
                "ipaddr.js bloqueia ranges internos/mapped antes/depois de ligar/redirect; PDF/DOCX corre em worker terminavel com concorrencia 2.",
            validation: "security negatives IPv4/IPv6/redirect e worker timeout/resourceLimits",
            scopeLimit: "Sem fetch/parser alternativo fora destes adaptadores.",
        },
        {
            area: "Jobs MongoDB",
            contract:
                "Lease 30 s, heartbeat/fencing, concorrencia 2, tres tentativas e backoff 1/5/30 s; recovery no arranque.",
            validation: "integracao Mongo real com lease expirada de index e quiz",
            scopeLimit: "Runner local; multi-instancia reabre coordenacao distribuida.",
        },
        {
            area: "Transacoes e invariantes",
            contract:
                "Role, ultimo admin, delete e versoes usam transactions; indices parciais protegem versao/job ativo.",
            validation: "concorrencia e rollback em Mongo replica set real",
            scopeLimit: "Reset de dados atuais permitido; sem migrations de producao neste alvo.",
        },
        {
            area: "Privacidade e retencao",
            contract:
                "Todos os models classificados; DELETE/PULL_MEMBERSHIP/ANONYMIZE_90D/RETAIN_NONPERSONAL; audit/recibos expiram em 90 dias.",
            validation: "integracao all-model export/delete/storage/sessoes/TTL",
            scopeLimit: "Evidence nunca guarda PII, cookies, prompts, respostas IA ou URIs com credenciais.",
        },
        {
            area: "Frontend robusto",
            contract:
                "Rotas lazy com ProtectedLayout/RoleGuard/403/404/error boundary; ApiError/AbortSignal; sessao checking/authenticated/anonymous/unavailable.",
            validation: "Vitest/RTL/axe, coverage, E2E de 401/403/404/5xx e browser 320/360/375/390 px",
            scopeLimit: "Backend continua autoridade; returnTo aceita apenas paths internos.",
        },
        {
            area: "Async, chat e bundle",
            contract:
                "useAsyncAction em mutacoes, polling single-flight monotono, chat com ack/dedupe; socket apenas no chunk chat.",
            validation: "component tests, Playwright Chrome/Firefox/WebKit e budgets 90/160 KiB gzip",
            scopeLimit: "Mudanca de chunk ou handler sem ack reabre a validacao.",
        },
        {
            area: "Backup, release e rollback",
            contract:
                "Backup offline gzip + AES-256-GCM + SHA-256/HMAC; restore so para destinos locais vazios; gate fail-closed com 21 provas e snapshot autenticado.",
            validation: "roundtrip sintetico, restore real manual, hash antes/depois, readiness negativa e smoke autenticado",
            scopeLimit: "RPO 24 h/RTO 60 min locais; off-site e producao fora do ambito.",
        },
    ],
};

/**
 * A lista validada deixa de ser uma segunda fonte manual: qualquer módulo
 * crítico acrescentado ao mapa passa automaticamente a ser obrigatório.
 */
export const REQUIRED_MODULES: readonly string[] = TECHNICAL_MAP.modules
    .filter((module) => module.critical)
    .map((module) => module.name);

export type NamedModuleImport = {
    name: string;
    specifier: string;
};

/**
 * Resolve o caminho do AppModule a partir da raiz do repo ou de real_dev/api.
 *
 * @returns Caminho absoluto para `real_dev/api/src/app.module.ts` ou `src/app.module.ts`.
 * @throws Error quando o ficheiro raiz da API nao existe.
 */
export async function resolveAppModulePath(): Promise<string> {
    const candidates = [
        resolve(process.cwd(), "src/app.module.ts"),
        resolve(process.cwd(), "real_dev/api/src/app.module.ts"),
    ];

    for (const candidate of candidates) {
        try {
            await access(candidate);
            return candidate;
        } catch {
            // O script pode ser chamado por `npm --prefix real_dev/api` ou pela raiz do repo.
        }
    }

    throw new Error("Nao foi encontrado real_dev/api/src/app.module.ts.");
}

/**
 * Extrai imports nomeados de modulos a partir do AppModule.
 *
 * @param appModuleSource Conteudo textual de `app.module.ts`.
 * @returns Lista ordenada de modulos importados.
 */
export function extractImportedModules(appModuleSource: string): string[] {
    return [
        ...new Set(
            extractNamedModuleImports(appModuleSource).map(({ name }) => name),
        ),
    ].sort();
}

/**
 * Extrai imports nomeados terminados em `Module`, incluindo imports multiline.
 *
 * @param source Ficheiro TypeScript de um módulo NestJS.
 * @returns Nomes e specifiers relativos necessários para percorrer o grafo.
 */
export function extractNamedModuleImports(source: string): NamedModuleImport[] {
    const imports: NamedModuleImport[] = [];
    const matches = source.matchAll(
        /import\s+\{([^}]+)\}\s+from\s+"([^"]+)";/gs,
    );
    for (const match of matches) {
        const specifier = match[2];
        for (const imported of match[1].split(",")) {
            const name = imported
                .trim()
                .replace(/^type\s+/, "")
                .split(/\s+as\s+/)[0];
            if (name.endsWith("Module")) imports.push({ name, specifier });
        }
    }
    return imports;
}

/**
 * Percorre imports relativos desde AppModule para validar também módulos
 * agregados (por exemplo, GuidedStudyRoomsModule dentro de Mf2Module).
 *
 * @param entryPath Caminho de `app.module.ts`.
 * @returns Todos os módulos alcançáveis pelo grafo estático de imports.
 */
export async function collectReachableModules(entryPath: string): Promise<string[]> {
    const reachable = new Set<string>();
    const visitedFiles = new Set<string>();
    const pendingFiles = [resolve(entryPath)];

    while (pendingFiles.length > 0) {
        const currentPath = pendingFiles.pop()!;
        if (visitedFiles.has(currentPath)) continue;
        visitedFiles.add(currentPath);
        const source = await readFile(currentPath, "utf8");
        for (const imported of extractNamedModuleImports(source)) {
            reachable.add(imported.name);
            if (!imported.specifier.startsWith(".")) continue;
            const sourcePath = resolve(
                dirname(currentPath),
                imported.specifier.replace(/\.js$/, ".ts"),
            );
            try {
                await access(sourcePath);
                pendingFiles.push(sourcePath);
            } catch {
                throw new Error(
                    `Import de modulo sem fonte TypeScript: ${imported.name}.`,
                );
            }
        }
    }

    return [...reachable].sort();
}

/**
 * Garante que os modulos criticos continuam presentes no AppModule.
 *
 * @param importedModules Valor de importedModules usado pela função para executar assert required modules com dados explícitos.
 * @param requiredModules Valor de requiredModules usado pela função para executar assert required modules com dados explícitos.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
export function assertRequiredModules(
    importedModules: readonly string[],
    requiredModules: readonly string[] = REQUIRED_MODULES,
): void {
    const missing = requiredModules.filter(
        (moduleName) => !importedModules.includes(moduleName),
    );

    if (missing.length > 0) {
        // Falha fechada: o mapa nao pode ficar verde se a app deixou de importar um modulo critico.
        throw new Error(`Modulos criticos ausentes no AppModule: ${missing.join(", ")}.`);
    }
}

/**
 * Cria uma linha de tabela Markdown com pipes escapados.
 *
 * @param cells Valores textuais da linha.
 * @returns Linha Markdown segura.
 */
export function tableRow(cells: readonly string[]): string {
    return `| ${cells.map((cell) => cell.replaceAll("|", "\\|")).join(" | ")} |`;
}

/**
 * Gera o Markdown do mapa tecnico minimo.
 *
 * @param map Contratos tecnicos documentados.
 * @returns Documento Markdown completo.
 * @throws Error quando um endpoint critico nao declara regra de seguranca.
 */
export function buildTechnicalMapMarkdown(map: TechnicalMap): string {
    const moduleNames = map.modules.map(({ name }) => name);
    if (new Set(moduleNames).size !== moduleNames.length) {
        throw new Error("O mapa tecnico declara modulos duplicados.");
    }
    const moduleRows = map.modules.map((item) =>
        tableRow([
            `\`${item.name}\``,
            item.domain,
            item.responsibility,
            item.securityRule,
        ]),
    );
    const routeRows = map.routes.map((route) =>
        tableRow([`\`${route.path}\``, `\`${route.page}\``, route.profile, route.securityRule]),
    );
    const endpointRows = map.endpoints.map((endpoint) => {
        if (endpoint.securityRule.trim().length === 0) {
            // Cada endpoint critico tem de explicar a barreira que protege dados e contexto.
            throw new Error(
                `Endpoint ${endpoint.method} ${endpoint.path} nao declara regra de seguranca.`,
            );
        }

        return tableRow([
            `\`${endpoint.interfaceGroup ?? "TRANSVERSAL"}\``,
            `\`${endpoint.method}\``,
            `\`${endpoint.path}\``,
            endpoint.input,
            endpoint.output,
            endpoint.securityRule,
        ]);
    });
    const documentedInterfaceGroups = new Set(
        map.endpoints.flatMap(({ interfaceGroup }) =>
            interfaceGroup ? [interfaceGroup] : [],
        ),
    );
    const missingInterfaceGroups = REQUIRED_INTERFACE_GROUPS.filter(
        (group) => !documentedInterfaceGroups.has(group),
    );
    if (missingInterfaceGroups.length > 0) {
        throw new Error(
            `Interfaces finais ausentes do mapa tecnico: ${missingInterfaceGroups.join(", ")}.`,
        );
    }
    const modelRows = map.models.map((model) =>
        tableRow([
            `\`${model.name}\``,
            model.domain,
            model.sensitiveData,
            model.protectionRule,
        ]),
    );
    const flowRows = map.flows.map((flow) =>
        tableRow([flow.name, `\`${flow.source}\``, flow.target, flow.controlledFailure]),
    );
    const operationalRows = map.operationalControls.map((control) =>
        tableRow([
            control.area,
            control.contract,
            control.validation,
            control.scopeLimit,
        ]),
    );

    return [
        "# StudyFlow - mapa tecnico canonico",
        "",
        "## Objetivo",
        "",
        "Este documento liga modulos, rotas, nove grupos de interfaces finais, modelos, fluxos e controlos operacionais criticos da implementacao real em `real_dev`.",
        "E gerado exclusivamente por `real_dev/api/src/scripts/export-technical-map.ts`; o artefacto nao deve ser editado manualmente.",
        "O alvo e `PAP_LOCAL_ENDURECIDA`, loopback e single-instance. Este mapa nao declara aptidao nem prontidao para producao; o estado atual pertence a `docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md`.",
        "",
        "## Modulos backend criticos",
        "",
        "| Modulo | Dominio | Responsabilidade | Seguranca documentada |",
        "| --- | --- | --- | --- |",
        ...moduleRows,
        "",
        "## Rotas frontend criticas",
        "",
        "| Rota | Pagina | Perfil | Regra de seguranca |",
        "| --- | --- | --- | --- |",
        ...routeRows,
        "",
        "## Endpoints criticos",
        "",
        "| Grupo final | Metodo | Endpoint | Entrada principal | Resposta esperada | Regra de seguranca |",
        "| --- | --- | --- | --- | --- | --- |",
        ...endpointRows,
        "",
        "## Modelos principais",
        "",
        "| Modelo/schema | Dominio | Dados sensiveis | Regra de protecao |",
        "| --- | --- | --- | --- |",
        ...modelRows,
        "",
        "## Fluxos criticos",
        "",
        "| Fluxo | Origem | Destino | Falha controlada obrigatoria |",
        "| --- | --- | --- | --- |",
        ...flowRows,
        "",
        "## Controlos operacionais e limites de escopo",
        "",
        "| Area | Contrato | Validacao | Limite/condicao de reabertura |",
        "| --- | --- | --- | --- |",
        ...operationalRows,
        "",
        "## Como validar",
        "",
        "1. Confirmar que todos os modulos criticos declarados nesta fonte sao alcancaveis a partir de `real_dev/api/src/app.module.ts`.",
        "2. Executar `npm --prefix real_dev/api test -- export-technical-map.spec.ts --runInBand`.",
        "3. Executar `npm --prefix real_dev/api run build`.",
        "4. Atualizar este artefacto com `npm --prefix real_dev/api run technical-map:write`.",
        "5. Confirmar equivalencia byte a byte com `npm --prefix real_dev/api run technical-map:check`; o gate local executa a mesma verificacao fail-closed.",
        "6. Executar `npm --prefix real_dev/api run manifest:hash` e associar a evidence apenas ao hash da implementacao efetivamente validada.",
        "",
    ].join("\n");
}

/**
 * Valida o AppModule e devolve o Markdown do mapa tecnico.
 *
 * @returns Documento Markdown depois de confirmar modulos criticos.
 */
export async function exportTechnicalMap(): Promise<string> {
    const appModulePath = await resolveAppModulePath();
    assertRequiredModules(await collectReachableModules(appModulePath));
    return buildTechnicalMapMarkdown(TECHNICAL_MAP);
}

/** Resolve o único artefacto canónico, dentro de `real_dev` e do manifesto. */
export async function resolveCanonicalTechnicalMapPath(): Promise<string> {
    const appModulePath = await resolveAppModulePath();
    const apiRoot = resolve(dirname(appModulePath), "..");
    return resolve(apiRoot, "../docs/technical/STUDYFLOW-TECHNICAL-MAP.md");
}

/** Compara sem normalizações para que qualquer drift documental falhe fechado. */
export function assertTechnicalMapContent(
    generated: string,
    canonical: string,
): void {
    if (generated !== canonical) {
        throw new Error(
            "Mapa tecnico canonico desatualizado; executa technical-map:write e volta a validar.",
        );
    }
}

/** Gera em memória e compara com o artefacto incluído no manifesto. */
export async function assertCanonicalTechnicalMap(): Promise<void> {
    const canonicalPath = await resolveCanonicalTechnicalMapPath();
    const [generated, canonical] = await Promise.all([
        exportTechnicalMap(),
        readFile(canonicalPath, "utf8"),
    ]);
    assertTechnicalMapContent(generated, canonical);
}

/** Reescreve mecanicamente o artefacto canónico a partir da fonte tipada. */
export async function writeCanonicalTechnicalMap(): Promise<string> {
    const canonicalPath = await resolveCanonicalTechnicalMapPath();
    await writeFile(canonicalPath, await exportTechnicalMap(), "utf8");
    return canonicalPath;
}

/**
 * Confirma se o ficheiro foi chamado como script compilado ou fonte direta.
 *
 * @param argv Argumentos do processo Node.js.
 * @returns `true` quando o entrypoint e este exportador.
 */
export function isTechnicalMapCli(argv: readonly string[] = process.argv): boolean {
    const entrypoint = argv[1] ?? "";
    return (
        entrypoint.endsWith("export-technical-map.js") ||
        entrypoint.endsWith("export-technical-map.ts")
    );
}

if (isTechnicalMapCli()) {
    const run = process.argv.includes("--check")
        ? assertCanonicalTechnicalMap().then(() => {
              process.stdout.write(
                  `${JSON.stringify({ ok: true, canonical: "real_dev/docs/technical/STUDYFLOW-TECHNICAL-MAP.md" })}\n`,
              );
          })
        : process.argv.includes("--write")
          ? writeCanonicalTechnicalMap().then(() => {
                process.stdout.write(
                    `${JSON.stringify({ ok: true, updated: "real_dev/docs/technical/STUDYFLOW-TECHNICAL-MAP.md" })}\n`,
                );
            })
          : exportTechnicalMap().then((markdown) => {
                process.stdout.write(markdown);
            });
    run
        .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : "Falha desconhecida.";
            console.error(message);
            process.exitCode = 1;
        });
}
