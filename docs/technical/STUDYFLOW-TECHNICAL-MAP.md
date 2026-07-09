<!-- docs/technical/STUDYFLOW-TECHNICAL-MAP.md -->
# StudyFlow - mapa técnico mínimo

## Objetivo

Este documento liga os módulos, fluxos, modelos e endpoints críticos do StudyFlow na implementação real em `real_dev`.
Ele existe para cumprir `RNF27` e para dar a `BK-MF7-06` uma base concreta para escolher testes automatizados de módulos críticos.

## Módulos backend críticos

| Módulo | Domínio | Responsabilidade | Segurança documentada |
| --- | --- | --- | --- |
| `AuthModule` | Autenticação | Registo, login, sessão e utilizador autenticado. | Cookies HttpOnly e sessão validada no backend. |
| `MaterialsModule` | Materiais privados | Materiais submetidos pelo aluno em áreas de estudo. | `userId` vem da sessão autenticada e valida ownership. |
| `OfficialMaterialsModule` | Materiais oficiais | Materiais de professor associados a disciplina/turma. | Professor e disciplina são validados no backend. |
| `SourceGroundedAiModule` | IA com fontes | Respostas baseadas em excertos citáveis. | Bloqueia resposta quando não há fontes processáveis. |
| `ClassAiModule` | IA da disciplina | Assistente da turma/disciplina com voz docente. | Valida membership da disciplina e materiais oficiais. |
| `TeacherStudentChatModule` | Chat da disciplina | Chat persistido entre alunos inscritos e professor responsável. | Sessão `sf_sid`, ownership/membership da disciplina e WebSocket autenticado. |
| `AiModelPoliciesModule` | Governança IA | Políticas de modelo e limites por contexto. | Não expõe chaves, prompts privados nem respostas completas. |
| `AiQuotasModule` | Quotas IA | Reserva e consumo de quotas por aluno/turma/grupo. | Limites aplicados no backend antes da chamada ao provider. |
| `AuditLogModule` | Auditoria | Eventos técnicos e sensíveis para defesa e rastreabilidade. | Logs minimizados, sem materiais privados nem credenciais. |

## Rotas frontend críticas

| Rota | Página | Perfil | Regra de segurança |
| --- | --- | --- | --- |
| `/app/areas/:id/ferramentas` | `StudyToolsPage` | Aluno | A API filtra artefactos por área e utilizador autenticado. |
| `/app/professor/disciplinas/:id/materiais` | `TeacherOfficialMaterialsPage` | Professor | A API valida professor, disciplina e materiais oficiais. |
| `/app/professor/disciplinas/:id/chat` | `TeacherSubjectChatPage` | Professor | A API valida ownership da disciplina antes de carregar ou enviar mensagens. |
| `/app/disciplinas/:id/ia` | `StudentClassAiPage` | Aluno | A API valida inscrição na disciplina antes de responder. |
| `/app/disciplinas/:id/chat` | `StudentSubjectChatPage` | Aluno | A API valida inscrição na disciplina antes de carregar ou enviar mensagens. |
| `/app/admin/governanca` | `AdminGovernancePage` | Admin | A API valida role de administração no backend. |

## Endpoints críticos

| Método | Endpoint | Entrada principal | Resposta esperada | Regra de segurança |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/login` | email e password | sessão HttpOnly e utilizador público | Não devolve `passwordHash` nem tokens de sessão ao frontend. |
| `GET` | `/api/auth/me` | cookie de sessão | utilizador autenticado | Falha com `401` quando a sessão não existe. |
| `POST` | `/api/study-areas/:studyAreaId/materials` | material privado do aluno | material criado | `userId` vem da sessão autenticada e a área valida ownership. |
| `GET` | `/api/study-areas/:id/summaries` | área de estudo | resumos da área | Ownership da área é validado no backend. |
| `POST` | `/api/ai/source-grounded-answers` | job de indexação e pergunta | resposta IA com citações | Bloqueia resposta quando não há fontes processáveis autorizadas. |
| `POST` | `/api/student/subjects/:subjectId/ai/answers` | pergunta do aluno | resposta IA citada | Membership da disciplina e fontes oficiais são obrigatórias. |
| `GET` | `/api/student/subjects/:subjectId/chat/messages` | disciplina do aluno | últimas 100 mensagens cronológicas | Valida inscrição na turma da disciplina e não expõe emails nem sessão. |
| `GET` | `/api/teacher/subjects/:subjectId/chat/messages` | disciplina do professor | últimas 100 mensagens cronológicas | Valida professor responsável pela disciplina. |
| `WS` | `/subject-chat` | `subject-chat:join` e `subject-chat:send` | `subject-chat:message` ou `subject-chat:error` | Handshake usa cookie `sf_sid`, valida `Origin` e repete autorização por disciplina. |

## Modelos principais

| Modelo/schema | Domínio | Dados sensíveis | Regra de proteção |
| --- | --- | --- | --- |
| `User` | Identidade | email, password hash | Hash nunca é devolvido ao frontend. |
| `StudyArea` | Estudo individual | relação com aluno | Ownership por sessão autenticada. |
| `Material` | Materiais privados | conteúdo e metadados de estudo | Visível apenas ao aluno dono. |
| `OfficialMaterial` | Disciplina/turma | material criado por professor | Acesso limitado por professor, turma e disciplina. |
| `TeacherStudentChatThread` | Chat da disciplina | relação disciplina/turma/professor | Um thread por disciplina, criado apenas após autorização. |
| `TeacherStudentChatMessage` | Chat da disciplina | texto da mensagem e autor | Autor vem da sessão; resposta pública não inclui email, cookie ou dados sensíveis. |
| `SourceGroundedAiAnswer` | IA com fontes | pergunta, resposta e citações | Sem resposta quando faltam fontes processáveis. |
| `AuditLog` | Auditoria | eventos técnicos | Minimização de dados pessoais e sem conteúdos privados completos. |

## Fluxos críticos

| Fluxo | Origem | Destino | Falha controlada obrigatória |
| --- | --- | --- | --- |
| Login seguro | `POST /api/auth/login` | shell autenticada | `401` para credenciais inválidas. |
| Resumo IA privado | materiais da área | artefacto IA com fontes | bloqueio quando não há fontes processáveis. |
| Material oficial | professor/disciplina | material oficial indexável | `403` quando o professor não tem acesso. |
| IA com fontes obrigatórias | `POST /api/ai/source-grounded-answers` | resposta citada | erro controlado quando não há fontes autorizadas. |
| IA da disciplina | aluno inscrito | resposta com citações | `403` sem membership e erro controlado sem fontes. |
| Chat da disciplina | aluno/professor autorizado | histórico REST e entrega WebSocket | `401/403` sem sessão, inscrição ou ownership; envio bloqueado quando a socket falha. |

## Como validar

1. Confirmar que `real_dev/api/src/app.module.ts` importa os módulos críticos listados.
2. Executar `npm --prefix real_dev/api test -- export-technical-map.spec.ts --runInBand`.
3. Executar `npm --prefix real_dev/api run build`.
4. Gerar a versão atualizada com `node real_dev/api/dist/scripts/export-technical-map.js`.
5. Comparar o output gerado com este documento e atualizar a PR se algum módulo crítico estiver em falta.
