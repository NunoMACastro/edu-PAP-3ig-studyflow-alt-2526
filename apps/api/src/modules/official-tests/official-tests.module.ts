/**
 * Regista providers, controllers e schemas necessários ao módulo de testes oficiais.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { OfficialTestsController } from "./official-tests.controller.js";
import { OfficialTestsService } from "./official-tests.service.js";
import { OfficialTest, OfficialTestSchema } from "./schemas/official-test.schema.js";

/**
 * Módulo de testes oficiais da MF2.
 */
@Module({
    imports: [
        AuthModule,
        SubjectsModule,
        MongooseModule.forFeature([
            { name: OfficialTest.name, schema: OfficialTestSchema },
        ]),
    ],
    controllers: [OfficialTestsController],
    providers: [OfficialTestsService],
    exports: [OfficialTestsService],
})
export class OfficialTestsModule {}
