// apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts
/**
 * Implementa as regras de negócio de guardrails IA e concentra validações do domínio.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { evaluateAiSafetyInput } from "../ai-safety/ai-safety-policy.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { StudyRoomsService } from "../study-rooms/study-rooms.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import {
    AiGuardrailContextType,
    CheckAiGuardrailsDto,
} from "./dto/check-ai-guardrails.dto.js";
import {
    AiGuardrailCheck,
    AiGuardrailCheckDocument,
} from "./schemas/ai-guardrail-check.schema.js";

/**
 * Contrato público da decisão devolvida ao frontend.
 */
export type AiGuardrailDecision = {
    _id: string;
    contextType: AiGuardrailContextType;
    resourceId: string;
    allowed: boolean;
    reasonCode: string;
    reason: string;
    checkedAt?: Date;
};

/**
 * Serviço de guardrails IA por contexto.
 *
 * A regra central é validar role, contexto e segurança ética no backend antes
 * de qualquer chamada posterior ao provider de IA.
 */
@Injectable()
export class AiGuardrailsService {
    /**
     * Recebe dependências por injeção para manter a classe testável.
     *
     * @param checkModel Modelo Mongoose usado para persistir decisões mínimas.
     * @param studyAreasService Service que valida ownership de áreas privadas.
     * @param studyRoomsService Service que valida membership de salas de estudo.
     * @param subjectsService Service que valida acesso do aluno a disciplinas.
     */
    constructor(
        @InjectModel(AiGuardrailCheck.name)
        private readonly checkModel: Model<AiGuardrailCheckDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Verifica se um pedido IA pode avançar sem misturar contextos nem aceitar
     * pedidos enviesados ou inseguros.
     *
     * @param actor Utilizador autenticado pela sessão.
     * @param input Payload validado pelo DTO.
     * @returns Decisão persistida e pronta para a UI.
     */
    async check(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
    ): Promise<AiGuardrailDecision> {
        if (actor.role !== "STUDENT") {
            return this.persistDecision(actor, input, false, "STUDENT_ROLE_REQUIRED");
        }

        try {
            await this.assertContextAccess(actor, input);
        } catch (error) {
            if (error instanceof ForbiddenException) {
                return this.persistDecision(actor, input, false, "CONTEXT_FORBIDDEN");
            }

            return this.persistDecision(actor, input, false, "CONTEXT_NOT_AVAILABLE");
        }

        const safetyDecision = evaluateAiSafetyInput(input.prompt);

        if (!safetyDecision.allowed) {
            // O bloqueio ético acontece antes de qualquer provider para evitar conteúdo inseguro.
            return this.persistDecision(
                actor,
                input,
                false,
                safetyDecision.reasonCode,
                safetyDecision.reason,
            );
        }

        return this.persistDecision(actor, input, true, "CONTEXT_ALLOWED");
    }

    /**
     * Confirma ownership ou membership do recurso indicado.
     *
     * @param actor Aluno autenticado.
     * @param input Contexto funcional indicado no pedido.
     */
    private async assertContextAccess(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
    ): Promise<void> {
        if (input.contextType === AiGuardrailContextType.SOLO) {
            await this.studyAreasService.getMyStudyArea(actor.id, input.resourceId);
            return;
        }

        if (input.contextType === AiGuardrailContextType.STUDY_ROOM) {
            await this.studyRoomsService.ensureMember(actor.id, input.resourceId);
            return;
        }

        // `classId`/`subjectId` não vêm da confiança do frontend: o service confirma acesso.
        await this.subjectsService.findSubjectForStudent(actor.id, input.resourceId);
    }

    /**
     * Persiste decisão de guardrail sem guardar prompt, resposta IA ou material privado.
     *
     * @param actor Utilizador autenticado.
     * @param input Pedido original validado.
     * @param allowed Resultado final do guardrail.
     * @param reasonCode Código estável para UI, testes e evidence.
     * @param reasonOverride Mensagem pública específica quando a policy já decidiu a razão.
     * @returns Decisão pública.
     */
    private async persistDecision(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
        allowed: boolean,
        reasonCode: string,
        reasonOverride?: string,
    ): Promise<AiGuardrailDecision> {
        const reason = reasonOverride ?? this.reasonFor(reasonCode);
        const check = await this.checkModel.create({
            actorId: actor.id,
            contextType: input.contextType,
            resourceId: input.resourceId,
            allowed,
            reasonCode,
            reason,
        });
        const created = check.toObject() as { createdAt?: Date };

        return {
            _id: String(check._id),
            contextType: check.contextType,
            resourceId: check.resourceId,
            allowed: check.allowed,
            reasonCode: check.reasonCode,
            reason: check.reason,
            checkedAt: created.createdAt,
        };
    }

    /**
     * Traduz códigos técnicos para mensagens PT-PT seguras.
     *
     * @param code Código interno da decisão.
     * @returns Mensagem pública sem revelar dados de outro contexto.
     */
    private reasonFor(code: string): string {
        const reasons: Record<string, string> = {
            BIAS_RISK: "A IA não responde a pedidos discriminatórios ou enviesados.",
            CONTEXT_ALLOWED: "O contexto foi validado e a IA pode avançar.",
            CONTEXT_FORBIDDEN:
                "O pedido foi bloqueado porque não tens acesso a este contexto.",
            CONTEXT_NOT_AVAILABLE:
                "O pedido foi bloqueado porque o contexto não está disponível.",
            NON_PEDAGOGICAL: "Escreve uma pergunta de estudo concreta.",
            STUDENT_ROLE_REQUIRED:
                "Este guardrail só valida pedidos IA feitos por alunos.",
            UNSAFE_REQUEST: "A IA bloqueou o pedido por segurança.",
        };

        return reasons[code] ?? "O pedido foi bloqueado por regra de segurança.";
    }
}