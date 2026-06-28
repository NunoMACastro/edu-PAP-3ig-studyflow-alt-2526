<!-- docs/technical/STUDYFLOW-TECHNICAL-MAP.md -->
# StudyFlow - mapa técnico mínimo

## Objetivo

Este documento liga os módulos, fluxos, modelos e endpoints críticos do StudyFlow.
Ele existe para cumprir `RNF27` e para dar a `BK-MF7-06` uma base concreta para escolher testes automatizados de módulos críticos.

## Módulos backend críticos

| Módulo | Domínio | Responsabilidade | Segurança documentada |
| --- | --- | --- | --- |
| `AuthModule` | Autenticação | Registo, login, sessão e utilizador autenticado. | Cookies HttpOnly e sessão validada no backend. |
| `MaterialsModule` | Materiais privados | Materiais submetidos pelo aluno em áreas de estudo. | `userId` vem da sessão autenticada e valida ownership. |
| `OfficialMaterialsModule` | Materiais oficiais | Materiais de professor associados a disciplina/turma. | Professor e disciplina são validados no backend. |
| `SourceGroundedAiModule` | IA com fontes | Respostas baseadas em excertos citáveis. | Bloqueia resposta quando não há fontes processáveis. |
| `ClassAiModule` | IA da disciplina | Assistente da turma/disciplina com voz docente. | Valida membership da disciplina e materiais oficiais. |
| `AiModelPoliciesModule` | Governança IA | Políticas de modelo e limites por contexto. | Não expõe chaves, prompts privados nem respostas completas. |
| `AiQuotasModule` | Quotas IA | Reserva e consumo de quotas por aluno/turma/grupo. | Limites aplicados no backend antes da chamada ao provider. |
| `AuditLogModule` | Auditoria | Eventos técnicos e sensíveis para defesa e rastreabilidade. | Logs minimizados, sem materiais privados nem credenciais. |

## Rotas frontend críticas

| Rota | Página | Perfil | Regra de segurança |
| --- | --- | --- | --- |
| `/app/areas/:id/ferramentas` | `StudyToolsPage` | Aluno | A API filtra artefactos por área e utilizador autenticado. |
| `/app/professor/disciplinas/:id/materiais` | `TeacherOfficialMaterialsPage` | Professor | A API valida professor, disciplina e materiais oficiais. |
| `/app/disciplinas/:id/ia` | `StudentClassAiPage` | Aluno | A API valida inscrição na disciplina antes de responder. |
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

## Modelos principais

| Modelo/schema | Domínio | Dados sensíveis | Regra de proteção |
| --- | --- | --- | --- |
| `User` | Identidade | email, password hash | Hash nunca é devolvido ao frontend. |
| `StudyArea` | Estudo individual | relação com aluno | Ownership por sessão autenticada. |
| `Material` | Materiais privados | conteúdo e metadados de estudo | Visível apenas ao aluno dono. |
| `OfficialMaterial` | Disciplina/turma | material criado por professor | Acesso limitado por professor, turma e disciplina. |
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

## Como validar

1. Confirmar que `apps/api/src/app.module.ts` importa os módulos críticos listados.
2. Executar `npm --prefix apps/api test -- export-technical-map.spec.ts`.
3. Executar `npm --prefix apps/api run build`.
4. Gerar a versão atualizada com `node apps/api/dist/scripts/export-technical-map.js`.
5. Comparar o output gerado com este documento e atualizar a PR se algum módulo crítico estiver em falta.