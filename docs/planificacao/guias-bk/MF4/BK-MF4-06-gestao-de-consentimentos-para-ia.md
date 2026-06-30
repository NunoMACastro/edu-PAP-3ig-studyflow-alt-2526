# BK-MF4-06 - Gestão de consentimentos para IA.

## Header

- `doc_id`: `GUIA-BK-MF4-06`
- `bk_id`: `BK-MF4-06`
- `macro`: `MF4`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF54`
- `fase_documental`: `Fase 2`
- `sprint`: `S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-07`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-06-gestao-de-consentimentos-para-ia.md`
- `last_updated`: `2026-06-18`

#### Objetivo

Criar gestão versionada de consentimentos para funcionalidades de IA. O utilizador consegue conceder e revogar consentimento por finalidade, e os services de IA passam a ter um método claro para bloquear tratamento sem consentimento activo.

#### Importância

RF54 protege privacidade e confiança. Sem consentimento explícito, funcionalidades de IA podem tratar materiais, preferências ou interacções de forma indevida.

#### Scope-in

- Criar DTO e schema `AiConsent`.
- Guardar finalidade, versão, estado, datas e actor.
- Expor endpoints para listar, conceder e revogar.
- Criar método `assertGranted`.
- Integrar o método nos services de IA já existentes.
- Criar frontend de gestão de consentimentos.
- Testar bloqueio sem consentimento.

#### Scope-out

- Alterar prompts dos providers.
- Definir modelos e limites de IA, coberto por BK-MF4-09.
- Quotas de IA, cobertas por BK-MF4-10.
- Consentimentos de encarregados de educação.

#### Estado antes e depois

##### Estado antes

Os módulos de IA já existem e usam `AI_PROVIDER`, ownership e fontes. Não existe verificação transversal de consentimento por finalidade.

##### Estado depois

Fica um módulo `ai-consents` com histórico versionado e método de enforcement para ser chamado antes de cada tratamento IA.

##### Decisões de escopo

- `CANONICO`: RF54 pertence a todos os utilizadores.
- `CANONICO`: revogar consentimento bloqueia chamadas futuras de IA.
- `DERIVADO`: `policyVersion` começa em `2026-06-16` para tornar consentimentos comparáveis.
- `DERIVADO`: cada finalidade é separada para não transformar um consentimento amplo numa permissão global.

#### Pre-requisitos

- `SessionGuard`.
- `AuthenticatedUser`.
- Services IA existentes: `PrivateAreaAiService`, `StudyGroupAiService`, `ClassAiService`, `ProjectAiService`.
- `requestMf3Json`.

#### Glossário

- Finalidade: motivo específico para tratamento IA.
- Versão de política: identificador textual do texto de consentimento aceite.
- Consentimento activo: último registo da finalidade com estado `GRANTED`.
- Enforcement: bloqueio no service antes de chamar o provider.

#### Conceitos teóricos essenciais

Consentimento não é uma flag global. No StudyFlow, cada funcionalidade de IA trata dados diferentes e tem riscos diferentes: a IA privada trabalha com materiais do aluno, a IA de grupo trabalha com fontes partilhadas, a IA da turma trabalha com materiais oficiais e a IA de projecto trabalha com o enunciado publicado. Por isso, o consentimento tem de ser separado por finalidade.

Finalidade é o motivo técnico e funcional do tratamento. `PRIVATE_AREA_AI`, `STUDY_GROUP_AI`, `CLASS_AI` e `PROJECT_AI` não são apenas nomes de enum; são barreiras de privacidade. Um aluno pode aceitar uma finalidade e recusar outra. Isto evita que um consentimento amplo seja usado como permissão para todos os contextos de IA.

Consentimento activo é a última decisão guardada para uma finalidade. Se o último registo for `GRANTED`, a funcionalidade pode continuar o fluxo. Se for `REVOKED`, ou se não existir decisão, o backend deve bloquear com `AI_CONSENT_REQUIRED`. A revogação não apaga o histórico, porque a app precisa de rastreabilidade para defesa técnica e privacidade.

O backend é o ponto de enforcement. O frontend mostra botões para conceder e revogar, mas não decide se a IA pode correr. Os services que chamam `AI_PROVIDER` devem chamar `AiConsentsService.assertGranted` antes de preparar prompt ou enviar dados para IA. Isto evita confiar no browser e protege mesmo que alguém tente chamar a API manualmente.

DTO, schema, service, controller e módulo têm papéis diferentes. O DTO valida o payload recebido; o schema define como a decisão fica guardada em MongoDB; o service concentra regras como listar, conceder, revogar e bloquear; o controller expõe rotas protegidas por sessão; o módulo exporta `AiConsentsService` para os services de IA.

Privacidade e RGPD aparecem aqui como minimização e finalidade. A app só deve tratar com IA os dados necessários para a finalidade consentida. Também não deve registar prompts privados, respostas completas ou materiais sensíveis em logs. O que fica guardado no consentimento é a decisão, a finalidade, a versão da política e a data.

No frontend, estado local, loading e erro servem para o utilizador perceber o que aconteceu. Como conceder ou revogar consentimento altera uma decisão sensível, a interface deve impedir cliques duplicados e mostrar falhas de API em `role="alert"`.

Nos testes, o cenário mais importante é o default seguro: sem consentimento activo, a IA não corre. Também é obrigatório provar que uma concessão permite a finalidade e que uma revogação posterior volta a bloquear. Estes testes protegem BK-MF4-09 e BK-MF4-10, que dependem da mesma finalidade para modelos e quotas.

#### Arquitetura do BK

- Endpoint: `GET /api/ai-consents`, `PUT /api/ai-consents/:purpose`, `DELETE /api/ai-consents/:purpose`.
- Modelo/schema: `AiConsent`.
- Service: `AiConsentsService`.
- Controller: `AiConsentsController`.
- Integração: services IA chamam `assertGranted`.
- Cliente: `ai-consents-client.ts`.
- Componente: `AiConsentsPanel`.
- Testes: `ai-consents.service.spec.ts`.
- Handoff: BK-MF4-07 recebe um modelo de permissões mais claro para administração.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai-consents/dto/upsert-ai-consent.dto.ts`
- CRIAR: `apps/api/src/modules/ai-consents/schemas/ai-consent.schema.ts`
- CRIAR: `apps/api/src/modules/ai-consents/ai-consents.service.ts`
- CRIAR: `apps/api/src/modules/ai-consents/ai-consents.controller.ts`
- CRIAR: `apps/api/src/modules/ai-consents/ai-consents.module.ts`
- CRIAR: `apps/api/src/modules/ai-consents/ai-consents.service.spec.ts`
- EDITAR: services IA que chamam `AI_PROVIDER`
- CRIAR: `apps/web/src/features/ai-consents/ai-consents-client.ts`
- CRIAR: `apps/web/src/features/ai-consents/ai-consents-panel.tsx`
- EDITAR: `apps/api/src/app.module.ts`

#### Tutorial técnico linear

### Passo 1 - Definir DTO e schema versionado

1. Objetivo funcional do passo no contexto da app.
   Persistir consentimentos por finalidade e versão.
2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai-consents/dto/upsert-ai-consent.dto.ts`
    - CRIAR: `apps/api/src/modules/ai-consents/schemas/ai-consent.schema.ts`
3. Instruções do que fazer.
   Modela finalidades explícitas e estado revogável.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-consents/dto/upsert-ai-consent.dto.ts
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Finalidades de IA que podem ser consentidas separadamente.
 */
export enum AiConsentPurpose {
    PRIVATE_AREA_AI = "PRIVATE_AREA_AI",
    STUDY_GROUP_AI = "STUDY_GROUP_AI",
    CLASS_AI = "CLASS_AI",
    PROJECT_AI = "PROJECT_AI",
}

export const CURRENT_AI_CONSENT_VERSION = "2026-06-16";

/**
 * Entrada para conceder consentimento IA numa finalidade.
 */
export class UpsertAiConsentDto {
    @IsEnum(AiConsentPurpose)
    purpose!: AiConsentPurpose;

    /** Versão aceite pelo utilizador, registada para auditoria futura. */
    @IsString()
    @MinLength(10)
    @MaxLength(40)
    policyVersion!: string;
}
```

```ts
// apps/api/src/modules/ai-consents/schemas/ai-consent.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AiConsentPurpose } from "../dto/upsert-ai-consent.dto.js";

export type AiConsentDocument = HydratedDocument<AiConsent>;
export type AiConsentStatus = "GRANTED" | "REVOKED";

/**
 * Consentimento IA por utilizador, finalidade e versão.
 */
@Schema({ timestamps: true, collection: "ai_consents" })
export class AiConsent {
    // O userId vem sempre da sessão autenticada; nunca vem do body ou da query string.
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        required: true,
        enum: Object.values(AiConsentPurpose),
        index: true,
    })
    purpose!: AiConsentPurpose;

    @Prop({ required: true, trim: true, maxlength: 40 })
    policyVersion!: string;

    @Prop({ required: true, enum: ["GRANTED", "REVOKED"], default: "GRANTED" })
    status!: AiConsentStatus;

    // Guardar a data da decisão permite descobrir qual foi o último estado efectivo.
    @Prop({ required: true, default: Date.now })
    decidedAt!: Date;
}

export const AiConsentSchema = SchemaFactory.createForClass(AiConsent);
AiConsentSchema.index({ userId: 1, purpose: 1, decidedAt: -1 });
```

5. Explicação do código.
   O DTO define o contrato de entrada para conceder consentimento: a finalidade tem de existir no enum e a versão da política tem tamanho controlado para não aceitar texto arbitrário. O schema guarda cada decisão como um novo registo, em vez de actualizar uma única flag. Isto preserva histórico, permite provar quando o utilizador concedeu ou revogou e torna possível descobrir o estado activo ordenando por `decidedAt`.

   `userId` fica no schema porque cada consentimento pertence a um utilizador autenticado. Esse valor não deve vir do frontend; o service vai obtê-lo de `AuthenticatedUser`. `purpose` separa as finalidades para impedir permissões globais. `status` permite revogar sem apagar histórico. `policyVersion` liga a decisão ao texto de consentimento apresentado ao utilizador. O índice por `userId`, `purpose` e `decidedAt` acelera a consulta do último consentimento de cada finalidade.
6. Validação do passo.
   Criar um DTO com finalidade fora de `AiConsentPurpose` deve falhar na validação. Criar um documento com `purpose` válido, `status` válido e `policyVersion` preenchida deve guardar uma decisão rastreável.
7. Cenário negativo/erro esperado.
   Consentimento sem `policyVersion` deve ser rejeitado. Uma finalidade inventada, como `"ALL_AI"`, também deve ser rejeitada porque transformaria consentimento específico numa permissão global.

### Passo 2 - Implementar service com enforcement

1. Objetivo funcional do passo no contexto da app.
   Listar, conceder, revogar e bloquear IA sem consentimento.
2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai-consents/ai-consents.service.ts`
3. Instruções do que fazer.
   O método `assertGranted` deve ser pequeno e reutilizável.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-consents/ai-consents.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    AiConsentPurpose,
    UpsertAiConsentDto,
} from "./dto/upsert-ai-consent.dto.js";
import { AiConsent, AiConsentDocument } from "./schemas/ai-consent.schema.js";

export type AiConsentView = {
    purpose: AiConsentPurpose;
    policyVersion: string;
    status: string;
    decidedAt: Date;
};

/**
 * Serviço de consentimentos IA com bloqueio centralizado.
 */
@Injectable()
export class AiConsentsService {
    constructor(
        @InjectModel(AiConsent.name)
        private readonly consentModel: Model<AiConsentDocument>,
    ) {}

    /**
     * Lista o histórico de consentimentos do utilizador autenticado.
     *
     * @param actor Utilizador autenticado pela sessão.
     * @returns Decisões ordenadas da mais recente para a mais antiga.
     */
    async listMine(actor: AuthenticatedUser): Promise<AiConsentView[]> {
        // O filtro usa actor.id da sessão para impedir listagem de consentimentos de outro utilizador.
        const rows = await this.consentModel
            .find({ userId: new Types.ObjectId(actor.id) })
            .sort({ decidedAt: -1 })
            .lean();
        return rows.map((row) => this.toView(row));
    }

    /**
     * Regista uma nova concessão de consentimento IA.
     *
     * @param actor Utilizador autenticado que concede a finalidade.
     * @param input Finalidade e versão de política aceites pelo utilizador.
     * @returns Decisão criada em formato público.
     */
    async grant(
        actor: AuthenticatedUser,
        input: UpsertAiConsentDto,
    ): Promise<AiConsentView> {
        // Cada decisão é append-only para preservar histórico e permitir auditoria posterior.
        const row = await this.consentModel.create({
            userId: new Types.ObjectId(actor.id),
            purpose: input.purpose,
            policyVersion: input.policyVersion,
            status: "GRANTED",
            decidedAt: new Date(),
        });
        return this.toView(row.toObject());
    }

    /**
     * Regista uma revogação sem apagar decisões anteriores.
     *
     * @param actor Utilizador autenticado que revoga a finalidade.
     * @param purpose Finalidade IA a bloquear daqui para a frente.
     * @returns Decisão criada em estado `REVOKED`.
     */
    async revoke(
        actor: AuthenticatedUser,
        purpose: AiConsentPurpose,
    ): Promise<AiConsentView> {
        // Revogar cria um novo registo para que o último estado seja bloqueante e rastreável.
        const row = await this.consentModel.create({
            userId: new Types.ObjectId(actor.id),
            purpose,
            policyVersion: "revoked",
            status: "REVOKED",
            decidedAt: new Date(),
        });
        return this.toView(row.toObject());
    }

    /**
     * Bloqueia qualquer chamada IA sem consentimento activo para a finalidade.
     */
    async assertGranted(
        userId: string,
        purpose: AiConsentPurpose,
    ): Promise<void> {
        // Só a decisão mais recente interessa para saber se o consentimento está activo.
        const latest = await this.consentModel
            .findOne({ userId: new Types.ObjectId(userId), purpose })
            .sort({ decidedAt: -1 })
            .lean();
        if (latest?.status !== "GRANTED") {
            throw new ForbiddenException({
                code: "AI_CONSENT_REQUIRED",
                message:
                    "É necessário consentimento activo para usar esta funcionalidade de IA.",
            });
        }
    }

    /**
     * Converte o documento interno para o contrato público do módulo.
     *
     * @param row Documento ou objecto Mongoose já materializado.
     * @returns Vista sem `_id`, `userId` ou outros detalhes internos.
     */
    private toView(row: {
        purpose: AiConsentPurpose;
        policyVersion: string;
        status: string;
        decidedAt: Date;
    }): AiConsentView {
        return {
            purpose: row.purpose,
            policyVersion: row.policyVersion,
            status: row.status,
            decidedAt: row.decidedAt,
        };
    }
}
```

5. Explicação do código.
   `AiConsentsService` é a fronteira de regras do módulo. `listMine` usa `actor.id` vindo da sessão para garantir que ninguém lista consentimentos de outro utilizador. `grant` e `revoke` criam sempre novos registos, por isso o histórico fica preservado e a app consegue explicar a última decisão. `assertGranted` consulta apenas o registo mais recente da finalidade e lança `ForbiddenException` com `AI_CONSENT_REQUIRED` quando não há consentimento activo.

   Os services IA não consultam MongoDB directamente para saber se podem correr. Eles chamam `assertGranted` antes de preparar prompt ou contactar provider. Isto mantém a regra de privacidade num único ponto e evita duplicação. A conversão em `toView` impede que detalhes internos do documento sejam expostos ao frontend.
6. Validação do passo.
   Com um último registo `GRANTED`, `assertGranted` deve resolver sem erro. Com ausência de registo ou último registo `REVOKED`, deve lançar `ForbiddenException` com `code: "AI_CONSENT_REQUIRED"`.
7. Cenário negativo/erro esperado.
   Sem qualquer consentimento, `assertGranted` devolve `AI_CONSENT_REQUIRED`. Se o service aceitasse ausência de registo, a app trataria dados com IA sem decisão explícita do utilizador.

### Passo 3 - Criar controller e módulo

1. Objetivo funcional do passo no contexto da app.
   Permitir ao utilizador gerir os próprios consentimentos.
2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai-consents/ai-consents.controller.ts`
    - CRIAR: `apps/api/src/modules/ai-consents/ai-consents.module.ts`
    - EDITAR: `apps/api/src/app.module.ts`
3. Instruções do que fazer.
   As rotas usam a sessão; nenhuma recebe `userId`.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-consents/ai-consents.controller.ts
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseEnumPipe,
    Put,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiConsentsService } from "./ai-consents.service.js";
import {
    AiConsentPurpose,
    UpsertAiConsentDto,
} from "./dto/upsert-ai-consent.dto.js";

/**
 * API de consentimentos IA do próprio utilizador.
 */
@Controller("api/ai-consents")
@UseGuards(SessionGuard)
export class AiConsentsController {
    constructor(private readonly consentsService: AiConsentsService) {}

    /**
     * Lista o histórico de decisões IA do utilizador autenticado.
     */
    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        // O utilizador vem da sessão validada pelo SessionGuard, não do body.
        return this.consentsService.listMine(request.user!);
    }

    /**
     * Concede consentimento para a finalidade indicada no URL.
     */
    @Put(":purpose")
    grant(
        @Req() request: AuthenticatedRequest,
        @Param("purpose", new ParseEnumPipe(AiConsentPurpose))
        purpose: AiConsentPurpose,
        @Body() input: UpsertAiConsentDto,
    ) {
        // O purpose do URL prevalece para evitar divergência entre URL e body.
        return this.consentsService.grant(request.user!, { ...input, purpose });
    }

    /**
     * Revoga consentimento para a finalidade indicada no URL.
     */
    @Delete(":purpose")
    revoke(
        @Req() request: AuthenticatedRequest,
        @Param("purpose", new ParseEnumPipe(AiConsentPurpose))
        purpose: AiConsentPurpose,
    ) {
        return this.consentsService.revoke(request.user!, purpose);
    }
}
```

```ts
// apps/api/src/modules/ai-consents/ai-consents.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { AiConsentsController } from "./ai-consents.controller.js";
import { AiConsentsService } from "./ai-consents.service.js";
import { AiConsent, AiConsentSchema } from "./schemas/ai-consent.schema.js";

/**
 * Módulo de consentimentos IA.
 */
@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: AiConsent.name, schema: AiConsentSchema },
        ]),
    ],
    controllers: [AiConsentsController],
    providers: [AiConsentsService],
    exports: [AiConsentsService],
})
export class AiConsentsModule {}
```

```ts
// apps/api/src/app.module.ts
import "./common/config/load-env.js";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdaptiveExplanationsModule } from "./modules/adaptive-explanations/adaptive-explanations.module.js";
import { AiGuardrailsModule } from "./modules/ai-guardrails/ai-guardrails.module.js";
import { AiConsentsModule } from "./modules/ai-consents/ai-consents.module.js";
import { AiModule } from "./modules/ai/ai.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { ClassAiModule } from "./modules/class-ai/class-ai.module.js";
import { ClassPostsModule } from "./modules/class-posts/class-posts.module.js";
import { ClassesModule } from "./modules/classes/classes.module.js";
import { CurriculumNavigationModule } from "./modules/curriculum-navigation/curriculum-navigation.module.js";
import { ExternalKnowledgeAiModule } from "./modules/external-knowledge-ai/external-knowledge-ai.module.js";
import { MaterialsModule } from "./modules/materials/materials.module.js";
import { Mf2Module } from "./modules/mf2/mf2.module.js";
import { NotificationPreferencesModule } from "./modules/notification-preferences/notification-preferences.module.js";
import { OfficialMaterialsModule } from "./modules/official-materials/official-materials.module.js";
import { SourceGroundedAiModule } from "./modules/source-grounded-ai/source-grounded-ai.module.js";
import { StudentsModule } from "./modules/students/students.module.js";
import { StudyAlertsModule } from "./modules/study-alerts/study-alerts.module.js";
import { StudyAreasModule } from "./modules/study-areas/study-areas.module.js";
import { StudyGroupAiModule } from "./modules/study-group-ai/study-group-ai.module.js";
import { StudyGroupMessagesModule } from "./modules/study-group-messages/study-group-messages.module.js";
import { StudyGroupSessionsModule } from "./modules/study-group-sessions/study-group-sessions.module.js";
import { StudyGroupsModule } from "./modules/study-groups/study-groups.module.js";
import { StudyModule } from "./modules/study/study.module.js";
import { StudyRoomsModule } from "./modules/study-rooms/study-rooms.module.js";
import { SubjectsModule } from "./modules/subjects/subjects.module.js";
import { TeacherAiModule } from "./modules/teacher-ai/teacher-ai.module.js";
import { UnifiedSearchModule } from "./modules/unified-search/unified-search.module.js";

@Module({
    imports: [
        MongooseModule.forRoot(
            process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/studyflow",
        ),
        AuthModule,
        StudentsModule,
        StudyModule,
        StudyAreasModule,
        MaterialsModule,
        AiModule,
        StudyRoomsModule,
        ClassesModule,
        SubjectsModule,
        OfficialMaterialsModule,
        TeacherAiModule,
        ClassAiModule,
        ClassPostsModule,
        Mf2Module,
        AiGuardrailsModule,
        SourceGroundedAiModule,
        ExternalKnowledgeAiModule,
        AdaptiveExplanationsModule,
        StudyGroupsModule,
        StudyGroupMessagesModule,
        StudyGroupSessionsModule,
        StudyGroupAiModule,
        UnifiedSearchModule,
        CurriculumNavigationModule,
        NotificationPreferencesModule,
        StudyAlertsModule,
        AiConsentsModule,
    ],
})
export class AppModule {}
```

5. Explicação do código.
   O controller cria a fronteira HTTP do módulo de consentimentos. Todas as rotas estão protegidas por `SessionGuard`, por isso a identidade vem de `request.user` e nunca de um `userId` enviado pelo frontend. Isto é essencial: consentimento é uma decisão pessoal e não pode ser alterado escolhendo outro utilizador no payload.

   `GET /api/ai-consents` devolve o histórico do actor autenticado. `PUT /api/ai-consents/:purpose` cria uma decisão `GRANTED` para a finalidade indicada no URL. `DELETE /api/ai-consents/:purpose` cria uma decisão `REVOKED` para a mesma finalidade. `ParseEnumPipe` valida o parâmetro `purpose` antes de chegar ao service, evitando finalidades inventadas como `"ALL_AI"`. O body continua a transportar `policyVersion`, mas o `purpose` efectivo vem do URL para não haver conflito entre rota e payload.

   `AiConsentsModule` regista o schema Mongoose, controller e service. O `exports: [AiConsentsService]` é indispensável porque os módulos de IA precisam de injetar `AiConsentsService`. No `AppModule`, o novo módulo fica junto dos restantes módulos de domínio da API para tornar as rotas disponíveis na aplicação principal.
6. Validação do passo.
   `GET /api/ai-consents` deve listar só decisões do actor autenticado. `PUT /api/ai-consents/PRIVATE_AREA_AI` deve criar uma decisão concedida com a versão enviada no body. `DELETE /api/ai-consents/PRIVATE_AREA_AI` deve criar uma decisão revogada. Um `purpose` inválido no URL deve ser rejeitado antes de criar documento.
7. Cenário negativo/erro esperado.
   Pedido sem sessão deve falhar antes de tocar na base de dados. Pedido com `purpose` fora de `AiConsentPurpose` deve falhar na validação de rota, porque aceitar finalidades livres quebraria o contrato usado por modelos, quotas e services IA.

### Passo 4 - Integrar nos services IA

1. Objetivo funcional do passo no contexto da app.
   Bloquear chamadas a IA sem consentimento activo antes de qualquer prompt, leitura de fontes sensíveis ou chamada ao provider.
2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
    - EDITAR: `apps/api/src/modules/private-area-ai/private-area-ai.module.ts`
    - EDITAR: `apps/api/src/modules/study-group-ai/study-group-ai.service.ts`
    - EDITAR: `apps/api/src/modules/study-group-ai/study-group-ai.module.ts`
    - EDITAR: `apps/api/src/modules/class-ai/class-ai.service.ts`
    - EDITAR: `apps/api/src/modules/class-ai/class-ai.module.ts`
    - EDITAR: `apps/api/src/modules/project-ai/project-ai.service.ts`
    - EDITAR: `apps/api/src/modules/project-ai/project-ai.module.ts`
3. Instruções do que fazer.
   Importa `AiConsentsModule` nos módulos IA, injeta `AiConsentsService` nos services e chama `assertGranted` no método público que inicia cada operação IA. A validação deve ficar depois das validações mínimas de acesso ao contexto e antes de ler fontes para o prompt, construir o prompt ou contactar `AI_PROVIDER`.
4. Código completo, correto e integrado com a app final.

```ts
// Imports a acrescentar nos quatro services IA.
import { AiConsentsService } from "../ai-consents/ai-consents.service.js";
import { AiConsentPurpose } from "../ai-consents/dto/upsert-ai-consent.dto.js";
```

O código não deve ser colado no fim do ficheiro. Em cada service há quatro zonas a alterar: imports, `constructor`, método privado de validação e chamada no método público.

Em `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`, o service já recebe `answerModel`, `aiProvider`, `studyAreasService` e `materialsService`. Acrescenta `aiConsentsService` no fim do `constructor`:

```ts
constructor(
    @InjectModel(PrivateAreaAiAnswer.name)
    private readonly answerModel: Model<PrivateAreaAiAnswerDocument>,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
    private readonly studyAreasService: StudyAreasService,
    private readonly materialsService: MaterialsService,
    private readonly aiConsentsService: AiConsentsService,
) {}
```

Ainda dentro da classe `PrivateAreaAiService`, coloca este método privado a seguir ao `constructor`:

```ts
/**
 * Valida consentimento antes de ler fontes privadas ou chamar `AI_PROVIDER`.
 */
private async assertPrivateAreaAiConsent(actor: AuthenticatedUser): Promise<void> {
    await this.aiConsentsService.assertGranted(
        actor.id,
        AiConsentPurpose.PRIVATE_AREA_AI,
    );
}
```

No método `ask`, a chamada entra depois da validação de role e antes de `getMyStudyArea` e `listReadyTextSources`, porque estes dois métodos já entram no contexto privado do aluno:

```ts
if (actor.role !== "STUDENT") {
    throw new ForbiddenException({
        code: "STUDENT_ROLE_REQUIRED",
        message: "Esta funcionalidade é exclusiva de alunos.",
    });
}

await this.assertPrivateAreaAiConsent(actor);

// Só depois do consentimento activo se leem a área e os materiais privados.
const area = await this.studyAreasService.getMyStudyArea(actor.id, studyAreaId);
const materials = await this.materialsService.listReadyTextSources(
    actor.id,
    studyAreaId,
);
```

Em `apps/api/src/modules/private-area-ai/private-area-ai.module.ts`, importa `AiConsentsModule` e adiciona-o ao array `imports`. Este passo é obrigatório para o Nest conseguir injetar `AiConsentsService`:

```ts
import { AiConsentsModule } from "../ai-consents/ai-consents.module.js";

@Module({
    imports: [
        AuthModule,
        AiModule,
        AiConsentsModule,
        StudyAreasModule,
        MaterialsModule,
        MongooseModule.forFeature([
            {
                name: PrivateAreaAiAnswer.name,
                schema: PrivateAreaAiAnswerSchema,
            },
        ]),
    ],
    controllers: [PrivateAreaAiController],
    providers: [PrivateAreaAiService],
})
export class PrivateAreaAiModule {}
```

Em `apps/api/src/modules/study-group-ai/study-group-ai.service.ts`, acrescenta `aiConsentsService` ao `constructor` de `StudyGroupAiService`:

```ts
constructor(
    @InjectModel(StudyGroupAiAnswer.name)
    private readonly answerModel: Model<StudyGroupAiAnswerDocument>,
    private readonly studyGroupsService: StudyGroupsService,
    private readonly roomSharesService: RoomSharesService,
    @Inject(AI_PROVIDER)
    private readonly aiProvider: AiProvider,
    private readonly aiConsentsService: AiConsentsService,
) {}
```

Cria o método privado a seguir ao `constructor`:

```ts
/**
 * Valida consentimento antes de usar fontes partilhadas do grupo com IA.
 */
private async assertStudyGroupAiConsent(actor: AuthenticatedUser): Promise<void> {
    await this.aiConsentsService.assertGranted(
        actor.id,
        AiConsentPurpose.STUDY_GROUP_AI,
    );
}
```

No método `ask`, a ordem deve ficar: validar membership, validar consentimento, ler partilhas. Assim, a app não prepara prompt com fontes partilhadas sem consentimento:

```ts
// A membership é validada antes de ler partilhas para evitar fuga de notas de outros grupos.
await this.studyGroupsService.ensureMember(actor.id, groupId);

await this.assertStudyGroupAiConsent(actor);

const sources = await this.roomSharesService.findUsableSharesForRoom(
    actor.id,
    groupId,
    input.sourceShareIds,
);
```

Em `apps/api/src/modules/study-group-ai/study-group-ai.module.ts`, importa o módulo de consentimentos:

```ts
import { AiConsentsModule } from "../ai-consents/ai-consents.module.js";

@Module({
    imports: [
        AuthModule,
        AiModule,
        AiConsentsModule,
        StudyGroupsModule,
        StudyRoomsModule,
        MongooseModule.forFeature([
            { name: StudyGroupAiAnswer.name, schema: StudyGroupAiAnswerSchema },
        ]),
    ],
    controllers: [StudyGroupAiController],
    providers: [StudyGroupAiService],
})
export class StudyGroupAiModule {}
```

Em `apps/api/src/modules/class-ai/class-ai.service.ts`, acrescenta `aiConsentsService` ao `constructor` de `ClassAiService`:

```ts
constructor(
    @InjectModel(ClassAiInteraction.name)
    private readonly interactionModel: Model<ClassAiInteractionDocument>,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
    private readonly subjectsService: SubjectsService,
    private readonly materialsService: OfficialMaterialsService,
    private readonly voiceService: TeacherAiVoiceService,
    private readonly aiConsentsService: AiConsentsService,
) {}
```

Cria o método privado a seguir ao `constructor`:

```ts
/**
 * Valida consentimento antes de usar materiais oficiais da disciplina com IA.
 */
private async assertClassAiConsent(actor: AuthenticatedUser): Promise<void> {
    await this.aiConsentsService.assertGranted(
        actor.id,
        AiConsentPurpose.CLASS_AI,
    );
}
```

No método `askClassAi`, a chamada entra depois de confirmar que o actor é aluno e que está inscrito na disciplina, mas antes de `listProcessedForSubject` e antes de `resolveTeacherVoice`:

```ts
if (actor.role !== "STUDENT") {
    throw new ForbiddenException({
        code: "STUDENT_ROLE_REQUIRED",
        message: "Esta funcionalidade é exclusiva de alunos.",
    });
}

// A inscrição na disciplina é validada antes de qualquer material oficial ser exposto ao aluno.
const { subject, schoolClass } =
    await this.subjectsService.findSubjectForStudent(actor.id, subjectId);

await this.assertClassAiConsent(actor);

const materials = await this.materialsService.listProcessedForSubject(
    subject._id,
);
```

Em `apps/api/src/modules/class-ai/class-ai.module.ts`, importa o módulo de consentimentos:

```ts
import { AiConsentsModule } from "../ai-consents/ai-consents.module.js";

@Module({
    imports: [
        AuthModule,
        AiModule,
        AiConsentsModule,
        SubjectsModule,
        OfficialMaterialsModule,
        TeacherAiModule,
        MongooseModule.forFeature([
            { name: ClassAiInteraction.name, schema: ClassAiInteractionSchema },
        ]),
    ],
    controllers: [ClassAiController],
    providers: [ClassAiService],
})
export class ClassAiModule {}
```

Em `apps/api/src/modules/project-ai/project-ai.service.ts`, acrescenta `aiConsentsService` ao `constructor` de `ProjectAiService`:

```ts
constructor(
    @InjectModel(ProjectAiPlan.name)
    private readonly planModel: Model<ProjectAiPlanDocument>,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
    private readonly projectsService: ClassProjectsService,
    private readonly aiConsentsService: AiConsentsService,
) {}
```

Cria o método privado a seguir ao `constructor`:

```ts
/**
 * Valida consentimento antes de gerar um plano de projecto com IA.
 */
private async assertProjectAiConsent(actor: AuthenticatedUser): Promise<void> {
    await this.aiConsentsService.assertGranted(
        actor.id,
        AiConsentPurpose.PROJECT_AI,
    );
}
```

No método `createPlan`, a chamada entra depois de confirmar que o projecto está publicado e disponível para o aluno, mas antes de normalizar dados que entram no prompt e antes de chamar `generateProjectPlan`:

```ts
const project = await this.projectsService.findPublishedForStudent(
    actor.id,
    projectId,
);

await this.assertProjectAiConsent(actor);

const knownDifficulties = (input.knownDifficulties ?? [])
    .map((difficulty) => difficulty.trim())
    .filter(Boolean);
```

Em `apps/api/src/modules/project-ai/project-ai.module.ts`, importa o módulo de consentimentos:

```ts
import { AiConsentsModule } from "../ai-consents/ai-consents.module.js";

@Module({
    imports: [
        AuthModule,
        AiModule,
        AiConsentsModule,
        ClassProjectsModule,
        MongooseModule.forFeature([
            { name: ProjectAiPlan.name, schema: ProjectAiPlanSchema },
        ]),
    ],
    controllers: [ProjectAiController],
    providers: [ProjectAiService],
})
export class ProjectAiModule {}
```

5. Explicação do código.
   `AiConsentsService.assertGranted` é o ponto central de bloqueio. Os services IA continuam a validar role, ownership, membership e acesso ao contexto com os services que já existem na aplicação. Depois disso, antes de recolher fontes para o prompt ou chamar `AI_PROVIDER`, validam a finalidade IA correspondente. Isto evita transformar um consentimento geral numa permissão global e impede que a app trate dados com IA quando o último registo da finalidade não está `GRANTED`.
6. Validação do passo.
   Cada teste de service IA deve receber um dobro de teste de `AiConsentsService`. Quando `assertGranted` rejeita com `AI_CONSENT_REQUIRED`, o teste deve confirmar duas coisas: o método público falha com esse erro e o método do provider não é chamado.

```ts
aiConsentsService.assertGranted.mockRejectedValueOnce(
    new ForbiddenException({
        code: "AI_CONSENT_REQUIRED",
        message:
            "É necessário consentimento activo para usar esta funcionalidade de IA.",
    }),
);

await expect(service.ask(actor, id, input)).rejects.toMatchObject({
    response: expect.objectContaining({ code: "AI_CONSENT_REQUIRED" }),
});

expect(aiProvider.generatePrivateAreaAnswer).not.toHaveBeenCalled();
```

O método muda conforme o service testado: `ask` em `PrivateAreaAiService`, `ask` em `StudyGroupAiService`, `askClassAi` em `ClassAiService` e `createPlan` em `ProjectAiService`.
7. Cenário negativo/erro esperado.
   Se a chamada ao provider ocorrer antes de `assertGranted`, ou se o service ler fontes para o prompt antes de validar consentimento, o teste deve falhar. O erro esperado sem consentimento é `AI_CONSENT_REQUIRED`, não `AI_PROVIDER_UNAVAILABLE`, `NO_PRIVATE_AI_SOURCES`, `NO_GROUP_AI_SOURCES` ou outro erro posterior.

### Passo 5 - Criar cliente e painel

1. Objetivo funcional do passo no contexto da app.
   Dar controlo visível ao utilizador.
2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/features/ai-consents/ai-consents-client.ts`
    - CRIAR: `apps/web/src/features/ai-consents/ai-consents-panel.tsx`
3. Instruções do que fazer.
   Usa `requestMf3Json` e expõe conceder/revogar por finalidade.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/ai-consents/ai-consents-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Finalidades de IA expostas ao frontend.
 */
export type AiConsentPurpose =
    | "PRIVATE_AREA_AI"
    | "STUDY_GROUP_AI"
    | "CLASS_AI"
    | "PROJECT_AI";

/**
 * Decisão pública de consentimento recebida da API.
 */
export type AiConsent = {
    purpose: AiConsentPurpose;
    policyVersion: string;
    status: string;
    decidedAt: string;
};

export const CURRENT_AI_CONSENT_VERSION = "2026-06-16";

/**
 * Carrega o histórico de consentimentos do utilizador autenticado.
 */
export function loadAiConsents(): Promise<AiConsent[]> {
    return requestMf3Json<AiConsent[]>("/api/ai-consents");
}

/**
 * Concede consentimento para uma finalidade IA.
 */
export function grantAiConsent(purpose: AiConsentPurpose): Promise<AiConsent> {
    return requestMf3Json<AiConsent>(`/api/ai-consents/${purpose}`, {
        method: "PUT",
        body: JSON.stringify({
            purpose,
            policyVersion: CURRENT_AI_CONSENT_VERSION,
        }),
    });
}

/**
 * Revoga consentimento para uma finalidade IA.
 */
export function revokeAiConsent(purpose: AiConsentPurpose): Promise<AiConsent> {
    return requestMf3Json<AiConsent>(`/api/ai-consents/${purpose}`, {
        method: "DELETE",
    });
}
```

```tsx
// apps/web/src/features/ai-consents/ai-consents-panel.tsx
import { useEffect, useState } from "react";
import {
    grantAiConsent,
    loadAiConsents,
    revokeAiConsent,
} from "./ai-consents-client.js";
import type { AiConsent, AiConsentPurpose } from "./ai-consents-client.js";

const PURPOSES: AiConsentPurpose[] = [
    "PRIVATE_AREA_AI",
    "STUDY_GROUP_AI",
    "CLASS_AI",
    "PROJECT_AI",
];

/**
 * Painel de consentimentos IA por finalidade.
 */
export function AiConsentsPanel() {
    const [items, setItems] = useState<AiConsent[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingPurpose, setPendingPurpose] =
        useState<AiConsentPurpose | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAiConsents()
            .then(setItems)
            .catch((caught: unknown) =>
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível carregar consentimentos.",
                ),
            )
            .finally(() => setLoading(false));
    }, []);

    /**
     * Alterna a decisão de uma finalidade e mantém feedback visível ao utilizador.
     */
    async function toggle(
        purpose: AiConsentPurpose,
        granted: boolean,
    ): Promise<void> {
        setError(null);
        setPendingPurpose(purpose);
        try {
            const saved = granted
                ? await revokeAiConsent(purpose)
                : await grantAiConsent(purpose);
            // Mantém o histórico visível colocando a decisão mais recente no topo.
            setItems((current) => [saved, ...current]);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível guardar a decisão.",
            );
        } finally {
            setPendingPurpose(null);
        }
    }

    return (
        <section aria-labelledby="ai-consents-title">
            <h2 id="ai-consents-title">Consentimentos de IA</h2>
            {error ? <p role="alert">{error}</p> : null}
            {loading ? <p>A carregar consentimentos...</p> : null}
            {PURPOSES.map((purpose) => {
                const latest = items.find((item) => item.purpose === purpose);
                const granted = latest?.status === "GRANTED";
                const pending = pendingPurpose === purpose;
                return (
                    <button
                        key={purpose}
                        type="button"
                        disabled={pending}
                        onClick={() => toggle(purpose, granted)}
                    >
                        {purpose}:{" "}
                        {pending ? "a guardar" : granted ? "revogar" : "conceder"}
                    </button>
                );
            })}
        </section>
    );
}
```

5. Explicação do código.
   O cliente frontend concentra as chamadas HTTP para a API de consentimentos e reutiliza `requestMf3Json`, mantendo cookies HttpOnly, CSRF e tratamento de erro alinhados com os BKs anteriores. O painel não guarda permissões em storage do browser; usa sempre a API para carregar e alterar decisões.

   `items` mantém o histórico recebido, `loading` mostra o carregamento inicial, `pendingPurpose` bloqueia cliques duplicados na finalidade que está a ser guardada e `error` mostra falhas em `role="alert"`. A decisão apresentada em cada botão vem do registo mais recente encontrado para aquela finalidade. Quando o utilizador concede ou revoga, a decisão devolvida pela API é colocada no topo para que a UI reflita imediatamente o novo estado.
6. Validação do passo.
   Ao abrir o painel, deve existir uma chamada `GET /api/ai-consents`. Ao conceder `PRIVATE_AREA_AI`, deve existir `PUT /api/ai-consents/PRIVATE_AREA_AI` com `policyVersion`. Ao revogar a mesma finalidade, deve existir `DELETE /api/ai-consents/PRIVATE_AREA_AI`. Em ambos os casos, o botão deve ficar temporariamente desativado e a decisão mais recente deve aparecer como estado efectivo.
7. Cenário negativo/erro esperado.
   Falha da API ao carregar, conceder ou revogar deve aparecer em `role="alert"`. Se o `try/catch` for removido do `toggle`, a rejeição da chamada pode ficar sem feedback visível e o aluno pode pensar que a decisão foi guardada quando não foi.

### Passo 6 - Testar bloqueio sem consentimento

1. Objetivo funcional do passo no contexto da app.
   Garantir que IA fica bloqueada até haver consentimento.
2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai-consents/ai-consents.service.spec.ts`
3. Instruções do que fazer.
   Testa ausência, concessão e revogação.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/ai-consents/ai-consents.service.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { AiConsentsService } from "./ai-consents.service.js";
import { AiConsentPurpose } from "./dto/upsert-ai-consent.dto.js";
import type { Model } from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import type { AiConsentDocument } from "./schemas/ai-consent.schema.js";

describe("AiConsentsService", () => {
    const actor: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439010",
        email: "aluno@studyflow.local",
        role: "STUDENT",
    };

    it("bloqueia IA sem consentimento activo", async () => {
        const { service } = makeService(null);

        await expect(
            service.assertGranted(
                actor.id,
                AiConsentPurpose.PRIVATE_AREA_AI,
            ),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("permite IA quando o último consentimento está concedido", async () => {
        const { service } = makeService({
            purpose: AiConsentPurpose.PRIVATE_AREA_AI,
            policyVersion: "2026-06-16",
            status: "GRANTED",
            decidedAt: new Date("2026-06-16T10:00:00.000Z"),
        });

        await expect(
            service.assertGranted(
                actor.id,
                AiConsentPurpose.PRIVATE_AREA_AI,
            ),
        ).resolves.toBeUndefined();
    });

    it("bloqueia IA quando o último consentimento está revogado", async () => {
        const { service } = makeService({
            purpose: AiConsentPurpose.PRIVATE_AREA_AI,
            policyVersion: "revoked",
            status: "REVOKED",
            decidedAt: new Date("2026-06-17T10:00:00.000Z"),
        });

        await expect(
            service.assertGranted(
                actor.id,
                AiConsentPurpose.PRIVATE_AREA_AI,
            ),
        ).rejects.toMatchObject({
            response: expect.objectContaining({ code: "AI_CONSENT_REQUIRED" }),
        });
    });

    it("regista concessão e revogação como decisões novas", async () => {
        const createdRows = [
            {
                toObject: () => ({
                    purpose: AiConsentPurpose.PROJECT_AI,
                    policyVersion: "2026-06-16",
                    status: "GRANTED",
                    decidedAt: new Date("2026-06-16T10:00:00.000Z"),
                }),
            },
            {
                toObject: () => ({
                    purpose: AiConsentPurpose.PROJECT_AI,
                    policyVersion: "revoked",
                    status: "REVOKED",
                    decidedAt: new Date("2026-06-17T10:00:00.000Z"),
                }),
            },
        ];
        const { consentModel, service } = makeService(null);
        consentModel.create
            .mockResolvedValueOnce(createdRows[0])
            .mockResolvedValueOnce(createdRows[1]);

        await expect(
            service.grant(actor, {
                purpose: AiConsentPurpose.PROJECT_AI,
                policyVersion: "2026-06-16",
            }),
        ).resolves.toMatchObject({ status: "GRANTED" });

        await expect(
            service.revoke(actor, AiConsentPurpose.PROJECT_AI),
        ).resolves.toMatchObject({ status: "REVOKED" });

        expect(consentModel.create).toHaveBeenCalledTimes(2);
    });
});

type ConsentModelDouble = {
    create: jest.Mock;
    findOne: jest.Mock;
};

function makeService(latestConsent: unknown) {
    const consentModel: ConsentModelDouble = {
        create: jest.fn(),
        findOne: jest.fn(() => ({
            sort: jest.fn(() => ({
                lean: jest.fn().mockResolvedValue(latestConsent),
            })),
        })),
    };
    const service = new AiConsentsService(
        consentModel as unknown as Model<AiConsentDocument>,
    );
    return { consentModel, service };
}
```

5. Explicação do código.
   O teste cobre o default seguro e os dois estados relevantes depois da primeira decisão. Sem documento, `assertGranted` bloqueia. Com último documento `GRANTED`, a Promise resolve e o service IA pode continuar. Com último documento `REVOKED`, o erro volta a ser `AI_CONSENT_REQUIRED`. O último teste confirma que conceder e revogar criam decisões novas, em vez de apagar ou sobrescrever o histórico.

   O dobro de teste de Mongoose implementa apenas os métodos usados pelo service: `findOne`, `sort`, `lean` e `create`. Isto mantém o teste focado na regra de negócio, sem abrir ligação real a MongoDB. A conversão para `Model<AiConsentDocument>` fica isolada no helper `makeService`, deixando os cenários legíveis.
6. Validação do passo.
   `npm run test:unit -- ai-consents` deve mostrar os quatro cenários a passar: ausência bloqueia, concessão permite, revogação bloqueia e histórico append-only é preservado.
7. Cenário negativo/erro esperado.
   Se `assertGranted` aceitar ausência de registo ou último estado `REVOKED`, o teste falha. Se `grant` ou `revoke` deixarem de criar documentos novos, o teste de histórico falha e evita perder rastreabilidade.

### Passo 7 - Validar contrato final

1. Objetivo funcional do passo no contexto da app.
   Fechar RF54 e preparar políticas/quotas IA.
2. Ficheiros envolvidos:
    - REVER: todos os ficheiros deste BK e services IA editados
3. Instruções do que fazer.
   Confirma que todas as chamadas a `AI_PROVIDER` passam por consentimento.
4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.
   A validação final liga privacidade ao runtime de IA. O consentimento não pode ficar apenas no painel.
6. Validação do passo.
   `rg -n "AI_PROVIDER|assertGranted" apps/api/src/modules`.
7. Cenário negativo/erro esperado.
   Um service IA que chama provider sem `assertGranted` deve ser corrigido antes do PR.

#### Critérios de aceite

- Consentimentos são por finalidade e versão.
- Revogação bloqueia chamadas futuras.
- Nenhum endpoint recebe `targetUserId`.
- Services IA chamam `assertGranted`.
- Frontend mostra loading e erro em `role="alert"` sem guardar decisão em storage.
- Teste cobre ausência, concessão e revogação.

#### Validação final

- `npm run test:unit -- ai-consents`
- `npm run test:integration`
- `rg -n "AI_PROVIDER|assertGranted" apps/api/src/modules`
- Confirmar que cada chamada a provider IA tem uma validação de consentimento antes de preparar prompt.

#### Evidence para PR/defesa

- Output dos testes.
- Payload de consentimento concedido e revogado.
- Erro `AI_CONSENT_REQUIRED`.
- Lista dos services IA integrados.
- Captura ou registo de falha frontend apresentada em `role="alert"`.

#### Handoff

BK-MF4-07 continua a administração de utilizadores; BK-MF4-09 deve configurar modelos IA apenas depois de consentimento estar validado.

#### Changelog

- `2026-06-18`: guia reforçado com teoria, controller validado por enum, frontend com loading/erro, testes de concessão/revogação e estrutura canónica do Passo 4 corrigida.
- `2026-06-16`: guia corrigido com consentimento IA versionado e enforcement nos services IA.
