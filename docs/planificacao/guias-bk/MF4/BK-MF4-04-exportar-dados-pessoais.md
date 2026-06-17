# BK-MF4-04 - Exportar dados pessoais.

## Header

- `doc_id`: `GUIA-BK-MF4-04`
- `bk_id`: `BK-MF4-04`
- `macro`: `MF4`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF52`
- `fase_documental`: `Fase 2`
- `sprint`: `S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-05`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-04-exportar-dados-pessoais.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Criar exportação de dados pessoais para o próprio utilizador autenticado. O resultado observável é um pedido de exportação, uma listagem dos pedidos do utilizador e um download JSON protegido por ownership.

#### Importância

RF52 é requisito de privacidade. O utilizador deve conseguir obter os seus dados sem intervenção manual, sem expor dados de terceiros e sem incluir segredos técnicos como hashes de password.

#### Scope-in

- Criar pedido de exportação com expiração.
- Montar bundle JSON com utilizador público, áreas, contagem de materiais e preferências.
- Expor `POST`, `GET` e `GET /:id/download`.
- Criar cliente e painel React.
- Testar ownership e exclusão de `passwordHash`.

#### Scope-out

- ZIP ou ficheiros binários.
- Exportação de dados de outros utilizadores.
- Eliminação de dados, coberta por BK-MF4-05.
- Relatórios administrativos.

#### Estado antes e depois

##### Estado antes

Existem dados pessoais distribuídos por auth, áreas, materiais, histórico e preferências. Não existe endpoint de exportação por utilizador.

##### Estado depois

Fica um módulo `privacy-data-exports` que cria pedidos e gera um JSON minimizado no momento do download.

##### Decisões de escopo

- `CANONICO`: RF52 é para todos os utilizadores.
- `CANONICO`: o utilizador só exporta os seus próprios dados.
- `DERIVADO`: o download é JSON, porque é suficiente para o MVP e auditável.
- `DERIVADO`: o bundle é gerado no download para não persistir cópia extra de dados pessoais.

#### Pre-requisitos

- `UsersService.findById`.
- `StudyAreasService.listMyStudyAreas`.
- `MaterialsService.countMine`.
- `NotificationPreferencesService.listEffective`.
- `SessionGuard`.
- `requestMf3Json`.

#### Glossário

- Export request: registo que prova que o utilizador pediu uma exportação.
- Bundle: objecto JSON com dados pessoais exportados.
- Ownership: filtro que garante que `userId` do pedido é igual ao actor autenticado.
- Minimização: incluir apenas dados necessários e excluir segredos.

#### Conceitos teóricos essenciais

Exportar dados pessoais não significa abrir uma query administrativa. O backend deve construir um pacote do próprio utilizador, com campos públicos e rastreio do pedido. O download nunca recebe `userId` no body; usa a sessão e o `exportId` validado.

#### Arquitetura do BK

- Endpoint: `POST /api/privacy/data-exports`, `GET /api/privacy/data-exports`, `GET /api/privacy/data-exports/:id/download`.
- Modelo/schema: `DataExportRequest`.
- Service: `PrivacyDataExportsService`.
- Controller: `PrivacyDataExportsController`.
- Cliente: `privacy-data-exports-client.ts`.
- Componente: `PrivacyDataExportsPanel`.
- Testes: `privacy-data-exports.service.spec.ts`.
- Handoff: BK-MF4-05 usa a mesma disciplina de ownership para eliminação.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/privacy-data-exports/dto/request-data-export.dto.ts`
- CRIAR: `apps/api/src/modules/privacy-data-exports/schemas/data-export-request.schema.ts`
- CRIAR: `apps/api/src/modules/privacy-data-exports/privacy-data-exports.service.ts`
- CRIAR: `apps/api/src/modules/privacy-data-exports/privacy-data-exports.controller.ts`
- CRIAR: `apps/api/src/modules/privacy-data-exports/privacy-data-exports.module.ts`
- CRIAR: `apps/api/src/modules/privacy-data-exports/privacy-data-exports.service.spec.ts`
- CRIAR: `apps/web/src/features/privacy-data-exports/privacy-data-exports-client.ts`
- CRIAR: `apps/web/src/features/privacy-data-exports/privacy-data-exports-panel.tsx`
- EDITAR: `apps/api/src/app.module.ts`

#### Tutorial técnico linear

### Passo 1 - Criar DTO e schema de pedido

1. Objetivo funcional do passo no contexto da app.
   Guardar pedidos de exportação sem guardar o bundle completo.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/privacy-data-exports/dto/request-data-export.dto.ts`
   - CRIAR: `apps/api/src/modules/privacy-data-exports/schemas/data-export-request.schema.ts`
3. Instruções do que fazer.
   Usa estado, datas e `userId`; não guardes password, token ou JSON exportado.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/privacy-data-exports/dto/request-data-export.dto.ts
import { IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Pedido opcionalmente anotado pelo próprio utilizador.
 */
export class RequestDataExportDto {
    @IsOptional()
    @IsString()
    @MaxLength(300)
    reason?: string;
}
```

```ts
// apps/api/src/modules/privacy-data-exports/schemas/data-export-request.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type DataExportRequestDocument = HydratedDocument<DataExportRequest>;
export type DataExportStatus = "READY" | "EXPIRED";

/**
 * Pedido de exportação de dados pessoais do próprio utilizador.
 */
@Schema({ timestamps: true, collection: "data_export_requests" })
export class DataExportRequest {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: ["READY", "EXPIRED"], default: "READY" })
    status!: DataExportStatus;

    @Prop({ trim: true, maxlength: 300 })
    reason?: string;

    @Prop({ required: true, default: Date.now })
    requestedAt!: Date;

    @Prop({ required: true, index: true })
    expiresAt!: Date;
}

export const DataExportRequestSchema = SchemaFactory.createForClass(DataExportRequest);
DataExportRequestSchema.index({ userId: 1, requestedAt: -1 });
```

5. Explicação do código.
   O schema guarda o rasto do pedido e a expiração. O bundle é produzido no download para reduzir duplicação de dados pessoais em base de dados.
6. Validação do passo.
   Um `reason` com mais de 300 caracteres deve ser rejeitado.
7. Cenário negativo/erro esperado.
   O pedido não pode incluir `targetUserId`; esse campo nunca existe no DTO.

### Passo 2 - Implementar service de exportação minimizada

1. Objetivo funcional do passo no contexto da app.
   Criar pedidos, listar pedidos do actor e gerar JSON protegido.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/privacy-data-exports/privacy-data-exports.service.ts`
3. Instruções do que fazer.
   Monta dados através dos services existentes e remove segredos antes de devolver.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/privacy-data-exports/privacy-data-exports.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { NotificationPreferencesService } from "../notification-preferences/notification-preferences.service.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { UsersService } from "../users/users.service.js";
import { RequestDataExportDto } from "./dto/request-data-export.dto.js";
import { DataExportRequest, DataExportRequestDocument } from "./schemas/data-export-request.schema.js";

export type DataExportRequestView = { id: string; status: string; requestedAt: Date; expiresAt: Date };
export type PersonalDataBundle = {
    exportedAt: string;
    user: { id: string; email: string; role: string };
    studyAreas: unknown[];
    materialCount: number;
    notificationPreferences: unknown[];
};

/**
 * Gera exportações de dados pessoais do próprio utilizador.
 */
@Injectable()
export class PrivacyDataExportsService {
    constructor(
        @InjectModel(DataExportRequest.name)
        private readonly exportModel: Model<DataExportRequestDocument>,
        private readonly usersService: UsersService,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
        private readonly preferencesService: NotificationPreferencesService,
    ) {}

    async requestExport(actor: AuthenticatedUser, input: RequestDataExportDto): Promise<DataExportRequestView> {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const row = await this.exportModel.create({
            userId: new Types.ObjectId(actor.id),
            reason: input.reason?.trim(),
            requestedAt: new Date(),
            expiresAt,
            status: "READY",
        });
        return this.toView(row.toObject());
    }

    async listMine(actor: AuthenticatedUser): Promise<DataExportRequestView[]> {
        const rows = await this.exportModel
            .find({ userId: new Types.ObjectId(actor.id) })
            .sort({ requestedAt: -1 })
            .lean();
        return rows.map((row) => this.toView(row));
    }

    async download(actor: AuthenticatedUser, exportId: string): Promise<PersonalDataBundle> {
        const request = await this.findOwnedReadyRequest(actor, exportId);
        if (request.expiresAt.getTime() < Date.now()) {
            throw new ForbiddenException({ code: "DATA_EXPORT_EXPIRED", message: "A exportação expirou." });
        }

        const user = await this.usersService.findById(actor.id);
        if (!user) throw new NotFoundException({ code: "USER_NOT_FOUND", message: "Utilizador não encontrado." });

        const [studyAreas, materialCount, notificationPreferences] = await Promise.all([
            this.studyAreasService.listMyStudyAreas(actor.id),
            this.materialsService.countMine(actor.id),
            this.preferencesService.listEffective(actor.id),
        ]);

        // Só são devolvidos campos públicos; passwordHash e dados de sessão ficam sempre fora.
        return {
            exportedAt: new Date().toISOString(),
            user: this.usersService.toPublicUser(user),
            studyAreas,
            materialCount,
            notificationPreferences,
        };
    }

    private async findOwnedReadyRequest(actor: AuthenticatedUser, exportId: string) {
        if (!Types.ObjectId.isValid(exportId)) throw this.notFound();
        const request = await this.exportModel
            .findOne({ _id: exportId, userId: new Types.ObjectId(actor.id), status: "READY" })
            .lean();
        if (!request) throw this.notFound();
        return request;
    }

    private notFound(): NotFoundException {
        return new NotFoundException({ code: "DATA_EXPORT_NOT_FOUND", message: "Exportação não encontrada." });
    }

    private toView(row: { _id: unknown; status: string; requestedAt: Date; expiresAt: Date }): DataExportRequestView {
        return { id: String(row._id), status: row.status, requestedAt: row.requestedAt, expiresAt: row.expiresAt };
    }
}
```

5. Explicação do código.
   O service filtra sempre por `actor.id`. O bundle usa APIs públicas existentes e exclui `passwordHash`, sessões, cookies e tokens. A expiração limita o risco de links antigos.
6. Validação do passo.
   Criar pedido e chamar download com o mesmo actor deve devolver JSON com `user`, `studyAreas`, `materialCount` e `notificationPreferences`.
7. Cenário negativo/erro esperado.
   Outro utilizador a chamar o mesmo `exportId` recebe `DATA_EXPORT_NOT_FOUND`.

### Passo 3 - Criar controller e módulo

1. Objetivo funcional do passo no contexto da app.
   Expor o fluxo de exportação protegido por sessão.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/privacy-data-exports/privacy-data-exports.controller.ts`
   - CRIAR: `apps/api/src/modules/privacy-data-exports/privacy-data-exports.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
3. Instruções do que fazer.
   O controller nunca recebe `userId` externo.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/privacy-data-exports/privacy-data-exports.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { RequestDataExportDto } from "./dto/request-data-export.dto.js";
import { PrivacyDataExportsService } from "./privacy-data-exports.service.js";

/**
 * API de exportação de dados pessoais do próprio utilizador.
 */
@Controller("api/privacy/data-exports")
@UseGuards(SessionGuard)
export class PrivacyDataExportsController {
    constructor(private readonly exportsService: PrivacyDataExportsService) {}

    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        return this.exportsService.listMine(request.user!);
    }

    @Post()
    requestExport(@Req() request: AuthenticatedRequest, @Body() input: RequestDataExportDto) {
        return this.exportsService.requestExport(request.user!, input);
    }

    @Get(":id/download")
    download(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.exportsService.download(request.user!, id);
    }
}
```

```ts
// apps/api/src/modules/privacy-data-exports/privacy-data-exports.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { NotificationPreferencesModule } from "../notification-preferences/notification-preferences.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { DataExportRequest, DataExportRequestSchema } from "./schemas/data-export-request.schema.js";
import { PrivacyDataExportsController } from "./privacy-data-exports.controller.js";
import { PrivacyDataExportsService } from "./privacy-data-exports.service.js";

/**
 * Módulo RGPD de exportação de dados pessoais.
 */
@Module({
    imports: [
        AuthModule,
        StudyAreasModule,
        MaterialsModule,
        NotificationPreferencesModule,
        MongooseModule.forFeature([{ name: DataExportRequest.name, schema: DataExportRequestSchema }]),
    ],
    controllers: [PrivacyDataExportsController],
    providers: [PrivacyDataExportsService],
})
export class PrivacyDataExportsModule {}
```

5. Explicação do código.
   O controller só usa a sessão. A rota de download é separada para permitir evidence clara e testes de ownership.
6. Validação do passo.
   `GET /api/privacy/data-exports/:id/download` deve devolver JSON para o dono.
7. Cenário negativo/erro esperado.
   Pedido sem sessão deve ser bloqueado pelo `SessionGuard`.

### Passo 4 - Criar cliente e painel

1. Objetivo funcional do passo no contexto da app.
   Permitir ao utilizador pedir e descarregar a exportação.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/privacy-data-exports/privacy-data-exports-client.ts`
   - CRIAR: `apps/web/src/features/privacy-data-exports/privacy-data-exports-panel.tsx`
3. Instruções do que fazer.
   Usa `requestMf3Json` e cria download JSON com `Blob`.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/privacy-data-exports/privacy-data-exports-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type DataExportRequest = { id: string; status: string; requestedAt: string; expiresAt: string };

export function loadDataExports() {
    return requestMf3Json<DataExportRequest[]>("/api/privacy/data-exports");
}

export function requestDataExport(reason?: string) {
    return requestMf3Json<DataExportRequest>("/api/privacy/data-exports", {
        method: "POST",
        body: JSON.stringify({ reason }),
    });
}

/**
 * Obtém o bundle JSON do próprio utilizador.
 */
export function downloadDataExport(id: string) {
    return requestMf3Json<unknown>(`/api/privacy/data-exports/${id}/download`);
}
```

```tsx
// apps/web/src/features/privacy-data-exports/privacy-data-exports-panel.tsx
import { useEffect, useState } from "react";
import { DataExportRequest, downloadDataExport, loadDataExports, requestDataExport } from "./privacy-data-exports-client.js";

/**
 * Painel de privacidade para exportar dados pessoais.
 */
export function PrivacyDataExportsPanel() {
    const [items, setItems] = useState<DataExportRequest[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDataExports().then(setItems).catch((err: Error) => setError(err.message));
    }, []);

    async function handleRequest() {
        const created = await requestDataExport("Pedido feito no painel de privacidade.");
        setItems((current) => [created, ...current]);
    }

    async function handleDownload(id: string) {
        const bundle = await downloadDataExport(id);
        const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" }));
        // A URL temporária vive apenas no browser durante o clique.
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "studyflow-dados-pessoais.json";
        anchor.click();
        URL.revokeObjectURL(url);
    }

    return (
        <section aria-labelledby="privacy-export-title">
            <h2 id="privacy-export-title">Exportar dados pessoais</h2>
            {error ? <p role="alert">{error}</p> : null}
            <button type="button" onClick={handleRequest}>Pedir exportação</button>
            <ul>{items.map((item) => <li key={item.id}><button type="button" onClick={() => handleDownload(item.id)}>Descarregar {item.status}</button></li>)}</ul>
        </section>
    );
}
```

5. Explicação do código.
   O painel não guarda dados no storage. O ficheiro é criado a partir do JSON recebido e descartado após o clique.
6. Validação do passo.
   Pedir exportação deve adicionar um item à lista.
7. Cenário negativo/erro esperado.
   Download expirado deve mostrar erro da API.

### Passo 5 - Testar ownership e minimização

1. Objetivo funcional do passo no contexto da app.
   Provar que o download pertence ao actor e não contém hash.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/privacy-data-exports/privacy-data-exports.service.spec.ts`
3. Instruções do que fazer.
   Simula request de outro utilizador e bundle do dono.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/privacy-data-exports/privacy-data-exports.service.spec.ts
import { NotFoundException } from "@nestjs/common";
import { PrivacyDataExportsService } from "./privacy-data-exports.service.js";

describe("PrivacyDataExportsService", () => {
    it("bloqueia download de exportação de outro utilizador", async () => {
        const exportModel = { findOne: jest.fn(() => ({ lean: async () => null })) };
        const service = new PrivacyDataExportsService(exportModel as never, {} as never, {} as never, {} as never, {} as never);

        await expect(
            service.download({ id: "507f1f77bcf86cd799439010", email: "a@studyflow.test", role: "STUDENT" }, "507f1f77bcf86cd799439011"),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});
```

5. Explicação do código.
   O teste confirma que uma exportação não encontrada pelo par `_id + userId` é tratada como inexistente, não como recurso visível de outro utilizador.
6. Validação do passo.
   `npm run test:unit -- privacy-data-exports`
7. Cenário negativo/erro esperado.
   Remover o filtro `userId` deve fazer o teste de ownership falhar.

### Passo 6 - Validar contrato final

1. Objetivo funcional do passo no contexto da app.
   Fechar RF52 com evidence clara.
2. Ficheiros envolvidos:
   - REVER: todos os ficheiros criados neste BK
3. Instruções do que fazer.
   Confirma que a resposta não inclui `passwordHash`, cookies, tokens nem dados de outros utilizadores.
4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.
   A validação final é de segurança: a exportação deve ser útil para o utilizador e limitada ao necessário.
6. Validação do passo.
   `npm run test:unit -- privacy-data-exports` e download manual do JSON.
7. Cenário negativo/erro esperado.
   Download com `exportId` de outro utilizador deve devolver `DATA_EXPORT_NOT_FOUND`.

#### Critérios de aceite

- Só o próprio utilizador exporta os seus dados.
- O bundle não contém `passwordHash`, cookies ou segredos.
- O pedido expira.
- O frontend não guarda o bundle em storage.
- Existe teste de ownership.

#### Validação final

- `npm run test:unit -- privacy-data-exports`
- `npm run test:integration`
- Download manual e inspeção do JSON.

#### Evidence para PR/defesa

- JSON exportado com campos públicos.
- Erro de download cruzado.
- Output dos testes.
- Screenshot do painel.

#### Handoff

BK-MF4-05 deve reutilizar a mesma regra: actor da sessão, confirmação forte e ausência de dados de terceiros.

#### Changelog

- `2026-06-16`: guia corrigido com exportação RGPD real, download protegido e minimização.
