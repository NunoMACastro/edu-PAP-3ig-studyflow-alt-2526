/**
 * Regista providers, controllers e schemas necessários ao módulo de pesquisa unificada.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialIndexModule } from "../material-index/material-index.module.js";
import {
    UnifiedSearchLog,
    UnifiedSearchLogSchema,
} from "./schemas/unified-search-log.schema.js";
import { UnifiedSearchController } from "./unified-search.controller.js";
import { UnifiedSearchService } from "./unified-search.service.js";

/**
 * Módulo MF3 de pesquisa unificada por fontes indexadas.
 */
@Module({
    imports: [
        AuthModule,
        MaterialIndexModule,
        MongooseModule.forFeature([
            { name: UnifiedSearchLog.name, schema: UnifiedSearchLogSchema },
        ]),
    ],
    controllers: [UnifiedSearchController],
    providers: [UnifiedSearchService],
})
export class UnifiedSearchModule {}
