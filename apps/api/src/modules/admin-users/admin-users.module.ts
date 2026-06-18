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