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