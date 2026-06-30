# BK-MF7-10 - IA respeita perfis distintos (aluno, sala, turma, disciplina, professor).

## Header

- `doc_id`: `GUIA-BK-MF7-10`
- `bk_id`: `BK-MF7-10`
- `macro`: `MF7`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF32`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-11`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `last_updated`: `2026-06-27`

#### Objetivo

Neste BK vais implementar uma política explícita para separar IA privada, IA de sala/grupo e IA da turma/disciplina. O resultado observável é `assertAiContextProfile(...)` aplicado no backend antes de fontes, prompt, quota e provider.

No fim, a equipa consegue demonstrar `RNF32` com código, testes negativos P0 e evidence objetiva, sem depender de decisões escondidas nem de memória oral.

#### Importância

`RNF32` é uma regra de segurança IA. Misturar perfil de aluno, turma e professor pode expor materiais, histórico, voz docente ou limites pedagógicos de outro contexto.

Este BK é incremental: consome a explicabilidade de fontes de `BK-MF7-09`, respeita os guardrails de MF6 e prepara `BK-MF7-11`, onde os limites docentes passam a depender desta separação de contexto.

#### Scope-in

- Criar `apps/api/src/modules/ai/context/ai-context-policy.ts`.
- Criar `apps/api/src/modules/ai/context/ai-context-policy.spec.ts`.
- Editar `apps/api/src/modules/class-ai/class-ai.service.ts` para validar `CLASS_SUBJECT` com perfil `TEACHER_CLASS`.
- Editar `apps/api/src/modules/class-ai/class-ai.service.spec.ts` para provar que a falha de perfil acontece antes de materiais, quota, provider e persistência.
- Usar apenas caminhos públicos em `apps/api`, `apps/web` e `docs`.
- Preservar autenticação, autorização, ownership, membership, quotas e guardrails já definidos.
- Produzir evidence com expected/observed e três negativos mínimos por ser `P0`.

#### Scope-out

- Criar requisitos novos fora de `RNF32`.
- Alterar IDs BK, owner, prioridade, sprint, esforço ou sequência canónica.
- Criar endpoint, schema, coleção, módulo de IA externa ou integração nova de monitorização.
- Guardar segredos, cookies, prompts privados, respostas IA completas ou materiais privados em logs, screenshots ou documentos de evidence.
- Mover regras de sessão, role, ownership, membership, quota, fonte IA ou privacidade para o frontend.
- Alterar `BK-MF7-11`; este BK só deixa o contrato pronto para ser reutilizado.

#### Estado antes e depois

- Estado antes: MF6 deixa guardrails, isolamento de IA e fontes autorizadas documentados; `BK-MF7-09` deixa fontes explicáveis; a IA da disciplina já valida aluno, disciplina e materiais, mas ainda não tem uma policy explícita para impedir mistura entre IA privada, sala/grupo e turma/disciplina.
- Estado depois: `assertAiContextProfile(...)` existe, é testado e é chamado em `ClassAiService.askClassAi(...)` logo depois de validar membership na disciplina e antes de listar materiais oficiais, construir prompt, reservar quota ou chamar o provider.

#### Pre-requisitos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `apps/api/src/modules/class-ai/class-ai.service.ts`
- `apps/api/src/modules/class-ai/class-ai.service.spec.ts`
- `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
- `apps/api/src/modules/official-materials/official-materials.service.ts`
- `apps/api/src/modules/subjects/subjects.service.ts`

#### Glossário

- **StudyFlow:** plataforma de estudo com áreas privadas, turmas, materiais oficiais e IA pedagógica.
- **Aluno autenticado:** utilizador identificado por sessão HttpOnly no backend.
- **Professor:** utilizador que gere turmas, disciplinas, materiais oficiais, voz docente e limites pedagógicos.
- **IA privada:** IA associada à área pessoal de estudo do aluno.
- **IA de sala/grupo:** IA associada a um espaço partilhado entre participantes autorizados.
- **IA da turma/disciplina:** IA associada a uma turma/disciplina concreta, materiais oficiais e regras docentes herdadas.
- **Voz docente herdada:** voz efetiva calculada por `SUBJECT_OVERRIDE -> CLASS_BASE -> DEFAULT`, sem atravessar para IA privada nem salas livres de alunos.
- **Fonte processável:** texto extraído e autorizado que pode sustentar uma resposta IA.
- **Evidence:** prova objetiva de funcionamento e falha controlada, usada em PR e defesa PAP.
- **Separação de perfis IA:** regra técnica deste BK para cumprir `RNF32`.

#### Conceitos teóricos essenciais

- **Perfil IA privado:** preferências e fontes da área do aluno autenticado; não herda voz docente de turma ou disciplina.
- **Perfil IA de sala/grupo:** contexto partilhado por membros autorizados; não substitui a IA privada nem a IA da disciplina e não herda voz docente.
- **Perfil IA de turma/disciplina:** regras e voz docente definidas pelo professor para a turma, com override opcional por disciplina.
- **Contexto ativo:** alvo técnico da pergunta IA, sempre validado no backend.
- **Falhar cedo:** bloquear a operação antes de listar fontes, construir prompt, reservar quota ou chamar o provider.
- **Segurança no backend:** sessão, role, ownership e membership são validados por controllers/services, não por componentes visuais.
- **Privacidade e RGPD:** logs, evidence e respostas públicas devem minimizar dados pessoais e evitar conteúdo privado.
- **Teste negativo:** prova que a aplicação bloqueia input inválido, acesso indevido ou estado inseguro.

#### Arquitetura do BK

- Endpoint(s): não cria endpoint; reforça o fluxo já consumido pela IA da disciplina.
- Modelo/schema: não cria schema.
- Service(s): cria a policy `assertAiContextProfile(...)` e chama-a em `ClassAiService.askClassAi(...)`.
- Controller/route: não altera controller; continua a depender dos guards existentes.
- Guard/middleware: reutiliza `SessionGuard` e validações já existentes.
- Cliente API: não altera frontend; a decisão de perfil fica no backend.
- Segurança/autorização: bloqueia mistura de contexto depois de membership e antes de materiais oficiais, resolvedor de voz, prompt, quota e provider.
- Testes: unitários da policy e teste de service para ordem de bloqueio.
- Handoff para o próximo BK: `BK-MF7-11` aplica limites do professor apenas depois de este BK garantir contexto `CLASS_SUBJECT` com perfil `TEACHER_CLASS` e sem vazamento para IA privada/sala de alunos.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai/context/ai-context-policy.ts`
- CRIAR: `apps/api/src/modules/ai/context/ai-context-policy.spec.ts`
- EDITAR: `apps/api/src/modules/class-ai/class-ai.service.ts`
- EDITAR: `apps/api/src/modules/class-ai/class-ai.service.spec.ts`
- REVER: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
- REVER: `apps/api/src/modules/class-ai/class-ai.controller.ts`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF7-10` entrega `RNF32` sem alterar ID, owner, prioridade, sprint ou sequência.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- LOCALIZAÇÃO: linhas canónicas do requisito e da matriz.

3. Instruções do que fazer.

Lê `RNF32` em `docs/RNF.md`, confirma a linha `BK-MF7-10` na matriz e regista as decisões seguintes:
- `CANONICO`: `RNF32` exige perfis distintos de aluno, turma e professor.
- `DERIVADO`: representar contexto IA por `PRIVATE_AREA`, `STUDY_ROOM` e `CLASS_SUBJECT`.
- `DERIVADO`: representar perfil aplicado por `STUDENT_PRIVATE`, `ROOM_SHARED` e `TEACHER_CLASS`.
- `DERIVADO`: falhar cedo quando o perfil não combina com o contexto.
- `DERIVADO`: a IA da disciplina usa `CLASS_SUBJECT` com `TEACHER_CLASS`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa o contrato. A implementação só começa depois de confirmar o requisito, o domínio e o BK seguinte.

6. Validação do passo.

Resultado esperado: `BK-MF7-10` continua ligado a `RNF32`, `prioridade: P0`, `sprint: S12` e `proximo_bk: BK-MF7-11`.

7. Cenário negativo/erro esperado.

Se a matriz, backlog e guia tiverem valores diferentes, não avances; regista o drift no relatório de PR.

### Passo 2 - Mapear contratos existentes

1. Objetivo funcional do passo no contexto da app.

Localizar os ficheiros que este BK consome para não duplicar regras de separação de perfis IA.

2. Ficheiros envolvidos:
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/api/src/modules/class-ai/class-ai.service.ts`
- REVER: `apps/api/src/modules/class-ai/class-ai.service.spec.ts`
- REVER: `apps/api/src/modules/subjects/subjects.service.ts`
- REVER: `apps/api/src/modules/official-materials/official-materials.service.ts`
- REVER: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- LOCALIZAÇÃO: módulos já criados nas macrofases anteriores e ponto de integração deste BK.

3. Instruções do que fazer.

Confirma que `ClassAiService.askClassAi(...)` já valida:
- role `STUDENT`;
- inscrição do aluno na disciplina via `subjectsService.findSubjectForStudent(...)`;
- materiais oficiais processados;
- consentimento, política de modelo, quota, provider e auditoria.

Este BK não substitui `SessionGuard`, ownership, membership, quotas ou guardrails; acrescenta uma validação de perfil entre membership e listagem de materiais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o objetivo é evitar duplicação. O aluno deve saber que cada ficheiro novo encaixa num contrato anterior.

6. Validação do passo.

Resultado esperado: lista curta de ficheiros existentes e decisão clara de integrar em `ClassAiService.askClassAi(...)`.

7. Cenário negativo/erro esperado.

Se a solução criar outro endpoint ou outro schema para uma responsabilidade já existente, rejeita a abordagem e usa o service existente.

### Passo 3 - Criar a policy de contexto IA

1. Objetivo funcional do passo no contexto da app.

Construir o ficheiro principal que torna `RNF32` implementável.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/ai/context/ai-context-policy.ts`
- LOCALIZAÇÃO: ficheiro completo `apps/api/src/modules/ai/context/ai-context-policy.ts`.

3. Instruções do que fazer.

Cria o ficheiro com o código abaixo. Mantém nomes, imports e mensagens em português de Portugal. Não guardes dados sensíveis nem deixes decisões de segurança para o frontend.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai/context/ai-context-policy.ts
import { ForbiddenException } from "@nestjs/common";

/**
 * Contextos técnicos em que a aplicação pode pedir ajuda à IA.
 */
export type AiContextType = "PRIVATE_AREA" | "STUDY_ROOM" | "CLASS_SUBJECT";

/**
 * Perfis pedagógicos que podem ser aplicados ao prompt antes do provider.
 */
export type AiProfileType = "STUDENT_PRIVATE" | "ROOM_SHARED" | "TEACHER_CLASS";

const EXPECTED_PROFILE_BY_CONTEXT: Record<AiContextType, AiProfileType> = {
    PRIVATE_AREA: "STUDENT_PRIVATE",
    STUDY_ROOM: "ROOM_SHARED",
    CLASS_SUBJECT: "TEACHER_CLASS",
};

/**
 * Bloqueia mistura entre contexto IA e perfil pedagógico.
 *
 * @param contextType Contexto técnico do pedido IA.
 * @param profileType Perfil que seria aplicado ao prompt.
 */
export function assertAiContextProfile(
    contextType: AiContextType,
    profileType: AiProfileType,
): void {
    const expectedProfile = EXPECTED_PROFILE_BY_CONTEXT[contextType];

    if (profileType !== expectedProfile) {
        // Falhar antes do provider impede fuga de materiais ou voz docente entre contextos.
        throw new ForbiddenException({
            code: "AI_CONTEXT_PROFILE_MISMATCH",
            message: "O perfil de IA não corresponde ao contexto pedido.",
            details: {
                contextType,
                expectedProfile,
                receivedProfile: profileType,
            },
        });
    }
}
```

5. Explicação do código.

O código implementa o contrato principal de `BK-MF7-10`. `AiContextType` representa onde a pergunta acontece, `AiProfileType` representa que regras pedagógicas serão aplicadas e `EXPECTED_PROFILE_BY_CONTEXT` define a matriz permitida. A função lança `ForbiddenException` para manter o erro no padrão HTTP do backend e para bloquear a operação antes de qualquer provider IA receber contexto incorreto.

6. Validação do passo.

Resultado esperado: o ficheiro compila, não tem logs, não recebe dados pessoais e só devolve erro técnico com nomes de contexto/perfil.

7. Cenário negativo/erro esperado.

Se removeres a validação ou trocares `ForbiddenException` por erro genérico, o BK deixa de provar bloqueio controlado no backend.

### Passo 4 - Integrar a policy no service real

1. Objetivo funcional do passo no contexto da app.

Ligar a policy ao fluxo real da IA da disciplina sem duplicar módulos.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/src/modules/class-ai/class-ai.service.ts`
- LOCALIZAÇÃO: import no topo do ficheiro e método `askClassAi(...)`, depois de `subjectsService.findSubjectForStudent(...)` e antes de `materialsService.listProcessedForSubject(...)`.

3. Instruções do que fazer.

Importa a policy de contexto e valida que a IA da disciplina usa contexto `CLASS_SUBJECT` com perfil `TEACHER_CLASS`. O backend decide este par porque o service chamado é o da disciplina e o `subjectId` já foi validado por membership.

4. Código completo, correto e integrado com a app final.

No topo de `apps/api/src/modules/class-ai/class-ai.service.ts`, acrescenta o import:

```ts
import * as aiContextPolicy from "../ai/context/ai-context-policy.js";
```

No mesmo ficheiro, mantém a assinatura pública e substitui o método `askClassAi(...)` por esta versão:

```ts
async askClassAi(
    actor: AuthenticatedUser,
    subjectId: string,
    input: AskClassAiDto,
) {
    if (actor.role !== "STUDENT") {
        throw new ForbiddenException({
            code: "STUDENT_ROLE_REQUIRED",
            message: "Esta funcionalidade é exclusiva de alunos.",
        });
    }

    // A inscrição na disciplina é validada antes de qualquer material oficial ser exposto ao aluno.
    const { subject, schoolClass } =
        await this.subjectsService.findSubjectForStudent(actor.id, subjectId);

    aiContextPolicy.assertAiContextProfile("CLASS_SUBJECT", "TEACHER_CLASS");

    const materials = await this.materialsService.listProcessedForSubject(
        subject._id,
    );
    if (materials.length === 0) {
        throw new UnprocessableEntityException({
            code: "NO_OFFICIAL_AI_SOURCES",
            message:
                "Esta disciplina ainda não tem materiais oficiais processados para IA.",
        });
    }

    const voice = await this.voiceService.resolveTeacherVoice({
        classId: subject.classId.toString(),
        subjectId: subject._id.toString(),
    });
    await this.aiConsentsService.assertGranted(actor.id, "CLASS_AI");
    const policy = await this.aiModelPoliciesService.resolveForUse("CLASS_AI");
    const limitedMaterials = materials.slice(0, policy.maxSourceCount);
    const prompt = buildClassAiPrompt({
        subjectName: subject.name,
        question: input.question.trim(),
        materials: limitedMaterials,
        voice,
    });
    assertPromptWithinLimit(prompt, policy);
    await this.aiQuotasService.reserveUsage({
        scope: "CLASS",
        targetId: String(schoolClass._id),
        purpose: "CLASS_AI",
        units: this.estimateUsageUnits(prompt),
    });

    try {
        // O prompt recebe apenas materiais oficiais processados e a voz configurada pelo professor.
        const result = await this.aiProvider.generateClassAnswer({
            prompt,
            options: { model: policy.model, timeoutMs: policy.timeoutMs },
        });
        // A resposta só é aceite se citar materiais oficiais permitidos para esta disciplina.
        this.validateResult(result, limitedMaterials);

        const interaction = await this.interactionModel.create({
            subjectId: new Types.ObjectId(subject._id),
            classId: new Types.ObjectId(schoolClass._id),
            studentId: new Types.ObjectId(actor.id),
            question: input.question.trim(),
            answer: result.answer.trim(),
            sourceMaterialIds: result.sourceMaterialIds.map(
                (sourceId) => new Types.ObjectId(sourceId),
            ),
            voiceRulesApplied: voice.rules,
        });

        const created = interaction.toObject() as { createdAt?: Date };
        await this.auditLogService.record({
            actorId: actor.id,
            domain: "AI",
            action: "CLASS_AI_REQUESTED",
            resourceType: "Subject",
            resourceId: String(subject._id),
            result: "SUCCESS",
            metadata: {
                purpose: "CLASS_AI",
                classId: String(schoolClass._id),
                model: policy.model,
                sourceCount: limitedMaterials.length,
            },
        });

        return {
            _id: String(interaction._id),
            subjectId: subject._id,
            classId: schoolClass._id,
            question: interaction.question,
            answer: interaction.answer,
            voiceRulesApplied: interaction.voiceRulesApplied,
            sources: limitedMaterials.filter((material) =>
                result.sourceMaterialIds.includes(material._id),
            ),
            createdAt: created.createdAt,
        };
    } catch (error) {
        await this.auditLogService.record({
            actorId: actor.id,
            domain: "AI",
            action: "CLASS_AI_REQUESTED",
            resourceType: "Subject",
            resourceId: String(subject._id),
            result: "FAILED",
            metadata: {
                purpose: "CLASS_AI",
                classId: String(schoolClass._id),
                model: policy.model,
                sourceCount: limitedMaterials.length,
            },
        });
        if (
            error instanceof GatewayTimeoutException ||
            error instanceof ServiceUnavailableException ||
            error instanceof UnprocessableEntityException
        ) {
            throw error;
        }
        throw new ServiceUnavailableException({
            code: "AI_PROVIDER_UNAVAILABLE",
            message: "A IA está temporariamente indisponível.",
        });
    }
}
```

5. Explicação do código.

A ordem é intencional. Primeiro confirma-se que o ator é aluno, depois confirma-se que o aluno pertence à disciplina e só depois se valida o par `CLASS_SUBJECT`/`TEACHER_CLASS`. A policy fica antes de materiais, voz docente, consentimento, quota, prompt e provider, porque a app não deve preparar contexto IA se o perfil estiver errado.

6. Validação do passo.

Resultado esperado: `ClassAiService.askClassAi(...)` continua a validar membership antes de expor materiais oficiais e passa a chamar `assertAiContextProfile(...)` antes de qualquer dado enviado ao provider.

7. Cenário negativo/erro esperado.

Se a chamada da policy ficar depois do provider, depois da quota ou apenas no frontend, a alteração não cumpre `RNF32`.

### Passo 5 - Adicionar testes P0

1. Objetivo funcional do passo no contexto da app.

Provar que a policy funciona, que há três negativos mínimos e que o service bloqueia antes de fontes, quota, provider e persistência.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/ai/context/ai-context-policy.spec.ts`
- EDITAR: `apps/api/src/modules/class-ai/class-ai.service.spec.ts`
- LOCALIZAÇÃO: ficheiro de teste da policy e `describe("ClassAiService", ...)`.

3. Instruções do que fazer.

Cria o teste da policy com um caminho principal e três negativos. Depois adiciona um teste ao service para provar a ordem de bloqueio.

4. Código completo, correto e integrado com a app final.

Cria `apps/api/src/modules/ai/context/ai-context-policy.spec.ts`:

```ts
// apps/api/src/modules/ai/context/ai-context-policy.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { assertAiContextProfile } from "./ai-context-policy.js";

describe("assertAiContextProfile", () => {
    it("aceita perfil docente apenas em IA da disciplina", () => {
        // Este caso permitido mostra que a IA da disciplina só aceita o perfil docente da turma.
        expect(() =>
            assertAiContextProfile("CLASS_SUBJECT", "TEACHER_CLASS"),
        ).not.toThrow();
    });

    it.each([
        ["PRIVATE_AREA", "TEACHER_CLASS"],
        ["CLASS_SUBJECT", "STUDENT_PRIVATE"],
        ["CLASS_SUBJECT", "ROOM_SHARED"],
    ] as const)(
        "bloqueia contexto %s com perfil %s",
        (contextType, profileType) => {
            // Cada par proibido representa uma mistura de contexto que deve falhar antes de tocar em dados privados ou partilhados.
            expect(() =>
                assertAiContextProfile(contextType, profileType),
            ).toThrow(ForbiddenException);
        },
    );
});
```

Em `apps/api/src/modules/class-ai/class-ai.service.spec.ts`, acrescenta este import:

```ts
import * as aiContextPolicy from "../ai/context/ai-context-policy.js";
```

Dentro de `describe("ClassAiService", ...)`, acrescenta a limpeza de spies e o teste seguinte:

```ts
afterEach(() => {
    jest.restoreAllMocks();
});

it("bloqueia perfil incompatível antes de materiais, quota, provider e persistência", async () => {
    const {
        aiProvider,
        aiQuotasService,
        interactionModel,
        materialsService,
        service,
    } = makeService();
    // Forçamos a falha da policy para provar que o service pára no guardrail de contexto.
    jest.spyOn(aiContextPolicy, "assertAiContextProfile").mockImplementationOnce(
        () => {
            throw new ForbiddenException({
                code: "AI_CONTEXT_PROFILE_MISMATCH",
                message: "O perfil de IA não corresponde ao contexto pedido.",
            });
        },
    );

    await expect(
        service.askClassAi(student, subjectId, {
            question: "Explica derivadas.",
        }),
    ).rejects.toMatchObject({
        response: {
            code: "AI_CONTEXT_PROFILE_MISMATCH",
        },
    });

    expect(aiContextPolicy.assertAiContextProfile).toHaveBeenCalledWith(
        "CLASS_SUBJECT",
        "TEACHER_CLASS",
    );
    // Estes asserts provam que a falha acontece antes de ler materiais, reservar quota, chamar provider ou gravar interação.
    expect(materialsService.listProcessedForSubject).not.toHaveBeenCalled();
    expect(aiQuotasService.reserveUsage).not.toHaveBeenCalled();
    expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
    expect(interactionModel.create).not.toHaveBeenCalled();
});
```

5. Explicação do código.

O teste da policy cobre o caminho permitido e três misturas proibidas. O teste do service força uma falha controlada na policy e confirma que a app não listou materiais, não reservou quota, não chamou o provider e não gravou interação. Isto prova a ordem de segurança exigida por `RNF32`.

6. Validação do passo.

Comandos recomendados:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- ai-context-policy class-ai
```

Resultado esperado: build verde e testes da policy/service verdes.

7. Cenário negativo/erro esperado.

Se os testes só confirmarem que a função existe, sem erro controlado nem prova de que o provider não foi chamado, a evidence não é suficiente para `P0`.

### Passo 6 - Validar por camada

1. Objetivo funcional do passo no contexto da app.

Confirmar que backend, documentação e evidence estão alinhados.

2. Ficheiros envolvidos:
- REVER: `apps/api/package.json`
- REVER: `apps/api/src/modules/ai/context/`
- REVER: `apps/api/src/modules/class-ai/`
- REVER: `docs/planificacao/guias-bk/MF7`
- LOCALIZAÇÃO: comandos de validação e PR.

3. Instruções do que fazer.

Executa validação por camada e regista observed/expected. Para `P0`, a PR deve incluir unit, integração/service e três negativos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque a validação é operacional. O valor está em comparar resultado esperado e observado de forma objetiva.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- ai-context-policy class-ai
rg -n "console\\.log|logger\\.|cookie|password|authorization|bearer" apps/api/src/modules/ai/context apps/api/src/modules/class-ai
```

Resultados esperados: build e testes verdes; pesquisa sem logs ou dados sensíveis novos.

7. Cenário negativo/erro esperado.

Se o build falhar por import criado neste BK, corrige antes de abrir PR. Se falhar por dívida externa, regista caminho, comando e erro observado.

### Passo 7 - Preparar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF7-10` com prova técnica e instrução clara para `BK-MF7-11`.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- LOCALIZAÇÃO: secções finais do guia e descrição da PR.

3. Instruções do que fazer.

No PR, inclui comandos executados, resultado principal, negativos, risco restante e o que o próximo BK passa a poder reutilizar. Para IA, inclui prova de contexto e fontes sem expor materiais privados nem respostas completas.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque o foco é comunicação técnica. A equipa deve conseguir defender a decisão sem pedir contexto extra ao professor.

6. Validação do passo.

Resultado esperado: evidence completa e handoff explícito para `BK-MF7-11`.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas "funciona", sem output, request/response, teste ou screenshot, não cumpre o BK.

#### Critérios de aceite

- `RNF32` fica demonstrável por código, teste/evidence e explicação pedagógica.
- O guia mantém `bk_id`, `macro`, owner, apoio, prioridade, sprint, esforço, `rf_rnf` e `proximo_bk` alinhados com matriz e backlog.
- Cada passo tem objetivo, ficheiros, instruções, código ou justificação sem código, explicação, validação e negativo.
- O código apresentado tem JSDoc nos elementos relevantes e comentários didáticos junto das decisões importantes.
- `apps/api/src/modules/class-ai/class-ai.service.ts` fica marcado como `EDITAR` e contém a chamada real da policy.
- Os testes incluem caminho principal, três negativos de policy e teste de service antes de materiais, quota, provider e persistência.
- Os testes confirmam que IA privada, IA de sala/grupo e IA da turma/disciplina não partilham voz docente indevidamente.
- A voz docente da turma/disciplina só é resolvida no contexto `CLASS_SUBJECT`/`TEACHER_CLASS`.
- Não existe decisão de sessão, ownership, membership, role, quota, fonte IA ou privacidade feita apenas no frontend.
- Não há exposição de cookies, passwords, prompts privados, respostas IA completas, materiais privados ou dados de outro contexto em logs/evidence.

#### Validação final

- Executar pesquisa textual nos BKs MF7 para confirmar ausência de linguagem interna e caminhos privados.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `npm --prefix apps/api run build`.
- Executar `npm --prefix apps/api run test:unit -- ai-context-policy class-ai`.
- Resultado esperado: comandos verdes ou falha externa registada com caminho, comando e erro observado.

#### Evidence para PR/defesa

- `pr`: referência do PR/commit com resumo de `BK-MF7-10`.
- `proof_tecnico`: comando executado, output relevante ou request/response do caminho principal.
- `proof_negativos`: três erros controlados da policy e bloqueio do service antes de materiais/provider.
- `proof_fontes`: confirmação de que a IA da disciplina só usa materiais oficiais processados depois de membership e policy.
- `proof_voz_docente`: confirmação de que a voz docente não atravessa para IA privada nem salas livres de alunos.
- `proof_privacidade`: confirmação de que não há dados pessoais ou privados em logs/evidence.
- `proof_pedagogico`: explicação curta de como `RNF32` melhora a aplicação para alunos, professores e operação.

#### Handoff

`BK-MF7-11` pode reutilizar `assertAiContextProfile("CLASS_SUBJECT", "TEACHER_CLASS")` como pré-condição para aplicar limites docentes e voz efetiva apenas ao contexto de turma/disciplina.

O próximo BK deve reutilizar os ficheiros e decisões deste guia, sem criar outro contrato para a mesma responsabilidade.

#### Changelog

- `2026-06-27`: guia corrigido para incluir integração real em `ClassAiService.askClassAi(...)`, três negativos P0, teste de service antes de materiais/provider e handoff explícito para `BK-MF7-11`.
- `2026-06-30`: documentada separação entre voz docente herdada e perfis de IA privada/sala.
- `2026-06-26`: contrato de separação de perfis IA documentado com tutorial técnico linear, código completo, validação, negativos, evidence e caminhos públicos `apps/...`.
