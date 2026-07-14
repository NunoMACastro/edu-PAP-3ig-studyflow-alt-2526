/** Regista o gate de topology e índices Mongo. */
import { Module } from "@nestjs/common";
import { PersistenceIntegrityService } from "./persistence-integrity.service.js";

@Module({
    providers: [PersistenceIntegrityService],
    exports: [PersistenceIntegrityService],
})
export class PersistenceIntegrityModule {}

