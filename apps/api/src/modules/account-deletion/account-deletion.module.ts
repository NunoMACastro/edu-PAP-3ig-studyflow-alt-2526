/**
 * Regista eliminação de conta própria.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountLifecycleModule } from "../../common/account-lifecycle/account-lifecycle.module.js";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { User, UserSchema } from "../auth/schemas/user.schema.js";
import { PersonalDataModule } from "../personal-data/personal-data.module.js";
import { AccountDeletionController } from "./account-deletion.controller.js";
import { AccountDeletionRecoveryService } from "./account-deletion-recovery.service.js";
import { AccountDeletionService } from "./account-deletion.service.js";
import { AccountDeletionRequest, AccountDeletionRequestSchema } from "./schemas/account-deletion-request.schema.js";

@Module({
    imports: [
        AccountLifecycleModule,
        AuthModule,
        AuditLogModule,
        PersonalDataModule,
        MongooseModule.forFeature([
            { name: AccountDeletionRequest.name, schema: AccountDeletionRequestSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [AccountDeletionController],
    providers: [AccountDeletionService, AccountDeletionRecoveryService],
})
export class AccountDeletionModule {}
