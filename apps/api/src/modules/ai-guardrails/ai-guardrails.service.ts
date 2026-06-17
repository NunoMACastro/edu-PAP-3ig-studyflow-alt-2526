/**
 * Implementa as regras de negócio de ai guardrails e concentra validações do domínio.
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
 * Contrato de guardrails de IA que documenta a estrutura esperada em tempo de desenvolvimento.
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
 * A regra central é simples: validar contexto no backend antes de qualquer IA.
 * Cada ramo usa o service de domínio que já conhece ownership ou membership.
 */
@Injectable()
export class AiGuardrailsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param checkModel Modelo Mongoose injetado para ler e persistir guardrails de IA.
     * @param studyAreasService Service injetado para reutilizar regras de áreas de estudo sem duplicar validações.
     * @param studyRoomsService Service injetado para reutilizar regras de salas de estudo sem duplicar validações.
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     */
    constructor(
        @InjectModel(AiGuardrailCheck.name)
        private readonly checkModel: Model<AiGuardrailCheckDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Verifica se o pedido IA pode avançar sem misturar contextos.
     *
     * @param actor Utilizador autenticado pela sessão.
     * @param input Payload validado.
     * @returns Decisão persistida e pronta para o frontend.
     */
    async check(
        actor: AuthenticatedUser,
        input: CheckAiGuardrailsDto,
    ): Promise<AiGuardrailDecision> {
        if (actor.role !== "STUDENT") {
            return this.persistDecision(actor, input, false, "STUDENT_ROLE_REQUIRED");
        }

        try {
            if (input.contextType === AiGuardrailContextType.SOLO) {
                await this.studyAreasService.getMyStudyArea(actor.id, input.resourceId);
            }

            if (input.contextType === AiGuardrailContextType.STUDY_ROOM) {
                await this.studyRoomsService.ensureMember(actor.id, input.resourceId);
            }

            if (input.contextType === AiGuardrailContextType.CLASS_SUBJECT) {
                await this.subjectsService.findSubjectForStudent(
                    actor.id,
                    input.resourceId,
                );
            }

            return this.persistDecision(actor, input, true, "CONTEXT_ALLOWED");
        } catch (error) {
            if (error instanceof ForbiddenException) {
                return this.persistDecision(actor, input, false, "CONTEXT_FORBIDDEN");
            }
            return this.persistDecision(actor, input, false, "CONTEXT_NOT_AVAILABLE");
        }
    }

    /**
     * Persiste a decisão sem guardar qualquer excerto do prompt.
     *
     * O prompt pode conter dados pessoais ou material privado; para auditoria
     * técnica bastam o contexto validado, a decisão e a razão estável.
     *
     * @param actor Utilizador autenticado.
     * @param input Pedido original validado.
     * @param allowed Resultado do guardrail.
     * @param reasonCode Código estável para UI e testes.
     * @returns Decisão pública.
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
