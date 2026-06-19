// apps/api/src/modules/ai/student-ai.service.ts

import { Injectable, BadRequestException } from "@nestjs/common";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { AuditDomain, AuditResult } from "../audit-log/dto/audit-query.dto.js";

@Injectable()
export class StudentAiService {
    constructor(
        private readonly aiConsentsService: any,       // Injeta o serviço de consentimentos
        private readonly aiModelPoliciesService: any,   // Injeta o serviço de políticas
        private readonly aiQuotasService: any,          // Injeta o serviço de quotas
        private readonly auditLogService: AuditLogService, // Injeta a auditoria
    ) {}

    async processStudentPrompt(actor: { id: string }, prompt: string) {
        // ====================================================================
        // CONTRATO: VALIDAÇÕES PRÉ-CONEXÃO (Inserir exatamente aqui)
        // ====================================================================
        
        // 1. Garante que o aluno aceitou os termos de consentimento de IA
        await this.aiConsentsService.assertGranted(actor.id, AiConsentPurpose.PRIVATE_AREA_AI);

        // 2. Carrega a política ativa
        const policy = await this.aiModelPoliciesService.resolveForUse(AiModelPurpose.PRIVATE_AREA_AI);

        // [Validação do tamanho que adicionámos no passo anterior]
        if (prompt.length > policy.maxPromptChars) {
            await this.auditLogService.record({
                actorId: actor.id,
                domain: AuditDomain.AI,
                action: "AI_PROMPT_LIMIT_EXCEEDED",
                resourceType: "AiModelPolicy",
                resourceId: policy._id?.toString(),
                result: AuditResult.DENIED,
                metadata: { promptLength: prompt.length, maxLengthAllowed: policy.maxPromptChars },
            });

            throw new BadRequestException({
                code: "AI_PROMPT_TOO_LONG",
                message: "O pedido é demasiado grande para a política de IA configurada.",
            });
        }

        // 3. Reserva as unidades de quota com base no tamanho do prompt
        await this.aiQuotasService.reserveUsage({
            scopeType: AiQuotaScopeType.USER,
            scopeId: actor.id,
            purpose: policy.purpose,
            units: Math.max(1, Math.ceil(prompt.length / 1000)),
        });

        // ====================================================================
        // FIM DO CONTRATO - DAQUI PARA BAIXO SEGUE PARA O AI_PROVIDER
        // ====================================================================

        // const response = await this.aiProvider.call(prompt);
        
        // Auditoria de Sucesso
        await this.auditLogService.record({
            actorId: actor.id,
            domain: AuditDomain.AI,
            action: "AI_STUDENT_REQUEST_SUCCESS",
            resourceType: "AiModel",
            result: AuditResult.SUCCESS,
            metadata: { promptLength: prompt.length },
        });

        return { success: true };
    }
}