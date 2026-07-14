/**
 * Resolve destinos, turnos e fontes para materiais privados do Assistente.
 * Toda a informação sensível é derivada no servidor e congelada antes da IA.
 */
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    PayloadTooLargeException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { createHash } from "node:crypto";
import { Model, Types } from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import type {
    AiArtifactTarget,
    AiArtifactTargetKind,
    AssistantArtifactGenerationSnapshot,
} from "../ai/ai-artifact-generation.types.js";
import { AiModelPoliciesService } from "../ai-model-policies/ai-model-policies.service.js";
import type { AiSource } from "../ai/providers/ai-provider.js";
import {
    ClassAiInteraction,
    type ClassAiInteractionDocument,
} from "../class-ai/schemas/class-ai-interaction.schema.js";
import { ClassesService } from "../classes/classes.service.js";
import { GuidedStudyRoomsService } from "../guided-study-rooms/guided-study-rooms.service.js";
import {
    GuidedStudyRoomAiInteraction,
    type GuidedStudyRoomAiInteractionDocument,
} from "../guided-study-rooms/schemas/guided-study-room-ai-interaction.schema.js";
import {
    GuidedStudyRoom,
    type GuidedStudyRoomDocument,
} from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import { MaterialsService } from "../materials/materials.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import {
    PrivateAreaAiAnswer,
    type PrivateAreaAiAnswerDocument,
} from "../private-area-ai/schemas/private-area-ai-answer.schema.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import {
    StudyGroupAiAnswer,
    type StudyGroupAiAnswerDocument,
} from "../study-group-ai/schemas/study-group-ai-answer.schema.js";
import { RoomSharesService } from "../study-rooms/room-shares.service.js";
import {
    RoomAiInteraction,
    type RoomAiInteractionDocument,
} from "../study-rooms/schemas/room-ai-interaction.schema.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import type { StudentAssistantArtifactType } from "./student-ai-assistant.types.js";
import { StudentAiContextResolverService } from "./student-ai-context-resolver.service.js";

const MAX_SNAPSHOT_CHARACTERS = 500_000;

type ConversationInput = {
    _id: Types.ObjectId;
    studentId: Types.ObjectId;
    contextKind: "SUBJECT" | "STUDY_AREA" | "STUDY_GROUP" | "STUDY_ROOM" | "GUIDED_ROOM";
    contextId: Types.ObjectId;
    contextLabelSnapshot: string;
    status: string;
    readOnly: boolean;
    lastMessageAt?: Date;
};

type TurnInput = {
    question: string;
    answer: string;
    sourceMaterialIds?: unknown[];
    sourceShareIds?: unknown[];
    sources?: Array<{ shareId?: string }>;
};

export type StudentArtifactTargetView = AiArtifactTarget & {
    secondaryLabel?: string;
};

@Injectable()
export class StudentAiArtifactContextService {
    constructor(
        @InjectModel(ClassAiInteraction.name)
        private readonly classTurnModel: Model<ClassAiInteractionDocument>,
        @InjectModel(PrivateAreaAiAnswer.name)
        private readonly privateTurnModel: Model<PrivateAreaAiAnswerDocument>,
        @InjectModel(StudyGroupAiAnswer.name)
        private readonly groupTurnModel: Model<StudyGroupAiAnswerDocument>,
        @InjectModel(RoomAiInteraction.name)
        private readonly roomTurnModel: Model<RoomAiInteractionDocument>,
        @InjectModel(GuidedStudyRoomAiInteraction.name)
        private readonly guidedTurnModel: Model<GuidedStudyRoomAiInteractionDocument>,
        @InjectModel(GuidedStudyRoom.name)
        private readonly guidedRoomModel: Model<GuidedStudyRoomDocument>,
        private readonly contextResolver: StudentAiContextResolverService,
        private readonly classesService: ClassesService,
        private readonly subjectsService: SubjectsService,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
        private readonly roomSharesService: RoomSharesService,
        private readonly guidedRoomsService: GuidedStudyRoomsService,
        private readonly policiesService: AiModelPoliciesService,
    ) {}

    /** Devolve preview e destino sem chamar provider nem reservar quota. */
    async setup(actor: AuthenticatedUser, conversation: ConversationInput) {
        this.assertCreatable(conversation);
        await this.contextResolver.resolve(
            actor,
            conversation.contextKind,
            String(conversation.contextId),
        );
        const [turns, sources, fixedTarget, summaryPolicy, toolPolicy] =
            await Promise.all([
                this.loadTurns(conversation),
                this.loadSources(actor, conversation),
                this.fixedTarget(actor, conversation),
                this.policiesService.resolveForUse("SUMMARY").catch(() => null),
                this.policiesService.resolveForUse("STUDY_TOOL").catch(() => null),
            ]);
        if (!turns.length) throw this.noTurns();
        return {
            canCreate: true,
            targetMode: fixedTarget ? "FIXED" as const : "SELECTION_REQUIRED" as const,
            ...(fixedTarget ? { fixedTarget } : {}),
            preview: {
                turnCount: turns.length,
                candidateSourceCount: sources.length,
                groundingMode: sources.length ? "CHAT_AND_SOURCES" as const : "CHAT_ONLY" as const,
                sourceLimits: {
                    SUMMARY: summaryPolicy?.maxSourceCount ?? 0,
                    STUDY_TOOL: toolPolicy?.maxSourceCount ?? 0,
                },
            },
        };
    }

    /** Lista apenas destinos ativos do próprio aluno ou das suas memberships. */
    async listTargets(
        actor: AuthenticatedUser,
        input: { query?: string; cursor?: string; limit?: number },
    ) {
        const [classes, areas] = await Promise.all([
            this.classesService.listStudentClasses(actor, "ACTIVE"),
            this.studyAreasService.listMyStudyAreas(actor.id),
        ]);
        const subjects = (
            await Promise.all(
                classes.map((schoolClass) =>
                    this.subjectsService.listStudentClassSubjects(
                        actor,
                        schoolClass._id,
                        "ACTIVE",
                    ),
                ),
            )
        ).flat();
        const classById = new Map(classes.map((row) => [row._id, row]));
        const all: StudentArtifactTargetView[] = [
            ...subjects.map((row) => ({
                kind: "SUBJECT" as const,
                id: row._id,
                label: row.name,
                secondaryLabel: classById.get(row.classId)?.name,
            })),
            ...classes.map((row) => ({
                kind: "CLASS" as const,
                id: row._id,
                label: row.name,
                secondaryLabel: `${row.code} · ${row.schoolYear}`,
            })),
            ...areas.map((row) => ({
                kind: "STUDY_AREA" as const,
                id: row._id,
                label: row.name,
                secondaryLabel: "Estudo pessoal",
            })),
        ].sort((left, right) =>
            `${left.label}:${left.kind}`.localeCompare(
                `${right.label}:${right.kind}`,
                "pt-PT",
            ),
        );
        const query = input.query?.trim().toLocaleLowerCase("pt-PT") ?? "";
        const filtered = query
            ? all.filter((row) =>
                  `${row.label} ${row.secondaryLabel ?? ""}`
                      .toLocaleLowerCase("pt-PT")
                      .includes(query),
              )
            : all;
        const offset = this.decodeCursor(input.cursor);
        const limit = input.limit ?? 20;
        const items = filtered.slice(offset, offset + limit);
        return {
            items,
            nextCursor:
                offset + items.length < filtered.length
                    ? Buffer.from(String(offset + items.length)).toString("base64url")
                    : null,
        };
    }

    /** Constrói o snapshot exato do pedido e aplica a política do tipo escolhido. */
    async prepareSnapshot(
        actor: AuthenticatedUser,
        conversation: ConversationInput,
        type: StudentAssistantArtifactType,
        requestedTarget?: { kind: AiArtifactTargetKind; id: string },
    ): Promise<AssistantArtifactGenerationSnapshot> {
        this.assertCreatable(conversation);
        await this.contextResolver.resolve(
            actor,
            conversation.contextKind,
            String(conversation.contextId),
        );
        const fixedTarget = await this.fixedTarget(actor, conversation);
        if (fixedTarget && requestedTarget) {
            throw new BadRequestException({
                code: "ASSISTANT_ARTIFACT_TARGET_FIXED",
                message: "O destino deste material é definido pela conversa.",
            });
        }
        if (!fixedTarget && !requestedTarget) {
            throw new BadRequestException({
                code: "ASSISTANT_ARTIFACT_TARGET_REQUIRED",
                message: "Escolhe onde queres organizar este material privado.",
            });
        }
        const target = fixedTarget ?? await this.validateTarget(actor, requestedTarget!);
        const [turns, candidates, policy] = await Promise.all([
            this.loadTurns(conversation),
            this.loadSources(actor, conversation),
            this.policiesService.resolveForUse(type === "SUMMARY" ? "SUMMARY" : "STUDY_TOOL"),
        ]);
        if (!turns.length) throw this.noTurns();
        const orderedSources = this.prioritizeSources(candidates, turns);
        const sources = orderedSources.slice(0, policy.maxSourceCount);
        const characterCount = turns.reduce(
            (total, turn) => total + turn.question.length + turn.answer.length,
            sources.reduce(
                (total, source) =>
                    total + source.title.length + source.contentText.length,
                0,
            ),
        );
        if (characterCount > MAX_SNAPSHOT_CHARACTERS) {
            throw new PayloadTooLargeException({
                code: "ASSISTANT_ARTIFACT_SNAPSHOT_TOO_LARGE",
                message: "A conversa e as fontes excedem o limite permitido para criar material.",
            });
        }
        const snapshotAt = new Date();
        const digestPayload = JSON.stringify({
            conversationId: String(conversation._id),
            target,
            turns,
            sources,
            snapshotAt: snapshotAt.toISOString(),
        });
        return Object.freeze({
            userId: actor.id,
            conversationId: String(conversation._id),
            sourceContextKind: conversation.contextKind,
            sourceContextId: String(conversation.contextId),
            contextLabel: conversation.contextLabelSnapshot,
            target,
            sources: Object.freeze(sources.map((source) => Object.freeze({ ...source }))),
            candidateSourceCount: candidates.length,
            conversationTurns: Object.freeze(
                turns.map((turn) => Object.freeze({
                    question: turn.question,
                    answer: turn.answer,
                })),
            ),
            snapshotAt,
            snapshotTurnCount: turns.length,
            groundingMode: sources.length ? "CHAT_AND_SOURCES" : "CHAT_ONLY",
            snapshotDigest: createHash("sha256").update(digestPayload).digest("hex"),
            ...(conversation.contextKind === "STUDY_AREA"
                ? { voiceTone: (await this.studyAreasService.getMyStudyArea(actor.id, String(conversation.contextId))).voiceTone }
                : {}),
        });
    }

    /** Calcula se um destino ainda permite prática; labels vêm sempre do servidor. */
    async resolveTargetAccess(
        userId: string,
        kind: AiArtifactTargetKind,
        targetId: string,
        labelSnapshot: string,
    ): Promise<{ active: boolean; label: string; targetPath?: string }> {
        try {
            if (kind === "STUDY_AREA") {
                const area = await this.studyAreasService.getMyStudyArea(userId, targetId);
                return { active: true, label: area.name, targetPath: `/app/areas/${area._id}/ferramentas` };
            }
            if (kind === "SUBJECT") {
                const { subject } = await this.subjectsService.findSubjectForStudent(userId, targetId);
                return { active: true, label: subject.name, targetPath: `/app/disciplinas/${subject._id}/meus-materiais` };
            }
            const schoolClass = await this.classesService.ensureStudentEnrollment(userId, targetId);
            return { active: true, label: schoolClass.name, targetPath: `/app/turmas/${schoolClass._id}/meus-materiais` };
        } catch {
            return { active: false, label: labelSnapshot };
        }
    }

    private async fixedTarget(
        actor: AuthenticatedUser,
        conversation: ConversationInput,
    ): Promise<StudentArtifactTargetView | null> {
        const id = String(conversation.contextId);
        if (conversation.contextKind === "STUDY_AREA") {
            const area = await this.studyAreasService.getMyStudyArea(actor.id, id);
            return { kind: "STUDY_AREA", id: area._id, label: area.name, secondaryLabel: "Estudo pessoal" };
        }
        if (conversation.contextKind === "SUBJECT") {
            const { subject, schoolClass } = await this.subjectsService.findSubjectForStudent(actor.id, id);
            return { kind: "SUBJECT", id: subject._id, label: subject.name, secondaryLabel: schoolClass.name };
        }
        if (conversation.contextKind !== "GUIDED_ROOM") return null;
        const room = await this.guidedRoomModel.findById(id).lean();
        if (!room) throw this.targetUnavailable();
        if (room.subjectId) {
            const { subject, schoolClass } = await this.subjectsService.findSubjectForStudent(actor.id, String(room.subjectId));
            return { kind: "SUBJECT", id: subject._id, label: subject.name, secondaryLabel: schoolClass.name };
        }
        const schoolClass = await this.classesService.ensureStudentEnrollment(actor.id, String(room.classId));
        return { kind: "CLASS", id: schoolClass._id, label: schoolClass.name };
    }

    private async validateTarget(
        actor: AuthenticatedUser,
        target: { kind: AiArtifactTargetKind; id: string },
    ): Promise<StudentArtifactTargetView> {
        try {
            if (target.kind === "STUDY_AREA") {
                const area = await this.studyAreasService.getMyStudyArea(actor.id, target.id);
                return { kind: target.kind, id: area._id, label: area.name, secondaryLabel: "Estudo pessoal" };
            }
            if (target.kind === "SUBJECT") {
                const { subject, schoolClass } = await this.subjectsService.findSubjectForStudent(actor.id, target.id);
                return { kind: target.kind, id: subject._id, label: subject.name, secondaryLabel: schoolClass.name };
            }
            const schoolClass = await this.classesService.ensureStudentEnrollment(actor.id, target.id);
            return { kind: target.kind, id: schoolClass._id, label: schoolClass.name };
        } catch {
            throw this.targetUnavailable();
        }
    }

    private async loadTurns(conversation: ConversationInput): Promise<TurnInput[]> {
        const filter = { conversationId: conversation._id, studentId: conversation.studentId };
        let rows: TurnInput[];
        if (conversation.contextKind === "SUBJECT") {
            rows = await this.classTurnModel.find(filter).sort({ _id: -1 }).limit(6).lean() as unknown as TurnInput[];
        } else if (conversation.contextKind === "STUDY_AREA") {
            rows = await this.privateTurnModel.find(filter).sort({ _id: -1 }).limit(6).lean() as unknown as TurnInput[];
        } else if (conversation.contextKind === "STUDY_GROUP") {
            rows = await this.groupTurnModel.find(filter).sort({ _id: -1 }).limit(6).lean() as unknown as TurnInput[];
        } else if (conversation.contextKind === "STUDY_ROOM") {
            rows = await this.roomTurnModel.find(filter).sort({ _id: -1 }).limit(6).lean() as unknown as TurnInput[];
        } else {
            rows = await this.guidedTurnModel.find(filter).sort({ _id: -1 }).limit(6).lean() as unknown as TurnInput[];
        }
        return rows
            .filter((row) => row.question?.trim() && row.answer?.trim())
            .reverse();
    }

    private async loadSources(
        actor: AuthenticatedUser,
        conversation: ConversationInput,
    ): Promise<AiSource[]> {
        const id = String(conversation.contextId);
        if (conversation.contextKind === "SUBJECT") {
            const rows = await this.officialMaterialsService.listProcessedForSubject(id);
            return rows.map((row) => ({ materialId: row._id, title: row.title, contentText: row.textContent ?? "" }));
        }
        if (conversation.contextKind === "STUDY_AREA") {
            const rows = await this.materialsService.listReadyTextSources(actor.id, id);
            return rows.map((row) => ({ materialId: String(row._id), title: row.title, contentText: row.contentText ?? "" }));
        }
        if (conversation.contextKind === "STUDY_GROUP") {
            const rows = await this.roomSharesService.findUsableSharesForRoom(actor.id, id, undefined, "STUDY_GROUP");
            return rows.map((row) => ({ materialId: row.shareId, title: row.title, contentText: row.contentText }));
        }
        if (conversation.contextKind === "STUDY_ROOM") {
            const rows = await this.roomSharesService.findUsableSharesForRoom(actor.id, id);
            return rows.map((row) => ({ materialId: row.shareId, title: row.title, contentText: row.contentText }));
        }
        const row = await this.guidedRoomModel.findById(id).lean();
        if (!row) return [];
        const room = await this.guidedRoomsService.ensureStudentRoom(actor, String(row.classId), id);
        const rows = await this.guidedRoomsService.listProcessedSelectedMaterials(room);
        return rows.map((source) => ({ materialId: source._id, title: source.title, contentText: source.textContent ?? "" }));
    }

    private prioritizeSources(sources: AiSource[], turns: TurnInput[]): AiSource[] {
        const cited = turns.flatMap((turn) => [
            ...(turn.sourceMaterialIds ?? []),
            ...(turn.sourceShareIds ?? []),
            ...(turn.sources?.map((source) => source.shareId).filter(Boolean) ?? []),
        ]).map(String);
        const priority = new Map<string, number>();
        cited.forEach((id, index) => { if (!priority.has(id)) priority.set(id, index); });
        return sources
            .map((source, index) => ({ source, index }))
            .sort((left, right) => {
                const leftPriority = priority.get(left.source.materialId);
                const rightPriority = priority.get(right.source.materialId);
                if (leftPriority !== undefined || rightPriority !== undefined) {
                    if (leftPriority === undefined) return 1;
                    if (rightPriority === undefined) return -1;
                    return leftPriority - rightPriority;
                }
                return left.index - right.index;
            })
            .map(({ source }) => source);
    }

    private assertCreatable(conversation: ConversationInput): void {
        if (
            !["DRAFT", "ACTIVE"].includes(conversation.status) ||
            conversation.readOnly ||
            !conversation.lastMessageAt
        ) {
            throw new ForbiddenException({
                code: "ASSISTANT_ARTIFACT_CONVERSATION_READ_ONLY",
                message: "Esta conversa não permite criar novos materiais.",
            });
        }
    }

    private decodeCursor(cursor?: string): number {
        if (!cursor) return 0;
        try {
            const offset = Number(Buffer.from(cursor, "base64url").toString("utf8"));
            if (!Number.isInteger(offset) || offset < 0) throw new Error("invalid");
            return offset;
        } catch {
            throw new BadRequestException({
                code: "ASSISTANT_ARTIFACT_TARGET_CURSOR_INVALID",
                message: "Cursor de destinos inválido.",
            });
        }
    }

    private noTurns(): BadRequestException {
        return new BadRequestException({
            code: "ASSISTANT_ARTIFACT_TURNS_REQUIRED",
            message: "A conversa precisa de pelo menos uma resposta para criar material.",
        });
    }

    private targetUnavailable(): ForbiddenException {
        return new ForbiddenException({
            code: "ASSISTANT_ARTIFACT_TARGET_UNAVAILABLE",
            message: "O destino selecionado não está disponível.",
        });
    }
}
