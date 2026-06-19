// apps/api/src/modules/ai/ai-generation.service.ts
import { Injectable, BadRequestException } from "@nestjs/common";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { AuditDomain, AuditResult } from "../audit-log/dto/audit-query.dto.js";

// Enums e Interfaces fictícias para o contexto do exemplo (ajusta aos teus ficheiros reais)
export enum AiModelPurpose {
    PRIVATE_AREA_AI = "PRIVATE_AREA_AI",
}

interface AiPolicy {
    _id?: string;
    maxPromptChars: number;
}

@Injectable()
export class AiGenerationService {
    constructor(
        private readonly aiModelPoliciesService: any, // Substitui pelo tipo correto do teu service de políticas
        private readonly auditLogService: AuditLogService, // <-- Injeção do serviço de auditoria
    ) {}

    /**
     * Processa um pedido de IA, validando o tamanho do prompt contra as políticas configuradas.
     */
    async generateResponse(userId: string, prompt: string): Promise<{ response: string }> {
        // 1. Resolve a política de IA ativa para este propósito
        const policy: AiPolicy = await this.aiModelPoliciesService.resolveForUse(AiModelPurpose.PRIVATE_AREA_AI);

        // 2. Valida o limite do prompt de acordo com a política
        if (prompt.length > policy.maxPromptChars) {
            
            // Regista o evento de negação na auditoria antes de lançar a exceção
            await this.auditLogService.record({
                actorId: userId,
                domain: AuditDomain.AI,
                action: "AI_PROMPT_LIMIT_EXCEEDED",
                resourceType: "AiModelPolicy",
                resourceId: policy._id?.toString() ?? "unknown",
                result: AuditResult.DENIED,
                metadata: { 
                    promptLength: prompt.length, 
                    maxLengthAllowed: policy.maxPromptChars 
                }, // Minimização de dados: guardamos apenas as métricas, nunca o prompt textual inteiro
            });

            throw new BadRequestException({
                code: "AI_PROMPT_TOO_LONG",
                message: "O pedido é demasiado grande para a política de IA configurada.",
            });
        }

        // 3. Se passar na validação, segue para a chamada do AI_PROVIDER externo
        // const aiResponse = await this.aiProvider.call(prompt);
        
        // Exemplo de auditoria de sucesso após gerar a resposta (opcional, se quiseres auditar consumos com sucesso)
        await this.auditLogService.record({
            actorId: userId,
            domain: AuditDomain.AI,
            action: "AI_RESPONSE_GENERATED",
            resourceType: "AiModel",
            result: AuditResult.SUCCESS,
            metadata: { promptLength: prompt.length },
        });

        return { response: "Resposta mockada do provedor de IA." };
    }
}