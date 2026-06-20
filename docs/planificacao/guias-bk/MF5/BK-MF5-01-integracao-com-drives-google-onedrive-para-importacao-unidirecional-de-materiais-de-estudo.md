# BK-MF5-01 - Integração com Drives (Google/OneDrive) para importação unidirecional de materiais de estudo.

## Header

- `doc_id`: `GUIA-BK-MF5-01`
- `bk_id`: `BK-MF5-01`
- `macro`: `MF5`
- `owner`: `Daniel`
- `apoio`: `Kaua`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RF61`
- `fase_documental`: `Fase 2`
- `sprint`: `S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-03`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-01-integracao-com-drives-google-onedrive-para-importacao-unidirecional-de-materiais-de-estudo.md`
- `last_updated`: `2026-06-19`

#### Objetivo

Neste BK vais implementar a importação unidirecional de materiais de estudo a partir de links Google Drive ou OneDrive. A aplicação não guarda credenciais externas nem tenta sincronizar ficheiros remotos; cria apenas um material StudyFlow com URL validado e destino autorizado no backend.

#### Importância

`RF61` permite que alunos e professores reaproveitem materiais já existentes sem quebrar ownership, permissões de professor ou separação entre materiais privados e oficiais. Este BK entrega uma entrada única, validada e reutilizável para que os BKs seguintes de UX, feedback e validação trabalhem sobre um fluxo real.

#### Scope-in

- DTO `ImportExternalMaterialDto` para validar provider, destino, título e URL.
- Endpoint `POST /api/external-material-imports` protegido por sessão.
- Service `ExternalMaterialImportsService` que reutiliza `MaterialsService` e `OfficialMaterialsService`.
- Módulo NestJS e import no `AppModule`.
- Cliente API tipado e painel React com loading, sucesso e erro.
- Testes unitários para importação privada, importação oficial e bloqueio de aluno em destino oficial.

#### Scope-out

- OAuth Google/Microsoft.
- Sincronização bidirecional.
- OCR, embeddings, RAG ou indexação automática.
- Guardar passwords, cookies ou credenciais externas.
- Permitir que o frontend envie `userId`, role ou ownership.

#### Estado antes e depois

- **Antes:** materiais privados e oficiais já existem, mas não há entrada RF61 única para importar links externos com validação de destino.
- **Depois:** aluno importa link externo para a sua área de estudo e professor importa link externo para uma disciplina que controla, usando sessão real e validação no backend.

#### Pre-requisitos

- Ler `RF61` em `docs/RF.md`.
- Rever a linha `BK-MF5-01` em `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md` e `MF-VIEWS.md`.
- Confirmar que `MaterialsModule` exporta `MaterialsService`.
- Confirmar que `OfficialMaterialsModule` exporta `OfficialMaterialsService`.
- Confirmar que `SessionGuard` fica em `apps/api/src/common/guards/session.guard.ts`.
- Confirmar que `requestMf3Json` já envia cookies com `credentials: "include"`.

#### Glossário

- **Importação unidirecional:** criação de um material StudyFlow a partir de URL externo, sem sincronização futura com o provider.
- **Provider:** origem declarada pelo utilizador, neste BK `GOOGLE_DRIVE` ou `ONE_DRIVE`.
- **Destino privado:** área de estudo pertencente ao aluno autenticado.
- **Destino oficial:** disciplina oficial gerida pelo professor autenticado.
- **Ownership:** regra que impede um aluno de criar ou consultar materiais numa área de outro aluno.
- **Permissão de professor:** regra que impede utilizadores sem role `TEACHER` de criar materiais oficiais de disciplina.

#### Conceitos teóricos essenciais

- **Contrato incremental:** este BK consome os contratos de materiais privados de MF0 e materiais oficiais de MF1/MF2. O novo módulo não duplica persistência; apenas decide para que service existente deve encaminhar o pedido.
- **Route e controller:** a route define o caminho HTTP (`POST /api/external-material-imports`) e o controller recebe o pedido autenticado. O controller deve ser fino: valida sessão, recebe DTO e delega a regra de negócio para o service.
- **DTO e validação:** o DTO rejeita provider, destino, título e URL inválidos antes de o service tocar em dados. Isto evita que a UI ou pedidos manuais criem materiais incoerentes.
- **Service de domínio:** o service decide se o destino é uma área privada ou uma disciplina oficial. Esta decisão fica no backend porque o frontend não é fonte confiável de permissões.
- **Sessão autenticada:** `request.user` vem do `SessionGuard` e usa o contrato `AuthenticatedUser`, com roles `STUDENT`, `TEACHER` e `ADMIN`. O body nunca envia `userId`.
- **Ownership privado:** para áreas privadas, o service chama `MaterialsService.submitTextMaterial(actor.id, targetId, ...)`. O `actor.id` vem da sessão e o `MaterialsService` confirma se a área pertence ao aluno.
- **Material oficial:** para disciplina oficial, o service exige `TEACHER` e chama `OfficialMaterialsService.createOfficialMaterial`. Esse service valida se a disciplina pertence ao professor.
- **Privacidade e RGPD:** URLs partilhados podem conter nomes de ficheiros, turmas ou dados pessoais. Por isso, o fluxo não coloca URLs em logs, mensagens de erro, query string ou storage persistente do browser.
- **Estado React:** loading, erro e sucesso tornam a chamada assíncrona compreensível para o utilizador e evitam cliques repetidos durante a submissão.
- **Evidence técnico:** testes unitários e pedidos HTTP demonstram que o fluxo funciona, bloqueia acesso indevido e preserva contratos de segurança.

#### Arquitetura do BK

O frontend envia provider, tipo de destino, ID do destino, título e URL. O controller recebe a sessão, o DTO valida o body e o service encaminha para materiais privados ou oficiais. O backend continua a ser a única fonte de autorização: `targetId` indica o destino pedido, mas ownership e permissão são confirmados nos services herdados.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/external-material-imports/dto/import-external-material.dto.ts` - contrato de entrada RF61.
- CRIAR: `apps/api/src/modules/external-material-imports/external-material-imports.service.ts` - encaminhamento seguro entre materiais privados e oficiais.
- CRIAR: `apps/api/src/modules/external-material-imports/external-material-imports.controller.ts` - endpoint autenticado.
- CRIAR: `apps/api/src/modules/external-material-imports/external-material-imports.module.ts` - módulo NestJS.
- EDITAR: `apps/api/src/app.module.ts` - registo do novo módulo.
- CRIAR: `apps/api/src/modules/external-material-imports/external-material-imports.service.spec.ts` - testes unitários de contrato e segurança.
- CRIAR: `apps/web/src/features/mf5/external-material-imports-client.ts` - cliente API tipado.
- CRIAR: `apps/web/src/features/mf5/external-material-import-panel.tsx` - painel React.
- REVER: páginas de materiais privados e oficiais onde o painel será colocado.

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e destinos permitidos

1. Objetivo funcional do passo no contexto da app.

Confirmar que `RF61` cobre importação por link Google Drive ou OneDrive, sem credenciais externas e sem sincronização com o provider.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - LOCALIZAÇÃO: linhas de `RF61` e `BK-MF5-01`

3. Instruções do que fazer.

Regista mentalmente três decisões. Primeiro, `RF61` é CANONICO para alunos e professores. Segundo, aceitar apenas `GOOGLE_DRIVE` e `ONE_DRIVE` é DERIVADO a partir do texto do requisito. Terceiro, `POST /api/external-material-imports` é DERIVADO para criar uma entrada única sem duplicar endpoints de materiais privados e oficiais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e preparatório, porque fixa o contrato antes de criares ficheiros.

5. Explicação do código.

Não há código porque ainda estás a fechar o domínio. Esta pausa evita que confundas importação por link com OAuth, sincronização de ficheiros, OCR ou indexação automática. Essas capacidades não pertencem a este BK.

6. Validação do passo.

Confirma que o header mantém `rf_rnf: RF61`, `proximo_bk: BK-MF5-03` e que a matriz também liga `BK-MF5-01` a `BK-MF5-03`.

7. Cenário negativo/erro esperado.

Se encontrares referência a um BK intermédio que não aparece na matriz, não o cries dentro deste guia: a sequência canónica deste requisito segue para `BK-MF5-03`.

### Passo 2 - Criar DTO, service, controller e módulo backend

1. Objetivo funcional do passo no contexto da app.

Criar o backend completo de RF61, com validação de input, sessão real, ownership privado e permissão oficial no backend.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/external-material-imports/dto/import-external-material.dto.ts`
    - CRIAR: `apps/api/src/modules/external-material-imports/external-material-imports.service.ts`
    - CRIAR: `apps/api/src/modules/external-material-imports/external-material-imports.controller.ts`
    - CRIAR: `apps/api/src/modules/external-material-imports/external-material-imports.module.ts`
    - LOCALIZAÇÃO: ficheiros completos

3. Instruções do que fazer.

Cria a pasta `external-material-imports`, cria a subpasta `dto` e adiciona os quatro ficheiros seguintes. Mantém imports com extensão `.js`, porque a API real usa TypeScript em modo ES Modules.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/external-material-imports/dto/import-external-material.dto.ts
import { IsEnum, IsString, IsUrl, Length } from "class-validator";

/** Origem externa permitida para a importação unidirecional de materiais StudyFlow. */
export enum ExternalMaterialProvider {
    GoogleDrive = "GOOGLE_DRIVE",
    OneDrive = "ONE_DRIVE",
}

/** Destino interno onde o link externo ficará registado como material. */
export enum ExternalMaterialTargetType {
    PrivateStudyArea = "PRIVATE_STUDY_AREA",
    OfficialSubject = "OFFICIAL_SUBJECT",
}

/**
 * Dados recebidos pelo endpoint RF61.
 *
 * O utilizador autenticado vem da sessão, por isso este DTO nunca aceita
 * `userId`, role ou campos de ownership enviados pelo browser.
 */
export class ImportExternalMaterialDto {
    /** Provider declarado pelo utilizador para explicar a origem do link. */
    @IsEnum(ExternalMaterialProvider)
    provider!: ExternalMaterialProvider;

    /** Tipo de destino interno escolhido pelo utilizador. */
    @IsEnum(ExternalMaterialTargetType)
    targetType!: ExternalMaterialTargetType;

    /** Identificador da área de estudo privada ou da disciplina oficial. */
    @IsString()
    @Length(12, 80)
    targetId!: string;

    /** Título visível na lista de materiais StudyFlow. */
    @IsString()
    @Length(3, 120)
    title!: string;

    /** URL externo guardado como referência, sem credenciais do provider. */
    @IsUrl({ require_protocol: true, protocols: ["http", "https"] })
    sourceUrl!: string;
}
```

```ts
// apps/api/src/modules/external-material-imports/external-material-imports.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialsService } from "../materials/materials.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import {
    ExternalMaterialTargetType,
    ImportExternalMaterialDto,
} from "./dto/import-external-material.dto.js";

/**
 * Encaminha links externos para materiais privados ou oficiais sem duplicar regras de persistência.
 */
@Injectable()
export class ExternalMaterialImportsService {
    /**
     * Recebe os services herdados de BKs anteriores.
     *
     * @param materialsService Service de materiais privados por área de estudo.
     * @param officialMaterialsService Service de materiais oficiais por disciplina.
     */
    constructor(
        private readonly materialsService: MaterialsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
    ) {}

    /**
     * Importa um link externo para o destino pedido.
     *
     * @param actor Utilizador autenticado anexado pelo `SessionGuard`.
     * @param dto Dados validados do pedido RF61.
     * @returns Material criado pelo service especializado.
     * @throws ForbiddenException quando um aluno tenta criar material oficial.
     */
    async importExternalMaterial(
        actor: AuthenticatedUser,
        dto: ImportExternalMaterialDto,
    ) {
        if (dto.targetType === ExternalMaterialTargetType.PrivateStudyArea) {
            // O userId vem da sessão para impedir que o frontend escolha o dono do material.
            return this.materialsService.submitTextMaterial(actor.id, dto.targetId, {
                title: dto.title,
                type: "URL",
                url: dto.sourceUrl,
            });
        }

        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Apenas professores podem importar materiais oficiais.",
            });
        }

        // O provider fica no contrato RF61; o service oficial mantém apenas o DTO que já conhece.
        return this.officialMaterialsService.createOfficialMaterial(
            actor,
            dto.targetId,
            {
                title: dto.title,
                type: "URL",
                sourceUrl: dto.sourceUrl,
            },
        );
    }
}
```

```ts
// apps/api/src/modules/external-material-imports/external-material-imports.controller.ts
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ImportExternalMaterialDto } from "./dto/import-external-material.dto.js";
import { ExternalMaterialImportsService } from "./external-material-imports.service.js";

/**
 * Endpoint autenticado para importação unidirecional de materiais externos.
 */
@Controller("api/external-material-imports")
@UseGuards(SessionGuard)
export class ExternalMaterialImportsController {
    /**
     * Recebe o service para manter o controller fino e testável.
     *
     * @param importsService Service que aplica ownership e permissões.
     */
    constructor(private readonly importsService: ExternalMaterialImportsService) {}

    /**
     * Cria um material StudyFlow a partir de um link externo validado.
     *
     * @param request Pedido autenticado com `request.user` preenchido pelo guard.
     * @param body Dados validados pelo DTO.
     * @returns Material privado ou oficial criado pelo service adequado.
     */
    @Post()
    importExternalMaterial(
        @Req() request: AuthenticatedRequest,
        @Body() body: ImportExternalMaterialDto,
    ) {
        // A sessão autenticada é a fonte de identidade, nunca o body enviado pelo browser.
        return this.importsService.importExternalMaterial(request.user!, body);
    }
}
```

```ts
// apps/api/src/modules/external-material-imports/external-material-imports.module.ts
import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import { ExternalMaterialImportsController } from "./external-material-imports.controller.js";
import { ExternalMaterialImportsService } from "./external-material-imports.service.js";

/**
 * Regista a importação externa RF61 e reutiliza os módulos de materiais já existentes.
 */
@Module({
    imports: [
        AuthModule,
        MaterialsModule,
        OfficialMaterialsModule,
    ],
    controllers: [ExternalMaterialImportsController],
    providers: [ExternalMaterialImportsService],
})
export class ExternalMaterialImportsModule {}
```

5. Explicação do código.

O DTO define o contrato público do endpoint e impede campos de identidade vindos do frontend. O service reutiliza `MaterialsService.submitTextMaterial` para áreas privadas, mantendo ownership no service herdado de MF0. Para materiais oficiais, exige `actor.role === "TEACHER"` porque `OfficialMaterialsService.createOfficialMaterial` também valida professor e disciplina. O controller usa `@Controller("api/external-material-imports")`, alinhado com os restantes controllers reais, que incluem `api/` no decorator. O módulo importa `AuthModule`, `MaterialsModule` e `OfficialMaterialsModule` para que o guard e os services estejam disponíveis por injeção.

6. Validação do passo.

Depois de criar os ficheiros, executa `npm run build` em `apps/api`. O expected result é build sem erro de import, sem erro de role e com rota `POST /api/external-material-imports` registada.

7. Cenário negativo/erro esperado.

Com sessão de aluno e `targetType: "OFFICIAL_SUBJECT"`, o expected result é `403 Forbidden` com código `TEACHER_ROLE_REQUIRED`. Isto prova que a autorização oficial não fica na UI.

### Passo 3 - Registar o módulo no AppModule

1. Objetivo funcional do passo no contexto da app.

Garantir que o endpoint novo fica montado na API real.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/app.module.ts`
    - LOCALIZAÇÃO: imports do topo e array `imports` do `@Module`

3. Instruções do que fazer.

Adiciona o import de `ExternalMaterialImportsModule` e inclui o módulo no array `imports`, perto dos módulos de materiais e integrações.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/app.module.ts
import "./common/config/load-env.js";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./modules/auth/auth.module.js";
import { StudentsModule } from "./modules/students/students.module.js";
import { StudyModule } from "./modules/study/study.module.js";
import { StudyAreasModule } from "./modules/study-areas/study-areas.module.js";
import { MaterialsModule } from "./modules/materials/materials.module.js";
import { AiModule } from "./modules/ai/ai.module.js";
import { StudyRoomsModule } from "./modules/study-rooms/study-rooms.module.js";
import { ClassesModule } from "./modules/classes/classes.module.js";
import { SubjectsModule } from "./modules/subjects/subjects.module.js";
import { OfficialMaterialsModule } from "./modules/official-materials/official-materials.module.js";
import { ExternalMaterialImportsModule } from "./modules/external-material-imports/external-material-imports.module.js";
import { TeacherAiModule } from "./modules/teacher-ai/teacher-ai.module.js";
import { ClassAiModule } from "./modules/class-ai/class-ai.module.js";
import { ClassPostsModule } from "./modules/class-posts/class-posts.module.js";
import { Mf2Module } from "./modules/mf2/mf2.module.js";
import { AdaptiveExplanationsModule } from "./modules/adaptive-explanations/adaptive-explanations.module.js";
import { AiGuardrailsModule } from "./modules/ai-guardrails/ai-guardrails.module.js";
import { CurriculumNavigationModule } from "./modules/curriculum-navigation/curriculum-navigation.module.js";
import { ExternalKnowledgeAiModule } from "./modules/external-knowledge-ai/external-knowledge-ai.module.js";
import { NotificationPreferencesModule } from "./modules/notification-preferences/notification-preferences.module.js";
import { SourceGroundedAiModule } from "./modules/source-grounded-ai/source-grounded-ai.module.js";
import { StudyAlertsModule } from "./modules/study-alerts/study-alerts.module.js";
import { StudyGroupAiModule } from "./modules/study-group-ai/study-group-ai.module.js";
import { StudyGroupMessagesModule } from "./modules/study-group-messages/study-group-messages.module.js";
import { StudyGroupSessionsModule } from "./modules/study-group-sessions/study-group-sessions.module.js";
import { StudyGroupsModule } from "./modules/study-groups/study-groups.module.js";
import { UnifiedSearchModule } from "./modules/unified-search/unified-search.module.js";
import { AccountDeletionModule } from "./modules/account-deletion/account-deletion.module.js";
import { AdminUsersModule } from "./modules/admin-users/admin-users.module.js";
import { AiConsentsModule } from "./modules/ai-consents/ai-consents.module.js";
import { AiModelPoliciesModule } from "./modules/ai-model-policies/ai-model-policies.module.js";
import { AiQuotasModule } from "./modules/ai-quotas/ai-quotas.module.js";
import { AuditLogModule } from "./modules/audit-log/audit-log.module.js";
import { ContextNotificationsModule } from "./modules/context-notifications/context-notifications.module.js";
import { FollowUpAlertsModule } from "./modules/follow-up-alerts/follow-up-alerts.module.js";
import { NotificationPoliciesModule } from "./modules/notification-policies/notification-policies.module.js";
import { PrivacyDataExportsModule } from "./modules/privacy-data-exports/privacy-data-exports.module.js";

/**
 * Módulo raiz da API.
 */
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
        ExternalMaterialImportsModule,
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
        AdminUsersModule,
        AuditLogModule,
        PrivacyDataExportsModule,
        AccountDeletionModule,
        AiConsentsModule,
        ContextNotificationsModule,
        FollowUpAlertsModule,
        NotificationPoliciesModule,
        AiModelPoliciesModule,
        AiQuotasModule,
    ],
})
export class AppModule {}
```

5. Explicação do código.

Este ficheiro é o ponto onde a API passa a conhecer o novo módulo. Sem este registo, os ficheiros do passo anterior poderiam compilar, mas a route não ficaria disponível para o frontend. A posição junto de `OfficialMaterialsModule` torna explícito que este BK depende dos contratos de materiais privados e oficiais, sem criar outro modelo de material.

6. Validação do passo.

Executa `npm run build` em `apps/api` e confirma que não existe erro de módulo não encontrado.

7. Cenário negativo/erro esperado.

Se te esqueceres deste import, um pedido para `POST /api/external-material-imports` devolve `404 Not Found`, mesmo que o controller exista no disco.

### Passo 4 - Criar cliente API e painel React

1. Objetivo funcional do passo no contexto da app.

Dar ao aluno ou professor uma interface simples para submeter o link externo sem guardar dados sensíveis no browser.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/features/mf5/external-material-imports-client.ts`
    - CRIAR: `apps/web/src/features/mf5/external-material-import-panel.tsx`
    - EDITAR: página de materiais privados ou oficiais onde o painel deve aparecer
    - LOCALIZAÇÃO: ficheiros completos

3. Instruções do que fazer.

Cria primeiro o cliente API tipado. Depois cria o painel e importa-o na página de materiais que já tem o `targetId` disponível. Em área privada usa `targetType="PRIVATE_STUDY_AREA"`; em disciplina oficial usa `targetType="OFFICIAL_SUBJECT"`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/mf5/external-material-imports-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/** Provider externo aceite pelo RF61. */
export type ExternalMaterialProvider = "GOOGLE_DRIVE" | "ONE_DRIVE";

/** Destino interno aceite pelo endpoint de importação externa. */
export type ExternalMaterialTargetType = "PRIVATE_STUDY_AREA" | "OFFICIAL_SUBJECT";

/** Pedido enviado pelo painel MF5 para criar o material por URL. */
export type ImportExternalMaterialInput = {
    provider: ExternalMaterialProvider;
    targetType: ExternalMaterialTargetType;
    targetId: string;
    title: string;
    sourceUrl: string;
};

/** Material devolvido pela API depois da criação. */
export type ImportedExternalMaterial = {
    _id: string;
    title: string;
    type: "URL";
    status: string;
    url?: string;
    sourceUrl?: string;
};

/**
 * Cria um material StudyFlow a partir de um link externo.
 *
 * @param input Dados preenchidos pelo aluno ou professor.
 * @returns Material criado pelo backend autenticado.
 */
export function importExternalMaterial(
    input: ImportExternalMaterialInput,
): Promise<ImportedExternalMaterial> {
    return requestMf3Json<ImportedExternalMaterial>("/api/external-material-imports", {
        method: "POST",
        // O cliente envia apenas o contrato funcional; sessão e ownership seguem nos cookies HttpOnly.
        body: JSON.stringify(input),
    });
}
```

```tsx
// apps/web/src/features/mf5/external-material-import-panel.tsx
import { FormEvent, useId, useState } from "react";
import {
    ExternalMaterialProvider,
    ExternalMaterialTargetType,
    importExternalMaterial,
} from "./external-material-imports-client.js";

type ExternalMaterialImportPanelProps = {
    targetType: ExternalMaterialTargetType;
    targetId: string;
    onImported?: () => void;
};

/**
 * Formulário acessível para importar links Drive/OneDrive para materiais StudyFlow.
 *
 * @param props Destino interno e callback de atualização da página.
 * @returns Painel de importação RF61.
 */
export function ExternalMaterialImportPanel({
    targetType,
    targetId,
    onImported,
}: ExternalMaterialImportPanelProps) {
    const providerId = useId();
    const titleId = useId();
    const urlId = useId();
    const [provider, setProvider] = useState<ExternalMaterialProvider>("GOOGLE_DRIVE");
    const [title, setTitle] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus("loading");
        setMessage("A importar material externo...");

        try {
            await importExternalMaterial({
                provider,
                targetType,
                targetId,
                title,
                sourceUrl,
            });
            setStatus("success");
            setMessage("Material importado para o StudyFlow.");
            setTitle("");
            setSourceUrl("");
            onImported?.();
        } catch {
            // A mensagem é controlada para não mostrar URLs privados, IDs internos ou detalhes de permissões.
            setStatus("error");
            setMessage("Não foi possível importar este link. Confirma o URL e as permissões.");
        }
    }

    return (
        <form
            className="space-y-3 rounded border border-slate-200 bg-white p-4"
            onSubmit={handleSubmit}
        >
            <h2 className="text-lg font-semibold text-slate-900">
                Importar de Drive ou OneDrive
            </h2>

            <label className="block text-sm font-medium text-slate-800" htmlFor={providerId}>
                Origem
            </label>
            <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                id={providerId}
                value={provider}
                onChange={(event) => setProvider(event.target.value as ExternalMaterialProvider)}
            >
                <option value="GOOGLE_DRIVE">Google Drive</option>
                <option value="ONE_DRIVE">OneDrive</option>
            </select>

            <label className="block text-sm font-medium text-slate-800" htmlFor={titleId}>
                Título
            </label>
            <input
                className="w-full rounded border border-slate-300 px-3 py-2"
                id={titleId}
                minLength={3}
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
            />

            <label className="block text-sm font-medium text-slate-800" htmlFor={urlId}>
                URL partilhado
            </label>
            <input
                className="w-full rounded border border-slate-300 px-3 py-2"
                id={urlId}
                required
                type="url"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
            />

            <button
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={status === "loading"}
                type="submit"
            >
                {status === "loading" ? "A importar..." : "Importar material"}
            </button>

            {message ? (
                <p aria-live="polite" className="text-sm text-slate-700">
                    {message}
                </p>
            ) : null}
        </form>
    );
}
```

5. Explicação do código.

O cliente usa `requestMf3Json`, que já envia cookies HttpOnly com `credentials: "include"` e header CSRF. O painel mantém estado local para provider, título, URL, loading e mensagens. O browser valida `type="url"` e `minLength`, mas isto é apenas experiência de utilizador; a validação que decide segurança fica no DTO e nos services backend. A mensagem de erro é curta para não expor URLs privados nem IDs internos.

6. Validação do passo.

Coloca o painel numa página com `targetId` real, submete `https://example.com/material.pdf` e confirma mensagem de sucesso. Depois recarrega a lista de materiais usando `onImported`.

7. Cenário negativo/erro esperado.

Sem sessão, o backend devolve `401 Unauthorized` e o painel mostra mensagem controlada. Com URL sem protocolo, o backend devolve `400 Bad Request`.

### Passo 5 - Criar testes unitários de contrato e segurança

1. Objetivo funcional do passo no contexto da app.

Provar que o service usa `actor.id` para materiais privados, bloqueia aluno em material oficial e delega material oficial para o service correto.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/external-material-imports/external-material-imports.service.spec.ts`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o teste abaixo e executa Jest para este ficheiro. Os dobros de teste existem só dentro do teste; a implementação real continua a usar os services injetados pelo módulo.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/external-material-imports/external-material-imports.service.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialsService } from "../materials/materials.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import {
    ExternalMaterialProvider,
    ExternalMaterialTargetType,
} from "./dto/import-external-material.dto.js";
import { ExternalMaterialImportsService } from "./external-material-imports.service.js";

const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT",
};

const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439013",
    email: "professor@example.test",
    role: "TEACHER",
};

const studyAreaId = "507f1f77bcf86cd799439014";
const subjectId = "507f1f77bcf86cd799439015";

describe("ExternalMaterialImportsService", () => {
    it("importa URL para área privada usando o aluno autenticado", async () => {
        const { materialsService, officialMaterialsService, service } = makeService();
        materialsService.submitTextMaterial.mockResolvedValue({
            _id: "507f1f77bcf86cd799439016",
            title: "Resumo Drive",
            type: "URL",
            status: "PENDING_PROCESSING",
            url: "https://drive.google.com/file/d/abc",
        });

        await expect(
            service.importExternalMaterial(student, {
                provider: ExternalMaterialProvider.GoogleDrive,
                targetType: ExternalMaterialTargetType.PrivateStudyArea,
                targetId: studyAreaId,
                title: "Resumo Drive",
                sourceUrl: "https://drive.google.com/file/d/abc",
            }),
        ).resolves.toMatchObject({
            title: "Resumo Drive",
            type: "URL",
        });

        expect(materialsService.submitTextMaterial).toHaveBeenCalledWith(
            student.id,
            studyAreaId,
            {
                title: "Resumo Drive",
                type: "URL",
                url: "https://drive.google.com/file/d/abc",
            },
        );
        expect(officialMaterialsService.createOfficialMaterial).not.toHaveBeenCalled();
    });

    it("bloqueia aluno que tenta importar material oficial", async () => {
        const { materialsService, officialMaterialsService, service } = makeService();

        await expect(
            service.importExternalMaterial(student, {
                provider: ExternalMaterialProvider.OneDrive,
                targetType: ExternalMaterialTargetType.OfficialSubject,
                targetId: subjectId,
                title: "Ficha OneDrive",
                sourceUrl: "https://onedrive.live.com/view.aspx?id=abc",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);

        // O erro acontece antes de tocar em persistência oficial ou privada.
        expect(materialsService.submitTextMaterial).not.toHaveBeenCalled();
        expect(officialMaterialsService.createOfficialMaterial).not.toHaveBeenCalled();
    });

    it("delega importação oficial para o service de materiais oficiais", async () => {
        const { materialsService, officialMaterialsService, service } = makeService();
        officialMaterialsService.createOfficialMaterial.mockResolvedValue({
            _id: "507f1f77bcf86cd799439017",
            subjectId,
            classId: "507f1f77bcf86cd799439018",
            teacherId: teacher.id,
            title: "Ficha OneDrive",
            type: "URL",
            status: "REFERENCE_ONLY",
            sourceUrl: "https://onedrive.live.com/view.aspx?id=abc",
        });

        await expect(
            service.importExternalMaterial(teacher, {
                provider: ExternalMaterialProvider.OneDrive,
                targetType: ExternalMaterialTargetType.OfficialSubject,
                targetId: subjectId,
                title: "Ficha OneDrive",
                sourceUrl: "https://onedrive.live.com/view.aspx?id=abc",
            }),
        ).resolves.toMatchObject({
            title: "Ficha OneDrive",
            type: "URL",
            status: "REFERENCE_ONLY",
        });

        expect(officialMaterialsService.createOfficialMaterial).toHaveBeenCalledWith(
            teacher,
            subjectId,
            {
                title: "Ficha OneDrive",
                type: "URL",
                sourceUrl: "https://onedrive.live.com/view.aspx?id=abc",
            },
        );
        expect(materialsService.submitTextMaterial).not.toHaveBeenCalled();
    });
});

/**
 * Cria dependências controladas para testar apenas a regra do service RF61.
 *
 * @returns Service em teste e dependências observáveis.
 */
function makeService() {
    const materialsService = {
        submitTextMaterial: jest.fn(),
    };
    const officialMaterialsService = {
        createOfficialMaterial: jest.fn(),
    };

    return {
        materialsService,
        officialMaterialsService,
        service: new ExternalMaterialImportsService(
            materialsService as never as MaterialsService,
            officialMaterialsService as never as OfficialMaterialsService,
        ),
    };
}
```

5. Explicação do código.

O primeiro teste garante que o service usa `student.id` da sessão e não aceita dono vindo do pedido. O segundo teste prova o negativo de segurança: aluno não cria material oficial. O terceiro teste confirma que professor cria material oficial usando o contrato real de `OfficialMaterialsService`, sem campo `provider` no DTO oficial. Os `jest.fn()` observam chamadas sem substituir a regra de produção; a regra de produção está no service que estás a testar.

6. Validação do passo.

Executa `npm run test:unit -- external-material-imports` em `apps/api`, ou o comando Jest equivalente configurado no projeto. O expected result é três testes a passar.

7. Cenário negativo/erro esperado.

Se o teste oficial esperar `{ provider: ... }` dentro do DTO oficial, deve falhar. Esse campo pertence ao DTO RF61, mas não ao contrato de `CreateOfficialMaterialDto`.

### Passo 6 - Validar segurança, privacidade e experiência final

1. Objetivo funcional do passo no contexto da app.

Confirmar que a funcionalidade é segura, compreensível e não expõe dados sensíveis em fluxos de erro.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/external-material-imports/*`
    - REVER: `apps/web/src/features/mf5/external-material-import-panel.tsx`
    - LOCALIZAÇÃO: validação manual, terminal e browser

3. Instruções do que fazer.

Testa quatro caminhos: sucesso em área privada, sucesso oficial com professor, bloqueio oficial com aluno e URL inválido. No browser, confirma que o botão fica desativado durante loading e que a mensagem não mostra URL, cookie, ID interno ou stack trace.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação operacional e privacidade depois de criares os ficheiros.

5. Explicação do código.

O código dos passos anteriores já contém a proteção. Aqui estás a provar comportamento observável: `401` sem sessão, `400` para DTO inválido, `403` para role errada e sucesso quando ownership ou permissão são válidos. Esta verificação também protege RGPD porque confirma que URLs e dados pessoais não aparecem em mensagens de erro.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run build
npm run test:unit -- external-material-imports
cd ../web
npm run build
```

7. Cenário negativo/erro esperado.

Se o frontend conseguir criar material oficial apenas alterando `targetType` no browser, a correção está errada: o backend tem de bloquear com `403`.

### Passo 7 - Preparar handoff para BK-MF5-03

1. Objetivo funcional do passo no contexto da app.

Deixar contratos claros para os BKs seguintes de interface, feedback e validação.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/external-material-imports/*`
    - REVER: `apps/web/src/features/mf5/external-material-imports-client.ts`
    - REVER: `apps/web/src/features/mf5/external-material-import-panel.tsx`
    - LOCALIZAÇÃO: secções `Critérios de aceite`, `Evidence` e `Handoff`

3. Instruções do que fazer.

Regista no PR que este BK entrega `POST /api/external-material-imports`, `importExternalMaterial` e `ExternalMaterialImportPanel`. Não alteres o contrato de materiais oficiais noutros BKs para guardar provider; essa decisão só deve existir se a matriz ou RF/RNF passar a pedi-la.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de handoff técnico e defesa.

5. Explicação do código.

O handoff evita que `BK-MF5-03`, `BK-MF5-05` e `BK-MF5-08` inventem nomes ou endpoints diferentes. O painel já expõe estados básicos; os BKs seguintes podem melhorar clareza visual, feedback e validação sem mover autorização para o frontend.

6. Validação do passo.

Pesquisa `external-material-imports` no backend e frontend e confirma que só existe um endpoint para a acção RF61.

7. Cenário negativo/erro esperado.

Se aparecer outro endpoint para a mesma acção, por exemplo `POST /api/drive/import`, mantém apenas o contrato deste BK ou regista drift antes de avançar.

#### Critérios de aceite

- `POST /api/external-material-imports` existe e está protegido por `SessionGuard`.
- DTO rejeita provider, destino, título e URL inválidos.
- Aluno importa URL apenas para área privada validada pelo backend.
- Professor importa URL oficial apenas para disciplina validada pelo backend.
- Aluno recebe `403` ao tentar destino oficial.
- Frontend usa cliente API tipado e `requestMf3Json`.
- Painel mostra loading, sucesso e erro sem expor dados sensíveis.
- Testes unitários cobrem sucesso privado, bloqueio oficial de aluno e sucesso oficial de professor.

#### Validação final

Executa, depois de aplicares o código:

```bash
cd apps/api
npm run build
npm run test:unit -- external-material-imports
cd ../web
npm run build
```

Expected results:

- Build backend sem erro de imports ESM, rota ou tipos.
- Testes do service com três cenários a passar.
- Build web sem erro no cliente ou no painel.
- Pedido sem sessão devolve `401`.
- Pedido com aluno para destino oficial devolve `403`.
- Pedido com URL inválido devolve `400`.

#### Evidence para PR/defesa

- Print ou output do teste unitário de `ExternalMaterialImportsService`.
- Output do build backend.
- Output do build web.
- Pedido `POST /api/external-material-imports` com área privada e resposta `201` ou `200`, conforme configuração NestJS.
- Pedido `POST /api/external-material-imports` com aluno e destino oficial a devolver `403`.
- Print do painel em estado loading, sucesso e erro.

#### Handoff

`BK-MF5-03` pode melhorar a clareza visual do painel sem alterar endpoint. `BK-MF5-05` pode reutilizar o estado de loading/sucesso/erro para feedback global. `BK-MF5-08` pode reforçar validação de formulário no frontend, mantendo a validação backend deste BK. `BK-MF6-01` recebe materiais URL em estado adequado para processamento futuro, sem promessa de OCR, RAG ou indexação automática nesta fase.

#### Changelog

- 2026-06-19: Corrigido o guia para alinhar imports ES Modules, rota `/api`, `AuthenticatedUser`, contrato de materiais oficiais, módulo, cliente API e teste unitário com a app dos alunos `apps`.
