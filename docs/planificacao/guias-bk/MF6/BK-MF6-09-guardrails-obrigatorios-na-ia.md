# BK-MF6-09 - Guardrails obrigatórios na IA.

## Header

- `doc_id`: `GUIA-BK-MF6-09`
- `bk_id`: `BK-MF6-09`
- `macro`: `MF6`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF19`
- `fase_documental`: `Fase 3`
- `sprint`: `S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-10`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais consolidar os guardrails obrigatórios da IA sem criar um sistema paralelo ao que a aplicação já tem.

No fim, `GovernedAiExecutionService` é a única fachada de execução. A ordem obrigatória é: autorização, consentimento, policy/finalidade, limites, guardrails, reserva atómica de quota, provider, validação de output e audit seguro. Nenhum fluxo de produção injeta ou exporta o token do provider.

`ROOM_AI` é uma finalidade explícita, começa desativada e não recebe consentimentos automáticos. Erros de consentimento, finalidade desativada, quota e timeout têm códigos estáveis; nos negativos o teste prova que a chamada externa não aconteceu.

#### Importância

`RNF19` é CANONICO em `docs/RNF.md`: a IA precisa de guardrails obrigatórios. Isto é crítico porque a aplicação já tem IA privada, IA de sala, IA de turma/disciplina, fontes processáveis, materiais privados e materiais oficiais.

Um guardrail não é uma decoração no frontend. É uma barreira backend que impede a chamada ao provider quando o contexto é proibido, quando não há fontes suficientes, quando falta consentimento ou quando a política administrativa não permite a operação.

Este BK prepara `BK-MF6-10`: primeiro confirmas que existe uma fronteira de IA central e testável; no próximo BK vais reforçar que essa fronteira também impede mistura entre alunos, salas, turmas e disciplinas.

#### Scope-in

- Reutilizar `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`.
- Confirmar que `POST /api/ai/guardrails/check` continua protegido por `SessionGuard`.
- Guardar decisões de guardrail sem guardar o prompt do aluno.
- Reforçar os testes de `SOLO`, `STUDY_ROOM`, `CLASS_SUBJECT`, role inválida e ausência de prompt persistido.
- Rever os fluxos reais de IA antes do provider: IA privada, IA da sala, IA da turma/disciplina e IA com fontes.
- Criar teste arquitetural que falha perante qualquer injeção direta do provider fora da fachada.
- Preservar os caminhos públicos dos alunos em `apps/api` e `apps/web`.

#### Scope-out

- Criar outro endpoint de guardrails.
- Criar um service paralelo como `AiGuardrailPolicyService`.
- Implementar RAG, embeddings, OCR, indexação semântica ou automação não prevista nesta fase.
- Mover ownership, membership, consentimento ou autorização para o frontend.
- Guardar prompts privados, respostas IA privadas, cookies, tokens, hashes ou materiais sensíveis em logs ou evidence.
- Resolver a observabilidade completa de MF7.

#### Estado antes e depois

- Estado antes: MF3 já criou guardrails por contexto e MF4/MF5 acrescentaram governação, quotas, UX e performance, mas este guia ainda precisava de consolidar o contrato sem duplicar services.
- Estado depois: o aluno sabe que deve fortalecer `AiGuardrailsService`, confirmar os fluxos reais antes do provider e provar negativos de contexto, role e privacidade.

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
- `docs/planificacao/guias-bk/MF6/BK-MF6-08-processamento-de-documentos-em-sandbox-seguro.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`

#### Glossário

- **Guardrail:** regra backend que decide se uma chamada de IA pode avançar.
- **Contexto IA:** espaço onde a IA trabalha: área privada, sala/grupo ou disciplina/turma.
- **Provider IA:** integração isolada que gera a resposta; só deve ser chamado depois das validações.
- **Fonte processável:** material ou excerto validado que pode sustentar uma resposta IA.
- **Consentimento IA:** autorização do aluno para usar funcionalidades de IA quando o fluxo exige esse consentimento.
- **Política de modelo:** configuração administrativa que define modelo, timeout e limites de fontes.
- **Quota:** limite de utilização de IA por aluno, turma, grupo ou finalidade.
- **Fallback honesto:** erro controlado que assume a falha em vez de inventar resposta.
- **Evidence:** prova objetiva para PR e defesa PAP, sem dados sensíveis.

#### Conceitos teóricos essenciais

- **Guardrail de contexto:** valida se o utilizador autenticado pode usar uma área, sala ou disciplina. Vem do pedido autenticado, passa pelos services de domínio e evita que o frontend escolha permissões.
- **Guardrail de fontes:** bloqueia IA sem materiais processáveis. Vem dos materiais indexados ou partilhados, entra no prompt como excerto autorizado e evita alucinação factual.
- **Guardrail de consentimento:** confirma se o aluno autorizou IA para aquela finalidade. Vem do módulo de consentimentos e evita uso de IA sem base de governação.
- **Guardrail de política e quota:** limita modelo, timeout, número de fontes e consumo. Vem da configuração administrativa e evita uso descontrolado do provider.
- **Endpoint protegido:** `POST /api/ai/guardrails/check` só existe atrás de sessão. O frontend pode pedir validação, mas a decisão nasce no backend.
- **Persistência mínima:** a decisão guarda contexto, recurso, resultado e razão estável. O prompt completo não é persistido porque pode conter dados pessoais ou material privado.
- **Teste negativo:** prova que a barreira falha de forma controlada. Neste BK, os negativos principais são role inválida, sala sem membership e ausência de prompt persistido.

#### Arquitetura do BK

- Endpoint: `POST /api/ai/guardrails/check`.
- Controller: `apps/api/src/modules/ai-guardrails/ai-guardrails.controller.ts`.
- DTO: `apps/api/src/modules/ai-guardrails/dto/check-ai-guardrails.dto.ts`.
- Schema: `apps/api/src/modules/ai-guardrails/schemas/ai-guardrail-check.schema.ts`.
- Service principal: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`.
- Module: `apps/api/src/modules/ai-guardrails/ai-guardrails.module.ts`.
- Fluxos a rever antes do provider:
  - `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
  - `apps/api/src/modules/study-rooms/room-ai.service.ts`
  - `apps/api/src/modules/class-ai/class-ai.service.ts`
  - `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- Teste: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts`.
- Handoff: `BK-MF6-10` reutiliza a mesma fronteira para provar isolamento de dados.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
- EDITAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts`
- REVER: `apps/api/src/modules/ai-guardrails/ai-guardrails.controller.ts`
- REVER: `apps/api/src/modules/ai-guardrails/ai-guardrails.module.ts`
- REVER: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
- REVER: `apps/api/src/modules/study-rooms/room-ai.service.ts`
- REVER: `apps/api/src/modules/class-ai/class-ai.service.ts`
- REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK entrega `RNF19` sem alterar metadados canónicos nem criar um segundo sistema de guardrails.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - LOCALIZAÇÃO: linhas de `RNF19` e linha canónica de `BK-MF6-09`.

3. Instruções do que fazer.

Confirma que `RNF19` é "Guardrails obrigatórios na IA", que o BK é `P0`, `S09`, `Reforco`, e que o próximo BK é `BK-MF6-10`.

Marca como `CANONICO` o requisito e como `DERIVADO` a decisão técnica de reutilizar `AiGuardrailsService` em vez de criar `AiGuardrailPolicyService`. Esta decisão é derivada porque evita duplicação e preserva o endpoint já existente.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e fixa as fronteiras antes de editar código.

5. Explicação do código.

Não há código porque o objetivo é impedir drift: se mudares owner, sprint, endpoint ou service principal sem contrato, o aluno deixa de conseguir seguir a sequência da MF.

6. Validação do passo.

Confirma no header que continuam estes valores: `RNF19`, `P0`, `S09`, `Reforco`, `BK-MF6-10`.

7. Cenário negativo/erro esperado.

Se encontrares uma instrução para criar outro endpoint de guardrails com a mesma responsabilidade, rejeita essa duplicação e mantém `POST /api/ai/guardrails/check`.

### Passo 2 - Mapear guardrails antes de tocar no código

1. Objetivo funcional do passo no contexto da app.

Identificar que guardrails já existem e que fluxos de IA precisam de revisão antes do provider.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
    - REVER: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
    - REVER: `apps/api/src/modules/study-rooms/room-ai.service.ts`
    - REVER: `apps/api/src/modules/class-ai/class-ai.service.ts`
    - REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
    - LOCALIZAÇÃO: classes completas e método principal de cada service.

3. Instruções do que fazer.

Monta este mapa antes de editar:

- IA privada: `studyAreasService.getMyStudyArea`, `materialsService.listReadyTextSources`, consentimento, política, quota, provider.
- IA da sala: `studyRoomsService.ensureMember`, `roomSharesService.findUsableSharesForRoom`, fontes, provider.
- IA da disciplina: `subjectsService.findSubjectForStudent`, materiais oficiais processados, voz docente, consentimento, política, quota, provider.
- IA com fontes: `materialIndexService.findReadableDoneJob`, citações, provider.
- Endpoint de guardrails: `AiGuardrailsService.check` valida `SOLO`, `STUDY_ROOM` e `CLASS_SUBJECT`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de leitura técnica e evita que cries ficheiros duplicados.

5. Explicação do código.

Não há código porque a regra importante aqui é reconhecer contratos existentes. O erro que este passo evita é criar um novo service que compete com `AiGuardrailsService` e deixa a aplicação com duas fontes de verdade.

6. Validação do passo.

Confirma que `AiGuardrailsModule` exporta `AiGuardrailsService` e que `AiGuardrailsController` está protegido por `SessionGuard`.

7. Cenário negativo/erro esperado.

Se um fluxo chamar `aiProvider` antes de validar contexto, fontes ou consentimento quando exigido, esse fluxo não está pronto para defesa.

### Passo 3 - Consolidar o service de guardrails existente

1. Objetivo funcional do passo no contexto da app.

Manter uma única classe responsável pela decisão de guardrail de contexto e garantir que a decisão não guarda o prompt privado.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Substitui o ficheiro pelo código abaixo. Não cries `AiGuardrailPolicyService`: o contrato público já é `AiGuardrailsService`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts
/**
 * Implementa as regras de negócio de guardrails de IA e concentra validações do domínio.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
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
 * Decisão pública devolvida ao frontend depois de validar um contexto IA.
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
 * Valida se uma chamada IA pode avançar para um contexto StudyFlow.
 */
@Injectable()
export class AiGuardrailsService {
    /**
     * @param checkModel Modelo de decisões de guardrail.
     * @param studyAreasService Service que conhece ownership de áreas privadas.
     * @param studyRoomsService Service que conhece membership de salas.
     * @param subjectsService Service que conhece inscrição em disciplinas.
     */
    constructor(
        @InjectModel(AiGuardrailCheck.name)
        private readonly checkModel: Model<AiGuardrailCheckDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Decide se o utilizador autenticado pode usar IA no contexto pedido.
     *
     * @param actor Utilizador autenticado pela sessão HttpOnly.
     * @param input Contexto, recurso e prompt validados pelo DTO.
     * @returns Decisão persistida sem guardar o prompt.
     */
    async check(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
    ): Promise<AiGuardrailDecision> {
        if (actor.role !== "STUDENT") {
            return this.persistDecision(actor, input, false, "STUDENT_ROLE_REQUIRED");
        }

        try {
            await this.assertContextAllowed(actor, input);
            return this.persistDecision(actor, input, true, "CONTEXT_ALLOWED");
        } catch (error) {
            if (error instanceof ForbiddenException) {
                return this.persistDecision(actor, input, false, "CONTEXT_FORBIDDEN");
            }
            return this.persistDecision(actor, input, false, "CONTEXT_NOT_AVAILABLE");
        }
    }

    /**
     * Encaminha a validação para o service que conhece a regra de domínio.
     *
     * @param actor Utilizador autenticado.
     * @param input Pedido de guardrail.
     */
    private async assertContextAllowed(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
    ): Promise<void> {
        if (input.contextType === AiGuardrailContextType.SOLO) {
            // O ID do aluno vem da sessão para impedir ownership escolhido pelo frontend.
            await this.studyAreasService.getMyStudyArea(actor.id, input.resourceId);
            return;
        }

        if (input.contextType === AiGuardrailContextType.STUDY_ROOM) {
            // A sala só pode alimentar IA depois de confirmar membership no backend.
            await this.studyRoomsService.ensureMember(actor.id, input.resourceId);
            return;
        }

        // A IA da disciplina só avança se o aluno estiver inscrito na disciplina/turma.
        await this.subjectsService.findSubjectForStudent(actor.id, input.resourceId);
    }

    /**
     * Persiste a decisão sem guardar prompt, resposta IA ou excertos de materiais.
     *
     * @param actor Utilizador autenticado.
     * @param input Pedido validado.
     * @param allowed Resultado da decisão.
     * @param reasonCode Código estável para UI e testes.
     * @returns Decisão pública sem dados sensíveis.
     */
    private async persistDecision(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
        allowed: boolean,
        reasonCode: string,
    ): Promise<AiGuardrailDecision> {
        const reason = this.reasonFor(reasonCode);
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
            CONTEXT_ALLOWED: "O contexto foi validado e a IA pode avançar.",
            CONTEXT_FORBIDDEN:
                "O pedido foi bloqueado porque não tens acesso a este contexto.",
            CONTEXT_NOT_AVAILABLE:
                "O pedido foi bloqueado porque o contexto não está disponível.",
            STUDENT_ROLE_REQUIRED:
                "Este guardrail só valida pedidos IA feitos por alunos.",
        };
        return reasons[code] ?? "O pedido foi bloqueado por regra de segurança.";
    }
}
```

5. Explicação do código.

Este ficheiro concentra a decisão de contexto. O `actor.id` vem sempre da sessão autenticada, por isso o frontend não consegue dizer "sou outro aluno". Para `SOLO`, o service de áreas valida ownership. Para `STUDY_ROOM`, o service de salas valida membership. Para `CLASS_SUBJECT`, o service de disciplinas valida inscrição. A persistência não inclui o prompt porque esse texto pode conter dados pessoais, excertos de materiais ou perguntas privadas do aluno.

O código cumpre `RNF19` porque coloca a validação antes de qualquer uso de IA. Também prepara `BK-MF6-10`, pois a mesma fronteira será usada para provar que a IA não mistura dados entre contextos.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit -- ai-guardrails` ou a suite unitária completa do backend. O resultado esperado é que os testes de contexto passem e que nenhuma decisão persistida contenha `prompt`.

7. Cenário negativo/erro esperado.

Tenta validar uma sala onde o aluno não é membro. O resultado esperado é `allowed: false` e `reasonCode: "CONTEXT_FORBIDDEN"`, sem expor detalhes da sala.

### Passo 4 - Confirmar controller e module sem criar endpoint duplicado

1. Objetivo funcional do passo no contexto da app.

Garantir que o service do passo anterior está acessível por um endpoint protegido e exportado para outros módulos.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/ai-guardrails/ai-guardrails.controller.ts`
    - REVER: `apps/api/src/modules/ai-guardrails/ai-guardrails.module.ts`
    - LOCALIZAÇÃO: ficheiros completos.

3. Instruções do que fazer.

Confirma que estes ficheiros ficam com o contrato abaixo. Não cries outra rota para a mesma validação.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-guardrails/ai-guardrails.controller.ts
/**
 * Expõe os endpoints HTTP de guardrails IA e delega regras de negócio para o service.
 */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiGuardrailsService } from "./ai-guardrails.service.js";
import { CheckAiGuardrailsDto } from "./dto/check-ai-guardrails.dto.js";

/**
 * Endpoint de validação de guardrails antes de pedidos IA.
 */
@Controller("api/ai/guardrails")
@UseGuards(SessionGuard)
export class AiGuardrailsController {
    /**
     * @param guardrailsService Service que valida contexto no backend.
     */
    constructor(private readonly guardrailsService: AiGuardrailsService) {}

    /**
     * Verifica se o contexto informado é seguro para uso de IA.
     *
     * @param request Pedido autenticado por cookie.
     * @param body Dados validados pelo DTO.
     * @returns Decisão de guardrail persistida.
     */
    @Post("check")
    check(
        @Req() request: AuthenticatedRequest,
        @Body() body: CheckAiGuardrailsDto,
    ) {
        // O utilizador vem da sessão; o body nunca decide identidade.
        return this.guardrailsService.check(request.user!, body);
    }
}
```

```ts
// apps/api/src/modules/ai-guardrails/ai-guardrails.module.ts
/**
 * Regista providers, controllers e schemas necessários ao módulo de guardrails IA.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { StudyRoomsModule } from "../study-rooms/study-rooms.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { AiGuardrailsController } from "./ai-guardrails.controller.js";
import { AiGuardrailsService } from "./ai-guardrails.service.js";
import {
    AiGuardrailCheck,
    AiGuardrailCheckSchema,
} from "./schemas/ai-guardrail-check.schema.js";

/**
 * Módulo que centraliza guardrails IA por contexto.
 */
@Module({
    imports: [
        AuthModule,
        StudyAreasModule,
        StudyRoomsModule,
        SubjectsModule,
        MongooseModule.forFeature([
            { name: AiGuardrailCheck.name, schema: AiGuardrailCheckSchema },
        ]),
    ],
    controllers: [AiGuardrailsController],
    providers: [AiGuardrailsService],
    exports: [AiGuardrailsService],
})
export class AiGuardrailsModule {}
```

5. Explicação do código.

O controller cria a fronteira HTTP e obriga `SessionGuard`. O module injeta os services de domínio necessários para validar área, sala e disciplina. O export de `AiGuardrailsService` permite reutilização futura sem novo endpoint. Isto evita duplicação e mantém um único contrato de guardrails.

6. Validação do passo.

Confirma que existe apenas `POST /api/ai/guardrails/check` para esta decisão e que o controller não recebe `userId` no body.

7. Cenário negativo/erro esperado.

Se um pedido não tiver sessão válida, o `SessionGuard` deve bloquear antes de chegar ao service.

### Passo 5 - Rever os fluxos IA antes do provider

1. Objetivo funcional do passo no contexto da app.

Confirmar que os guardrails obrigatórios também existem nos services que chamam o provider IA.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
    - REVER: `apps/api/src/modules/study-rooms/room-ai.service.ts`
    - REVER: `apps/api/src/modules/class-ai/class-ai.service.ts`
    - REVER: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
    - LOCALIZAÇÃO: método principal que chama o provider em cada service.

3. Instruções do que fazer.

Confirma estes pontos antes de considerar `RNF19` cumprido:

- IA privada valida role `STUDENT`, ownership da área, fontes prontas, consentimento, política, limite de prompt, quota e resposta com fontes autorizadas.
- IA da sala valida membership, fontes partilhadas utilizáveis e resposta com IDs de fontes da sala.
- IA da disciplina valida inscrição na disciplina, materiais oficiais processados, consentimento, política, limite de prompt, quota e resposta com materiais oficiais autorizados.
- IA com fontes valida cada `sourceJobId` com `findReadableDoneJob`, exige citações e chama provider apenas com excertos autorizados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Estes services já pertencem a BKs anteriores; neste BK vais rever a ordem das validações e só editar se encontrares chamada ao provider antes das barreiras.

5. Explicação do código.

Não há código novo porque o objetivo é confirmar a sequência. Um guardrail de contexto sozinho não chega: a proteção real nasce da soma entre contexto autorizado, fontes suficientes, consentimento, política, quota e validação da resposta.

6. Validação do passo.

Procura as chamadas a `aiProvider`. Em cada service, confirma que a chamada acontece depois das validações listadas no ponto 3.

7. Cenário negativo/erro esperado.

Se a IA privada chamar o provider sem materiais processáveis, a correção está incompleta. O erro esperado deve ser controlado, por exemplo `NO_PRIVATE_AI_SOURCES`.

### Passo 6 - Reforçar testes de guardrails

1. Objetivo funcional do passo no contexto da app.

Garantir que os cenários principais e negativos ficam automatizados.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Substitui o teste pelo ficheiro abaixo. Ele cobre contexto privado, sala sem membership, disciplina autorizada, role inválida e ausência de prompt persistido.

4. Código completo, correto e integrado com a app final.

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
    const teacher: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439015",
        email: "professor@example.test",
        role: "TEACHER",
    };
    const resourceId = "507f1f77bcf86cd799439013";

    it("permite contexto SOLO quando a área pertence ao aluno", async () => {
        const { checkModel, service, studyAreasService } = makeService();
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

        // A decisão persiste a razão, mas nunca o prompt privado do aluno.
        const persistedDecision = checkModel.create.mock.calls[0]?.[0];
        expect(Object.keys(persistedDecision)).not.toContain("prompt");
    });

    it("bloqueia contexto de sala sem membership", async () => {
        const { checkModel, service, studyRoomsService } = makeService();
        studyRoomsService.ensureMember.mockRejectedValue(
            new ForbiddenException({
                code: "ROOM_ACCESS_DENIED",
                message: "Não tens acesso a esta sala.",
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

    it("permite contexto CLASS_SUBJECT quando o aluno está inscrito", async () => {
        const { service, subjectsService } = makeService();
        subjectsService.findSubjectForStudent.mockResolvedValue({
            subject: { _id: resourceId },
            schoolClass: { _id: "507f1f77bcf86cd799439020" },
        });

        await expect(
            service.check(student, {
                contextType: AiGuardrailContextType.CLASS_SUBJECT,
                resourceId,
                prompt: "Explica a matéria oficial.",
            }),
        ).resolves.toMatchObject({
            allowed: true,
            reasonCode: "CONTEXT_ALLOWED",
        });
        expect(subjectsService.findSubjectForStudent).toHaveBeenCalledWith(
            student.id,
            resourceId,
        );
    });

    it("bloqueia roles que não representam aluno", async () => {
        const { service, studyAreasService, studyRoomsService, subjectsService } =
            makeService();

        await expect(
            service.check(teacher, {
                contextType: AiGuardrailContextType.SOLO,
                resourceId,
                prompt: "Testa IA privada.",
            }),
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
 * Cria fixtures de guardrails IA para manter os testes focados nas regras do service.
 *
 * @returns Service e dependências controladas.
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
        service,
        studyAreasService,
        studyRoomsService,
        subjectsService,
    };
}
```

5. Explicação do código.

Os testes provam as decisões essenciais: aluno com área própria avança, sala sem membership bloqueia, disciplina inscrita avança, role errada bloqueia antes dos services de domínio, e o prompt não é gravado na decisão. Isto dá evidence objetiva para `RNF19`.

6. Validação do passo.

Executa `npm --prefix apps/api run test:unit -- ai-guardrails` ou a suite unitária completa do backend. O resultado esperado é `PASS`.

7. Cenário negativo/erro esperado.

Remove temporariamente a verificação de role e confirma que o teste "bloqueia roles que não representam aluno" falha. Depois repõe a verificação.

### Passo 7 - Fechar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Registar provas seguras e entregar a fronteira de IA para `BK-MF6-10`.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md`
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
    - LOCALIZAÇÃO: `Validação final`, `Evidence para PR/defesa`, `Handoff` e `Changelog`.

3. Instruções do que fazer.

Regista comandos, resultados e negativos sem copiar prompts privados, respostas IA, cookies, tokens, IDs reais de alunos ou excertos sensíveis.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo fecha a entrega documental e operacional.

5. Explicação do código.

Não há código porque a implementação já ficou nos passos anteriores. A evidence demonstra que a fronteira está pronta para ser consumida por `BK-MF6-10`.

6. Validação do passo.

Confirma que o guia não contém caminhos privados, que o endpoint é único e que os testes cobrem pelo menos um positivo e dois negativos.

7. Cenário negativo/erro esperado.

Se a evidence contiver prompt privado ou resposta IA privada, remove-a. Evidence deve provar comportamento, não expor dados.

#### Critérios de aceite

- `AiGuardrailsService` é o único service de decisão de guardrail de contexto.
- `POST /api/ai/guardrails/check` continua protegido por `SessionGuard`.
- O DTO não recebe `userId`; a identidade vem da sessão.
- A decisão persistida não grava prompt, resposta IA nem excertos de materiais.
- `SOLO`, `STUDY_ROOM` e `CLASS_SUBJECT` usam services de domínio.
- Os fluxos de IA reais são revistos antes do provider.
- Os testes cobrem contexto permitido, contexto proibido, role inválida e ausência de prompt persistido.

#### Validação final

- `npm --prefix apps/api run test:unit -- ai-guardrails`
- `npm --prefix apps/api run test:unit`
- `npm --prefix apps/api run build`
- Pesquisa textual para garantir que não há caminhos privados no guia.

Expected results:

- Testes de guardrails: `PASS`.
- Build backend: `PASS`.
- Pedido sem sessão para `POST /api/ai/guardrails/check`: `401`.
- Sala sem membership: decisão `allowed: false` com `reasonCode: "CONTEXT_FORBIDDEN"`.
- Role diferente de aluno: decisão `allowed: false` com `reasonCode: "STUDENT_ROLE_REQUIRED"`.

#### Evidence para PR/defesa

- `proof_testes`: output de `npm --prefix apps/api run test:unit -- ai-guardrails`.
- `proof_build`: output de `npm --prefix apps/api run build`.
- `proof_negativo_sala`: decisão bloqueada para sala sem membership.
- `proof_privacidade`: confirmação de que `AiGuardrailCheck` não guarda prompt nem resposta IA.
- `proof_handoff`: nota a explicar que `BK-MF6-10` reutiliza `AiGuardrailsService`.

#### Handoff

- Entrega para `BK-MF6-10`: existe uma fronteira única de guardrails por contexto.
- `BK-MF6-10` deve reutilizar `AiGuardrailsService` e os services de domínio; não deve criar outro service paralelo.
- A decisão `DERIVADO` deste BK é consolidar o service existente em vez de criar `AiGuardrailPolicyService`.
- `BK-MF7-09`, `BK-MF7-10` e `BK-MF7-11` podem usar esta fronteira como base para explicabilidade, perfis distintos e limites definidos pelo professor.

#### Changelog

- `2026-06-23`: guia corrigido para reutilizar `AiGuardrailsService`, remover service paralelo, cobrir controller/module/spec, rever fluxos IA reais e preparar `BK-MF6-10`.
