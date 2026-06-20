/**
 * Regista auditoria aplicacional MF4.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { AuditLogController } from "./audit-log.controller.js";
import { AuditLogService } from "./audit-log.service.js";
import { AuditEvent, AuditEventSchema } from "./schemas/audit-event.schema.js";

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([{ name: AuditEvent.name, schema: AuditEventSchema }]),
    ],
    controllers: [AuditLogController],
    providers: [AuditLogService],
    exports: [AuditLogService],
})
export class AuditLogModule {}
