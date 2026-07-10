# BK-MF7-01 - Logs estruturados de eventos e erros.

## Header

- `doc_id`: `GUIA-BK-MF7-01`
- `bk_id`: `BK-MF7-01`
- `macro`: `MF7`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF23`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-02`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais transformar eventos técnicos dispersos em logs estruturados, seguros e pesquisáveis. O resultado observável é um service transversal que regista domínio, ação, resultado, correlação e metadados sem expor prompts, respostas privadas, cookies ou materiais.

No fim, a equipa consegue demonstrar `RNF23` com código, validação e evidence, sem depender de decisões escondidas nem de memória oral.

#### Importância

`RNF23` é canónico e prepara a defesa técnica: sem logs estruturados, a equipa não consegue explicar falhas, recuperar incidentes nem demonstrar comportamento controlado. Este BK consome a recuperação de `BK-MF6-12` e entrega uma base para medir disponibilidade em `BK-MF7-02`.

Este BK é incremental: consome contratos já fechados nas MFs anteriores e entrega uma peça pequena, testável e explicável para o próximo BK.

#### Scope-in

- Implementar ou documentar o contrato de observabilidade operacional.
- Usar caminhos públicos em `apps/api`, `apps/web` e `docs`.
- Validar pelo menos um caminho principal e um cenário negativo.
- Preservar autenticação, autorização, ownership, membership, quotas e guardrails já definidos quando o fluxo tocar dados privados ou IA.
- Produzir evidence com expected/observed.

#### Scope-out

- Criar requisitos novos fora de `RNF23`.
- Alterar IDs BK, owner, prioridade, sprint, esforço ou sequência canónica.
- Criar integrações externas de monitorização, LMS, Drive, OCR, embeddings ou automações avançadas sem contrato documental.
- Guardar segredos, cookies, prompts privados, respostas IA completas ou materiais privados em logs, screenshots ou documentos de evidence.
- Mover regras de segurança para o frontend.

#### Estado antes e depois

- Estado antes: MF6 deixa segurança, recuperação, guardrails e isolamento de IA preparados, mas a app ainda não tem um contrato explícito de logs estruturados com redacção de metadados sensíveis para eventos operacionais.
- Estado depois: a app passa a ter `StructuredEventService`, teste de redacção e ponto de integração com `AuditLogService.record(...)`, preparando métricas de disponibilidade para `BK-MF7-02`.

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
- `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`

#### Glossário

- **StudyFlow:** plataforma de estudo com áreas privadas, turmas, materiais e IA pedagógica.
- **Aluno autenticado:** utilizador identificado por sessão HttpOnly no backend.
- **Professor:** utilizador que gere turmas, disciplinas, materiais oficiais e limites pedagógicos.
- **Fonte processável:** texto extraído e autorizado que pode sustentar uma resposta IA.
- **Evidence:** prova objetiva de funcionamento e falha controlada, usada em PR e defesa PAP.
- **Observabilidade operacional:** foco técnico deste BK para cumprir `RNF23`.

#### Conceitos teóricos essenciais

- **Log estruturado:** registo com campos fixos, mais fácil de filtrar do que texto solto.
- **Correlação:** identificador que liga uma falha, um pedido e uma recuperação sem expor dados pessoais.
- **Redacção:** remoção de valores sensíveis antes de persistir ou imprimir eventos.
- **Erro comum a evitar:** guardar prompts, respostas de IA, cookies, passwords ou excertos de materiais nos logs.
- **Segurança no backend:** sessão, role, ownership e membership são validados por controllers/services, não por componentes visuais.
- **Privacidade e RGPD:** logs, evidence e respostas públicas devem minimizar dados pessoais e evitar conteúdo privado.
- **Teste negativo:** prova que a aplicação bloqueia input inválido, acesso indevido ou estado inseguro.

#### Arquitetura do BK

- Endpoint(s): não cria endpoint público; o log fica interno ao backend.
- Modelo/schema: não cria coleção nova; usa objeto estruturado em memória e pode ser ligado ao audit log já existente.
- Service(s): `StructuredEventService`, responsável por normalizar e redigir eventos.
- Controller/route: não cria controller.
- Guard/middleware: reutiliza `SessionGuard` quando o endpoint for privado; health e operação pública nunca expõem dados pessoais.
- Cliente API: usa clientes existentes com `credentials: 'include'` quando houver frontend autenticado.
- Segurança/autorização: redige chaves sensíveis e nunca guarda conteúdo privado de materiais ou IA.
- Testes: unitários para correlação, redacção de metadados e cenário negativo com segredo.
- Handoff para o próximo BK: `BK-MF7-02` passa a ter eventos estáveis para medir disponibilidade.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/common/observability/structured-event.service.ts`
- CRIAR: `apps/api/src/common/observability/structured-event.service.spec.ts`
- EDITAR: `apps/api/src/modules/audit-log/audit-log.module.ts`
- EDITAR: `apps/api/src/modules/audit-log/audit-log.service.ts`
- EDITAR: `apps/api/src/modules/audit-log/audit-log.service.spec.ts`
- REVER: `apps/api/src/common/reliability/retry-with-recovery.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF7-01` entrega `RNF23` sem alterar ID, owner, prioridade, sprint ou sequência.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- LOCALIZAÇÃO: linhas canónicas do requisito e da matriz.

3. Instruções do que fazer.

Lê `RNF23` em `docs/RNF.md`, confirma a linha `BK-MF7-01` na matriz e regista as decisões seguintes:
- `CANONICO`: `RNF23` exige logs estruturados de eventos e erros.
- `DERIVADO`: usar `correlationId`, `domain`, `action` e `result` como formato mínimo pesquisável.
- `DERIVADO`: redigir metadados antes de qualquer escrita externa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo fixa o contrato. A implementação só começa depois de confirmar o requisito, o domínio e o BK seguinte.

6. Validação do passo.

Resultado esperado: `BK-MF7-01` continua ligado a `RNF23`, `prioridade: P0`, `sprint: S11` e `proximo_bk: BK-MF7-02`.

7. Cenário negativo/erro esperado.

Se a matriz, backlog e guia tiverem valores diferentes, não avances; regista o drift no relatório de PR.
### Passo 2 - Mapear contratos existentes

1. Objetivo funcional do passo no contexto da app.

Localizar os ficheiros que este BK consome para não duplicar regras de observabilidade operacional.

2. Ficheiros envolvidos:
- REVER: `apps/api/src/app.module.ts`
- REVER: `apps/web/src/routes/protectedRoutes.tsx`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
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

Construir o ficheiro principal que torna `RNF23` implementável.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/observability/structured-event.service.ts`
- LOCALIZAÇÃO: ficheiro completo `apps/api/src/common/observability/structured-event.service.ts`.

3. Instruções do que fazer.

Cria o ficheiro com o código abaixo. Mantém nomes, imports e mensagens em português de Portugal. Não guardes dados sensíveis nem deixes decisões de segurança para o frontend.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/observability/structured-event.service.ts
/**
 * Normaliza eventos operacionais seguros para logs estruturados StudyFlow.
 */
import { Injectable } from "@nestjs/common";
import {
    AuditDomain,
    AuditResult,
} from "../../modules/audit-log/schemas/audit-event.schema.js";

export type StructuredEventInput = {
    correlationId: string;
    domain: AuditDomain;
    action: string;
    result: AuditResult;
    metadata?: Record<string, unknown>;
};

export type StructuredEventOutput = {
    at: string;
    correlationId: string;
    domain: AuditDomain;
    action: string;
    result: AuditResult;
    metadata: Record<string, unknown>;
};

const SENSITIVE_KEYS = ["password", "cookie", "secret", "prompt", "answer", "token"];

/**
 * Service transversal de observabilidade.
 */
@Injectable()
export class StructuredEventService {
    /**
     * Converte um evento de domínio num objeto seguro para logger ou audit log.
     *
     * @param input Evento emitido por um módulo da API.
     * @returns Evento normalizado sem valores sensíveis.
     */
    record(input: StructuredEventInput): StructuredEventOutput {
        // Usar AuditDomain e AuditResult evita estados incompatíveis com o audit log.
        return {
            at: new Date().toISOString(),
            correlationId: input.correlationId.trim(),
            domain: input.domain,
            action: input.action.trim(),
            result: input.result,
            metadata: this.redact(input.metadata ?? {}),
        };
    }

    /**
     * Remove metadados que podem conter sessão, material privado ou conteúdo de IA.
     *
     * @param metadata Metadados candidatos a observabilidade.
     * @returns Metadados seguros para persistência.
     */
    private redact(metadata: Record<string, unknown>): Record<string, unknown> {
        const safe: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(metadata)) {
            const normalizedKey = key.toLowerCase();
            const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
                normalizedKey.includes(sensitiveKey),
            );
            // Redigir por nome de campo evita que prompts e cookies apareçam em evidence.
            safe[key] = isSensitive ? "[REDACTED]" : value;
        }
        return safe;
    }
}
```

5. Explicação do código.

O código implementa o contrato principal de `BK-MF7-01`. Cumpre `RNF23`, usa nomes explícitos, documenta a unidade com JSDoc e coloca comentários didáticos junto da decisão que evita erro operacional, pedagógico ou de segurança. As entradas são validadas antes de produzir saída; a saída é pequena, previsível e adequada para evidence.

6. Validação do passo.

Executa uma leitura técnica do ficheiro e confirma que não há imports inexistentes, dados privados em logs, casts inseguros, payloads sem tipo ou decisões de autorização feitas no frontend.

7. Cenário negativo/erro esperado.

Se removeres a validação ou o comentário didático, o BK fica `PARCIAL`; se a falha expuser dados privados ou permitir mistura de contextos, fica `CRITICO`.
### Passo 4 - Integrar com a aplicação

1. Objetivo funcional do passo no contexto da app.

Ligar o contrato principal ao ponto correto da app sem duplicar módulos.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/common/observability/structured-event.service.ts`
- CRIAR: `apps/api/src/common/observability/structured-event.service.spec.ts`
- EDITAR: `apps/api/src/modules/audit-log/audit-log.module.ts`
- EDITAR: `apps/api/src/modules/audit-log/audit-log.service.ts`
- EDITAR: `apps/api/src/modules/audit-log/audit-log.service.spec.ts`
- LOCALIZAÇÃO: `apps/api/src/modules/audit-log/audit-log.module.ts`, array `providers`, e `apps/api/src/modules/audit-log/audit-log.service.ts`, método `record(...)`, imediatamente antes da chamada a `this.auditModel.create(...)`.

3. Instruções do que fazer.

Usa `StructuredEventService` no ponto onde um evento operacional precisa de ser normalizado antes de entrar no audit log. Mantém `AuditLogService.redactMetadata(...)` como segunda barreira de segurança, porque o audit log continua a ser o último ponto antes da persistência.

Se a tua branch ainda não tiver outro emissor de logs estruturados, integra primeiro em `AuditLogService.record(...)`: injeta `StructuredEventService`, normaliza `domain`, `action`, `result` e `metadata`, e passa apenas metadata já redigida para `this.auditModel.create(...)`.

4. Código completo, correto e integrado com a app final.

Atualiza primeiro o módulo para a injeção de dependências ficar explícita:

```ts
// apps/api/src/modules/audit-log/audit-log.module.ts
/**
 * Regista auditoria aplicacional MF4 e observabilidade estruturada MF7.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StructuredEventService } from "../../common/observability/structured-event.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { AuditLogController } from "./audit-log.controller.js";
import { AuditLogService } from "./audit-log.service.js";
import { AuditEvent, AuditEventSchema } from "./schemas/audit-event.schema.js";

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([{ name: AuditEvent.name, schema: AuditEventSchema }]),
    ],
    controllers: [AuditLogController],
    providers: [
        AuditLogService,
        // O provider transversal fica no mesmo módulo para o AuditLogService o receber por DI.
        StructuredEventService,
    ],
    exports: [AuditLogService],
})
export class AuditLogModule {}
```

Depois substitui o service pela versão completa abaixo, preservando `list(...)`, `assertAdmin(...)` e `toView(...)`:

```ts
// apps/api/src/modules/audit-log/audit-log.service.ts
/**
 * Implementa auditoria aplicacional com metadata minimizada e logs estruturados.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { StructuredEventService } from "../../common/observability/structured-event.service.js";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditQueryDto } from "./dto/audit-query.dto.js";
import {
    AuditDomain,
    AuditEvent,
    AuditEventDocument,
    AuditResult,
} from "./schemas/audit-event.schema.js";

export type AuditRecordInput = {
    actorId: string;
    domain: AuditDomain;
    action: string;
    resourceType: string;
    resourceId?: string;
    result: AuditResult;
    metadata?: Record<string, unknown>;
};

const SENSITIVE_KEYS = [
    "password",
    "passwordHash",
    "cookie",
    "token",
    "secret",
    "prompt",
    "answer",
    "response",
    "apiKey",
];

/**
 * Serviço de audit log transversal.
 */
@Injectable()
export class AuditLogService {
    /**
     * @param auditModel Modelo Mongoose de eventos de auditoria.
     * @param structuredEventService Service que normaliza eventos antes da persistência.
     */
    constructor(
        @InjectModel(AuditEvent.name)
        private readonly auditModel: Model<AuditEventDocument>,
        private readonly structuredEventService: StructuredEventService,
    ) {}

    /**
     * Regista um evento com metadata redigida.
     *
     * @param input Evento a persistir.
     * @returns Evento público persistido.
     */
    async record(input: AuditRecordInput) {
        const resourceType = input.resourceType.trim();
        const resourceId = input.resourceId?.trim();
        const structuredEvent = this.structuredEventService.record({
            correlationId: `${input.domain}:${resourceType}:${resourceId ?? "sem-recurso"}`,
            domain: input.domain,
            action: input.action,
            result: input.result,
            metadata: {
                ...input.metadata,
                resourceType,
                resourceId: resourceId ?? "sem-recurso",
            },
        });

        const event = await this.auditModel.create({
            actorId: new Types.ObjectId(input.actorId),
            domain: structuredEvent.domain,
            action: structuredEvent.action,
            resourceType,
            resourceId,
            result: structuredEvent.result,
            // A segunda redacção mantém o audit log como última barreira antes da BD.
            metadata: this.redactMetadata({
                correlationId: structuredEvent.correlationId,
                observedAt: structuredEvent.at,
                ...structuredEvent.metadata,
            }),
        });
        return this.toView(event.toObject());
    }

    /**
     * Lista eventos apenas para administradores.
     *
     * @param actor Utilizador autenticado.
     * @param query Filtros opcionais.
     * @returns Eventos recentes.
     */
    async list(actor: AuthenticatedUser, query: AuditQueryDto = {}) {
        this.assertAdmin(actor);
        const filter: Record<string, unknown> = {};
        if (query.domain) filter.domain = query.domain;
        if (query.result) filter.result = query.result;
        if (query.action) filter.action = query.action.trim();
        const events = await this.auditModel
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        return events.map((event) => this.toView(event));
    }

    /**
     * Remove chaves sensíveis sem destruir contexto técnico útil.
     *
     * @param metadata Metadata candidata.
     * @returns Metadata segura para persistência.
     */
    redactMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
        const redacted: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(metadata)) {
            const lowered = key.toLowerCase();
            if (SENSITIVE_KEYS.some((sensitive) => lowered.includes(sensitive.toLowerCase()))) {
                redacted[key] = "[REDACTED]";
                continue;
            }
            redacted[key] =
                typeof value === "string" && value.length > 300
                    ? `${value.slice(0, 300)}...`
                    : value;
        }
        return redacted;
    }

    /**
     * @param actor Utilizador autenticado.
     */
    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({
                code: "ADMIN_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de administradores.",
            });
        }
    }

    /**
     * @param event Documento interno.
     * @returns Contrato público.
     */
    private toView(event: {
        _id?: unknown;
        actorId: unknown;
        domain: AuditDomain;
        action: string;
        resourceType: string;
        resourceId?: string;
        result: AuditResult;
        metadata?: Record<string, unknown>;
        createdAt?: Date;
    }) {
        return {
            id: String(event._id),
            actorId: String(event.actorId),
            domain: event.domain,
            action: event.action,
            resourceType: event.resourceType,
            resourceId: event.resourceId,
            result: event.result,
            metadata: event.metadata ?? {},
            createdAt: event.createdAt,
        };
    }
}
```

5. Explicação do código.

O ponto de integração é o método que já persiste eventos. Assim, os logs estruturados entram no fluxo real da aplicação sem criar outro modelo de auditoria, outro controller ou outra coleção. Esta decisão evita duplicação e preserva a regra de privacidade: prompts, respostas IA, cookies e tokens continuam redigidos antes de qualquer evidence. O módulo também fica completo, porque o provider de `StructuredEventService` é registado no mesmo contexto de DI usado por `AuditLogService`.

6. Validação do passo.

Resultado esperado: `AuditLogService.record(...)` continua a persistir eventos, mas a metadata sensível chega redigida e com `correlationId` operacional. O teste de `StructuredEventService` deve provar que campos como `prompt`, `answer`, `cookie`, `token` e `password` ficam como `[REDACTED]`.

7. Cenário negativo/erro esperado.

Se a integração contornar `SessionGuard`, ownership, membership, quotas ou guardrails já existentes, a alteração deve ser revertida.
### Passo 5 - Adicionar teste ou evidence técnica

1. Objetivo funcional do passo no contexto da app.

Provar que o contrato de `BK-MF7-01` funciona e falha de forma controlada.

2. Ficheiros envolvidos:
- CRIAR/EDITAR: `apps/api/src/common/observability/structured-event.service.spec.ts`
- LOCALIZAÇÃO: ficheiro de teste ou evidence `apps/api/src/common/observability/structured-event.service.spec.ts`.

3. Instruções do que fazer.

Adiciona o teste/evidence abaixo e garante que existe pelo menos um cenário negativo. Para `P0`, prepara três negativos na PR; para `P1`, dois; para `P2`, um é suficiente.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/common/observability/structured-event.service.spec.ts
import { StructuredEventService } from "./structured-event.service.js";

describe("StructuredEventService", () => {
    const service = new StructuredEventService();

    function recordWith(metadata: Record<string, unknown>) {
        const event = service.record({
            correlationId: " req-123 ",
            domain: "AI",
            action: " CLASS_AI_REQUESTED ",
            result: "FAILED",
            metadata,
        });
        return event;
    }

    it("redige prompts e respostas privadas", () => {
        const event = recordWith({
            prompt: "conteúdo privado",
            answer: "resposta privada",
            sourceCount: 2,
        });

        // Este negativo prova que conteúdo pedagógico privado não entra na evidence.
        expect(event.metadata).toEqual({
            prompt: "[REDACTED]",
            answer: "[REDACTED]",
            sourceCount: 2,
        });
    });

    it("redige cookies, tokens e passwords", () => {
        const event = recordWith({
            cookie: "sid=privado",
            token: "token-privado",
            password: "nao-guardar",
        });

        // Credenciais nunca devem aparecer em logs, mesmo quando entram dentro de metadata técnica.
        expect(event.metadata).toEqual({
            cookie: "[REDACTED]",
            token: "[REDACTED]",
            password: "[REDACTED]",
        });
    });

    it("redige segredos operacionais", () => {
        const event = recordWith({
            clientSecret: "segredo-privado",
            retryCount: 1,
        });

        expect(event.metadata).toEqual({
            clientSecret: "[REDACTED]",
            retryCount: 1,
        });
    });

    it("mantem metadados operacionais nao sensiveis", () => {
        const event = recordWith({
            sourceCount: 2,
            retryCount: 1,
        });

        expect(event.metadata).toEqual({
            sourceCount: 2,
            retryCount: 1,
        });
    });

    it("normaliza correlacao e acao para pesquisa operacional", () => {
        const event = recordWith({});

        expect(event.correlationId).toBe("req-123");
        expect(event.action).toBe("CLASS_AI_REQUESTED");
    });
});
```

5. Explicação do código.

Este bloco prova o caminho principal ou a falha controlada mais importante. A evidence não deve conter materiais privados, respostas completas de IA, cookies, credenciais ou dados de outro aluno.

6. Validação do passo.

Comando recomendado: `npm --prefix apps/api test -- structured-event.service.spec.ts` quando o ficheiro for teste backend; para frontend, executa `npm --prefix apps/web run build`.

7. Cenário negativo/erro esperado.

Se o teste só confirmar que a função existe, sem validar comportamento ou erro esperado, não é evidence suficiente.
### Passo 6 - Validar por camada

1. Objetivo funcional do passo no contexto da app.

Confirmar que backend, frontend, documentação e evidence estão alinhados.

2. Ficheiros envolvidos:
- REVER: `apps/api/package.json`
- REVER: `apps/web/package.json`
- REVER: `docs/planificacao/guias-bk/MF7`
- LOCALIZAÇÃO: comandos de validação e PR.

3. Instruções do que fazer.

Executa validação por camada e regista observed/expected. Matriz minima de testes por prioridade: `P0` exige unit, integração e 3 negativos; `P1` exige unit ou integração e 2 negativos; `P2` exige teste focal e 1 negativo. Evidencia de testes por camada: backend, frontend, documentação e smoke quando existir endpoint.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque a validação é operacional. O valor está em comparar resultado esperado e observado de forma objetiva.

6. Validação do passo.

Resultados esperados: testes verdes ou bloqueio explicado; nenhum comando deve depender de segredos locais para passar.

7. Cenário negativo/erro esperado.

Se o build falhar por import criado neste BK, corrige antes de abrir PR. Se falhar por dívida externa, regista o caminho e o erro exato.
### Passo 7 - Preparar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF7-01` com prova técnica e instrução clara para `BK-MF7-02`.

2. Ficheiros envolvidos:
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md`
- LOCALIZAÇÃO: secções finais do guia e descrição da PR.

3. Instruções do que fazer.

No PR, inclui comandos executados, resultado principal, negativos, risco restante e o que o próximo BK passa a poder reutilizar. Se o BK tocar IA, inclui prova de fontes/contexto; se tocar operação, inclui prova de health, logs ou readiness.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque o foco é comunicação técnica. A equipa deve conseguir defender a decisão sem pedir contexto extra ao professor.

6. Validação do passo.

Resultado esperado: evidence completa, três negativos de privacidade e handoff explícito para `BK-MF7-02`.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas 'funciona', sem output, request/response, teste ou screenshot, não cumpre o BK.

#### Critérios de aceite

- `RNF23` fica demonstrável por código, teste/evidence e explicação pedagógica.
- O guia mantém `bk_id`, `macro`, owner, apoio, prioridade, sprint, esforço, `rf_rnf` e `proximo_bk` alinhados com matriz e backlog.
- Cada passo tem objetivo, ficheiros, instruções, código ou justificação sem código, explicação, validação e negativo.
- O código apresentado tem JSDoc nos elementos relevantes e comentários didáticos junto das decisões importantes.
- A integração com `AuditLogModule` e `AuditLogService.record(...)` fica explícita e não depende de inferência externa.
- Não existe decisão de sessão, ownership, membership, role, quota, fonte IA ou privacidade feita apenas no frontend.
- Não há exposição de cookies, passwords, prompts privados, respostas IA completas, materiais privados ou dados de outro contexto em logs/evidence.
- Os negativos mínimos respeitam a prioridade `P0`.

#### Validação final

- Executar pesquisa textual nos BKs MF7 para confirmar ausência de linguagem interna e caminhos privados.
- Executar `git diff --check`.
- Executar `bash scripts/validate-planificacao.sh`.
- Quando houver teste backend, executar `npm --prefix apps/api test -- structured-event.service.spec.ts`.
- Quando houver frontend, executar `npm --prefix apps/web run build`.
- Resultado esperado: comandos verdes ou falha externa registada com caminho, comando e erro observado.

#### Evidence para PR/defesa

- `pr`: referência do PR/commit com resumo de `BK-MF7-01`.
- `proof_tecnico`: comando executado, output relevante ou request/response do caminho principal.
- `proof_negativos`: erro controlado do cenário negativo exigido.
- `proof_fontes`: para IA, lista de `sourceLabel`, `locator` e excerto limitado.
- `proof_privacidade`: confirmação de que não há dados pessoais ou privados em logs/evidence.
- `proof_pedagogico`: explicação curta de como `RNF23` melhora a aplicação para alunos, professores ou operação.

#### Handoff

`BK-MF7-02` passa a ter eventos estáveis para medir disponibilidade.

O próximo BK deve reutilizar os ficheiros e decisões deste guia, sem criar outro contrato para a mesma responsabilidade.

#### Changelog

- `2026-06-26`: integração com `AuditLogService` completada com código do módulo, constructor, uso de `StructuredEventService` e negativos de privacidade.
- `2026-06-26`: contrato de logs estruturados documentado com tutorial técnico linear, código completo, validação, negativos, evidence e caminhos públicos `apps/...`.
