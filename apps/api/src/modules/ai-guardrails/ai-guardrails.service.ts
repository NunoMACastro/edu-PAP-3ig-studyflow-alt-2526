// apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts
/**
 * Implementa as regras de negócio de guardrails de IA e concentra validações do domínio.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
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
 * Decisão pública devolvida ao frontend depois de validar um contexto IA.
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
 * Valida se uma chamada IA pode avançar para um contexto StudyFlow.
 */
@Injectable()
export class AiGuardrailsService {
    /**
     * @param checkModel Modelo de decisões de guardrail.
     * @param studyAreasService Service que conhece ownership de áreas privadas.
     * @param studyRoomsService Service que conhece membership de salas.
     * @param subjectsService Service que conhece inscrição em disciplinas.
     */
    constructor(
        @InjectModel(AiGuardrailCheck.name)
        private readonly checkModel: Model<AiGuardrailCheckDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Decide se o utilizador autenticado pode usar IA no contexto pedido.
     *
     * @param actor Utilizador autenticado pela sessão HttpOnly.
     * @param input Contexto, recurso e prompt validados pelo DTO.
     * @returns Decisão persistida sem guardar o prompt.
     */
    async check(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
    ): Promise<AiGuardrailDecision> {
        if (actor.role !== "STUDENT") {
            return this.persistDecision(actor, input, false, "STUDENT_ROLE_REQUIRED");
        }

        try {
            await this.assertContextAllowed(actor, input);
            return this.persistDecision(actor, input, true, "CONTEXT_ALLOWED");
        } catch (error) {
            if (error instanceof ForbiddenException) {
                return this.persistDecision(actor, input, false, "CONTEXT_FORBIDDEN");
            }
            return this.persistDecision(actor, input, false, "CONTEXT_NOT_AVAILABLE");
        }
    }

    /**
     * Encaminha a validação para o service que conhece a regra de domínio.
     *
     * @param actor Utilizador autenticado.
     * @param input Pedido de guardrail.
     */
    private async assertContextAllowed(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
    ): Promise<void> {
        if (input.contextType === AiGuardrailContextType.SOLO) {
            // O ID do aluno vem da sessão para impedir ownership escolhido pelo frontend.
            await this.studyAreasService.getMyStudyArea(actor.id, input.resourceId);
            return;
        }

        if (input.contextType === AiGuardrailContextType.STUDY_ROOM) {
            // A sala só pode alimentar IA depois de confirmar membership no backend.
            await this.studyRoomsService.ensureMember(actor.id, input.resourceId);
            return;
        }

        // A IA da disciplina só avança se o aluno estiver inscrito na disciplina/turma.
        await this.subjectsService.findSubjectForStudent(actor.id, input.resourceId);
    }

    /**
     * Persiste a decisão sem guardar prompt, resposta IA ou excertos de materiais.
     *
     * @param actor Utilizador autenticado.
     * @param input Pedido validado.
     * @param allowed Resultado da decisão.
     * @param reasonCode Código estável para UI e testes.
     * @returns Decisão pública sem dados sensíveis.
     */
    private async persistDecision(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
        allowed: boolean,
        reasonCode: string,
    ): Promise<AiGuardrailDecision> {
        const reason = this.reasonFor(reasonCode);
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
            CONTEXT_ALLOWED: "O contexto foi validado e a IA pode avançar.",
            CONTEXT_FORBIDDEN:
                "O pedido foi bloqueado porque não tens acesso a este contexto.",
            CONTEXT_NOT_AVAILABLE:
                "O pedido foi bloqueado porque o contexto não está disponível.",
            STUDENT_ROLE_REQUIRED:
                "Este guardrail só valida pedidos IA feitos por alunos.",
        };
        return reasons[code] ?? "O pedido foi bloqueado por regra de segurança.";
    }
}