/**
 * Orquestra a IA supervisionada das salas guiadas sobre a governação CLASS_AI.
 */
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Optional,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassAiResult } from "../ai/providers/ai-provider.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
import type { StudentAiExecutionContext } from "../ai/student-ai-conversation-context.js";
import { StudentAiLegacyConversationService } from "../ai/student-ai-legacy-conversation.service.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { ClassesService } from "../classes/classes.service.js";
import { ClassLearningActivityService } from "../class-learning-activity/class-learning-activity.service.js";
import {
    OfficialMaterialView,
    OfficialMaterialsService,
    StudentOfficialMaterialView,
} from "../official-materials/official-materials.service.js";
import { TeacherAiVoiceService } from "../teacher-ai/teacher-ai-voice.service.js";
import { AskGuidedStudyRoomAiDto } from "./dto/ask-guided-study-room-ai.dto.js";
import { GuidedStudyRoomsService } from "./guided-study-rooms.service.js";
import { buildGuidedStudyRoomAiPrompt } from "./prompts/guided-study-room-ai.prompt.js";
import {
    GuidedStudyRoomAiInteraction,
    GuidedStudyRoomAiInteractionDocument,
} from "./schemas/guided-study-room-ai-interaction.schema.js";

type InteractionRecord = {
    _id: unknown;
    roomId: unknown;
    classId: unknown;
    subjectId?: unknown;
    studentId: unknown;
    question: string;
    answer: string;
    sourceMaterialIds: unknown[];
    voiceSource: "SUBJECT_OVERRIDE" | "CLASS_BASE" | "DEFAULT";
    voiceTone: "CALM" | "DIRECT" | "SOCRATIC";
    voiceDetailLevel: "SHORT" | "BALANCED" | "DETAILED";
    voiceRulesApplied?: string[];
    createdAt?: Date;
};

@Injectable()
export class GuidedStudyRoomAiService {
    constructor(
        @InjectModel(GuidedStudyRoomAiInteraction.name)
        private readonly interactionModel: Model<GuidedStudyRoomAiInteractionDocument>,
        private readonly roomsService: GuidedStudyRoomsService,
        private readonly voiceService: TeacherAiVoiceService,
        private readonly aiExecution: GovernedAiExecutionService,
        private readonly auditLogService: AuditLogService,
        private readonly classesService: ClassesService,
        private readonly materialsService: OfficialMaterialsService,
        @Optional()
        private readonly classLearningActivityService?: ClassLearningActivityService,
        @Optional()
        private readonly legacyConversationService?: StudentAiLegacyConversationService,
    ) {}

    /** Responde ao aluno usando apenas as fontes selecionadas pelo professor. */
    async ask(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
        input: AskGuidedStudyRoomAiDto,
        assistantContext?: StudentAiExecutionContext,
    ) {
        const room = await this.roomsService.ensureStudentRoom(actor, classId, roomId);
        const executionContext = assistantContext ?? (this.legacyConversationService
            ? {
                conversationId: await this.legacyConversationService.ensure({
                    studentId: actor.id,
                    contextKind: "GUIDED_ROOM",
                    contextId: roomId,
                    label: room.title,
                    secondaryLabel: "Com o professor",
                }),
                turns: [],
            }
            : undefined);
        if (room.status !== "OPEN") {
            throw new ConflictException({
                code: "GUIDED_ROOM_CLOSED",
                message: "A sala está encerrada e a IA está em modo de consulta.",
            });
        }
        if (!room.aiEnabled) {
            throw new ForbiddenException({
                code: "GUIDED_ROOM_AI_DISABLED",
                message: "O professor não ativou a IA nesta sala.",
            });
        }
        const authorization = await this.aiExecution.authorize(actor.id, "CLASS_AI");
        const materials = await this.roomsService.listProcessedSelectedMaterials(room);
        if (!materials.length) {
            throw new UnprocessableEntityException({
                code: "GUIDED_ROOM_AI_SOURCES_REQUIRED",
                message: "A sala não tem materiais processados disponíveis para a IA.",
            });
        }
        const voice = await this.voiceService.resolveTeacherVoice({
            classId: String(room.classId),
            subjectId: room.subjectId ? String(room.subjectId) : undefined,
        });
        try {
            const execution = await this.aiExecution.executeAuthorized(authorization, {
                quota: { scope: "CLASS", targetId: String(room.classId) },
                sources: materials,
                guardrailText: input.question,
                pedagogicalContext: "STUDENT_PROFILE",
                conversationTurns: executionContext?.turns,
                buildPrompt: (sources, conversationHistory) =>
                    buildGuidedStudyRoomAiPrompt({
                        roomTitle: room.title,
                        goal: room.goal,
                        description: room.description,
                        question: input.question.trim(),
                        materials: [...sources],
                        voice,
                        conversationHistory,
                    }),
                invoke: ({ provider, prompt, options }) =>
                    provider.generateClassAnswer({ prompt, options }),
                validateResult: (result, sources) =>
                    this.validateResult(result, [...sources]),
            });
            const usedMaterials = [...execution.sources].filter((material) =>
                execution.result.sourceMaterialIds.includes(material._id),
            );
            const interaction = await this.interactionModel.create({
                roomId: new Types.ObjectId(roomId),
                classId: new Types.ObjectId(classId),
                ...(room.subjectId ? { subjectId: new Types.ObjectId(String(room.subjectId)) } : {}),
                studentId: new Types.ObjectId(actor.id),
                question: input.question.trim(),
                answer: execution.result.answer.trim(),
                sourceMaterialIds: execution.result.sourceMaterialIds.map(
                    (id) => new Types.ObjectId(id),
                ),
                voiceSource: voice.source,
                voiceTone: voice.tone,
                voiceDetailLevel: voice.detailLevel,
                voiceRulesApplied: voice.rules,
                ...(executionContext
                    ? { conversationId: new Types.ObjectId(executionContext.conversationId) }
                    : {}),
                citationSnapshots: usedMaterials.map((material) => ({
                    label: material.title,
                    kind: "OFFICIAL_MATERIAL",
                })),
            });
            const created = interaction.toObject() as { createdAt?: Date };
            if (!assistantContext && executionContext) {
                await this.legacyConversationService?.markAnswered(
                    executionContext.conversationId,
                    created.createdAt,
                );
            }
            await this.classLearningActivityService?.recordBestEffort({
                classId,
                studentId: actor.id,
                ...(room.subjectId
                    ? { subjectId: String(room.subjectId) }
                    : {}),
                type: "GUIDED_ROOM_AI_INTERACTION",
                sourceEventKey: `guided-room-ai-interaction:${String(interaction._id)}`,
                occurredAt: created.createdAt,
            });
            await this.auditLogService.record({
                actorId: actor.id,
                domain: "AI",
                action: "GUIDED_ROOM_AI_REQUESTED",
                resourceType: "GuidedStudyRoom",
                resourceId: roomId,
                result: "SUCCESS",
                metadata: {
                    classId,
                    purpose: "CLASS_AI",
                    sourceCount: usedMaterials.length,
                    model: execution.policy.model,
                },
            });
            return this.toView(interaction.toObject(), usedMaterials, actor.email, false);
        } catch (error) {
            if (
                error instanceof ConflictException ||
                error instanceof ForbiddenException ||
                error instanceof UnprocessableEntityException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    /** Lista apenas o histórico do próprio aluno. */
    async listForStudent(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
        cursor?: string,
        limit = 20,
    ) {
        const room = await this.roomsService.ensureStudentHistoricalRoom(
            actor,
            classId,
            roomId,
        );
        return this.listPage(
            { roomId: new Types.ObjectId(roomId), studentId: new Types.ObjectId(actor.id) },
            cursor,
            limit,
            new Map([[actor.id, actor.email]]),
            room,
            false,
        );
    }

    /** Lista conversas identificadas para supervisão read-only do professor. */
    async listForTeacher(
        actor: AuthenticatedUser,
        classId: string,
        roomId: string,
        input: { cursor?: string; limit?: number; studentId?: string },
    ) {
        const room = await this.roomsService.findOwnedRoom(actor, classId, roomId);
        if (input.studentId && !Types.ObjectId.isValid(input.studentId)) {
            throw new BadRequestException({
                code: "GUIDED_ROOM_AI_STUDENT_INVALID",
                message: "Aluno inválido para este histórico.",
            });
        }
        const historicalStudentIds = await this.interactionModel.distinct("studentId", {
            roomId: new Types.ObjectId(roomId),
        });
        const [progress, students] = await Promise.all([
            this.roomsService.getProgress(actor, classId, roomId),
            this.classesService.listOwnedClassStudentsIncluding(
                actor.id,
                classId,
                historicalStudentIds.map(String),
            ),
        ]);
        const audienceIds = new Set([
            ...progress.students.map((student) => student.studentId),
            ...historicalStudentIds.map(String),
        ]);
        if (
            input.studentId &&
            !audienceIds.has(input.studentId)
        ) {
            throw new BadRequestException({
                code: "GUIDED_ROOM_AI_STUDENT_OUT_OF_SCOPE",
                message: "O aluno indicado não pertence à audiência desta sala.",
            });
        }
        const emails = new Map([
            ...progress.students.map((student) => [student.studentId, student.email] as const),
            ...students.map((student) => [student.id, student.email] as const),
        ]);
        const page = await this.listPage(
            {
                roomId: new Types.ObjectId(roomId),
                ...(input.studentId
                    ? { studentId: new Types.ObjectId(input.studentId) }
                    : {}),
            },
            input.cursor,
            input.limit ?? 20,
            emails,
            room,
            true,
        );
        await this.auditLogService.record({
            actorId: actor.id,
            domain: "AI",
            action: "GUIDED_ROOM_AI_SUPERVISION_VIEWED",
            resourceType: "GuidedStudyRoom",
            resourceId: roomId,
            result: "SUCCESS",
            metadata: {
                classId,
                resultCount: page.items.length,
                filteredByStudent: Boolean(input.studentId),
            },
        });
        return page;
    }

    private async listPage(
        filter: Record<string, unknown>,
        cursor: string | undefined,
        requestedLimit: number,
        emails: Map<string, string>,
        room: Awaited<ReturnType<GuidedStudyRoomsService["findOwnedRoom"]>>,
        exposeTeacherDetails: boolean,
    ) {
        if (cursor && !Types.ObjectId.isValid(cursor)) {
            throw new BadRequestException({
                code: "GUIDED_ROOM_AI_CURSOR_INVALID",
                message: "Cursor de histórico inválido.",
            });
        }
        const limit = Math.max(1, Math.min(50, Number(requestedLimit) || 20));
        const rows = await this.interactionModel
            .find({
                ...filter,
                ...(cursor ? { _id: { $lt: new Types.ObjectId(cursor) } } : {}),
            })
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();
        const hasMore = rows.length > limit;
        const pageRows = hasMore ? rows.slice(0, limit) : rows;
        const sourceIds = [
            ...new Set(pageRows.flatMap((row) => row.sourceMaterialIds.map(String))),
        ];
        const loadedMaterials = sourceIds.length
            ? await this.materialsService.listByIds(sourceIds)
            : [];
        const materials = this.roomsService.filterMaterialsForRoom(
            room,
            loadedMaterials,
        );
        const materialById = new Map(materials.map((material) => [material._id, material]));
        return {
            items: pageRows.map((row) =>
                this.toView(
                    row,
                    row.sourceMaterialIds
                        .map((id) => materialById.get(String(id)))
                        .filter((item): item is OfficialMaterialView => Boolean(item)),
                    emails.get(String(row.studentId)) ?? `Aluno ${String(row.studentId).slice(-4)}`,
                    exposeTeacherDetails,
                ),
            ),
            nextCursor: hasMore ? String(pageRows.at(-1)?._id) : null,
        };
    }

    private validateResult(result: ClassAiResult, materials: OfficialMaterialView[]): void {
        const allowed = new Set(materials.map((material) => material._id));
        if (
            typeof result.answer !== "string" ||
            !result.answer.trim() ||
            !Array.isArray(result.sourceMaterialIds) ||
            !result.sourceMaterialIds.length ||
            result.sourceMaterialIds.some((id) => !allowed.has(id))
        ) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_GUIDED_ROOM_ANSWER",
                message: "A IA devolveu uma resposta inválida para a sala guiada.",
            });
        }
    }

    private toView(
        interaction: InteractionRecord,
        sources: OfficialMaterialView[],
        studentEmail: string,
        exposeTeacherDetails: boolean,
    ) {
        const publicSources: Array<OfficialMaterialView | StudentOfficialMaterialView> =
            exposeTeacherDetails
                ? sources
                : sources.map((source) =>
                      this.materialsService.toStudentMaterialView(source),
                  );
        return {
            _id: String(interaction._id),
            roomId: String(interaction.roomId),
            classId: String(interaction.classId),
            subjectId: interaction.subjectId ? String(interaction.subjectId) : undefined,
            question: interaction.question,
            answer: interaction.answer,
            sources: publicSources,
            ...(exposeTeacherDetails
                ? {
                      studentId: String(interaction.studentId),
                      studentEmail,
                      voice: {
                          source: interaction.voiceSource,
                          tone: interaction.voiceTone,
                          detailLevel: interaction.voiceDetailLevel,
                          rules: interaction.voiceRulesApplied ?? [],
                      },
                  }
                : {
                      teacherVoiceApplied: interaction.voiceSource !== "DEFAULT",
                  }),
            createdAt: interaction.createdAt,
        };
    }
}
