# BK-MF4-07 - Gestão de utilizadores e papéis.

## Header

- `doc_id`: `GUIA-BK-MF4-07`
- `bk_id`: `BK-MF4-07`
- `macro`: `MF4`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-04`
- `rf_rnf`: `RF55`
- `fase_documental`: `Fase 2`
- `sprint`: `S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-08`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-07-gestao-de-utilizadores-e-papeis.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Criar gestão administrativa de utilizadores e papéis sobre o schema real `User`. O administrador consegue listar utilizadores públicos e alterar `role` com razão obrigatória, protegendo o último admin.

#### Importância

RF55 é base de administração e segurança. Alterar papéis sem validação permite privilege escalation; não alterar o `UserRole` real deixa a funcionalidade apenas documental.

#### Scope-in

- Criar DTO `ChangeUserRoleDto`.
- Criar schema `UserRoleChange`.
- Listar utilizadores sem `passwordHash`.
- Alterar `User.role` real.
- Bloquear último admin.
- Registar alteração para BK-MF4-08.
- Criar painel admin.
- Criar testes de role e último admin.

#### Scope-out

- Convites por email.
- Gestão fina de permissões por recurso.
- Login, registo e passwords.
- Auditoria transversal completa, coberta por BK-MF4-08.

#### Estado antes e depois

##### Estado antes

`UserRole` já existe com `STUDENT`, `TEACHER` e `ADMIN`, mas não há API administrativa segura para alterar papéis.

##### Estado depois

Fica um módulo `admin-users` que lista utilizadores públicos, altera papéis no schema real e guarda histórico de alterações.

##### Decisões de escopo

- `CANONICO`: só `ADMIN` altera papéis.
- `CANONICO`: o último admin não pode perder role admin.
- `DERIVADO`: `reason` é obrigatório para tornar a alteração defensável em auditoria.

#### Pre-requisitos

- BK-MF0-04 com papéis base.
- `User`, `UserRole` e `UsersService.toPublicUser`.
- `SessionGuard`.
- `requestMf3Json`.

#### Glossário

- Papel: valor `STUDENT`, `TEACHER` ou `ADMIN` guardado em `User.role`.
- Privilege escalation: elevação indevida de permissões.
- Último admin: único administrador restante.
- Histórico de role: registo de quem alterou, quem foi alterado, valor anterior e valor novo.

#### Conceitos teóricos essenciais

O frontend nunca decide se alguém é admin. O backend confirma a role do actor em cada operação e altera o documento `User` real. O histórico não substitui a auditoria global, mas entrega a BK-MF4-08 a fonte do evento administrativo.

#### Arquitetura do BK

- Endpoint: `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`.
- Modelo/schema: `UserRoleChange`.
- Service: `AdminUsersService`.
- Controller: `AdminUsersController`.
- Guard: `SessionGuard`.
- Cliente: `admin-users-client.ts`.
- Componente: `AdminUsersPanel`.
- Testes: `admin-users.service.spec.ts`.
- Handoff: BK-MF4-08 consome alterações de papel como eventos auditáveis.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/admin-users/dto/change-user-role.dto.ts`
- CRIAR: `apps/api/src/modules/admin-users/schemas/user-role-change.schema.ts`
- CRIAR: `apps/api/src/modules/admin-users/admin-users.service.ts`
- CRIAR: `apps/api/src/modules/admin-users/admin-users.controller.ts`
- CRIAR: `apps/api/src/modules/admin-users/admin-users.module.ts`
- CRIAR: `apps/api/src/modules/admin-users/admin-users.service.spec.ts`
- CRIAR: `apps/web/src/features/admin-users/admin-users-client.ts`
- CRIAR: `apps/web/src/features/admin-users/admin-users-panel.tsx`
- EDITAR: `apps/api/src/app.module.ts`

#### Tutorial técnico linear

### Passo 1 - Criar DTO e histórico de alteração

1. Objetivo funcional do passo no contexto da app.
   Definir contrato seguro para mudar papéis.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/admin-users/dto/change-user-role.dto.ts`
   - CRIAR: `apps/api/src/modules/admin-users/schemas/user-role-change.schema.ts`
3. Instruções do que fazer.
   Exige `nextRole` e `reason`; `targetUserId` vem da URL.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/admin-users/dto/change-user-role.dto.ts
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";
import { UserRole } from "../../auth/schemas/user.schema.js";

/**
 * Pedido administrativo para alterar papel de um utilizador.
 */
export class ChangeUserRoleDto {
    /** Role final permitida pelo schema real de auth. */
    @IsEnum(["STUDENT", "TEACHER", "ADMIN"])
    nextRole!: UserRole;

    @IsString()
    @MinLength(5)
    @MaxLength(300)
    reason!: string;
}
```

```ts
// apps/api/src/modules/admin-users/schemas/user-role-change.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { UserRole } from "../../auth/schemas/user.schema.js";

export type UserRoleChangeDocument = HydratedDocument<UserRoleChange>;

/**
 * Histórico de alteração de papéis.
 */
@Schema({ timestamps: true, collection: "user_role_changes" })
export class UserRoleChange {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    actorId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    targetUserId!: Types.ObjectId;

    @Prop({ required: true, enum: ["STUDENT", "TEACHER", "ADMIN"] })
    previousRole!: UserRole;

    @Prop({ required: true, enum: ["STUDENT", "TEACHER", "ADMIN"] })
    nextRole!: UserRole;

    @Prop({ required: true, trim: true, maxlength: 300 })
    reason!: string;
}

export const UserRoleChangeSchema = SchemaFactory.createForClass(UserRoleChange);
UserRoleChangeSchema.index({ targetUserId: 1, createdAt: -1 });
```

5. Explicação do código.
   A URL identifica o alvo; o body só contém a decisão e a justificação. O histórico guarda metadados suficientes para auditoria sem copiar email ou password.
6. Validação do passo.
   `nextRole: "OWNER"` deve falhar.
7. Cenário negativo/erro esperado.
   `reason` curta deve devolver 400.

### Passo 2 - Implementar service que altera `User.role`

1. Objetivo funcional do passo no contexto da app.
   Listar utilizadores públicos e alterar a role real.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/admin-users/admin-users.service.ts`
3. Instruções do que fazer.
   Injeta `User` model e `UserRoleChange` model; filtra roles no backend.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/admin-users/admin-users.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { PublicUserDto } from "../users/users.service.js";
import { User, UserDocument } from "../auth/schemas/user.schema.js";
import { ChangeUserRoleDto } from "./dto/change-user-role.dto.js";
import { UserRoleChange, UserRoleChangeDocument } from "./schemas/user-role-change.schema.js";

/**
 * Administração de utilizadores sobre o schema real de autenticação.
 */
@Injectable()
export class AdminUsersService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(UserRoleChange.name) private readonly changeModel: Model<UserRoleChangeDocument>,
    ) {}

    async listUsers(actor: AuthenticatedUser): Promise<PublicUserDto[]> {
        this.assertAdmin(actor);
        const users = await this.userModel.find().select("_id email role").sort({ email: 1 }).lean();
        return users.map((user) => ({ id: String(user._id), email: user.email, role: user.role }));
    }

    async changeRole(actor: AuthenticatedUser, targetUserId: string, input: ChangeUserRoleDto): Promise<PublicUserDto> {
        this.assertAdmin(actor);
        if (!Types.ObjectId.isValid(targetUserId)) throw this.notFound();
        const mongoSession = await this.connection.startSession();
        let result: PublicUserDto | undefined;
        try {
            await mongoSession.withTransaction(async () => {
                // Todas as mutações do conjunto de admins escrevem o mesmo sentinel.
                // Duas alterações concorrentes entram em conflito e a transaction é repetida.
                await this.connection.collection("security_sentinels").findOneAndUpdate(
                    { _id: "last-admin" },
                    { $inc: { revision: 1 }, $setOnInsert: { createdAt: new Date() } },
                    { upsert: true, session: mongoSession },
                );

                const target = await this.userModel
                    .findById(targetUserId)
                    .session(mongoSession)
                    .lean();
                if (!target) throw this.notFound();

                if (target.role === "ADMIN" && input.nextRole !== "ADMIN") {
                    const adminCount = await this.userModel
                        .countDocuments({ role: "ADMIN", accountStatus: "ACTIVE" })
                        .session(mongoSession);
                    if (adminCount <= 1) {
                        throw new ForbiddenException({
                            code: "LAST_ADMIN_REQUIRED",
                            message: "Tem de existir pelo menos um administrador ativo.",
                        });
                    }
                }

                const updated = await this.userModel
                    .findByIdAndUpdate(
                        targetUserId,
                        { $set: { role: input.nextRole }, $inc: { sessionVersion: 1 } },
                        { new: true, runValidators: true, session: mongoSession },
                    )
                    .lean();
                if (!updated) throw this.notFound();

                await this.changeModel.create([{
                    actorId: new Types.ObjectId(actor.id),
                    targetUserId: new Types.ObjectId(targetUserId),
                    previousRole: target.role,
                    nextRole: input.nextRole,
                    reason: input.reason.trim(),
                }], { session: mongoSession });
                result = { id: String(updated._id), email: updated.email, role: updated.role };
            });
        } finally {
            await mongoSession.endSession();
        }
        if (!result) throw new Error("ROLE_CHANGE_TRANSACTION_ABORTED");
        return result;
    }

    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({ code: "ADMIN_ROLE_REQUIRED", message: "Apenas administradores podem gerir utilizadores." });
        }
    }

    private notFound(): NotFoundException {
        return new NotFoundException({ code: "USER_NOT_FOUND", message: "Utilizador não encontrado." });
    }
}
```

5. Explicação do código.
   `changeRole` altera `User.role`, incrementa `sessionVersion` e escreve o histórico na mesma transaction. O sentinel `last-admin` serializa mutações concorrentes do conjunto de administradores; a listagem exclui `passwordHash`.
6. Validação do passo.
   Alterar `STUDENT` para `TEACHER` deve devolver o utilizador actualizado.
7. Cenário negativo/erro esperado.
   Rebaixar/eliminar em paralelo dois dos últimos administradores deve deixar pelo menos um ativo; o pedido perdedor devolve `LAST_ADMIN_REQUIRED` após retry transacional.

### Passo 3 - Criar controller e módulo

1. Objetivo funcional do passo no contexto da app.
   Expor administração por HTTP protegido.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/admin-users/admin-users.controller.ts`
   - CRIAR: `apps/api/src/modules/admin-users/admin-users.module.ts`
   - EDITAR: `apps/api/src/app.module.ts`
3. Instruções do que fazer.
   Usa `SessionGuard`; validação de admin fica no service.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/admin-users/admin-users.controller.ts
import { Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AdminUsersService } from "./admin-users.service.js";
import { ChangeUserRoleDto } from "./dto/change-user-role.dto.js";

/**
 * Endpoints administrativos de utilizadores.
 */
@Controller("api/admin/users")
@UseGuards(SessionGuard)
export class AdminUsersController {
    constructor(private readonly adminUsersService: AdminUsersService) {}

    @Get()
    listUsers(@Req() request: AuthenticatedRequest) {
        return this.adminUsersService.listUsers(request.user!);
    }

    @Patch(":id/role")
    changeRole(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() input: ChangeUserRoleDto) {
        return this.adminUsersService.changeRole(request.user!, id, input);
    }
}
```

```ts
// apps/api/src/modules/admin-users/admin-users.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { User, UserSchema } from "../auth/schemas/user.schema.js";
import { AdminUsersController } from "./admin-users.controller.js";
import { AdminUsersService } from "./admin-users.service.js";
import { UserRoleChange, UserRoleChangeSchema } from "./schemas/user-role-change.schema.js";

/**
 * Módulo administrativo para roles de utilizador.
 */
@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: UserRoleChange.name, schema: UserRoleChangeSchema },
        ]),
    ],
    controllers: [AdminUsersController],
    providers: [AdminUsersService],
    exports: [AdminUsersService],
})
export class AdminUsersModule {}
```

5. Explicação do código.
   A API é pequena e auditável: listar e alterar role. A exportação do service permite BK-MF4-08 consultar ou integrar eventos.
6. Validação do passo.
   `GET /api/admin/users` deve rejeitar não admin.
7. Cenário negativo/erro esperado.
   `PATCH` com id inválido deve devolver `USER_NOT_FOUND`.

### Passo 4 - Criar cliente e painel admin

1. Objetivo funcional do passo no contexto da app.
   Permitir gestão visual de papéis.
2. Ficheiros envolvidos:
   - CRIAR: `apps/web/src/features/admin-users/admin-users-client.ts`
   - CRIAR: `apps/web/src/features/admin-users/admin-users-panel.tsx`
3. Instruções do que fazer.
   Usa `requestMf3Json` e mostra erros.
4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/features/admin-users/admin-users-client.ts
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type AdminUser = { id: string; email: string; role: "STUDENT" | "TEACHER" | "ADMIN" };

export function loadAdminUsers() {
    return requestMf3Json<AdminUser[]>("/api/admin/users");
}

export function changeUserRole(id: string, nextRole: AdminUser["role"], reason: string) {
    return requestMf3Json<AdminUser>(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ nextRole, reason }),
    });
}
```

```tsx
// apps/web/src/features/admin-users/admin-users-panel.tsx
import { useEffect, useState } from "react";
import { AdminUser, changeUserRole, loadAdminUsers } from "./admin-users-client.js";

/**
 * Painel administrativo de utilizadores.
 */
export function AdminUsersPanel() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAdminUsers().then(setUsers).catch((err: Error) => setError(err.message));
    }, []);

    async function promoteToTeacher(user: AdminUser) {
        const updated = await changeUserRole(user.id, "TEACHER", "Promoção administrativa validada.");
        setUsers((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    }

    return (
        <section aria-labelledby="admin-users-title">
            <h2 id="admin-users-title">Utilizadores</h2>
            {error ? <p role="alert">{error}</p> : null}
            <ul>{users.map((user) => <li key={user.id}>{user.email} - {user.role}<button type="button" onClick={() => promoteToTeacher(user)}>Tornar professor</button></li>)}</ul>
        </section>
    );
}
```

5. Explicação do código.
   O painel demonstra o contrato e preserva cookies HttpOnly. A razão é enviada ao backend para histórico.
6. Validação do passo.
   Um admin deve conseguir promover um aluno a professor.
7. Cenário negativo/erro esperado.
   Um não admin deve ver o erro do backend.

### Passo 5 - Testar último admin

1. Objetivo funcional do passo no contexto da app.
   Cobrir a regra de segurança principal.
2. Ficheiros envolvidos:
   - CRIAR: `apps/api/src/modules/admin-users/admin-users.service.spec.ts`
3. Instruções do que fazer.
   Simula admin único e tentativa de rebaixamento.
4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/modules/admin-users/admin-users.service.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { AdminUsersService } from "./admin-users.service.js";

describe("AdminUsersService", () => {
    it("impede rebaixar o último administrador", async () => {
        const userModel = {
            findById: jest.fn(() => ({ lean: async () => ({ _id: "507f1f77bcf86cd799439010", email: "admin@studyflow.test", role: "ADMIN" }) })),
            countDocuments: jest.fn(async () => 0),
        };
        const service = new AdminUsersService(userModel as never, {} as never);

        await expect(
            service.changeRole(
                { id: "507f1f77bcf86cd799439011", email: "root@studyflow.test", role: "ADMIN" },
                "507f1f77bcf86cd799439010",
                { nextRole: "TEACHER", reason: "Teste de segurança." },
            ),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });
});
```

5. Explicação do código.
   O teste foca a falha mais perigosa: deixar a plataforma sem administrador.
6. Validação do passo.
   `npm run test:unit -- admin-users`
7. Cenário negativo/erro esperado.
   Remover a contagem de admins deve fazer este teste falhar.

### Passo 6 - Validar contrato final

1. Objetivo funcional do passo no contexto da app.
   Fechar RF55 com mutação real e auditável.
2. Ficheiros envolvidos:
   - REVER: todos os ficheiros criados neste BK
3. Instruções do que fazer.
   Verifica que a role muda no documento `users`.
4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.
   A validação final confirma que não foi criado um sistema paralelo de roles.
6. Validação do passo.
   `npm run test:unit -- admin-users` e teste manual com admin.
7. Cenário negativo/erro esperado.
   Não admin deve receber `ADMIN_ROLE_REQUIRED`.

#### Critérios de aceite

- Listagem não expõe `passwordHash`.
- Só admin gere papéis.
- `User.role` real é alterado.
- Último admin fica protegido.
- Histórico de alteração é criado.

#### Validação final

- `npm run test:unit -- admin-users`
- `npm run test:integration`
- Teste manual de alteração de role.

#### Evidence para PR/defesa

- Output dos testes.
- Payload antes/depois de role.
- Registo `UserRoleChange`.
- Erro `LAST_ADMIN_REQUIRED`.

#### Handoff

BK-MF4-08 deve registar alterações de role como eventos administrativos na auditoria global.

#### Changelog

- `2026-06-16`: guia corrigido com alteração real de `UserRole`, protecção do último admin e histórico.
