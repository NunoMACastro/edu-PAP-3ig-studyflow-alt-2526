// apps/api/src/modules/official-tests/official-tests.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { OfficialTestRankingService } from "./official-test-ranking.service.js";
import { OfficialTestsController } from "./official-tests.controller.js";
import { OfficialTestsService } from "./official-tests.service.js";
import {
    OfficialTestAttempt,
    OfficialTestAttemptSchema,
} from "./schemas/official-test-attempt.schema.js";
import { OfficialTest, OfficialTestSchema } from "./schemas/official-test.schema.js";

/**
 * Módulo de testes oficiais, tentativas e ranking docente.
 */
@Module({
    imports: [
        AuthModule,
        SubjectsModule,
        MongooseModule.forFeature([
            { name: OfficialTest.name, schema: OfficialTestSchema },
            { name: OfficialTestAttempt.name, schema: OfficialTestAttemptSchema },
        ]),
    ],
    controllers: [OfficialTestsController],
    providers: [OfficialTestsService, OfficialTestRankingService],
    exports: [OfficialTestsService, OfficialTestRankingService],
})
export class OfficialTestsModule {}