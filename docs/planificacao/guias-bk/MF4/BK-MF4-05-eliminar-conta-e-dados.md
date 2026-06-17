# BK-MF4-05 - Eliminar conta e dados.

## Header

- `doc_id`: `GUIA-BK-MF4-05`
- `bk_id`: `BK-MF4-05`
- `macro`: `MF4`
- `owner`: `Daniel`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF53`
- `fase_documental`: `Fase 2`
- `sprint`: `S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-06`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-05-eliminar-conta-e-dados.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Criar um fluxo de eliminação da própria conta com confirmação forte, revogação da sessão actual e remoção controlada de dados pessoais principais. O utilizador só pode eliminar a sua própria conta.

#### Importância

RF53 é requisito crítico de privacidade. Um fluxo inseguro pode apagar dados de terceiros, deixar sessões activas ou remover o último administrador da plataforma.

#### Scope-in

- Criar DTO com frase de confirmação.
- Criar registo de pedido de eliminação.
- Apagar áreas, materiais e eventos pessoais.
- Anonimizar o utilizador em vez de deixar email e hash activos.
- Bloquear eliminação do último admin.
- Revogar a sessão actual.
- Criar painel React com confirmação explícita.

#### Scope-out

- Backups e retenção legal fora da aplicação.
- Eliminação de dados de turmas pertencentes a outros utilizadores.
- Workflow de aprovação manual.
- Exportação prévia, coberta por BK-MF4-04.

#### Estado antes e depois

##### Estado antes

O sistema tem utilizadores, áreas, materiais, eventos e sessão opaca. Não existe endpoint seguro de eliminação.

##### Estado depois

Fica definido um módulo `account-deletion` que elimina dados pessoais directos, anonimiza a conta, regista o pedido e destrói a sessão actual.

##### Decisões de escopo

- `CANONICO`: RF53 é para todos os utilizadores.
- `CANONICO`: o backend nunca aceita `targetUserId` no pedido.
- `DERIVADO`: a frase `ELIMINAR A MINHA CONTA` reduz risco de clique acidental.
- `DERIVADO`: o último admin fica protegido por regra explícita.

#### Pre-requisitos

- `User`, `StudyArea`, `Material` e `StudyEvent` schemas.
- `SessionService.destroySession`.
- Cookie `sf_sid`.
- `SessionGuard`.
- `requestMf3Json`.

#### Glossário

- Confirmação forte: frase exacta exigida antes de executar eliminação.
- Anonimização: remoção de identificadores pessoais do documento de utilizador.
- Último admin: único utilizador com role `ADMIN`.
- Revogação de sessão: remoção do identificador opaco em Redis.

#### Conceitos teóricos essenciais

Eliminar dados é irreversível para a experiência do utilizador. Por isso, o endpoint deve ser idempotente, autenticado, limitado ao actor e testado contra privilege escalation. A sessão actual deve ser destruída no mesmo fluxo para impedir continuação de uso com dados apagados.

#### Arquitetura do BK

- Endpoint: `POST /api/privacy/account-deletion`.
- Modelo/schema: `AccountDeletionRequest`.
- Service: `AccountDeletionService`.
- Controller: `AccountDeletionController`.
- Guard: `SessionGuard`.
- Cliente: `account-deletion-client.ts`.
- Componente: `AccountDeletionPanel`.
- Testes: `account-deletion.service.spec.ts`.
- Handoff: BK-MF4-06 gere consentimentos IA antes de qualquer tratamento futuro.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/account-deletion/dto/request-account-deletion.dto.ts`
- CRIAR: `apps/api/src/modules/account-deletion/schemas/account-deletion-request.schema.ts`
- CRIAR: `apps/api/src/modules/account-deletion/account-deletion.service.ts`
- CRIAR: `apps/api/src/modules/account-deletion/account-deletion.controller.ts`
- CRIAR: `apps/api/src/modules/account-deletion/account-deletion.module.ts`
- CRIAR: `apps/api/src/modules/account-deletion/account-deletion.service.spec.ts`
- CRIAR: `apps/web/src/features/account-deletion/account-deletion-client.ts`
- CRIAR: `apps/web/src/features/account-deletion/account-deletion-panel.tsx`
- EDITAR: `apps/api/src/app.module.ts`

#### Tutorial técnico linear

### Passo 1 - Criar DTO e schema do pedido

1. Objetivo funcional do passo no contexto da app.
   Validar a intenção do utilizador e guardar rasto mínimo.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/account-deletion/dto/request-account-deletion.dto.ts`
   - CRIAR: `apps/api/src/modules/account-deletion/schemas/account-deletion-request.schema.ts`
3. Instruções do que fazer.
   A frase de confirmação é obrigatória; `reason` é opcional.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/account-deletion/dto/request-account-deletion.dto.ts
import { Equals, IsOptional, IsString, MaxLength } from "class-validator";

export const ACCOUNT_DELETION_CONFIRMATION = "ELIMINAR A MINHA CONTA";

/**
 * Pedido de eliminação feito pelo próprio utilizador.
 */
export class RequestAccountDeletionDto {
    /** A frase reduz risco de submissão acidental ou botão escondido. */
    @Equals(ACCOUNT_DELETION_CONFIRMATION)
    confirmation!: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    reason?: string;
}
```

```ts
// apps/api/src/modules/account-deletion/schemas/account-deletion-request.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AccountDeletionRequestDocument = HydratedDocument<AccountDeletionRequest>;

/**
 * Registo mínimo do pedido de eliminação de conta.
 */
@Schema({ timestamps: true, collection: "account_deletion_requests" })
export class AccountDeletionRequest {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: ["COMPLETED"], default: "COMPLETED" })
    status!: "COMPLETED";

    @Prop({ trim: true, maxlength: 300 })
    reason?: string;

    @Prop({ required: true, default: Date.now })
    completedAt!: Date;
}

export const AccountDeletionRequestSchema = SchemaFactory.createForClass(AccountDeletionRequest);
```

5. Explicação do código.
   O DTO não aceita `targetUserId`; a sessão define quem é apagado. O schema guarda rasto sem guardar dados sensíveis.
6. Validação do passo.
   Submeter outra frase deve falhar com 400.
7. Cenário negativo/erro esperado.
   Um body vazio deve ser rejeitado antes do service.

### Passo 2 - Implementar eliminação controlada

1. Objetivo funcional do passo no contexto da app.
   Apagar dados pessoais directos, proteger último admin e anonimizar conta.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/account-deletion/account-deletion.service.ts`
3. Instruções do que fazer.
   Usa transação se o MongoDB do ambiente a suportar; se não suportar, mantém a ordem idempotente indicada.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/account-deletion/account-deletion.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { User, UserDocument } from "../auth/schemas/user.schema.js";
import { Material, MaterialDocument } from "../materials/schemas/material.schema.js";
import { StudyArea, StudyAreaDocument } from "../study-areas/schemas/study-area.schema.js";
import { StudyEvent, StudyEventDocument } from "../study/schemas/study-event.schema.js";
import { RequestAccountDeletionDto } from "./dto/request-account-deletion.dto.js";
import { AccountDeletionRequest, AccountDeletionRequestDocument } from "./schemas/account-deletion-request.schema.js";

export type AccountDeletionResult = { status: "COMPLETED"; deletedStudyAreas: number; deletedMaterials: number; deletedEvents: number };

/**
 * Executa eliminação da própria conta com limites explícitos.
 */
@Injectable()
export class AccountDeletionService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(StudyArea.name) private readonly areaModel: Model<StudyAreaDocument>,
        @InjectModel(Material.name) private readonly materialModel: Model<MaterialDocument>,
        @InjectModel(StudyEvent.name) private readonly eventModel: Model<StudyEventDocument>,
        @InjectModel(AccountDeletionRequest.name) private readonly deletionModel: Model<AccountDeletionRequestDocument>,
    ) {}

    async deleteOwnAccount(actor: AuthenticatedUser, input: RequestAccountDeletionDto): Promise<AccountDeletionResult> {
        const user = await this.userModel.findById(actor.id).lean();
        if (!user) throw new NotFoundException({ code: "USER_NOT_FOUND", message: "Utilizador não encontrado." });
        if (user.role === "ADMIN") await this.assertAnotherAdminExists(actor.id);

        const userId = new Types.ObjectId(actor.id);
        const [materials, areas, events] = await Promise.all([
            this.materialModel.deleteMany({ userId }),
            this.areaModel.deleteMany({ userId }),
            this.eventModel.deleteMany({ userId }),
        ]);

        await this.userModel.updateOne(
            { _id: userId },
            {
                $set: {
                    email: `deleted-${actor.id}@studyflow.local`,
                    passwordHash: "account-deleted",
                    role: "STUDENT",
                },
            },
        );

        // O registo fica depois das remoções para reflectir uma execução concluída.
        await this.deletionModel.create({ userId, reason: input.reason?.trim(), completedAt: new Date(), status: "COMPLETED" });
        return {
            status: "COMPLETED",
            deletedStudyAreas: areas.deletedCount ?? 0,
            deletedMaterials: materials.deletedCount ?? 0,
            deletedEvents: events.deletedCount ?? 0,
        };
    }

    private async assertAnotherAdminExists(userId: string): Promise<void> {
        const adminCount = await this.userModel.countDocuments({ role: "ADMIN", _id: { $ne: new Types.ObjectId(userId) } });
        if (adminCount < 1) {
            throw new ForbiddenException({ code: "LAST_ADMIN_REQUIRED", message: "Não podes eliminar o último administrador." });
        }
    }
}
```

5. Explicação do código.
   A eliminação é limitada ao `actor.id`. A conta é anonimizada para cortar login por email antigo e a protecção de último admin evita bloquear a gestão da plataforma.
6. Validação do passo.
   Testa aluno com materiais/áreas/eventos e confirma contadores.
7. Cenário negativo/erro esperado.
   Último admin deve receber `LAST_ADMIN_REQUIRED`.

### Passo 3 - Revogar sessão no controller

1. Objetivo funcional do passo no contexto da app.
   Fechar a sessão actual depois da eliminação.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/account-deletion/account-deletion.controller.ts`
   - CRIAR: `apps/api/src/modules/account-deletion/account-deletion.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
3. Instruções do que fazer.
   Lê o cookie `sf_sid` e chama `SessionService.destroySession`.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/account-deletion/account-deletion.controller.ts
import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { SESSION_COOKIE_NAME, SessionService } from "../auth/session.service.js";
import { AccountDeletionService } from "./account-deletion.service.js";
import { RequestAccountDeletionDto } from "./dto/request-account-deletion.dto.js";

/**
 * Endpoint de eliminação da própria conta.
 */
@Controller("api/privacy/account-deletion")
@UseGuards(SessionGuard)
export class AccountDeletionController {
    constructor(
        private readonly deletionService: AccountDeletionService,
        private readonly sessionService: SessionService,
    ) {}

    @Post()
    async deleteOwnAccount(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response, @Body() input: RequestAccountDeletionDto) {
        const result = await this.deletionService.deleteOwnAccount(request.user!, input);
        const sessionId = request.cookies?.[SESSION_COOKIE_NAME];
        if (sessionId) await this.sessionService.destroySession(sessionId);
        response.clearCookie(SESSION_COOKIE_NAME);
        return result;
    }
}
```

```ts
// apps/api/src/modules/account-deletion/account-deletion.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { User, UserSchema } from "../auth/schemas/user.schema.js";
import { Material, MaterialSchema } from "../materials/schemas/material.schema.js";
import { StudyArea, StudyAreaSchema } from "../study-areas/schemas/study-area.schema.js";
import { StudyEvent, StudyEventSchema } from "../study/schemas/study-event.schema.js";
import { AccountDeletionController } from "./account-deletion.controller.js";
import { AccountDeletionService } from "./account-deletion.service.js";
import { AccountDeletionRequest, AccountDeletionRequestSchema } from "./schemas/account-deletion-request.schema.js";

/**
 * Módulo de eliminação de conta e dados pessoais directos.
 */
@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: StudyArea.name, schema: StudyAreaSchema },
            { name: Material.name, schema: MaterialSchema },
            { name: StudyEvent.name, schema: StudyEventSchema },
            { name: AccountDeletionRequest.name, schema: AccountDeletionRequestSchema },
        ]),
    ],
    controllers: [AccountDeletionController],
    providers: [AccountDeletionService],
})
export class AccountDeletionModule {}
```

5. Explicação do código.
   A revogação acontece no controller porque só ele conhece o cookie. O service mantém a regra de dados e o controller trata a sessão.
6. Validação do passo.
   Depois da eliminação, `GET /api/me` deve falhar por sessão destruída.
7. Cenário negativo/erro esperado.
   Pedido sem cookie autenticado nunca chega ao service.

### Passo 4 - Criar cliente e painel de confirmação

1. Objetivo funcional do passo no contexto da app.
   Dar ao utilizador uma acção explícita e segura.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/account-deletion/account-deletion-client.ts`
   - CRIAR: `apps/web/src/features/account-deletion/account-deletion-panel.tsx`
3. Instruções do que fazer.
   O botão só fica activo quando a frase exacta foi escrita.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/account-deletion/account-deletion-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export const ACCOUNT_DELETION_CONFIRMATION = "ELIMINAR A MINHA CONTA";

export function deleteOwnAccount(confirmation: string, reason?: string) {
    return requestMf3Json("/api/privacy/account-deletion", {
        method: "POST",
        body: JSON.stringify({ confirmation, reason }),
    });
}
```

```tsx
// apps/web/src/features/account-deletion/account-deletion-panel.tsx
import { useState } from "react";
import { ACCOUNT_DELETION_CONFIRMATION, deleteOwnAccount } from "./account-deletion-client.js";

/**
 * Painel de eliminação de conta com confirmação forte.
 */
export function AccountDeletionPanel() {
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    async function handleDelete() {
        setError(null);
        try {
            await deleteOwnAccount(confirmation, "Pedido pelo painel de privacidade.");
            setDone(true);
        } catch (err) {
            // O erro do backend fica visível; não há fallback silencioso.
            setError(err instanceof Error ? err.message : "Não foi possível eliminar a conta.");
        }
    }

    return (
        <section aria-labelledby="account-deletion-title">
            <h2 id="account-deletion-title">Eliminar conta</h2>
            {error ? <p role="alert">{error}</p> : null}
            {done ? <p>A conta foi eliminada. Inicia sessão apenas se criares uma nova conta.</p> : null}
            <label>
                Escreve {ACCOUNT_DELETION_CONFIRMATION}
                <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            </label>
            <button type="button" disabled={confirmation !== ACCOUNT_DELETION_CONFIRMATION} onClick={handleDelete}>Eliminar a minha conta</button>
        </section>
    );
}
```

5. Explicação do código.
   O frontend reduz erro humano, mas a protecção real continua no backend. O painel não guarda a confirmação nem tokens.
6. Validação do passo.
   O botão deve permanecer desativado até a frase exacta ser escrita.
7. Cenário negativo/erro esperado.
   Submissão manual com frase errada deve falhar no DTO.

### Passo 5 - Testar último admin e ownership

1. Objetivo funcional do passo no contexto da app.
   Cobrir os riscos críticos do RF53.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/account-deletion/account-deletion.service.spec.ts`
3. Instruções do que fazer.
   Testa bloqueio do último admin e eliminação só por `actor.id`.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/account-deletion/account-deletion.service.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { AccountDeletionService } from "./account-deletion.service.js";
import { ACCOUNT_DELETION_CONFIRMATION } from "./dto/request-account-deletion.dto.js";

describe("AccountDeletionService", () => {
    it("bloqueia eliminação do último administrador", async () => {
        const userModel = {
            findById: jest.fn(() => ({ lean: async () => ({ role: "ADMIN" }) })),
            countDocuments: jest.fn(async () => 0),
        };
        const service = new AccountDeletionService(userModel as never, {} as never, {} as never, {} as never, {} as never);

        await expect(
            service.deleteOwnAccount(
                { id: "507f1f77bcf86cd799439010", email: "admin@studyflow.test", role: "ADMIN" },
                { confirmation: ACCOUNT_DELETION_CONFIRMATION },
            ),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });
});
```

5. Explicação do código.
   Este teste protege a administração da plataforma. A eliminação de dados de outros utilizadores nem entra no contrato, porque não há `targetUserId`.
6. Validação do passo.
   `npm run test:unit -- account-deletion`
7. Cenário negativo/erro esperado.
   Se `assertAnotherAdminExists` for removido, o teste deve falhar.

### Passo 6 - Validar contrato final

1. Objetivo funcional do passo no contexto da app.
   Fechar RF53 com uma prova segura.
2. Ficheiros envolvidos:
   - REVER: todos os ficheiros criados neste BK
3. Instruções do que fazer.
   Testa aluno normal, último admin e sessão destruída.
4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.
   A validação final confirma dados, conta e sessão no mesmo fluxo.
6. Validação do passo.
   `npm run test:unit -- account-deletion` e teste manual com conta de aluno.
7. Cenário negativo/erro esperado.
   Último admin deve ficar bloqueado com `LAST_ADMIN_REQUIRED`.

#### Critérios de aceite

- A eliminação exige frase exacta.
- Não existe `targetUserId`.
- Último admin não pode ser eliminado.
- Áreas, materiais e eventos pessoais são removidos.
- Sessão actual é revogada.

#### Validação final

- `npm run test:unit -- account-deletion`
- `npm run test:integration`
- Teste manual com conta de aluno.

#### Evidence para PR/defesa

- Output dos testes.
- Erro `LAST_ADMIN_REQUIRED`.
- Resposta com contadores de dados eliminados.
- Prova de sessão inválida após eliminação.

#### Handoff

BK-MF4-06 deve tratar consentimentos IA como dados próprios e revogáveis, sem depender da eliminação total da conta.

#### Changelog

- `2026-06-16`: guia corrigido com confirmação forte, protecção de último admin, remoção de dados pessoais e revogação de sessão.
