# BK-MF8-01 - IA evita enviesamentos e respostas inseguras.

## Header

- `doc_id`: `GUIA-BK-MF8-01`
- `bk_id`: `BK-MF8-01`
- `macro`: `MF8`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF34`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-02`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- `last_updated`: `2026-07-01`

#### Objetivo

Neste BK vais implementar uma policy backend que bloqueia pedidos inseguros, enviesados ou sem finalidade pedagógica antes de qualquer chamada ao provider. O trabalho é incremental: consome os contratos fechados até MF7, mantém caminhos públicos em `apps/api` e `apps/web`, e deixa o próximo BK pronto para continuar sem decisões escondidas.

#### Importância

`RNF34` é CANONICO na planificação StudyFlow. Sem este BK, a MF8 fica incompleta porque o fecho de produto não demonstra segurança ética da IA com validação, evidence e negativos controlados.

Este BK também protege a defesa PAP: o aluno consegue mostrar comportamento observável, explicar a decisão técnica, provar falhas controladas e justificar que dados de alunos, salas, turmas, professores e IA não são misturados.

#### Scope-in

- Confirmar metadados canónicos de `BK-MF8-01` em matriz, backlog e contrato de campos.
- Entregar policy `evaluateAiSafetyInput(...)` chamada pelo guardrail antes do provider.
- Entregar mensagem clara quando a IA bloqueia uma pergunta insegura.
- Criar ou rever testes para pergunta discriminatória, pedido perigoso e pedido pedagógico permitido.
- Preservar autenticação, autorização, ownership, membership, privacidade e logs mínimos sempre que o fluxo toca dados privados.
- Recolher evidence objetiva para PR e defesa.

#### Scope-out

- Alterar IDs, owners, prioridades, esforço, sprint, RF/RNF, dependências ou ordem dos BKs.
- Criar requisitos novos fora de `RNF34`.
- Prometer RAG, embeddings, OCR, tradução completa, automação externa ou integrações não previstas nesta fase.
- Guardar tokens, cookies, prompts privados, respostas IA privadas completas, materiais privados ou dados pessoais em logs/evidence.
- Mover validações de ownership, membership, role ou permissão para o frontend.
- Duplicar endpoints, models ou services com responsabilidades já existentes.

#### Estado antes e depois

- Estado antes: BK-MF7-11 deixa os contratos de limites da IA prontos, mas `BK-MF8-01` ainda não mostrava a integração completa entre policy, service, frontend e testes.
- Estado depois: `BK-MF8-01` passa a ter tutorial linear, ficheiros concretos, policy backend, integração completa no `AiGuardrailsService`, contrato frontend tipado, testes focados, validação por passo, negativos, expected results e handoff explícito para BK-MF8-02.

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
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`

#### Glossário

- **StudyFlow:** plataforma de estudo com áreas privadas, salas, turmas, professores, materiais e IA pedagógica.
- **Aluno autenticado:** utilizador identificado no backend por sessão segura; o seu `userId` nunca vem do body.
- **Professor:** utilizador que gere turmas, disciplinas, materiais oficiais, testes e acompanhamento.
- **Fonte processável:** texto autorizado que pode sustentar uma resposta IA ou uma validação pedagógica.
- **Ownership:** regra backend que confirma que um recurso pertence ao aluno ou professor correto.
- **Membership:** regra backend que confirma pertença a sala, grupo, turma ou disciplina antes de ler dados.
- **Fallback honesto:** resposta de erro controlada quando a app não tem dados suficientes ou seguros.
- **Evidence:** prova objetiva de execução, com comando, output, screenshot ou pedido/resposta sem dados sensíveis.

#### Conceitos teóricos essenciais

- **Domínio do BK:** segurança ética da IA. Vem de `RNF34`, entra neste BK como regra implementável e segue para BK-MF8-02 como contrato validado.
- **Controller:** recebe HTTP, usa `SessionGuard` quando há sessão e delega regras no service. Evita misturar transporte com domínio.
- **Service:** concentra validação, autorização, chamadas a models/providers e erros esperados. Evita regras duplicadas na UI.
- **DTO/validator:** define payload permitido e impede campos perigosos ou ambíguos antes de chegarem ao service.
- **Schema/model:** guarda só os dados necessários, com índices coerentes para aluno, sala, turma, disciplina ou artefacto.
- **Frontend React:** mostra estados loading, vazio, erro e sucesso, sempre chamando APIs com `credentials: "include"`.
- **Segurança e RGPD:** dados privados, fontes, prompts, respostas IA e resultados de testes não podem atravessar contextos nem aparecer em logs completos.
- **Teste negativo:** prova que a app falha com controlo quando falta acesso, faltam fontes, o input é inválido ou o provider devolve algo inseguro.

#### Arquitetura do BK

- Requisito canónico: `RNF34`.
- Endpoint/contrato principal: `POST /api/ai/guardrails/check`.
- Backend: policy `evaluateAiSafetyInput(...)` chamada pelo guardrail antes do provider.
- Frontend: mensagem clara quando a IA bloqueia uma pergunta insegura.
- Testes: pergunta discriminatória, pedido perigoso e pedido pedagógico permitido.
- Segurança: sessão real, validação backend, ownership/membership/role no service e ausência de dados sensíveis em logs.
- Decisão CANONICO: manter metadados da matriz/backlog/contrato.
- Decisões DERIVADO:
  - criar `AiSafetyPolicy` como policy pequena em vez de duplicar o provider.
  - usar códigos estáveis `BIAS_RISK`, `UNSAFE_REQUEST`, `NON_PEDAGOGICAL` e `CONTEXT_ALLOWED` para UI e testes.
- Handoff: BK-MF8-02.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai-safety/ai-safety-policy.ts`
- CRIAR: `apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts`
- EDITAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
- EDITAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts`
- EDITAR: `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
- REVER: `apps/api/src/modules/ai/providers/ai-provider.ts`
- EDITAR: `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF8-01` entrega `RNF34` sem alterar metadados canónicos.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - LOCALIZAÇÃO: linhas de `BK-MF8-01` e requisitos `RNF34`.

3. Instruções do que fazer.

Regista `CANONICO`: título, owner `Natalia`, apoio `Guilherme`, prioridade `P0`, esforço `M`, sprint `S12`, dependências `-` e próximo BK `BK-MF8-02`.

Regista `DERIVADO` apenas para as decisões técnicas listadas na arquitectura. Não alteres a matriz nem o backlog neste BK.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental, analítico ou preparatório e fixa decisões antes de alterar ficheiros.

5. Explicação do código.

Não existe código neste passo. O valor está em impedir drift antes de editar: se os documentos canónicos divergirem, o aluno deve parar e registar o bloqueio no relatório/evidence.

6. Validação do passo.

Resultado esperado: header do guia e documentos canónicos continuam alinhados com `BK-MF8-01`, `RNF34`, `S12` e `BK-MF8-02`.

7. Cenário negativo/erro esperado.

Se matriz, backlog e contrato tiverem valores incompatíveis, não inventes a resposta; marca `BLOQUEADO_POR_CONTRATO` no relatório da MF8.


### Passo 2 - Mapear contratos existentes

1. Objetivo funcional do passo no contexto da app.

Identificar o que já existe em `apps/api` e `apps/web` para entregar segurança ética da IA sem duplicar responsabilidades.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/app.module.ts`
    - REVER: `apps/api/src/common/guards/session.guard.ts`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - REVER: `apps/api/src/modules/ai/providers/ai-provider.ts`
    - REVER: `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
    - LOCALIZAÇÃO: classes, functions, components ou páginas indicados na lista de ficheiros.

3. Instruções do que fazer.

Confirma os imports públicos que este BK consome e escreve no teu rascunho de PR:

- que service valida segurança;
- que DTO protege input;
- que model persiste dados;
- que componente mostra resultado;
- que teste prova caminho feliz e falha controlada.

Se um ficheiro ainda não existir, cria-o no passo certo. Se já existir, edita-o mantendo a API pública estável.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental, analítico ou preparatório e fixa decisões antes de alterar ficheiros.

5. Explicação do código.

Sem código porque este passo é leitura técnica. A regra principal é reconhecer contratos existentes antes de criar ficheiros novos.

6. Validação do passo.

Resultado esperado: lista fechada de ficheiros a criar/editar/rever, sem endpoint duplicado e sem import para ficheiro inexistente.

7. Cenário negativo/erro esperado.

Se encontrares dois nomes para o mesmo conceito, escolhe o nome já usado em `apps/api` ou `apps/web` e regista a decisão como `DERIVADO`.


### Passo 3 - Policy de segurança ética da IA

1. Objetivo funcional do passo no contexto da app.

Implementar a peça técnica central de segurança ética da IA.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai-safety/ai-safety-policy.ts`
    - CRIAR: `apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts`
    - EDITAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
    - LOCALIZAÇÃO: ficheiro completo indicado no comentário inicial do bloco.

3. Instruções do que fazer.

Cria ou substitui o ficheiro indicado abaixo. Depois integra a função/classe no service principal do BK, mantendo validação antes de efeitos externos e sem aceitar IDs de utilizador vindos do frontend.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-safety/ai-safety-policy.ts
export type AiSafetyReasonCode =
    | "SAFE"
    | "BIAS_RISK"
    | "UNSAFE_REQUEST"
    | "NON_PEDAGOGICAL";

export type AiSafetyDecision = {
    allowed: boolean;
    reasonCode: AiSafetyReasonCode;
    reason: string;
};

const biasedTerms = [
    "inferior",
    "incapaz por origem",
    "merece menos apoio",
    "alunos de uma origem sao piores",
];

const unsafeTerms = [
    "autoagressao",
    "violencia detalhada",
    "burlar sistema",
    "fabricar credenciais",
];

/**
 * Normaliza texto livre para comparações simples e previsíveis.
 *
 * @param value Texto recebido do DTO.
 * @returns Texto em minúsculas, sem acentos e sem espaços duplicados.
 */
function normalizeSafetyText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

/**
 * Avalia uma pergunta antes de a IA gerar resposta.
 *
 * @param question Pergunta do aluno já validada pelo DTO do endpoint.
 * @returns Decisão segura para o service usar antes do provider.
 */
export function evaluateAiSafetyInput(question: string): AiSafetyDecision {
    const normalized = normalizeSafetyText(question);

    // A validação acontece no backend para impedir que uma UI alterada contorne a regra ética.
    if (!normalized) {
        return {
            allowed: false,
            reasonCode: "NON_PEDAGOGICAL",
            reason: "Escreve uma pergunta de estudo concreta.",
        };
    }

    if (biasedTerms.some((term) => normalized.includes(term))) {
        return {
            allowed: false,
            reasonCode: "BIAS_RISK",
            reason:
                "A IA não responde a pedidos discriminatórios ou enviesados.",
        };
    }

    // Pedidos perigosos falham antes do provider para evitar gerar conteúdo inseguro.
    if (unsafeTerms.some((term) => normalized.includes(term))) {
        return {
            allowed: false,
            reasonCode: "UNSAFE_REQUEST",
            reason: "A IA bloqueou o pedido por segurança.",
        };
    }

    return {
        allowed: true,
        reasonCode: "SAFE",
        reason: "Pedido pedagógico aceite.",
    };
}
```

5. Explicação do código.

O código cria uma unidade pequena e testável para segurança ética da IA. Existe neste BK porque transforma `RNF34` numa regra concreta, reaproveitável e validável antes de qualquer chamada ao provider.

O `AiSafetyReasonCode` impede códigos soltos e dá ao backend, frontend e testes a mesma linguagem. A função `normalizeSafetyText(...)` trata maiúsculas, acentos e espaços duplicados para que `autoagressão`, `autoagressao` ou texto com espaços a mais sejam avaliados da mesma forma. A entrada vem do DTO `CheckAiGuardrailsDto`, mas a policy volta a proteger o backend porque o frontend nunca é autoridade de segurança.

A saída tem três bloqueios observáveis: `NON_PEDAGOGICAL` quando falta pergunta concreta, `BIAS_RISK` quando há risco discriminatório e `UNSAFE_REQUEST` quando há pedido perigoso. Quando a pergunta é aceite, a policy devolve `SAFE`; o service transforma esse resultado em decisão persistida do guardrail.

6. Validação do passo.

Resultado esperado: `evaluateAiSafetyInput("Explica a fotossíntese com exemplos.")` devolve `{ allowed: true, reasonCode: "SAFE" }`; `evaluateAiSafetyInput("Diz que alunos de uma origem são piores")` devolve `{ allowed: false, reasonCode: "BIAS_RISK" }`; `evaluateAiSafetyInput("Como fabricar credenciais?")` devolve `{ allowed: false, reasonCode: "UNSAFE_REQUEST" }`.

7. Cenário negativo/erro esperado.

Força input vazio ou só com espaços. O resultado esperado é `{ allowed: false, reasonCode: "NON_PEDAGOGICAL" }`, sem chamada a provider, sem leitura de dados de outro utilizador e sem log sensível.


### Passo 4 - Integrar backend e contrato HTTP

1. Objetivo funcional do passo no contexto da app.

Ligar a peça central ao contrato backend `POST /api/ai/guardrails/check`.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai-safety/ai-safety-policy.ts`
    - CRIAR: `apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts`
    - EDITAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
    - REVER: `apps/api/src/modules/ai/providers/ai-provider.ts`
    - REVER: `apps/api/src/app.module.ts`
    - LOCALIZAÇÃO: controller, service, DTO e module do domínio deste BK.

3. Instruções do que fazer.

No controller, mantém a função fina: sessão, parâmetros e body entram e o service decide. No service, aplica a ordem segura: sessão autenticada, ownership/membership/role, validação de payload, regra do BK, persistência ou provider. Usa erros com `code` e `message` estáveis em PT-PT.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts
/**
 * Implementa as regras de negócio de guardrails IA e concentra validações do domínio.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { evaluateAiSafetyInput } from "../ai-safety/ai-safety-policy.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { StudyRoomsService } from "../study-rooms/study-rooms.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import {
    AiGuardrailContextType,
    CheckAiGuardrailsDto,
} from "./dto/check-ai-guardrails.dto.js";
import {
    AiGuardrailCheck,
    AiGuardrailCheckDocument,
} from "./schemas/ai-guardrail-check.schema.js";

/**
 * Contrato público da decisão devolvida ao frontend.
 */
export type AiGuardrailDecision = {
    _id: string;
    contextType: AiGuardrailContextType;
    resourceId: string;
    allowed: boolean;
    reasonCode: string;
    reason: string;
    checkedAt?: Date;
};

/**
 * Serviço de guardrails IA por contexto.
 *
 * A regra central é validar role, contexto e segurança ética no backend antes
 * de qualquer chamada posterior ao provider de IA.
 */
@Injectable()
export class AiGuardrailsService {
    /**
     * Recebe dependências por injeção para manter a classe testável.
     *
     * @param checkModel Modelo Mongoose usado para persistir decisões mínimas.
     * @param studyAreasService Service que valida ownership de áreas privadas.
     * @param studyRoomsService Service que valida membership de salas de estudo.
     * @param subjectsService Service que valida acesso do aluno a disciplinas.
     */
    constructor(
        @InjectModel(AiGuardrailCheck.name)
        private readonly checkModel: Model<AiGuardrailCheckDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Verifica se um pedido IA pode avançar sem misturar contextos nem aceitar
     * pedidos enviesados ou inseguros.
     *
     * @param actor Utilizador autenticado pela sessão.
     * @param input Payload validado pelo DTO.
     * @returns Decisão persistida e pronta para a UI.
     */
    async check(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
    ): Promise<AiGuardrailDecision> {
        if (actor.role !== "STUDENT") {
            return this.persistDecision(actor, input, false, "STUDENT_ROLE_REQUIRED");
        }

        try {
            await this.assertContextAccess(actor, input);
        } catch (error) {
            if (error instanceof ForbiddenException) {
                return this.persistDecision(actor, input, false, "CONTEXT_FORBIDDEN");
            }

            return this.persistDecision(actor, input, false, "CONTEXT_NOT_AVAILABLE");
        }

        const safetyDecision = evaluateAiSafetyInput(input.prompt);

        if (!safetyDecision.allowed) {
            // O bloqueio ético acontece antes de qualquer provider para evitar conteúdo inseguro.
            return this.persistDecision(
                actor,
                input,
                false,
                safetyDecision.reasonCode,
                safetyDecision.reason,
            );
        }

        return this.persistDecision(actor, input, true, "CONTEXT_ALLOWED");
    }

    /**
     * Confirma ownership ou membership do recurso indicado.
     *
     * @param actor Aluno autenticado.
     * @param input Contexto funcional indicado no pedido.
     */
    private async assertContextAccess(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
    ): Promise<void> {
        if (input.contextType === AiGuardrailContextType.SOLO) {
            await this.studyAreasService.getMyStudyArea(actor.id, input.resourceId);
            return;
        }

        if (input.contextType === AiGuardrailContextType.STUDY_ROOM) {
            await this.studyRoomsService.ensureMember(actor.id, input.resourceId);
            return;
        }

        // `classId`/`subjectId` não vêm da confiança do frontend: o service confirma acesso.
        await this.subjectsService.findSubjectForStudent(actor.id, input.resourceId);
    }

    /**
     * Persiste decisão de guardrail sem guardar prompt, resposta IA ou material privado.
     *
     * @param actor Utilizador autenticado.
     * @param input Pedido original validado.
     * @param allowed Resultado final do guardrail.
     * @param reasonCode Código estável para UI, testes e evidence.
     * @param reasonOverride Mensagem pública específica quando a policy já decidiu a razão.
     * @returns Decisão pública.
     */
    private async persistDecision(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
        allowed: boolean,
        reasonCode: string,
        reasonOverride?: string,
    ): Promise<AiGuardrailDecision> {
        const reason = reasonOverride ?? this.reasonFor(reasonCode);
        const check = await this.checkModel.create({
            actorId: actor.id,
            contextType: input.contextType,
            resourceId: input.resourceId,
            allowed,
            reasonCode,
            reason,
        });
        const created = check.toObject() as { createdAt?: Date };

        return {
            _id: String(check._id),
            contextType: check.contextType,
            resourceId: check.resourceId,
            allowed: check.allowed,
            reasonCode: check.reasonCode,
            reason: check.reason,
            checkedAt: created.createdAt,
        };
    }

    /**
     * Traduz códigos técnicos para mensagens PT-PT seguras.
     *
     * @param code Código interno da decisão.
     * @returns Mensagem pública sem revelar dados de outro contexto.
     */
    private reasonFor(code: string): string {
        const reasons: Record<string, string> = {
            BIAS_RISK: "A IA não responde a pedidos discriminatórios ou enviesados.",
            CONTEXT_ALLOWED: "O contexto foi validado e a IA pode avançar.",
            CONTEXT_FORBIDDEN:
                "O pedido foi bloqueado porque não tens acesso a este contexto.",
            CONTEXT_NOT_AVAILABLE:
                "O pedido foi bloqueado porque o contexto não está disponível.",
            NON_PEDAGOGICAL: "Escreve uma pergunta de estudo concreta.",
            STUDENT_ROLE_REQUIRED:
                "Este guardrail só valida pedidos IA feitos por alunos.",
            UNSAFE_REQUEST: "A IA bloqueou o pedido por segurança.",
        };

        return reasons[code] ?? "O pedido foi bloqueado por regra de segurança.";
    }
}
```

5. Explicação do código.

Este código mostra a integração real que faltava: `AiGuardrailsService.check(...)` continua a receber o aluno autenticado e o DTO do endpoint `POST /api/ai/guardrails/check`, mas agora chama `evaluateAiSafetyInput(...)` antes de autorizar o fluxo de IA.

A ordem é intencional. Primeiro valida o papel do utilizador, porque este endpoint é para pedidos feitos por alunos. Depois valida ownership ou membership através dos services já existentes: área privada em `StudyAreasService`, sala em `StudyRoomsService` e disciplina/turma em `SubjectsService`. Só depois aplica a policy ética ao `prompt`; assim o backend não revela informação sobre recursos a quem não tem acesso.

O método `persistDecision(...)` guarda apenas `actorId`, `contextType`, `resourceId`, `allowed`, `reasonCode` e `reason`. Não guarda o prompt nem respostas IA, porque esses dados podem conter informação pessoal, materiais privados ou dúvidas sensíveis do aluno. Isto cumpre `RNF34` sem quebrar `RNF20`, `RNF23` e os contratos de privacidade já preparados em MF6/MF7.

Os alunos podem adaptar os termos de `ai-safety-policy.ts` quando o professor quiser apertar critérios, mas não devem mover ownership, membership ou role para a UI. Se a policy bloquear, o provider nunca é chamado; se o contexto for proibido, o erro continua a ser de contexto e não de conteúdo.

6. Validação do passo.

Resultado esperado: `POST /api/ai/guardrails/check` responde com `allowed: true` e `reasonCode: "CONTEXT_ALLOWED"` para uma pergunta pedagógica em contexto permitido; responde com `allowed: false` e `reasonCode: "BIAS_RISK"` para pedido enviesado; responde com `allowed: false` e `reasonCode: "UNSAFE_REQUEST"` para pedido perigoso; responde com `allowed: false` e `reasonCode: "CONTEXT_FORBIDDEN"` quando o aluno não pertence ao contexto.

7. Cenário negativo/erro esperado.

Se o controller tentar decidir ownership, membership ou segurança ética diretamente, a correção é mover essa regra para o service. O controller deve receber HTTP e delegar; a fonte de verdade do domínio é `AiGuardrailsService`.


### Passo 5 - Integrar frontend e estados da UI

1. Objetivo funcional do passo no contexto da app.

Tornar mensagem clara quando a IA bloqueia uma pergunta insegura visível ao aluno, professor ou equipa de defesa.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
    - EDITAR: `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
    - REVER: `apps/web/src/features/mf3/request-mf3-json.ts`
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: cliente API, página ou componente React indicado nos ficheiros do BK.

3. Instruções do que fazer.

Cria cliente API tipado, chama o backend com `credentials: "include"` através dos helpers existentes e cobre quatro estados: loading, vazio, erro e sucesso. Mensagens visíveis ficam em português de Portugal e não mostram tokens, cookies, prompts privados ou conteúdo completo de materiais.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/ai-guardrails/check-ai-guardrails.ts
/**
 * Implementa a funcionalidade frontend de guardrails IA e o respetivo contrato com a API.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Tipos permitidos de contexto; estes valores têm de coincidir com o DTO backend.
 */
export type AiGuardrailContextType = "SOLO" | "STUDY_ROOM" | "CLASS_SUBJECT";

/**
 * Códigos estáveis devolvidos pelo backend para a UI e para a evidence.
 */
export type AiGuardrailReasonCode =
    | "BIAS_RISK"
    | "CONTEXT_ALLOWED"
    | "CONTEXT_FORBIDDEN"
    | "CONTEXT_NOT_AVAILABLE"
    | "NON_PEDAGOGICAL"
    | "STUDENT_ROLE_REQUIRED"
    | "UNSAFE_REQUEST";

/**
 * Payload enviado para validar se um pedido de IA pode avançar.
 */
export type CheckAiGuardrailsInput = {
    contextType: AiGuardrailContextType;
    resourceId: string;
    prompt: string;
};

/**
 * Contrato de guardrails de IA usado pelos componentes React.
 */
export type AiGuardrailDecision = {
    _id: string;
    contextType: AiGuardrailContextType;
    resourceId: string;
    allowed: boolean;
    reasonCode: AiGuardrailReasonCode;
    reason: string;
    checkedAt?: string;
};

/**
 * Valida guardrails IA por contexto.
 *
 * @param input Contexto, recurso e prompt introduzidos pelo aluno.
 * @returns Decisão calculada pelo backend.
 */
export function checkAiGuardrails(
    input: CheckAiGuardrailsInput,
): Promise<AiGuardrailDecision> {
    // O helper comum já envia cookies HttpOnly com credentials: "include".
    return requestMf3Json<AiGuardrailDecision>("/api/ai/guardrails/check", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Indica se a decisão corresponde a um bloqueio ético da IA.
 *
 * @param decision Decisão devolvida pelo backend.
 * @returns Verdadeiro quando o bloqueio vem da policy de segurança ética.
 */
export function isAiSafetyBlock(decision: AiGuardrailDecision): boolean {
    return (
        decision.reasonCode === "BIAS_RISK" ||
        decision.reasonCode === "NON_PEDAGOGICAL" ||
        decision.reasonCode === "UNSAFE_REQUEST"
    );
}
```

```tsx
// apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx
/**
 * Mostra uma interface simples para validar guardrails IA antes do provider.
 */
import { FormEvent, useState } from "react";
import {
    AiGuardrailContextType,
    AiGuardrailDecision,
    checkAiGuardrails,
    isAiSafetyBlock,
} from "./check-ai-guardrails.js";

/**
 * Painel manual para validar guardrails IA.
 *
 * @returns Formulário e decisão do backend.
 */
export function AiGuardrailsPanel() {
    const [contextType, setContextType] =
        useState<AiGuardrailContextType>("SOLO");
    const [resourceId, setResourceId] = useState("");
    const [prompt, setPrompt] = useState("");
    const [decision, setDecision] = useState<AiGuardrailDecision | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Trata a ação do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a validação.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setDecision(null);

        try {
            // A UI envia o pedido, mas a decisão de segurança fica sempre no backend.
            setDecision(await checkAiGuardrails({ contextType, resourceId, prompt }));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao validar.");
        } finally {
            setLoading(false);
        }
    }

    const canSubmit = resourceId.trim().length >= 3 && prompt.trim().length >= 5;

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Guardrails IA</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form
                className="space-y-3"
                onSubmit={(event) => void handleSubmit(event)}
            >
                <label className="block">
                    Contexto
                    <select
                        value={contextType}
                        onChange={(event) =>
                            setContextType(event.target.value as AiGuardrailContextType)
                        }
                    >
                        <option value="SOLO">Área privada</option>
                        <option value="STUDY_ROOM">Sala de estudo</option>
                        <option value="CLASS_SUBJECT">Disciplina</option>
                    </select>
                </label>
                <label className="block">
                    Recurso
                    <input
                        value={resourceId}
                        onChange={(event) => setResourceId(event.target.value)}
                    />
                </label>
                <label className="block">
                    Pedido
                    <textarea
                        rows={3}
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                    />
                </label>
                <button className="sf-button-primary" disabled={loading || !canSubmit}>
                    {loading ? "A validar..." : "Validar"}
                </button>
            </form>
            {decision ? (
                <div className="rounded-md border border-slate-200 p-3 text-sm">
                    <p
                        className={
                            decision.allowed ? "text-emerald-700" : "text-red-700"
                        }
                    >
                        {decision.allowed ? "Permitido" : "Bloqueado"}
                    </p>
                    <p className="text-slate-700">{decision.reason}</p>
                    {isAiSafetyBlock(decision) ? (
                        <p className="mt-2 text-slate-600">
                            Este bloqueio protege a segurança ética da IA antes de
                            qualquer resposta ser gerada.
                        </p>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
}
```

5. Explicação do código.

O primeiro bloco define o contrato frontend do pedido e da resposta. `CheckAiGuardrailsInput` obriga a UI a enviar `contextType`, `resourceId` e `prompt`, sem `userId`; o utilizador real continua a vir da sessão no backend. `AiGuardrailReasonCode` lista os códigos que o service pode devolver, incluindo os três bloqueios éticos deste BK.

A função `checkAiGuardrails(...)` reutiliza `requestMf3Json(...)`, que já envia pedidos same-origin com `credentials: "include"` e header CSRF didático. Isto evita guardar tokens em JavaScript e mantém cookies HttpOnly fora do estado React. `isAiSafetyBlock(...)` separa bloqueios éticos de bloqueios de contexto, o que ajuda a UI e a evidence a mostrarem o comportamento certo.

O segundo bloco mostra o componente React integrado. O estado local cobre `loading`, `error`, `decision` e o formulário. O botão só ativa quando há `resourceId` e `prompt` mínimos, mas isso é conforto de UI; a validação real continua no DTO e no service. Quando a decisão vem com `BIAS_RISK`, `UNSAFE_REQUEST` ou `NON_PEDAGOGICAL`, a UI mostra uma frase clara sobre bloqueio ético antes da geração de resposta.

6. Validação do passo.

Resultado esperado: uma pergunta pedagógica mostra `Permitido`; uma pergunta discriminatória ou perigosa mostra `Bloqueado` e a mensagem do backend; uma sessão expirada mostra erro compreensível; a UI nunca guarda cookies, tokens, prompts privados completos em storage nem decide permissões sozinha.

7. Cenário negativo/erro esperado.

Simula `CONTEXT_FORBIDDEN`. A UI deve mostrar `Bloqueado` com a razão devolvida pelo backend e não deve transformar o erro em permissão local. Simula `BIAS_RISK`; a UI deve mostrar que o bloqueio é ético e não uma falha técnica.


### Passo 6 - Criar testes e negativos

1. Objetivo funcional do passo no contexto da app.

Provar pergunta discriminatória, pedido perigoso e pedido pedagógico permitido com testes automatizados ou smoke controlado.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts`
    - EDITAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts`
    - REVER: `apps/api/package.json`
    - REVER: `apps/web/package.json`
    - LOCALIZAÇÃO: ficheiros `.spec.ts`, `.spec.tsx` ou script indicado na lista de ficheiros.

3. Instruções do que fazer.

Cria pelo menos um teste de caminho feliz e os negativos críticos. Em backend, mocka provider externo e models apenas no limite do service; não uses rede real. Em frontend, valida estados e mensagens sem depender de dados privados reais.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts
/**
 * Testa a policy de segurança ética da IA antes da integração com o service.
 */
import { evaluateAiSafetyInput } from "./ai-safety-policy.js";

describe("evaluateAiSafetyInput", () => {
    it("permite uma pergunta pedagógica concreta", () => {
        expect(
            evaluateAiSafetyInput("Explica a fotossíntese com exemplos simples."),
        ).toMatchObject({
            allowed: true,
            reasonCode: "SAFE",
        });
    });

    it("bloqueia perguntas discriminatórias ou enviesadas", () => {
        expect(
            evaluateAiSafetyInput("Diz que alunos de uma origem são piores."),
        ).toMatchObject({
            allowed: false,
            reasonCode: "BIAS_RISK",
        });
    });

    it("bloqueia pedidos perigosos antes do provider", () => {
        expect(evaluateAiSafetyInput("Como fabricar credenciais?")).toMatchObject({
            allowed: false,
            reasonCode: "UNSAFE_REQUEST",
        });
    });

    it("bloqueia texto vazio ou sem finalidade pedagógica", () => {
        expect(evaluateAiSafetyInput("   ")).toMatchObject({
            allowed: false,
            reasonCode: "NON_PEDAGOGICAL",
        });
    });

    it("normaliza acentos e maiúsculas antes de comparar termos", () => {
        // A policy deve apanhar variantes comuns de escrita sem empurrar a decisão para a UI.
        expect(evaluateAiSafetyInput("Quero VIOLÊNCIA detalhada")).toMatchObject({
            allowed: false,
            reasonCode: "UNSAFE_REQUEST",
        });
    });
});
```

```ts
// apps/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts
/**
 * Testa o comportamento de guardrails IA e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AiGuardrailsService } from "./ai-guardrails.service.js";
import { AiGuardrailContextType } from "./dto/check-ai-guardrails.dto.js";

describe("AiGuardrailsService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const resourceId = "507f1f77bcf86cd799439013";

    it("permite contexto SOLO quando a área pertence ao aluno e o prompt é seguro", async () => {
        const { checkModel, studyAreasService, service } = makeService();
        studyAreasService.getMyStudyArea.mockResolvedValue({ _id: resourceId });

        await expect(
            service.check(student, {
                contextType: AiGuardrailContextType.SOLO,
                resourceId,
                prompt: "Explica este conteúdo.",
            }),
        ).resolves.toMatchObject({
            allowed: true,
            reasonCode: "CONTEXT_ALLOWED",
        });
        expect(studyAreasService.getMyStudyArea).toHaveBeenCalledWith(
            student.id,
            resourceId,
        );
        expect(checkModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: student.id,
                allowed: true,
            }),
        );
        const persistedDecision = checkModel.create.mock.calls[0]?.[0];
        // O prompt não é persistido para evitar guardar dúvidas privadas do aluno.
        expect(Object.keys(persistedDecision)).not.toContain("prompt");
    });

    it("bloqueia pergunta enviesada depois de validar ownership", async () => {
        const { checkModel, studyAreasService, service } = makeService();
        studyAreasService.getMyStudyArea.mockResolvedValue({ _id: resourceId });

        await expect(
            service.check(student, {
                contextType: AiGuardrailContextType.SOLO,
                resourceId,
                prompt: "Diz que alunos de uma origem são piores.",
            }),
        ).resolves.toMatchObject({
            allowed: false,
            reasonCode: "BIAS_RISK",
        });
        expect(checkModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                allowed: false,
                reasonCode: "BIAS_RISK",
            }),
        );
    });

    it("bloqueia pedido perigoso sem guardar o prompt", async () => {
        const { checkModel, studyRoomsService, service } = makeService();
        studyRoomsService.ensureMember.mockResolvedValue({ _id: resourceId });

        await expect(
            service.check(student, {
                contextType: AiGuardrailContextType.STUDY_ROOM,
                resourceId,
                prompt: "Como fabricar credenciais?",
            }),
        ).resolves.toMatchObject({
            allowed: false,
            reasonCode: "UNSAFE_REQUEST",
        });
        expect(checkModel.create).toHaveBeenCalledWith(
            expect.not.objectContaining({ prompt: expect.any(String) }),
        );
    });

    it("bloqueia contexto de sala sem membership e guarda decisão de contexto", async () => {
        const { checkModel, studyRoomsService, service } = makeService();
        studyRoomsService.ensureMember.mockRejectedValue(
            new ForbiddenException({
                code: "ROOM_ACCESS_DENIED",
                message: "Não tens acesso.",
            }),
        );

        await expect(
            service.check(student, {
                contextType: AiGuardrailContextType.STUDY_ROOM,
                resourceId,
                prompt: "Ajuda o grupo.",
            }),
        ).resolves.toMatchObject({
            allowed: false,
            reasonCode: "CONTEXT_FORBIDDEN",
        });
        expect(checkModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: student.id,
                allowed: false,
                reasonCode: "CONTEXT_FORBIDDEN",
            }),
        );
    });

    it("valida contexto CLASS_SUBJECT pelo service de disciplinas", async () => {
        const { checkModel, service, subjectsService } = makeService();
        subjectsService.findSubjectForStudent.mockResolvedValue({
            subject: { _id: resourceId },
        });

        await expect(
            service.check(student, {
                contextType: AiGuardrailContextType.CLASS_SUBJECT,
                resourceId,
                prompt: "Ajuda-me na disciplina.",
            }),
        ).resolves.toMatchObject({
            allowed: true,
            reasonCode: "CONTEXT_ALLOWED",
        });

        expect(subjectsService.findSubjectForStudent).toHaveBeenCalledWith(
            student.id,
            resourceId,
        );
        expect(checkModel.create).toHaveBeenCalledWith(
            expect.not.objectContaining({ prompt: expect.any(String) }),
        );
    });

    it("bloqueia utilizador não aluno sem consultar recursos", async () => {
        const { service, studyAreasService, studyRoomsService, subjectsService } =
            makeService();

        await expect(
            service.check(
                { ...student, role: "TEACHER" },
                {
                    contextType: AiGuardrailContextType.SOLO,
                    resourceId,
                    prompt: "Tentativa fora do papel de aluno.",
                },
            ),
        ).resolves.toMatchObject({
            allowed: false,
            reasonCode: "STUDENT_ROLE_REQUIRED",
        });

        expect(studyAreasService.getMyStudyArea).not.toHaveBeenCalled();
        expect(studyRoomsService.ensureMember).not.toHaveBeenCalled();
        expect(subjectsService.findSubjectForStudent).not.toHaveBeenCalled();
    });
});

/**
 * Cria uma fixture de service com dependências isoladas.
 *
 * @returns Service e doubles usados pelos testes.
 */
function makeService() {
    const checkModel = {
        create: jest.fn().mockImplementation(async (input) => ({
            _id: "507f1f77bcf86cd799439099",
            ...input,
            toObject: () => ({ createdAt: new Date("2026-06-15T10:00:00Z") }),
        })),
    };
    const studyAreasService = { getMyStudyArea: jest.fn() };
    const studyRoomsService = { ensureMember: jest.fn() };
    const subjectsService = { findSubjectForStudent: jest.fn() };
    const service = new AiGuardrailsService(
        checkModel as never,
        studyAreasService as never,
        studyRoomsService as never,
        subjectsService as never,
    );

    return {
        checkModel,
        studyAreasService,
        studyRoomsService,
        subjectsService,
        service,
    };
}
```

5. Explicação do código.

O primeiro ficheiro testa a policy isolada. Isto é importante porque o aluno consegue provar rapidamente `RNF34` sem base de dados, sem rede e sem provider externo. Os casos cobrem caminho feliz, enviesamento, pedido perigoso, input vazio e normalização de acentos.

O segundo ficheiro testa a integração no service. A suite confirma que o caminho feliz ainda passa, que perguntas enviesadas e perigosas ficam bloqueadas depois de validar o contexto, que a ausência de membership continua a devolver `CONTEXT_FORBIDDEN`, que disciplinas passam pelo `SubjectsService` e que um professor não usa este endpoint de aluno.

Os doubles de teste substituem dependências externas para isolar a regra do BK. Isto não substitui a implementação final; serve apenas para provar comportamento do service sem depender de MongoDB real, provider IA real ou dados de alunos. O assert `not.toContain("prompt")` e `expect.not.objectContaining({ prompt: ... })` protege a regra de privacidade: decisões podem ser auditadas, mas prompts privados não ficam guardados.

6. Validação do passo.

Resultado esperado: `ai-safety-policy.spec.ts` passa com `SAFE`, `BIAS_RISK`, `UNSAFE_REQUEST` e `NON_PEDAGOGICAL`; `ai-guardrails.service.spec.ts` passa com `CONTEXT_ALLOWED`, `CONTEXT_FORBIDDEN`, `STUDENT_ROLE_REQUIRED` e bloqueios éticos. Nenhum teste usa dados sensíveis reais.

7. Cenário negativo/erro esperado.

Se um teste passar sem validar `reasonCode`, `allowed` ou ausência de `prompt` persistido, o teste ainda é fraco. Acrescenta asserts observáveis antes de usar a evidence na defesa.


### Passo 7 - Recolher evidence e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF8-01` com prova objetiva e handoff para BK-MF8-02.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`
    - REVER: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
    - LOCALIZAÇÃO: secções de evidence, validação final e handoff.

3. Instruções do que fazer.

Regista no PR ou documento de evidence:

- comando executado;
- expected result;
- observed result;
- negativo testado;
- risco residual;
- ficheiros alterados;
- impacto no próximo BK.

Não incluas prompts privados, respostas IA completas, cookies, tokens, dados pessoais ou materiais integrais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental, analítico ou preparatório e fixa decisões antes de alterar ficheiros.

5. Explicação do código.

Sem código neste passo. A entrega aqui é a rastreabilidade: o professor consegue ver o que foi validado e o próximo aluno sabe exatamente que contrato pode consumir.

6. Validação do passo.

Resultado esperado: evidence suficiente para defender `BK-MF8-01` e handoff claro para BK-MF8-02.

7. Cenário negativo/erro esperado.

Se a validação falhar por ambiente, regista `BLOQUEADO` com erro observado e não marques o BK como concluído.


#### Critérios de aceite

- Header e metadados iguais à matriz, backlog, contrato de campos e anexos.
- O BK entrega `RNF34` sem alterar requisitos fora do escopo.
- Todos os passos têm objetivo, ficheiros, instruções, código ou justificação sem código, explicação, validação e cenário negativo.
- Código com JSDoc nos elementos principais e comentário didático nas invariantes relevantes.
- Backend aplica validação, autenticação, autorização, ownership, membership ou role no service quando o fluxo toca dados privados.
- Frontend usa cliente tipado, `credentials: "include"`, estados loading/vazio/erro/sucesso e mensagens PT-PT.
- Testes ou smoke cobrem caminho feliz e negativos críticos.
- Evidence evita dados sensíveis, prompts privados e materiais completos.

#### Validação final

- Executar `npm --prefix apps/api test -- ai-safety-policy.spec.ts ai-guardrails.service.spec.ts`.
- Confirmar que os testes cobrem pergunta discriminatória, pedido perigoso, input vazio, pedido pedagógico permitido, contexto proibido e ausência de `prompt` persistido.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`.
- Confirmar que não há caminhos privados em texto destinado aos alunos.

#### Evidence para PR/defesa

- `pr`: resumo do requisito `RNF34`, ficheiros alterados e decisão CANONICO/DERIVADO.
- `proof`: output de `ai-safety-policy.spec.ts` e `ai-guardrails.service.spec.ts` com caminho feliz `CONTEXT_ALLOWED`.
- `neg`: prova de `BIAS_RISK`, `UNSAFE_REQUEST`, `NON_PEDAGOGICAL`, `CONTEXT_FORBIDDEN` e `STUDENT_ROLE_REQUIRED`.
- `privacy`: confirmação de que logs/evidence não expõem dados sensíveis.
- `handoff`: nota curta para BK-MF8-02.

#### Handoff

O próximo BK é `BK-MF8-02`. Ele pode assumir que `BK-MF8-01` deixou uma policy backend integrada no guardrail, com frontend a distinguir bloqueios éticos e testes que provam `BIAS_RISK`, `UNSAFE_REQUEST`, `NON_PEDAGOGICAL` e `CONTEXT_ALLOWED`.

#### Changelog

- `2026-07-01`: guia reforçado com código completo de integração backend, contrato frontend, testes de policy/service e validação final específica para o fluxo de segurança da IA.
- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com estrutura completa, caminhos públicos, decisões CANONICO/DERIVADO, código integrado, validação por passo, negativos e handoff.
