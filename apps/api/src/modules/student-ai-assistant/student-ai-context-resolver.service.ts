/** Resolve contextos do Assistente sem confiar em labels ou permissões do browser. */
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { GuidedStudyRoomsService } from "../guided-study-rooms/guided-study-rooms.service.js";
import {
    GuidedStudyRoom,
    type GuidedStudyRoomDocument,
} from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import { StudyRoomsService } from "../study-rooms/study-rooms.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import type { ListStudentAiContextsDto } from "./dto/student-ai-assistant.dto.js";
import type {
    ResolvedStudentAssistantContext,
    StudentAssistantContextKind,
} from "./student-ai-assistant.types.js";

@Injectable()
export class StudentAiContextResolverService {
    constructor(
        private readonly classesService: ClassesService,
        private readonly subjectsService: SubjectsService,
        private readonly studyAreasService: StudyAreasService,
        private readonly studyGroupsService: StudyGroupsService,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly guidedRoomsService: GuidedStudyRoomsService,
        @InjectModel(GuidedStudyRoom.name)
        private readonly guidedRoomModel: Model<GuidedStudyRoomDocument>,
    ) {}

    /** Lista contextos atuais em bulk por domínio e aplica paginação opaca. */
    async list(actor: AuthenticatedUser, input: ListStudentAiContextsDto) {
        this.assertStudent(actor);
        const all = await this.listAll(actor);
        const query = input.query?.trim().toLocaleLowerCase("pt-PT") ?? "";
        const filtered = query
            ? all.filter((context) =>
                `${context.label} ${context.secondaryLabel ?? ""}`
                    .toLocaleLowerCase("pt-PT")
                    .includes(query),
            )
            : all;
        const offset = this.decodeOffset(input.cursor);
        const limit = input.limit ?? 20;
        const items = filtered.slice(offset, offset + limit);
        return {
            items,
            nextCursor:
                offset + items.length < filtered.length
                    ? Buffer.from(String(offset + items.length), "utf8").toString("base64url")
                    : null,
        };
    }

    /** Resolve e revalida um contexto concreto para leitura contextual ou nova execução. */
    async resolve(
        actor: AuthenticatedUser,
        kind: StudentAssistantContextKind,
        contextId: string,
    ): Promise<ResolvedStudentAssistantContext> {
        this.assertStudent(actor);
        if (!Types.ObjectId.isValid(contextId)) throw this.invalidContext();
        try {
            if (kind === "SUBJECT") {
                const { subject, schoolClass } =
                    await this.subjectsService.findSubjectForStudent(actor.id, contextId);
                return {
                    kind,
                    id: subject._id,
                    label: subject.name,
                    secondaryLabel: schoolClass.name,
                    consentPurpose: "CLASS_AI",
                    targetPath: `/app/disciplinas/${subject._id}`,
                    canAsk: true,
                    classId: schoolClass._id,
                };
            }
            if (kind === "STUDY_AREA") {
                const area = await this.studyAreasService.getMyStudyArea(actor.id, contextId);
                return {
                    kind,
                    id: area._id,
                    label: area.name,
                    secondaryLabel: "Estudo pessoal",
                    consentPurpose: "PRIVATE_AREA_AI",
                    targetPath: `/app/areas/${area._id}`,
                    canAsk: true,
                };
            }
            if (kind === "STUDY_GROUP") {
                const group = await this.studyGroupsService.ensureMember(actor.id, contextId);
                return {
                    kind,
                    id: group._id,
                    label: group.title,
                    secondaryLabel: "Grupo",
                    consentPurpose: "GROUP_AI",
                    targetPath: `/app/grupos/${group._id}`,
                    canAsk: true,
                };
            }
            if (kind === "STUDY_ROOM") {
                const room = await this.studyRoomsService.ensureMember(actor.id, contextId);
                return {
                    kind,
                    id: room._id,
                    label: room.name,
                    secondaryLabel: "Sala partilhada",
                    consentPurpose: "ROOM_AI",
                    targetPath: `/app/salas/${room._id}`,
                    canAsk: true,
                };
            }
            const row = await this.guidedRoomModel.findById(contextId).lean();
            if (!row) throw this.forbiddenContext();
            const room = await this.guidedRoomsService.getForStudent(
                actor,
                String(row.classId),
                contextId,
            );
            const canAsk = room.status === "OPEN" && room.aiEnabled;
            return {
                kind,
                id: room._id,
                label: room.title,
                secondaryLabel: "Com o professor",
                consentPurpose: "CLASS_AI",
                targetPath: `/app/turmas/${room.classId}/salas-guiadas/${room._id}`,
                canAsk,
                unavailableReason: !canAsk
                    ? room.status !== "OPEN"
                        ? "A sala está encerrada."
                        : "O professor não ativou a IA nesta sala."
                    : undefined,
                classId: room.classId,
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof ForbiddenException
            ) {
                throw error;
            }
            throw this.forbiddenContext();
        }
    }

    /** Devolve false sem propagar detalhes de um contexto cujo acesso terminou. */
    async hasCurrentAccess(
        actor: AuthenticatedUser,
        kind: StudentAssistantContextKind,
        contextId: string,
    ): Promise<boolean> {
        try {
            await this.resolve(actor, kind, contextId);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Resolve uma fotografia autorizada de todos os contextos do aluno numa só
     * passagem pelos serviços de domínio. A listagem de conversas usa este mapa
     * para evitar uma revalidação N+1 por item.
     */
    async listCurrentContextMap(
        actor: AuthenticatedUser,
    ): Promise<Map<string, ResolvedStudentAssistantContext>> {
        this.assertStudent(actor);
        const contexts = await this.listAll(actor);
        return new Map(
            contexts.map((context) => [
                this.contextKey(context.kind, context.id),
                context,
            ]),
        );
    }

    /** Constrói a chave interna sem expor metadata adicional no contrato HTTP. */
    contextKey(kind: StudentAssistantContextKind, contextId: string): string {
        return `${kind}:${contextId}`;
    }

    private async listAll(actor: AuthenticatedUser): Promise<ResolvedStudentAssistantContext[]> {
        const [classes, areas, groups, rooms, guidedOpen, guidedClosed] = await Promise.all([
            this.classesService.listStudentClasses(actor, "ACTIVE"),
            this.studyAreasService.listMyStudyAreas(actor.id),
            this.studyGroupsService.listMyGroups(actor),
            this.studyRoomsService.listMyRooms(actor),
            this.guidedRoomsService.listAllForStudent(actor, "OPEN", undefined, 50),
            this.guidedRoomsService.listAllForStudent(actor, "CLOSED", undefined, 50),
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
        const classById = new Map(classes.map((schoolClass) => [schoolClass._id, schoolClass]));
        const contexts: ResolvedStudentAssistantContext[] = [
            ...subjects.map((subject) => ({
                kind: "SUBJECT" as const,
                id: subject._id,
                label: subject.name,
                secondaryLabel: classById.get(subject.classId)?.name,
                consentPurpose: "CLASS_AI" as const,
                targetPath: `/app/disciplinas/${subject._id}`,
                canAsk: true,
                classId: subject.classId,
            })),
            ...areas.map((area) => ({
                kind: "STUDY_AREA" as const,
                id: area._id,
                label: area.name,
                secondaryLabel: "Estudo pessoal",
                consentPurpose: "PRIVATE_AREA_AI" as const,
                targetPath: `/app/areas/${area._id}`,
                canAsk: true,
            })),
            ...groups.map((group) => ({
                    kind: "STUDY_GROUP" as const,
                    id: group._id,
                    label: group.title,
                    secondaryLabel: "Grupo",
                    consentPurpose: "GROUP_AI" as const,
                    targetPath: `/app/grupos/${group._id}`,
                    canAsk: true,
                })),
            ...rooms.map((room) => ({
                    kind: "STUDY_ROOM" as const,
                    id: room._id,
                    label: room.name,
                    secondaryLabel: "Sala partilhada",
                    consentPurpose: "ROOM_AI" as const,
                    targetPath: `/app/salas/${room._id}`,
                    canAsk: true,
                })),
            ...[...guidedOpen.items, ...guidedClosed.items].map((room) => ({
                kind: "GUIDED_ROOM" as const,
                id: room._id,
                label: room.title,
                secondaryLabel: room.className ?? "Com o professor",
                consentPurpose: "CLASS_AI" as const,
                targetPath: `/app/turmas/${room.classId}/salas-guiadas/${room._id}`,
                canAsk: room.status === "OPEN" && room.aiEnabled,
                unavailableReason:
                    room.status !== "OPEN"
                        ? "A sala está encerrada."
                        : !room.aiEnabled
                            ? "O professor não ativou a IA nesta sala."
                            : undefined,
                classId: room.classId,
            })),
        ];
        return contexts.sort((left, right) =>
            `${left.label}:${left.kind}`.localeCompare(
                `${right.label}:${right.kind}`,
                "pt-PT",
            ),
        );
    }

    private decodeOffset(cursor?: string): number {
        if (!cursor) return 0;
        try {
            const value = Number(Buffer.from(cursor, "base64url").toString("utf8"));
            if (!Number.isInteger(value) || value < 0) throw new Error("invalid");
            return value;
        } catch {
            throw new BadRequestException({
                code: "ASSISTANT_CONTEXT_CURSOR_INVALID",
                message: "Cursor de contextos inválido.",
            });
        }
    }

    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") throw this.forbiddenContext();
    }

    private invalidContext(): BadRequestException {
        return new BadRequestException({
            code: "ASSISTANT_CONTEXT_INVALID",
            message: "O contexto indicado não é válido.",
        });
    }

    private forbiddenContext(): ForbiddenException {
        return new ForbiddenException({
            code: "ASSISTANT_CONTEXT_FORBIDDEN",
            message: "Não tens acesso a este contexto de estudo.",
        });
    }
}
