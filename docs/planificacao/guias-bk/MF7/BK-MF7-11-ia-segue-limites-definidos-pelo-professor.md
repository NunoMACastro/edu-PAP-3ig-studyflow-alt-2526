# BK-MF7-11 - IA segue limites definidos pelo professor, incluindo voz herdada.

## Header

- `doc_id`: `GUIA-BK-MF7-11`
- `bk_id`: `BK-MF7-11`
- `macro`: `MF7`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF33`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-01`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `last_updated`: `2026-06-27`

#### Objetivo

Neste BK vais aplicar limites definidos pelo professor antes de chamar a IA da disciplina. O resultado observável é uma política que valida número de fontes, tamanho do prompt e estado ativo da funcionalidade.

No fim, a equipa consegue demonstrar `RNF33` com código, validação e evidence, sem depender de decisões escondidas nem de memória oral.

#### Importância

`RNF33` dá controlo pedagógico ao professor. A IA deve ajudar dentro dos limites de turma/disciplina, materiais oficiais e voz docente efetiva, não ultrapassar regras para produzir respostas maiores ou fora de âmbito.

Este BK é incremental: consome contratos já fechados nas MFs anteriores e entrega uma peça pequena, testável e explicável para o próximo BK.

#### Scope-in

- Implementar o contrato de limites docentes de IA no backend.
- Usar caminhos públicos em `apps/api`, `apps/web` e `docs`.
- Validar um caminho principal, teste unitário, teste de integração/service e três cenários negativos P0.
- Preservar autenticação, autorização, ownership, membership, quotas e guardrails já definidos quando o fluxo tocar dados privados ou IA.
- Produzir evidence com expected/observed.

#### Scope-out

- Criar requisitos novos fora de `RNF33`.
- Alterar IDs BK, owner, prioridade, sprint, esforço ou sequência canónica.
- Criar integrações externas de monitorização, LMS, Drive, OCR, embeddings ou automações avançadas sem contrato documental.
- Guardar segredos, cookies, prompts privados, respostas IA completas ou materiais privados em logs, screenshots ou documentos de evidence.
- Mover regras de segurança para o frontend.

#### Estado antes e depois

- Estado antes: MF6 deixa segurança, recuperação, guardrails e isolamento de IA preparados, e a app já tem políticas de modelo, quotas e voz docente herdada, mas ainda falta explicitar a ordem segura que aplica limites antes do provider IA.
- Estado depois: a app passa a ter a sequência `resolveForUse("CLASS_AI")`, `assertPromptWithinLimit(...)`, `reserveUsage(...)` e `generateClassAnswer(...)`, preparando `BK-MF8-01`.

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
- `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- `apps/api/src/modules/class-ai/class-ai.service.ts`
- `apps/api/src/modules/class-ai/class-ai.service.spec.ts`
- `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
- `apps/api/src/modules/ai-model-policies/ai-model-policies.service.spec.ts`

#### Glossário

- **StudyFlow:** plataforma de estudo com áreas privadas, turmas, materiais e IA pedagógica.
- **Aluno autenticado:** utilizador identificado por sessão HttpOnly no backend.
- **Professor:** utilizador que gere turmas, disciplinas, materiais oficiais e limites pedagógicos.
- **Fonte processável:** texto extraído e autorizado que pode sustentar uma resposta IA.
- **Evidence:** prova objetiva de funcionamento e falha controlada, usada em PR e defesa PAP.
- **Limites docentes de IA:** foco técnico deste BK para cumprir `RNF33`.
- **Voz docente efetiva:** voz calculada por `SUBJECT_OVERRIDE -> CLASS_BASE -> DEFAULT` e aplicada apenas no contexto de turma/disciplina.

#### Conceitos teóricos essenciais

- **Limite docente:** regra configurada para manter a IA dentro do objetivo pedagógico da turma/disciplina.
- **Voz base e override:** a turma define a base pedagógica; a disciplina pode restringir ou especializar por override.
- **Política de modelo:** configuração que controla provider, modelo, timeout e tamanho de contexto.
- **Quota:** limite de uso para evitar consumo excessivo e abuso.
- **Falhar cedo:** interromper o fluxo antes de quota, provider ou persistência quando o limite não permite a chamada.
- **Teste de service:** teste que executa `ClassAiService.askClassAi(...)` com dependências controladas para provar a ordem real da integração.
- **Erro comum a evitar:** validar limites só no frontend ou depois da chamada externa de IA.
- **Segurança no backend:** sessão, role, ownership e membership são validados por controllers/services, não por componentes visuais.
- **Privacidade e RGPD:** logs, evidence e respostas públicas devem minimizar dados pessoais e evitar conteúdo privado.
- **Teste negativo:** prova que a aplicação bloqueia input inválido, acesso indevido ou estado inseguro.

#### Arquitetura do BK

- Endpoint(s): `POST /api/student/subjects/:subjectId/ai/answers` consome limites resolvidos.
- Modelo/schema: `AiModelPolicy` e `AiQuotaPolicy` já definem limites administrativos.
- Service(s): `AiModelPoliciesService`, `AiQuotasService`, `TeacherAiVoiceService.resolveTeacherVoice` e `ClassAiService`.
- Controller/route: controllers existentes mantêm sessão e delegam no service.
- Guard/middleware: reutiliza `SessionGuard` quando o endpoint for privado; health e operação pública nunca expõem dados pessoais.
- Cliente API: usa clientes existentes com `credentials: 'include'` quando houver frontend autenticado.
- Segurança/autorização: limites e voz efetiva são aplicados no backend, depois de membership e antes do provider IA.
- Testes: unitário de `assertPromptWithinLimit(...)`, teste de service para caminho principal e três negativos P0 antes do provider.
- Handoff para o próximo BK: `BK-MF8-01` passa a trabalhar segurança e enviesamento sobre IA já limitada.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
- EDITAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.spec.ts`
- EDITAR: `apps/api/src/modules/class-ai/class-ai.service.ts`
- EDITAR: `apps/api/src/modules/class-ai/class-ai.service.spec.ts`
- REVER: `apps/api/src/modules/ai-quotas/ai-quotas.service.ts`
- REVER: `apps/api/src/modules/teacher-ai/teacher-ai-voice.service.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF7-11` entrega `RNF33` sem alterar ID, owner, prioridade, sprint ou sequência.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- LOCALIZAÇÃO: linhas canónicas do requisito e da matriz.

3. Instruções do que fazer.

Lê `RNF33` em `docs/RNF.md`, confirma a linha `BK-MF7-11` na matriz e regista as decisões seguintes:
- `CANONICO`: `RNF33` exige que a IA siga limites definidos pelo professor.
- `DERIVADO`: reaproveitar política de modelo, quota e voz docente já existentes.
- `DERIVADO`: bloquear prompt antes do provider para evitar custo e resposta fora de contrato.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa o contrato. A implementação só começa depois de confirmar o requisito, o domínio e o BK seguinte.

6. Validação do passo.

Resultado esperado: `BK-MF7-11` continua ligado a `RNF33`, `prioridade: P0`, `sprint: S12` e `proximo_bk: BK-MF8-01`.

7. Cenário negativo/erro esperado.

Se a matriz, backlog e guia tiverem valores diferentes, não avances; regista o drift no relatório de PR.

### Passo 2 - Mapear contratos existentes

1. Objetivo funcional do passo no contexto da app.

Localizar os ficheiros que este BK consome para não duplicar regras de limites docentes de IA.

2. Ficheiros envolvidos:
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/api/src/modules/class-ai/class-ai.service.ts`
- REVER: `apps/api/src/modules/class-ai/class-ai.service.spec.ts`
- REVER: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
- REVER: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.spec.ts`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- LOCALIZAÇÃO: módulos já criados nas macrofases anteriores e ponto de integração deste BK.

3. Instruções do que fazer.

Confirma que a MF6 já entregou segurança, recovery e isolamento de IA. Este BK não substitui `SessionGuard`, ownership, membership, quotas ou guardrails; usa essas peças onde existirem.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o objetivo é evitar duplicação. O aluno deve saber que cada ficheiro novo encaixa num contrato anterior.

6. Validação do passo.

Resultado esperado: lista curta de ficheiros existentes e decisão clara sobre o ponto exato de criação ou edição.

7. Cenário negativo/erro esperado.

Se a solução criar outro endpoint ou outro schema para uma responsabilidade já existente, rejeita a abordagem e usa o service existente.

### Passo 3 - Criar ou editar o contrato principal

1. Objetivo funcional do passo no contexto da app.

Construir o ficheiro principal que torna `RNF33` implementável.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
- LOCALIZAÇÃO: imports, constantes exportadas, tipo `ResolvedAiModelPolicy` e função exportada `assertPromptWithinLimit(...)`.

3. Instruções do que fazer.

Edita o ficheiro existente sem remover a classe `AiModelPoliciesService`. Mantém nomes, imports e mensagens em português de Portugal. Não guardes dados sensíveis nem deixes decisões de segurança para o frontend.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts
import { PayloadTooLargeException } from "@nestjs/common";
import { AiConsentPurpose } from "../ai-consents/schemas/ai-consent.schema.js";

export const DEFAULT_AI_MAX_PROMPT_CHARS = 12000;

export type ResolvedAiModelPolicy = {
    purpose: AiConsentPurpose;
    enabled: boolean;
    provider: string;
    model: string;
    timeoutMs: number;
    maxSourceCount: number;
    maxPromptChars: number;
};

/**
 * Garante que o prompt final respeita o limite definido para a finalidade IA.
 *
 * @param prompt Prompt final que seria enviado ao provider.
 * @param policy Política efetiva resolvida para a finalidade IA.
 * @throws PayloadTooLargeException quando o prompt excede o limite permitido.
 */
export function assertPromptWithinLimit(
    prompt: string,
    policy: Partial<Pick<ResolvedAiModelPolicy, "maxPromptChars">>,
): void {
    const maxPromptChars =
        typeof policy.maxPromptChars === "number" &&
        Number.isFinite(policy.maxPromptChars) &&
        policy.maxPromptChars > 0
            ? policy.maxPromptChars
            : DEFAULT_AI_MAX_PROMPT_CHARS;

    if (prompt.length <= maxPromptChars) return;

    // O bloqueio acontece antes da chamada externa para preservar custo, privacidade e regra docente.
    throw new PayloadTooLargeException({
        code: "AI_PROMPT_TOO_LARGE",
        message: "O contexto selecionado excede o limite administrativo de IA.",
    });
}
```

5. Explicação do código.

O código implementa o contrato principal de `BK-MF7-11`. `ResolvedAiModelPolicy` representa a política já resolvida para uma finalidade de IA. `assertPromptWithinLimit(...)` recebe o prompt final e a política efetiva, calcula um limite seguro e lança `PayloadTooLargeException` antes de qualquer chamada externa quando o prompt é demasiado grande.

Esta função cumpre `RNF33` porque transforma o limite do professor/admin numa barreira técnica dentro do backend. A validação usa `Number.isFinite(...)` para evitar aceitar valores inválidos como limite. O comentário didático fica junto do erro porque é nesse ponto que o aluno deve perceber a razão de segurança: não enviar contexto privado ou oficial para o provider quando a própria política já diz que não deve seguir.

6. Validação do passo.

Executa uma leitura técnica do ficheiro e confirma que não há imports inexistentes, dados privados em logs, casts inseguros, payloads sem tipo ou decisões de autorização feitas no frontend. Confirma também que `AiModelPoliciesService.resolveForUse(...)` continua a lançar `AI_MODEL_POLICY_DISABLED` quando a finalidade está desativada.

7. Cenário negativo/erro esperado.

Se removeres a validação ou o comentário didático, o BK fica `PARCIAL`; se a falha expuser dados privados ou permitir mistura de contextos, fica `CRITICO`.

### Passo 4 - Integrar com a aplicação

1. Objetivo funcional do passo no contexto da app.

Ligar o contrato principal ao ponto correto da app sem duplicar módulos.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
- EDITAR: `apps/api/src/modules/class-ai/class-ai.service.ts`
- REVER: `apps/api/src/modules/ai-quotas/ai-quotas.service.ts`
- LOCALIZAÇÃO: `apps/api/src/modules/class-ai/class-ai.service.ts`, imports no topo e método completo `askClassAi(...)`.

3. Instruções do que fazer.

Confirma e preserva esta ordem: validar role, validar membership da disciplina, validar perfil/contexto herdado de `BK-MF7-10`, resolver consentimento e política, limitar número de fontes, construir prompt com voz docente, validar tamanho do prompt, reservar quota e só depois chamar o provider. Se faltar algum destes passos, adiciona-o no local indicado.

Não deixes o frontend enviar limites finais. O professor configura políticas por endpoints administrativos, mas `ClassAiService` é quem aplica os limites no backend.

4. Código completo, correto e integrado com a app final.

No topo de `apps/api/src/modules/class-ai/class-ai.service.ts`, confirma estes imports:

```ts
// apps/api/src/modules/class-ai/class-ai.service.ts
import * as aiContextPolicy from "../ai/context/ai-context-policy.js";
import {
    AiModelPoliciesService,
    assertPromptWithinLimit,
} from "../ai-model-policies/ai-model-policies.service.js";
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

    // A inscrição na disciplina é validada antes de qualquer regra docente ser aplicada.
    const { subject, schoolClass } =
        await this.subjectsService.findSubjectForStudent(actor.id, subjectId);

    aiContextPolicy.assertAiContextProfile("CLASS_SUBJECT", "TEACHER_CLASS");
    await this.aiConsentsService.assertGranted(actor.id, "CLASS_AI");
    const policy = await this.aiModelPoliciesService.resolveForUse("CLASS_AI");

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
        // O provider só é chamado depois de contexto, consentimento, política, limite de prompt e quota.
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

A integração começa por confirmar que o utilizador é aluno e que pertence à disciplina. Depois reutiliza `assertAiContextProfile(...)`, entregue no `BK-MF7-10`, para garantir que os limites docentes só são aplicados à IA da turma/disciplina. O consentimento e a política são resolvidos antes de preparar a chamada externa, porque uma funcionalidade desativada não deve chegar ao provider.

O número de fontes é limitado por `policy.maxSourceCount`; o prompt é construído com materiais oficiais e voz docente; `assertPromptWithinLimit(prompt, policy)` bloqueia contexto demasiado grande; `reserveUsage(...)` reserva quota antes do custo externo; e `generateClassAnswer(...)` só é chamado quando todos estes gates passam. A auditoria regista metadados técnicos mínimos, sem copiar prompt privado, resposta completa ou materiais oficiais para logs.

6. Validação do passo.

Resultado esperado: `ClassAiService.askClassAi(...)` chama `assertAiContextProfile(...)`, `assertGranted(...)`, `resolveForUse("CLASS_AI")`, `assertPromptWithinLimit(...)` e `reserveUsage(...)` antes de `generateClassAnswer(...)`. Os testes devem provar que o provider não é chamado quando a política está desativada, quando o prompt excede o limite ou quando a quota falha.

7. Cenário negativo/erro esperado.

Se a integração contornar `SessionGuard`, ownership, membership, quotas ou guardrails já existentes, a alteração deve ser revertida.

### Passo 5 - Adicionar teste ou evidence técnica

1. Objetivo funcional do passo no contexto da app.

Provar que o contrato de `BK-MF7-11` funciona e falha de forma controlada com cobertura P0.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.spec.ts`
- EDITAR: `apps/api/src/modules/class-ai/class-ai.service.spec.ts`
- LOCALIZAÇÃO: `describe("AiModelPoliciesService", ...)` e `describe("ClassAiService", ...)`.

3. Instruções do que fazer.

Adiciona os testes abaixo. Para este BK `P0`, a evidence mínima é: caminho principal, unit test da função de limite, teste de service e três negativos antes do provider.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-model-policies/ai-model-policies.service.spec.ts
import {
    ForbiddenException,
    PayloadTooLargeException,
    ServiceUnavailableException,
} from "@nestjs/common";
import { assertPromptWithinLimit } from "./ai-model-policies.service.js";

describe("assertPromptWithinLimit", () => {
    it("bloqueia prompt que excede o limite docente", () => {
        // Este negativo confirma que o limite do professor trava a pergunta antes de qualquer custo de IA.
        expect(() =>
            assertPromptWithinLimit("x".repeat(11), { maxPromptChars: 10 }),
        ).toThrow(PayloadTooLargeException);
    });

    it("aceita prompt dentro do limite configurado", () => {
        // A função valida o contrato antes de o ClassAiService chamar o provider externo.
        expect(() =>
            assertPromptWithinLimit("explica limites", { maxPromptChars: 100 }),
        ).not.toThrow();
    });
});
```

Em `apps/api/src/modules/class-ai/class-ai.service.spec.ts`, confirma que o import de exceções inclui `PayloadTooLargeException`:

```ts
// apps/api/src/modules/class-ai/class-ai.service.spec.ts
import {
    ForbiddenException,
    PayloadTooLargeException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
```

No mesmo ficheiro, acrescenta estes testes dentro de `describe("ClassAiService", ...)`:

```ts
it("não chama o provider quando a política de IA da disciplina está desativada", async () => {
    const {
        aiModelPoliciesService,
        aiProvider,
        aiQuotasService,
        interactionModel,
        materialsService,
        service,
    } = makeService();
    // A policy desativada deve falhar cedo para não listar materiais nem preparar contexto de IA.
    aiModelPoliciesService.resolveForUse.mockRejectedValueOnce(
        new ServiceUnavailableException({
            code: "AI_MODEL_POLICY_DISABLED",
            message: "Esta funcionalidade de IA está temporariamente desativada.",
        }),
    );

    await expect(
        service.askClassAi(student, subjectId, {
            question: "Explica derivadas.",
        }),
    ).rejects.toMatchObject({
        response: {
            code: "AI_MODEL_POLICY_DISABLED",
        },
    });

    expect(aiModelPoliciesService.resolveForUse).toHaveBeenCalledWith("CLASS_AI");
    expect(materialsService.listProcessedForSubject).not.toHaveBeenCalled();
    expect(aiQuotasService.reserveUsage).not.toHaveBeenCalled();
    expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
    expect(interactionModel.create).not.toHaveBeenCalled();
});

it("não reserva quota nem chama o provider quando o prompt excede o limite", async () => {
    const {
        aiModelPoliciesService,
        aiProvider,
        aiQuotasService,
        interactionModel,
        materialsService,
        service,
    } = makeService();
    materialsService.listProcessedForSubject.mockResolvedValue([
        makeMaterial(materialId),
    ]);
    aiModelPoliciesService.resolveForUse.mockResolvedValueOnce({
        enabled: true,
        model: "gpt-test",
        timeoutMs: 5000,
        maxSourceCount: 10,
        maxPromptChars: 10,
    });
    // O limite curto simula a regra docente e deve bloquear antes de reservar quota ou chamar o provider.

    await expect(
        service.askClassAi(student, subjectId, {
            question: "Explica derivadas com detalhe.",
        }),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);

    expect(aiQuotasService.reserveUsage).not.toHaveBeenCalled();
    expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
    expect(interactionModel.create).not.toHaveBeenCalled();
});

it("não chama o provider quando a reserva de quota falha", async () => {
    const {
        aiProvider,
        aiQuotasService,
        interactionModel,
        materialsService,
        service,
    } = makeService();
    materialsService.listProcessedForSubject.mockResolvedValue([
        makeMaterial(materialId),
    ]);
    aiQuotasService.reserveUsage.mockRejectedValueOnce(
        new ServiceUnavailableException({
            code: "AI_QUOTA_EXCEEDED",
            message: "O limite de IA da turma foi atingido.",
        }),
    );

    await expect(
        service.askClassAi(student, subjectId, {
            question: "Explica derivadas.",
        }),
    ).rejects.toMatchObject({
        response: {
            code: "AI_QUOTA_EXCEEDED",
        },
    });

    // Mesmo quando a quota é avaliada, a falha impede chamada externa e evita persistir uma resposta inexistente.
    expect(aiQuotasService.reserveUsage).toHaveBeenCalledWith({
        scope: "CLASS",
        targetId: classId,
        purpose: "CLASS_AI",
        units: 1,
    });
    expect(aiProvider.generateClassAnswer).not.toHaveBeenCalled();
    expect(interactionModel.create).not.toHaveBeenCalled();
});
```

5. Explicação do código.

O teste unitário prova a regra pequena: prompt dentro do limite passa, prompt acima do limite lança `PayloadTooLargeException`. Os testes de service provam a ordem real da aplicação. Quando a política está desativada, a app não lista materiais nem chama o provider. Quando o prompt é demasiado grande, a app não reserva quota nem chama o provider. Quando a quota falha, a app também não chama o provider nem grava interação.

Isto fecha os três negativos P0 de `RNF33` sem expor dados privados. Os dados usados são fixtures técnicas e não devem ser copiados de materiais reais de alunos ou professores.

6. Validação do passo.

Comandos recomendados:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- ai-model-policies.service class-ai.service
```

Resultado esperado: build verde; teste unitário de policy verde; teste de service verde com caminho principal e três negativos P0.

7. Cenário negativo/erro esperado.

Se o teste só confirmar que a função existe, sem validar comportamento, erro esperado e ausência de chamada ao provider, não é evidence suficiente.

### Passo 6 - Validar por camada

1. Objetivo funcional do passo no contexto da app.

Confirmar que backend, frontend, documentação e evidence estão alinhados.

2. Ficheiros envolvidos:
- REVER: `apps/api/package.json`
- REVER: `apps/web/package.json`
- REVER: `docs/planificacao/guias-bk/MF7`
- LOCALIZAÇÃO: comandos de validação e PR.

3. Instruções do que fazer.

Executa validação por camada e regista observed/expected. Matriz mínima de testes por prioridade: `P0` exige unit, integração/service e 3 negativos; `P1` exige unit ou integração e 2 negativos; `P2` exige teste focal e 1 negativo. Evidência de testes por camada: backend, documentação e smoke quando existir endpoint público adequado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque a validação é operacional. O valor está em comparar resultado esperado e observado de forma objetiva.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- ai-model-policies.service class-ai.service
rg -n "console\\.log|cookie|password|authorization|bearer|prompt|answer" apps/api/src/modules/class-ai apps/api/src/modules/ai-model-policies
```

Resultados esperados: build verde; testes verdes; pesquisa sem novos logs de prompts, respostas completas, cookies ou credenciais. A palavra `prompt` pode aparecer em nomes de função e variáveis técnicas; só é problema se houver log ou evidence com conteúdo privado.

7. Cenário negativo/erro esperado.

Se o build falhar por import criado neste BK, corrige antes de abrir PR. Se falhar por dívida externa, regista o caminho e o erro exato.

### Passo 7 - Preparar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF7-11` com prova técnica e instrução clara para `BK-MF8-01`.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- LOCALIZAÇÃO: secções finais do guia e descrição da PR.

3. Instruções do que fazer.

No PR, inclui comandos executados, resultado principal, negativos, risco restante e o que o próximo BK passa a poder reutilizar. Como este BK toca IA, inclui prova de contexto, limites e ausência de provider nos três negativos, sem expor materiais privados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque o foco é comunicação técnica. A equipa deve conseguir defender a decisão sem pedir contexto extra ao professor.

6. Validação do passo.

Resultado esperado: evidence completa e handoff explícito para `BK-MF8-01`.

Modelo mínimo de evidence:

```md
proof_tecnico:
- build: `npm --prefix apps/api run build` -> PASS
- unit/service: `npm --prefix apps/api run test:unit -- ai-model-policies.service class-ai.service` -> PASS

proof_negativos:
- política `CLASS_AI` desativada -> `AI_MODEL_POLICY_DISABLED`; provider não chamado
- prompt acima de `maxPromptChars` -> `PayloadTooLargeException`; quota/provider não chamados
- quota da turma excedida -> `AI_QUOTA_EXCEEDED`; provider não chamado

proof_privacidade:
- sem logs de prompt completo, resposta IA completa, cookies, tokens ou materiais privados
```

7. Cenário negativo/erro esperado.

Se a evidence disser apenas 'funciona', sem output, request/response, teste ou screenshot, não cumpre o BK.

#### Critérios de aceite

- `RNF33` fica demonstrável por código, teste/evidence e explicação pedagógica.
- O guia mantém `bk_id`, `macro`, owner, apoio, prioridade, sprint, esforço, `rf_rnf` e `proximo_bk` alinhados com matriz e backlog.
- Cada passo tem objetivo, ficheiros, instruções, código ou justificação sem código, explicação, validação e negativo.
- O código apresentado tem JSDoc nos elementos relevantes e comentários didáticos junto das decisões importantes.
- `ClassAiService.askClassAi(...)` aplica contexto, consentimento, política, limite de prompt e quota antes do provider.
- `ClassAiService.askClassAi(...)` aplica voz docente efetiva resolvida antes do provider e guarda as regras usadas.
- Os testes P0 incluem caminho principal, unit, service e três negativos.
- Não existe decisão de sessão, ownership, membership, role, quota, fonte IA ou privacidade feita apenas no frontend.
- Não há exposição de cookies, passwords, prompts privados, respostas IA completas, materiais privados ou dados de outro contexto em logs/evidence.
- Os negativos mínimos respeitam a prioridade `P0`.

#### Validação final

- Executar pesquisa textual nos BKs MF7 para confirmar ausência de linguagem interna e caminhos privados.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `npm --prefix apps/api run build`.
- Executar `npm --prefix apps/api run test:unit -- ai-model-policies.service class-ai.service`.
- Confirmar cenário sem override de disciplina, cenário com override e remoção de override.
- Executar pesquisa de logs sensíveis nos módulos alterados.
- Resultado esperado: comandos verdes ou falha externa registada com caminho, comando e erro observado.

#### Evidence para PR/defesa

- `pr`: referência do PR/commit com resumo de `BK-MF7-11`.
- `proof_tecnico`: comando executado, output relevante ou request/response do caminho principal.
- `proof_negativos`: três erros controlados P0, cada um com prova de provider não chamado.
- `proof_fontes`: para IA da disciplina, confirmação de que só entram materiais oficiais processados depois de membership.
- `proof_voz_docente`: confirmação de herança da turma, precedência do override e registo das regras efetivas.
- `proof_privacidade`: confirmação de que não há dados pessoais ou privados em logs/evidence.
- `proof_pedagogico`: explicação curta de como `RNF33` melhora a aplicação para alunos, professores ou operação.

#### Handoff

`BK-MF8-01` passa a trabalhar segurança e enviesamento sobre IA já limitada por perfil, voz efetiva, política, tamanho de prompt e quota.

O próximo BK deve reutilizar os ficheiros e decisões deste guia, sem criar outro contrato para a mesma responsabilidade.

#### Changelog

- `2026-06-27`: corrigida a prova P0 com integração em `ClassAiService.askClassAi(...)`, três negativos antes do provider, validação por camada e evidence objetiva.
- `2026-06-30`: documentada aplicação de voz efetiva herdada nos limites docentes.
- `2026-06-26`: contrato de limites docentes de IA documentado com tutorial técnico linear, código completo, validação, negativos, evidence e caminhos públicos `apps/...`.
