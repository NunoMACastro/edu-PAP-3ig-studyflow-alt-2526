/**
 * Regista providers, controllers e schemas necessários ao módulo de study.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { HistoryController } from "./history.controller.js";
import { HistoryService } from "./history.service.js";
import { StudyEvent, StudyEventSchema } from "./schemas/study-event.schema.js";

/**
 * Módulo exportável do histórico funcional de estudo.
 *
 * Fica separado de `StudyModule` para que materiais e IA possam registar
 * eventos sem criar ciclos de dependência com rotinas ou dashboard.
 */
@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: StudyEvent.name, schema: StudyEventSchema },
        ]),
    ],
    controllers: [HistoryController],
    providers: [HistoryService],
    exports: [HistoryService],
})
export class HistoryModule {}
